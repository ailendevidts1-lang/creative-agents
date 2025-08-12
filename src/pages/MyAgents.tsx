import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, LineChart, Share2, Pencil, Crown, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";
import { useEffect, useState } from "react";

const MyAgents = () => {
  const navigate = useNavigate();
  const { isAdmin, subscription } = useAuthSub();
  const isEnterprise = subscription.subscription_tier === "Enterprise";
  const [agents, setAgents] = useState<any[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("agents") || "[]");
      setAgents(stored);
    } catch (_) {}
  }, []);
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="My Agents – Dashboard"
        description="Manage your AI agents: run now, edit configuration, analyze usage, and publish to the marketplace."
        canonical="/my-agents"
      />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Agents</h1>
        <p className="text-muted-foreground mt-1">Run, edit, analyze, and publish your agents.</p>
        {isEnterprise && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
            <Crown className="w-4 h-4 mr-1" />
            Enterprise - Local execution & advanced features
          </div>
        )}
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
                      <Bot className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{agent.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">{agent.category || 'General'}</Badge>
                      <span>•</span>
                      <span className="capitalize">{agent.status || 'draft'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate('/sandbox', { state: { agent } })}>
                    <Play className="w-3 h-3" />
                    Run Now
                  </Button>
                  {isEnterprise && (
                    <Button size="sm" variant="outline" className="btn-glass">
                      <Server className="w-3 h-3" />
                      Run Local
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate('/builder')}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate('/earnings')}>
                    <LineChart className="w-3 h-3" />
                    Analytics
                  </Button>
                  <Button size="sm" onClick={() => navigate('/publish-agent', { state: { agent } })}>
                    <Share2 className="w-3 h-3" />
                    Publish
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>

        {isEnterprise && (
          <section className="card-premium">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" />
              Enterprise Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                <h3 className="font-medium text-foreground mb-2">Local Agent Execution</h3>
                <p className="text-sm text-muted-foreground mb-3">Run agents on your own infrastructure for maximum security and performance.</p>
                <Button size="sm" variant="outline" className="btn-glass">
                  <Server className="w-3 h-3 mr-1" />
                  Configure Local
                </Button>
              </div>
              <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                <h3 className="font-medium text-foreground mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground mb-3">Deep insights into agent performance, costs, and optimization opportunities.</p>
                <Button size="sm" variant="outline" className="btn-glass">
                  <LineChart className="w-3 h-3 mr-1" />
                  View Insights
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MyAgents;
