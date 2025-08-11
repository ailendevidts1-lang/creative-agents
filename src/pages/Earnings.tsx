import SEO from "@/components/SEO";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Wallet, FileDown } from "lucide-react";

const Earnings = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="Creator Revenue – Earnings"
        description="Track sales, subscriptions, and payouts from your published AI agents."
        canonical="/earnings"
      />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">Creator Revenue Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor sales, revenue, and payouts.</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <section className="grid md:grid-cols-3 gap-4">
          <MetricCard title="Total Earnings" value="$3,482" subtitle="Lifetime" icon={DollarSign} trend={{ value: "18%", isPositive: true }} />
          <MetricCard title="This Month" value="$642" subtitle="23 sales" icon={TrendingUp} trend={{ value: "6%", isPositive: true }} />
          <MetricCard title="Pending Payouts" value="$210" subtitle="Next payout in 5 days" icon={Wallet} />
        </section>

        <section className="card-premium">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Performance</h2>
            <Button variant="outline" className="btn-glass">
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">Charts and detailed analytics coming soon.</div>
        </section>
      </main>
    </div>
  );
};

export default Earnings;
