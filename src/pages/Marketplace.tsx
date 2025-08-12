import SEO from "@/components/SEO";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

const mockAgents = [
  { id: "1", name: "Research Assistant Pro", description: "Market research & competitive analysis", category: "Research", rating: 4.9, runs: 15420, price: 12, avatar: "🔍", isPopular: true },
  { id: "2", name: "Email Rewriter", description: "Rewrite emails with tone & clarity", category: "Content", rating: 4.6, runs: 8020, price: 0, avatar: "✉️" },
  { id: "3", name: "Lead Generator", description: "Find and qualify leads from the web", category: "Sales", rating: 4.7, runs: 11020, price: 9, avatar: "🎯" },
  { id: "4", name: "Contract Analyzer", description: "Flag risks and summarize clauses", category: "Legal", rating: 4.8, runs: 3120, price: 19, avatar: "⚖️" },
];

const mockWorkflows = [
  { id: "w1", name: "Weekly Research Digest", description: "Timer → Research Agent → Summarizer → Email Alert", category: "Workflow", rating: 4.8, runs: 1240, price: 15, avatar: "🧩" },
  { id: "w2", name: "Lead Nurturing Bundle", description: "Webhook → Qualify → Email Campaign", category: "Workflow", rating: 4.6, runs: 980, price: 19, avatar: "🧩" },
];

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="Browse Marketplace – Agents & Workflows"
        description="Discover, preview, and deploy AI agents and workflow bundles. Filter by category, price, and rating."
        canonical="/marketplace"
      />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">Browse Marketplace</h1>
        <p className="text-muted-foreground mt-1">Search, filter, and find the right agent for your workflow.</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <section className="card-premium">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Input placeholder="Search agents..." />
              <Button variant="outline" className="btn-glass">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="btn-glass">Research</Button>
              <Button variant="outline" className="btn-glass">Marketing</Button>
              <Button variant="outline" className="btn-glass">Sales</Button>
              <Button variant="outline" className="btn-glass">Legal</Button>
              <Button variant="outline" className="btn-glass">Workflows</Button>
            </div>
          </div>
        </section>

        <section>
          <div className="grid md:grid-cols-2 gap-4">
            {mockAgents.map((a) => (
              <AgentCard key={a.id} {...a} />
            ))}
          </div>
        </section>

        <section>
          <header className="flex items-center justify-between mb-3 mt-6">
            <h2 className="text-xl font-semibold text-foreground">Workflow Bundles</h2>
          </header>
          <div className="grid md:grid-cols-2 gap-4">
            {mockWorkflows.map((w) => (
              <AgentCard key={w.id} {...w} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Marketplace;
