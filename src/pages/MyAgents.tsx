import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";
import { useEffect, useMemo, useState } from "react";
import { Play, Pencil, LineChart, Share2, Server, Upload, CircleSlash2, Trash2 } from "lucide-react";
import { getAgents, saveAgent, deleteAgentById, type AgentModel } from "@/utils/agents";
import { checkLicense, createListing, unpublishListing, updateListing } from "@/utils/marketplaceApi";
import { supabase } from "@/integrations/supabase/client";

export default function MyAgents() {
  const navigate = useNavigate();
  const { user } = useAuthSub();
  const ownerId = user?.id || "anonymous";
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentModel[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const isEnterprise = false;

  function refresh() {
    const all = getAgents(ownerId);
    setAgents(all);
  }

  useEffect(() => { refresh(); }, [ownerId]);

  async function runNow(agent: AgentModel) {
    if (agent.priceType !== "free") {
      const license = await checkLicense(agent.id, ownerId);
      if (!license.licensed) {
        toast({ title: "You need a license to run this agent. Go to Marketplace to purchase." });
        return;
      }
    }
    setRunningId(agent.id);
    try {
      const tasks = [
        { id: "step1", type: "llm", model: "gpt-4o-mini", system: agent.systemPrompt, promptTemplate: `Run: {{prompt}}\n\n${agent.instructions || ""}` },
      ];
      await supabase.functions.invoke("agent-run", { body: { tasks, input: { prompt: "Quick run" }, system: agent.systemPrompt } });
      toast({ title: "Run started." });
    } catch (e) {
      // ignore
    } finally {
      setRunningId(null);
    }
  }

  async function publish(agent: AgentModel) {
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
      const updated = { ...agent, marketplaceListingId: res.listingId, status: "published" as const, visibility: "public" as const };
      saveAgent(updated); refresh();
      toast({ title: "Agent published to Marketplace." });
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
      const updated = { ...agent, status: "published" as const, visibility: "public" as const };
      saveAgent(updated); refresh();
      toast({ title: "Agent published to Marketplace." });
    }
  }

  async function unpublish(agent: AgentModel) {
    if (!agent.marketplaceListingId) return;
    await unpublishListing(agent.marketplaceListingId);
    const updated = { ...agent, status: "draft" as const, visibility: "private" as const };
    saveAgent(updated); refresh();
    toast({ title: "Agent unpublished from Marketplace." });
  }

  function remove(agent: AgentModel) {
    deleteAgentById(agent.id); refresh();
    toast({ title: "Agent deleted." });
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO title="My Agents – Library" description="Run, edit, publish/unpublish your agents and view analytics." canonical="/agents" />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Agents</h1>
        <p className="text-muted-foreground mt-1">Run, edit, analyze, and publish your agents.</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <section className="card-premium space-y-3">
          {agents.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No agents yet. Go to Builder to create one.</div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={`${agent.name} avatar`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Badge variant="secondary" className="text-xs">{agent.category || 'General'}</Badge>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{agent.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">{agent.category || 'General'}</Badge>
                      <span>•</span>
                      <span className="capitalize">{agent.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => runNow(agent)} disabled={runningId === agent.id}>
                    <Play className="w-3 h-3" />
                    Run Now
                  </Button>
                  {isEnterprise && (
                    <Button size="sm" variant="outline" className="btn-glass">
                      <Server className="w-3 h-3" />
                      Run Local
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate(`/builder?id=${agent.id}`)}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate('/earnings')}>
                    <LineChart className="w-3 h-3" />
                    Analytics
                  </Button>
                  {agent.status === 'published' && agent.marketplaceListingId ? (
                    <Button size="sm" variant="outline" className="btn-glass" onClick={() => unpublish(agent)}>
                      <CircleSlash2 className="w-3 h-3" />
                      Unpublish
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => publish(agent)}>
                      <Upload className="w-3 h-3" />
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => remove(agent)}>
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
