import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Play, Upload, Globe2, Webhook, Clock8, Wand2, Send, Trash2, CircleSlash2, CheckCircle2, Image as ImageIcon, FileText, Search } from "lucide-react";
import { getAgents, saveAgent, deleteAgentById, type AgentModel, type RunModel, saveRun } from "@/utils/agents";
import { createListing, updateListing, unpublishListing, checkLicense } from "@/utils/marketplaceApi";

const TOOL_OPTIONS = [
  { key: "email", label: "Email", icon: Send },
  { key: "sheets", label: "Spreadsheets", icon: Upload },
  { key: "web_search", label: "Web Search", icon: Globe2 },
  { key: "web_scraper", label: "Web Scraper", icon: Search },
  { key: "documents", label: "Document Analyzer", icon: FileText },
  { key: "image_edit", label: "Image Editing", icon: ImageIcon },
  { key: "webhook", label: "Webhook", icon: Webhook },
] as const;

type ToolKey = typeof TOOL_OPTIONS[number]["key"];

export default function AgentBuilder() {
  const { user } = useAuthSub();
  const ownerId = user?.id || "anonymous";
  const navigate = useNavigate();
  const { toast: shToast } = useToast();
  const [params] = useSearchParams();
  const editId = params.get("id");

  const emptyAgent: AgentModel = useMemo(() => ({
    id: crypto.randomUUID(),
    ownerId,
    name: "",
    description: "",
    category: "",
    tags: [],
    avatarUrl: "",
    status: "draft",
    visibility: "private",
    templateId: undefined,
    systemPrompt: "",
    instructions: "",
    tools: [],
    integrations: {},
    triggerType: "manual",
    scheduleCron: "",
    marketplaceListingId: null,
    priceType: "free",
    priceAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [ownerId]);

  const [agent, setAgent] = useState<AgentModel>(emptyAgent);
  const [testPrompt, setTestPrompt] = useState("");
  const [testOutput, setTestOutput] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!editId) return;
    const existing = getAgents(ownerId).find(a => a.id === editId);
    if (existing) setAgent(existing);
  }, [editId, ownerId]);

  function update<K extends keyof AgentModel>(key: K, value: AgentModel[K]) {
    setAgent((a) => ({ ...a, [key]: value, updatedAt: new Date().toISOString() }));
  }

  function toggleTool(key: ToolKey) {
    const selected = new Set(agent.tools);
    if (selected.has(key)) selected.delete(key); else selected.add(key);
    update("tools", Array.from(selected));
  }

  function setIntegration(key: ToolKey, creds: Record<string, string>) {
    update("integrations", { ...(agent.integrations || {}), [key]: creds });
  }

  function parseTags(str: string) {
    return str.split(",").map(t => t.trim()).filter(Boolean);
  }

  function tagsToString(tags: string[]) {
    return (tags || []).join(", ");
  }

  // Very lightweight local generator from a single prompt
  function localGenerateFromPrompt(prompt: string) {
    const firstLine = prompt.split("\n")[0] || "Untitled Agent";
    const name = firstLine.replace(/^[^a-zA-Z0-9]*/g, "").slice(0, 40) || "My Agent";
    const category = /news|article|blog/i.test(prompt)
      ? "Content"
      : /email|gmail|inbox/i.test(prompt)
      ? "Communication"
      : /sheet|csv|excel/i.test(prompt)
      ? "Data"
      : /twitter|x\s|social|slack/i.test(prompt)
      ? "Social"
      : "General";

    const tags = Array.from(new Set([
      category.toLowerCase(),
      ...prompt
        .toLowerCase()
        .match(/(email|sheets?|web\s?search|slack|twitter|drive|summary|report|daily|weekly)/g) || [],
    ])).slice(0, 6);

    const systemPrompt = `You are ${name}, a helpful ${category} automation agent. Be concise, reliable, and safe.`;
    const instructions = `Primary goal: ${prompt}\n\nSteps:\n1) Understand the task\n2) Gather required context\n3) Execute using available tools\n4) Return a clear result`;

    setAgent((a) => ({
      ...a,
      name,
      category,
      description: prompt,
      tags,
      systemPrompt,
      instructions,
      updatedAt: new Date().toISOString(),
    }));
  }

  async function aiGenerateFromPrompt() {
    try {
      const prompt = agent.description || testPrompt;
      if (!prompt) {
        return shToast({ title: "Enter a description to generate." });
      }
      const { data, error } = await supabase.functions.invoke("generate-agent", {
        body: { prompt },
      });
      if (error) throw error;
      const spec = (data as any)?.spec;
      if (!spec) throw new Error("No spec returned");
      setAgent((a) => ({
        ...a,
        name: spec.name || a.name,
        description: spec.description || a.description,
        category: spec.category || a.category,
        tags: Array.isArray(spec.tags) ? spec.tags : a.tags,
        systemPrompt: a.systemPrompt || `You are ${spec.name}. ${spec.personality || "Be helpful and concise."}`,
        instructions: a.instructions || `Primary goal: ${spec.description}\n\nSteps:\n1) Understand the task\n2) Gather required context\n3) Execute using available tools\n4) Return a clear result`,
        updatedAt: new Date().toISOString(),
      }));
      shToast({ title: "AI draft generated." });
    } catch (e: any) {
      toast.error(e?.message || "Generate failed");
    }
  }

  function applyMainTemplate() {
    const defaults = {
      systemPrompt:
        "You are a universal automation agent capable of content creation, document analysis, web scraping, and basic image editing. Be safe, precise, and concise.",
      instructions:
        "Capabilities:\n- Content creation and editing\n- Document analysis and summarization\n- Web scraping when allowed\n- Basic image editing (e.g., background removal)\n\nGeneral flow:\n1) Understand the user goal\n2) Select appropriate tools\n3) Execute step-by-step\n4) Provide a clear, actionable result",
      tools: [
        "web_search",
        "web_scraper",
        "documents",
        "image_edit",
        "email",
      ] as string[],
    };
    setAgent((a) => ({
      ...a,
      templateId: "main",
      systemPrompt: a.systemPrompt || defaults.systemPrompt,
      instructions: a.instructions || defaults.instructions,
      tools: Array.from(new Set([...(a.tools || []), ...defaults.tools])),
      updatedAt: new Date().toISOString(),
    }));
    shToast({ title: "Main template applied." });
  }

  function onSaveDraft() {
    const withOwner = { ...agent, ownerId, status: agent.status === "published" ? "draft" : agent.status, visibility: agent.status === "published" ? "private" : agent.visibility };
    saveAgent(withOwner);
    shToast({ title: "Draft saved." });
  }

  async function onPublish() {
    if (!agent.name || !agent.description || !agent.category || !agent.systemPrompt) {
      return shToast({ title: "Missing required fields", description: "Name, Description, Category, and System Prompt are required." });
    }
    try {
      setPublishing(true);
      const price = { type: agent.priceType, amount: agent.priceAmount } as const;
      if (!agent.marketplaceListingId) {
        const res = await createListing({
          agentId: agent.id,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          tags: agent.tags,
          avatarUrl: agent.avatarUrl,
          price,
          ownerId,
        });
        update("marketplaceListingId", res.listingId);
      } else {
        await updateListing(agent.marketplaceListingId, {
          agentId: agent.id,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          tags: agent.tags,
          avatarUrl: agent.avatarUrl,
          price,
          ownerId,
        });
      }
      update("status", "published");
      update("visibility", "public");
      saveAgent({ ...agent, status: "published", visibility: "public" });
      shToast({ title: "Agent published to Marketplace." });
    } catch (e: any) {
      toast.error(e?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function onUnpublish() {
    if (!agent.marketplaceListingId) return shToast({ title: "No listing to unpublish." });
    try {
      setPublishing(true);
      await unpublishListing(agent.marketplaceListingId);
      const next = { ...agent, status: "draft" as const, visibility: "private" as const };
      setAgent(next);
      saveAgent(next);
      shToast({ title: "Agent unpublished from Marketplace." });
    } catch (e: any) {
      toast.error(e?.message || "Unpublish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function onDelete() {
    deleteAgentById(agent.id);
    shToast({ title: "Agent deleted." });
    navigate("/agents");
  }

  async function onArchive() {
    const next = { ...agent, status: "archived" as const };
    setAgent(next);
    saveAgent(next);
    shToast({ title: "Agent archived." });
  }

  async function onTest() {
    try {
      if (agent.priceType !== "free") {
        const license = await checkLicense(agent.id, ownerId);
        if (!license.licensed) {
          toast.error("You need a license to run this agent. Go to Marketplace to purchase.");
          return;
        }
      }
      setRunning(true);
      setTestOutput("");
      const tasks = [
        {
          id: "step1",
          type: "llm",
          model: "gpt-4o-mini",
          system: agent.systemPrompt,
          promptTemplate: `Task: {{input}}\n\nInstructions:\n${agent.instructions || "Follow the system prompt."}`,
        },
      ];
      const { data, error } = await supabase.functions.invoke("agent-run", {
        body: { tasks, input: { input: testPrompt }, system: agent.systemPrompt },
      });
      if (error) throw error;
      const result = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      setTestOutput(result);
      const run: RunModel = {
        id: crypto.randomUUID(),
        agentId: agent.id,
        userId: ownerId,
        input: { input: testPrompt },
        output: data,
        status: "succeeded",
        durationMs: 0,
        cost: 0,
        createdAt: new Date().toISOString(),
        type: "test",
      } as any;
      saveRun(run);
      shToast({ title: "Run started." });
    } catch (e: any) {
      toast.error(e?.message || "Run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Agent Builder – Design and Publish Agents"
        description="Create agents with prompts, configure behavior, tools, triggers. Save drafts, test, and publish to the Marketplace."
        canonical="/builder"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agent Builder</h1>
            <p className="text-muted-foreground">Design your agent, test it, and publish to Marketplace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="btn-glass" onClick={onSaveDraft}>
              <Save className="w-4 h-4 mr-1" /> Save Draft
            </Button>
            {agent.status !== "published" ? (
              <Button className="btn-warm" onClick={onPublish} disabled={publishing}>
                <Upload className="w-4 h-4 mr-1" /> {publishing ? "Publishing…" : "Publish"}
              </Button>
            ) : (
              <Button variant="outline" className="btn-glass" onClick={onUnpublish} disabled={publishing}>
                <CircleSlash2 className="w-4 h-4 mr-1" /> {publishing ? "Unpublishing…" : "Unpublish"}
              </Button>
            )}
            <Button variant="outline" className="btn-glass" onClick={onArchive}>
              <Clock8 className="w-4 h-4 mr-1" /> Archive
            </Button>
            <Button variant="outline" className="btn-glass" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </header>

        {/* Templates */}
        <section className="card-premium p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Templates</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="btn-glass" onClick={applyMainTemplate}>
              Apply Main Agent Template
            </Button>
          </div>
        </section>

        {/* Prompt → Generate */}
        <section className="card-premium p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Wand2 className="w-4 h-4" /> Create from prompt</h2>
          </div>
          <Textarea
            value={agent.description || ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe what the agent should do (e.g., 'Summarize top AI news every morning and email me a bullet list.')"
          />
          <div className="flex flex-wrap gap-2">
            <Button className="btn-warm" onClick={() => localGenerateFromPrompt(agent.description || "")}>Quick Generate</Button>
            <Button variant="outline" className="btn-glass" onClick={aiGenerateFromPrompt}>AI Generate</Button>
            <Button variant="outline" className="btn-glass" onClick={() => setAgent(emptyAgent)}>Reset</Button>
          </div>
        </section>
        <main className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile + Behavior */}
          <div className="lg:col-span-2 space-y-6">
            <section className="card-premium p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Agent Profile</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={agent.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., Morning News Summarizer" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={agent.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g., Content" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" value={tagsToString(agent.tags)} onChange={(e) => update("tags", parseTags(e.target.value))} placeholder="news, summary, email" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" value={agent.avatarUrl} onChange={(e) => update("avatarUrl", e.target.value)} placeholder="https://…" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="longdesc">Long Description</Label>
                  <Textarea id="longdesc" value={agent.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this agent do?" />
                </div>
              </div>
            </section>

            <section className="card-premium p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Behavior</h2>
              <div className="space-y-1">
                <Label htmlFor="system">System Prompt</Label>
                <Textarea id="system" value={agent.systemPrompt} onChange={(e) => update("systemPrompt", e.target.value)} placeholder="Define the agent's persona and objectives." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" value={agent.instructions} onChange={(e) => update("instructions", e.target.value)} placeholder="Steps or rules for execution." />
              </div>
            </section>

            <section className="card-premium p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Test Output</h2>
              <div className="flex items-center gap-2">
                <Input value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} placeholder="Enter a test input…" />
                <Button className="btn-warm" onClick={onTest} disabled={running}>
                  <Play className="w-4 h-4 mr-1" /> {running ? "Running…" : "Test Agent"}
                </Button>
              </div>
              <pre className="rounded-md border border-border/40 p-3 text-sm text-foreground whitespace-pre-wrap bg-background min-h-[120px]">
                {testOutput || "No output yet."}
              </pre>
            </section>
          </div>

          {/* Right: Tools, Triggers, Pricing */}
          <aside className="space-y-6">
            <section className="card-premium p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Tools & Integrations</h2>
              <div className="space-y-2">
                {TOOL_OPTIONS.map(({ key, label, icon: Icon }) => {
                  const checked = agent.tools.includes(key);
                  const creds = (agent.integrations || {})[key] || {};
                  return (
                    <div key={key} className="rounded-md border border-border/40 p-3">
                      <div className="flex items-center gap-2">
                        <Checkbox id={`tool_${key}`} checked={checked} onCheckedChange={() => toggleTool(key)} />
                        <Label htmlFor={`tool_${key}`} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="w-4 h-4" /> {label}
                        </Label>
                      </div>
                      {checked && (
                        <div className="mt-3 grid gap-2">
                          {key === "email" && (
                            <Input placeholder="SMTP/API key (kept locally)" value={creds.apiKey || ""} onChange={(e) => setIntegration(key, { ...creds, apiKey: e.target.value })} />
                          )}
                          {key === "sheets" && (
                            <Input placeholder="Sheets token" value={creds.token || ""} onChange={(e) => setIntegration(key, { ...creds, token: e.target.value })} />
                          )}
                          {key === "web_search" && (
                            <Input placeholder="Search API key" value={creds.apiKey || ""} onChange={(e) => setIntegration(key, { ...creds, apiKey: e.target.value })} />
                          )}
                          {key === "web_scraper" && (
                            <Input placeholder="Firecrawl API key (kept locally)" value={creds.apiKey || ""} onChange={(e) => setIntegration(key, { ...creds, apiKey: e.target.value })} />
                          )}
                          {key === "documents" && (
                            <Input placeholder="Drive/Storage API token" value={creds.token || ""} onChange={(e) => setIntegration(key, { ...creds, token: e.target.value })} />
                          )}
                          {key === "image_edit" && (
                            <p className="text-xs text-muted-foreground">Uses in-browser models for basic edits (no key required).</p>
                          )}
                          {key === "webhook" && (
                            <Input placeholder="Webhook URL" value={creds.url || ""} onChange={(e) => setIntegration(key, { ...creds, url: e.target.value })} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card-premium p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Triggers</h2>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="t_manual" checked={agent.triggerType === "manual"} onCheckedChange={() => update("triggerType", "manual")} />
                  <Label htmlFor="t_manual">Manual</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="t_schedule" checked={agent.triggerType === "schedule"} onCheckedChange={() => update("triggerType", "schedule")} />
                  <Label htmlFor="t_schedule">Schedule</Label>
                </div>
                {agent.triggerType === "schedule" && (
                  <Input placeholder="Cron expression, e.g. 0 8 * * *" value={agent.scheduleCron || ""} onChange={(e) => update("scheduleCron", e.target.value)} />
                )}
                <div className="flex items-center gap-2">
                  <Checkbox id="t_webhook" checked={agent.triggerType === "webhook"} onCheckedChange={() => update("triggerType", "webhook")} />
                  <Label htmlFor="t_webhook">Webhook</Label>
                </div>
              </div>
            </section>

            <section className="card-premium p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="p_free" checked={agent.priceType === "free"} onCheckedChange={() => update("priceType", "free")} />
                  <Label htmlFor="p_free">Free</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="p_one" checked={agent.priceType === "one_time"} onCheckedChange={() => update("priceType", "one_time")} />
                  <Label htmlFor="p_one">One-time</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="p_sub" checked={agent.priceType === "subscription"} onCheckedChange={() => update("priceType", "subscription")} />
                  <Label htmlFor="p_sub">Subscription</Label>
                </div>
                {agent.priceType !== "free" && (
                  <div className="space-y-1">
                    <Label>Price (USD)</Label>
                    <Input type="number" min={0} step="1" value={Math.round((agent.priceAmount || 0) / 100)} onChange={(e) => update("priceAmount", Math.max(0, Math.round(Number(e.target.value) || 0) * 100))} />
                    <p className="text-xs text-muted-foreground">Stored in minor units (cents).</p>
                  </div>
                )}
              </div>
              {agent.status === "published" ? (
                <div className="text-xs text-accent mt-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Published</div>
              ) : (
                <div className="text-xs text-muted-foreground mt-2">Not published</div>
              )}
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
