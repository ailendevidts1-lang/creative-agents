import { useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Settings2, PlayCircle, Save, Send, BookTemplate, Crown, Sparkles, Loader2 } from "lucide-react";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AgentBuilder = () => {
  const { isAdmin, subscription, startCheckout } = useAuthSub();
  const { toast } = useToast();
  const isEnterprise = subscription.subscription_tier === "Enterprise";
  const isPremiumOrEnterprise = subscription.subscription_tier === "Premium" || isEnterprise;
  const isBuilderOrHigher = subscription.subscription_tier === "Builder" || isPremiumOrEnterprise || isAdmin;

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
  });

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke("generate-agent", { body: { prompt } });
      if (error) throw new Error(error.message || "Failed to generate agent");
      const spec = data?.spec || {};
      setAgent((prev) => ({
        ...prev,
        name: spec.name ?? prev.name,
        category: spec.category ?? prev.category,
        description: spec.description ?? prev.description,
        tags: Array.isArray(spec.tags) ? spec.tags.join(", ") : (prev.tags || ""),
        personality: spec.personality ?? prev.personality,
        actions: Array.isArray(spec.actions) ? spec.actions.join(", ") : (prev.actions || ""),
        knowledge: Array.isArray(spec.knowledge) ? spec.knowledge.join(", ") : (prev.knowledge || ""),
      }));
      toast({ title: "Agent generated", description: "Fields pre-filled from your prompt." });
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
              <Button variant="outline" className="btn-glass">Connect Gmail</Button>
              <Button variant="outline" className="btn-glass">Connect Slack</Button>
              <Button variant="outline" className="btn-glass">Connect CRM</Button>
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
                <Button className="btn-warm" onClick={() => saveAgent("draft")}>\n                  <Save className=\"w-4 h-4 mr-2\" />\n                  Save Draft\n                </Button>
                <Button variant="outline" className="btn-glass">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Test Agent
                </Button>
                <Button>
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
