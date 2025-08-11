import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, LineChart, Share2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const myAgents = [
  { name: "My Research Bot", category: "Research", status: "active" as const, lastRun: "2h ago" },
  { name: "Sales Analyzer", category: "Analytics", status: "scheduled" as const, lastRun: "1d ago" },
  { name: "Content Writer", category: "Content", status: "paused" as const, lastRun: "3d ago" },
];

const MyAgents = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="My Agents – Dashboard"
        description="Manage your AI agents: run now, edit configuration, analyze usage, and publish to the marketplace."
        canonical="/my-agents"
      />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Agents</h1>
        <p className="text-muted-foreground mt-1">Run, edit, analyze, and publish your agents.</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <section className="card-premium space-y-3">
          {myAgents.map((agent) => (
            <div key={agent.name} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{agent.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{agent.category}</Badge>
                    <span>•</span>
                    <span>Last run {agent.lastRun}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="btn-glass">
                  <Play className="w-3 h-3" />
                  Run Now
                </Button>
                <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate('/builder')}>
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="btn-glass" onClick={() => navigate('/earnings')}>
                  <LineChart className="w-3 h-3" />
                  Analytics
                </Button>
                <Button size="sm">
                  <Share2 className="w-3 h-3" />
                  Publish
                </Button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default MyAgents;
