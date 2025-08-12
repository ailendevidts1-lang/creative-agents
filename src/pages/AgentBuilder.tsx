import { useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Settings2, PlayCircle, Save, Send, BookTemplate, Crown, Sparkles, Loader2 } from "lucide-react";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
const AgentBuilder = () => {
  const { isAdmin, subscription, startCheckout } = useAuthSub();
  const { toast } = useToast();
  const isEnterprise = subscription.subscription_tier === "Enterprise";
  const isPremiumOrEnterprise = subscription.subscription_tier === "Premium" || isEnterprise;
  const isBuilderOrHigher = subscription.subscription_tier === "Builder" || isPremiumOrEnterprise || isAdmin;
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [agent, setAgent] = useState({
    name: "",
    category: "",
    description: "",
    tags: "",
    personality: "",
    actions: "",
    knowledge: "",
    avatarUrl: "",
    selectedIntegrations: [] as string[],
  });

  // Local fallback profile writer when AI is unavailable or quota is exceeded
  const localProfileFromPrompt = (p: string) => {
    const text = (p || '').trim();
    const normalized = text.toLowerCase();

    // Name: Title case from key nouns
    const words = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const key = words.slice(0, 4).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    let name = key || 'Custom Agent';
    if (/calculator|calc|math|compute/.test(normalized)) name = 'Advanced Calculator';
    if (/research|analy(s|z)e|insight|market/.test(normalized)) name = 'Research Assistant Pro';
    if (/email|gmail|inbox/.test(normalized)) name = 'Smart Email Assistant';

    // Category inference
    let category = 'General';
    if (/research|analysis|insight|market|trend/.test(normalized)) category = 'Research';
    else if (/support|helpdesk|chat|bot/.test(normalized)) category = 'Support';
    else if (/sales|crm|lead/.test(normalized)) category = 'Sales';
    else if (/finance|invoice|billing|account/.test(normalized)) category = 'Finance';
    else if (/developer|code|git|deploy/.test(normalized)) category = 'Developer Tools';

    // Description
    const description = `An AI agent that ${text.replace(/^create(\s+a[n]?|)\s*/i, '').replace(/^build(\s+a[n]?|)\s*/i, '')}`.trim();

    // Tags from keywords
    const tagSeeds = Array.from(new Set(normalized
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 3 && !/(this|that|with|from|into|your|their|about|which|will|have|been|for|and|the|you|are|can|into|over|like|make|able)/.test(t))
    ));
    const tags = tagSeeds.slice(0, 6);

    // Personality and actions heuristics
    const personality = /professional|enterprise/.test(normalized)
      ? 'Professional, precise, and reliable'
      : 'Helpful, concise, and friendly';

    const actions: string[] = [];
    if (/summar(y|ise)|digest|tl;dr|summary/.test(normalized)) actions.push('summarize content');
    if (/email|gmail|inbox/.test(normalized)) actions.push('draft and send emails');
    if (/research|crawl|scrape|web/.test(normalized)) actions.push('research and extract insights');
    if (/calculator|calc|math|compute/.test(normalized)) actions.push('perform calculations');
    if (/schedule|calendar|remind/.test(normalized)) actions.push('manage schedules and reminders');

    // Knowledge sources placeholder (user can add later)
    const knowledge: string[] = [];

    return { name, category, description, tags, personality, actions, knowledge };
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      // Try edge function first
      const { data, error } = await supabase.functions.invoke("generate-agent", { body: { prompt } });
      const spec = data?.spec || {};
      const isAIFallback = !!error || data?.warning === 'ai-fallback' || spec?.name === 'Draft Agent';

      // Decide source: AI spec or local writer
      const local = isAIFallback ? localProfileFromPrompt(prompt) : null;

      const name = (isAIFallback ? local?.name : spec.name) ?? agent.name;
      const category = (isAIFallback ? local?.category : spec.category) ?? agent.category;
      const description = (isAIFallback ? local?.description : spec.description) ?? agent.description;

      const tagsArr = isAIFallback
        ? (local?.tags || [])
        : (Array.isArray(spec.tags) ? spec.tags : (agent.tags ? agent.tags.split(',').map(t=>t.trim()).filter(Boolean) : []));

      const actionsArr = isAIFallback
        ? (local?.actions || [])
        : (Array.isArray(spec.actions) ? spec.actions : (agent.actions ? agent.actions.split(',').map(t=>t.trim()).filter(Boolean) : []));

      const knowledgeArr = isAIFallback
        ? (local?.knowledge || [])
        : (Array.isArray(spec.knowledge) ? spec.knowledge : (agent.knowledge ? agent.knowledge.split(',').map(t=>t.trim()).filter(Boolean) : []));

      const personality = (isAIFallback ? local?.personality : spec.personality) ?? agent.personality;

      // Recommend integrations from context
      const haystack = [
        ...tagsArr,
        ...actionsArr,
        ...knowledgeArr,
        String(description || ''),
        String(name || ''),
      ].join(' ').toLowerCase();
      const recommended: string[] = [];
      if (/(email|gmail|mail)/.test(haystack)) recommended.push('Gmail');
      if (/(slack|chatops)/.test(haystack)) recommended.push('Slack');
      if (/(crm|salesforce|hubspot|pipedrive)/.test(haystack)) recommended.push('CRM');

      const avatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(name || 'Agent')}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;

      setAgent((prev) => ({
        ...prev,
        name,
        category,
        description,
        tags: (Array.isArray(tagsArr) ? tagsArr : []).join(", "),
        personality,
        actions: (Array.isArray(actionsArr) ? actionsArr : []).join(", "),
        knowledge: (Array.isArray(knowledgeArr) ? knowledgeArr : []).join(", "),
        avatarUrl,
        selectedIntegrations: Array.from(new Set([...(prev.selectedIntegrations || []), ...recommended]))
      }));

      toast({
        title: isAIFallback ? 'Used local profile writer' : 'Agent generated',
        description: isAIFallback ? 'AI quota unavailable; generated a smart profile locally.' : 'Auto-filled profile, behavior, avatar, and integrations.'
      });
    } catch (e) {
      toast({ title: "Generation failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const saveAgent = (status: "draft" | "published") => {
    const toSave = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: agent.name?.trim() || "Untitled Agent",
      category: agent.category?.trim() || "General",
      description: agent.description?.trim() || "",
      tags: agent.tags.split(",").map((t) => t.trim()).filter(Boolean),
      personality: agent.personality?.trim() || "",
      actions: agent.actions.split(",").map((t) => t.trim()).filter(Boolean),
      knowledge: agent.knowledge.split(",").map((t) => t.trim()).filter(Boolean),
      avatarUrl: agent.avatarUrl,
      integrations: agent.selectedIntegrations,
      status,
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("agents") || "[]");
      const updated = [toSave, ...existing];
      localStorage.setItem("agents", JSON.stringify(updated));
      toast({ title: status === "draft" ? "Draft saved" : "Published", description: `${toSave.name} is now in My Agents.` });
    } catch (e) {
      toast({ title: "Save failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };
  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="Agent Builder – Create AI Agent"
        description="Build an AI agent from scratch or a template. Configure behavior, knowledge, integrations, then test and publish."
        canonical="/builder"
      />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">Agent Builder – Create New AI Agent</h1>
        <p className="text-muted-foreground mt-1">Pick a template, set behavior, add knowledge, connect integrations, then test and publish.</p>
        {isEnterprise && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
            <Crown className="w-4 h-4 mr-1" />
            Enterprise - All features unlocked
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <article className="card-premium">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Prompt to Agent</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the agent you want to build..."
              />
              <Button className="btn-warm" onClick={handleGenerate} disabled={!prompt || generating}>
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Builder+ feature: turn natural language into a configured agent.</p>
          </article>

          {/* Template Picker */}
          <article className="card-premium">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookTemplate className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Template Picker</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-warm">Start Blank</Button>
              <Button variant="outline" className="btn-glass">Research Agent</Button>
              <Button variant="outline" className="btn-glass">Email Rewriter</Button>
              <Button variant="outline" className="btn-glass">Lead Generator</Button>
              <Button variant="outline" className="btn-glass">Contract Analyzer</Button>
              {isEnterprise && (
                <>
                  <Button variant="outline" className="btn-glass">
                    <Crown className="w-4 h-4 mr-1" />
                    Enterprise Analytics
                  </Button>
                  <Button variant="outline" className="btn-glass">
                    <Crown className="w-4 h-4 mr-1" />
                    Custom Workflow
                  </Button>
                </>
              )}
            </div>
          </article>

          {/* Agent Profile */}
          <article className="card-premium space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Agent Profile</h2>
            <div className="flex items-center gap-4">
              <img
                src={agent.avatarUrl || `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(agent.name || 'Agent')}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`}
                alt={`${agent.name || 'Agent'} avatar`}
                loading="lazy"
                className="w-16 h-16 rounded-md border border-border/40 bg-card"
              />
              <Button variant="outline" className="btn-glass">
                <Upload className="w-4 h-4 mr-2" />
                Upload Icon/Avatar
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input value={agent.name} onChange={(e) => setAgent({ ...agent, name: e.target.value })} placeholder="e.g., Research Assistant Pro" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Category</label>
                <Input value={agent.category} onChange={(e) => setAgent({ ...agent, category: e.target.value })} placeholder="e.g., Research" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Description</label>
                <Textarea value={agent.description} onChange={(e) => setAgent({ ...agent, description: e.target.value })} placeholder="What does this agent do?" rows={4} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Tags</label>
                <Input value={agent.tags} onChange={(e) => setAgent({ ...agent, tags: e.target.value })} placeholder="e.g., market, competitor, trending" />
              </div>
              {isEnterprise && (
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">
                    <Crown className="w-4 h-4 inline mr-1" />
                    Enterprise Tier (for marketplace publishing)
                  </label>
                  <Input placeholder="e.g., Enterprise Analytics, Custom Solutions" />
                </div>
              )}
            </div>
            <div className="pt-2">
              <Button variant="outline" className="btn-glass">
                <Upload className="w-4 h-4 mr-2" />
                Upload Icon/Avatar
              </Button>
            </div>
          </article>

          {/* Behavior Settings */}
          <article className="card-premium space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Behavior Settings</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Personality & tone</label>
                <Input value={agent.personality} onChange={(e) => setAgent({ ...agent, personality: e.target.value })} placeholder="e.g., Helpful, concise, professional" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Actions (comma-separated)</label>
                <Input value={agent.actions} onChange={(e) => setAgent({ ...agent, actions: e.target.value })} placeholder="e.g., crawl site, summarize, email report" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Knowledge base (docs, CSVs, URLs)</label>
                <Textarea value={agent.knowledge} onChange={(e) => setAgent({ ...agent, knowledge: e.target.value })} placeholder="Comma-separated URLs or source descriptions" rows={3} />
              </div>
              {isEnterprise && (
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">
                    <Crown className="w-4 h-4 inline mr-1" />
                    Local Execution Settings (Enterprise)
                  </label>
                  <Textarea placeholder="Configure local agent execution parameters..." rows={2} />
                </div>
              )}
            </div>
          </article>
        </section>

        {/* Right column */}
        <aside className="space-y-6">
          <article className="card-premium">
            <h2 className="text-lg font-semibold text-foreground mb-3">Integrations</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Connect Gmail, Slack, CRM, databases</div>
              <div>Webhooks and API access</div>
              {isEnterprise && (
                <div className="text-accent font-medium">
                  <Crown className="w-3 h-3 inline mr-1" />
                  Enterprise: Advanced integrations available
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {agent.selectedIntegrations?.length ? (
                agent.selectedIntegrations.map((intg) => (
                  <span key={intg} className="px-2 py-1 rounded-md border border-border/40 text-xs bg-card/70">{intg}</span>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">No integrations selected yet. Generate from prompt to auto-select.</div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" className="btn-glass" onClick={() => setAgent(a => ({...a, selectedIntegrations: Array.from(new Set([...(a.selectedIntegrations||[]), 'Gmail']))}))}>Connect Gmail</Button>
              <Button variant="outline" className="btn-glass" onClick={() => setAgent(a => ({...a, selectedIntegrations: Array.from(new Set([...(a.selectedIntegrations||[]), 'Slack']))}))}>Connect Slack</Button>
              <Button variant="outline" className="btn-glass" onClick={() => setAgent(a => ({...a, selectedIntegrations: Array.from(new Set([...(a.selectedIntegrations||[]), 'CRM']))}))}>Connect CRM</Button>
              {isEnterprise && (
                <>
                  <Button variant="outline" className="btn-glass">
                    <Crown className="w-3 h-3 mr-1" />
                    Enterprise DB
                  </Button>
                  <Button variant="outline" className="btn-glass">
                    <Crown className="w-3 h-3 mr-1" />
                    Custom API
                  </Button>
                </>
              )}
            </div>
          </article>

          <article className="card-premium">
            <h2 className="text-lg font-semibold text-foreground mb-3">Test & Deploy</h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-border/30 p-3 bg-card/50">
                <div className="text-sm text-muted-foreground">Sandbox preview</div>
                <div className="text-xs text-muted-foreground">Run a test task to validate behavior.</div>
                {isEnterprise && (
                  <div className="text-xs text-accent mt-1">
                    <Crown className="w-3 h-3 inline mr-1" />
                    Local execution available
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="btn-warm" onClick={() => saveAgent("draft")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline" className="btn-glass" onClick={() => navigate('/sandbox', { state: { agent } })}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Test Agent
                </Button>
                <Button onClick={() => navigate('/publish-agent', { state: { agent } })}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Agent
                </Button>
                {isEnterprise && (
                  <Button variant="outline" className="btn-glass">
                    <Crown className="w-4 h-4 mr-2" />
                    Deploy Local
                  </Button>
                )}
              </div>
            </div>
          </article>
        </aside>
      </main>
    </div>
  );
};

export default AgentBuilder;
