import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PublishAgent() {
  const { state } = useLocation() as { state?: { agent?: any } };
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(state?.agent || null);
  const [price, setPrice] = useState<number>(0);
  const [billing, setBilling] = useState<"one-off" | "recurring">("one-off");
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!agent) {
      try {
        const stored = JSON.parse(localStorage.getItem("agents") || "[]");
        setAgent(stored[0] || null);
      } catch (_) {}
    }
  }, [agent]);

  const publish = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("agents") || "[]");
      let updated = existing;
      if (agent) {
        const enriched = {
          ...agent,
          status: "published",
          pricing: { price, billing, interval },
          marketplaceNotes: notes,
        };
        // replace or insert
        const idx = existing.findIndex((a: any) => a.id === agent.id);
        if (idx >= 0) {
          updated = [...existing];
          updated[idx] = enriched;
        } else {
          updated = [enriched, ...existing];
        }
        localStorage.setItem("agents", JSON.stringify(updated));
      }
    } catch (_) {}
    navigate("/my-agents");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO title="Publish Agent – Pricing & Listing" description="Set price and billing, then publish your agent to the marketplace." canonical="/publish-agent" />

      <header className="max-w-3xl mx-auto mb-4">
        <h1 className="text-3xl font-bold text-foreground">Publish Agent</h1>
        <p className="text-muted-foreground">Configure pricing and listing details.</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-4">
        {agent ? (
          <section className="card-premium space-y-3">
            <div className="flex items-center gap-3">
              <img src={agent.avatarUrl} alt={`${agent.name} avatar`} className="w-12 h-12 rounded-md border border-border/40 bg-card" loading="lazy" />
              <div>
                <div className="text-foreground font-medium">{agent.name}</div>
                <div className="text-xs text-muted-foreground">{agent.description}</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Price (USD)</label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="e.g., 19" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Payment Type</label>
                <div className="flex gap-2 pt-2">
                  <Button variant={billing === 'one-off' ? 'default' : 'outline'} onClick={() => setBilling('one-off')}>One-off</Button>
                  <Button variant={billing === 'recurring' ? 'default' : 'outline'} onClick={() => setBilling('recurring')}>Recurring</Button>
                </div>
              </div>
              {billing === 'recurring' && (
                <div>
                  <label className="text-sm text-muted-foreground">Interval</label>
                  <div className="flex gap-2 pt-2">
                    <Button variant={interval === 'monthly' ? 'default' : 'outline'} onClick={() => setInterval('monthly')}>Monthly</Button>
                    <Button variant={interval === 'yearly' ? 'default' : 'outline'} onClick={() => setInterval('yearly')}>Yearly</Button>
                  </div>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground">Listing Notes</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Highlight benefits, requirements, or usage limits." rows={3} />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button className="btn-warm" onClick={publish}>Save & Publish</Button>
              <Button variant="outline" className="btn-glass" onClick={() => navigate('/builder')}>Back to Builder</Button>
            </div>
          </section>
        ) : (
          <section className="card-premium">
            <p className="text-sm text-muted-foreground">No agent selected. Go back to Builder.</p>
            <div className="pt-2"><Button variant="outline" className="btn-glass" onClick={() => navigate('/builder')}>Back to Builder</Button></div>
          </section>
        )}
      </main>
    </div>
  );
}
