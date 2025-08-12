import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SEO from "@/components/SEO";
import { Activity as ActivityIcon, Bot, ShoppingBag, PlusCircle, Users, TrendingUp, ChevronRight } from "lucide-react";

const userName = "Alex"; // TODO: wire to auth profile when available

const activity = [
  { id: 1, icon: <Bot className="size-4" />, label: "Agent 'Newsletter Summarizer' ran successfully", time: "2h ago" },
  { id: 2, icon: <ShoppingBag className="size-4" />, label: "Purchased 'SEO Blog Writer'", time: "Yesterday" },
  { id: 3, icon: <Users className="size-4" />, label: "Installed by 3 new users", time: "2d ago" },
];

export default function Dashboard() {
  const monthlyRuns = { used: 620, limit: 1000 };
  const activeAgents = { count: 7, limit: 15 };
  const planUsage = { used: 65, limit: 100 }; // percent
  const earningsThisMonth = 1250; // USD placeholder

  return (
    <>
      <SEO
        title="AgentHub Dashboard — Central hub for your account and agent activity"
        description="Manage agents, see recent activity, track usage and earnings in one place."
        canonical={window.location.origin + "/dashboard"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AgentHub Dashboard",
          applicationCategory: "BusinessApplication",
          description: "Central hub for account and agent activity",
          url: window.location.origin + "/dashboard",
        }}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="sr-only">AgentHub Dashboard</h1>

        {/* Welcome Banner */}
        <header className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Welcome Banner</p>
            <p className="text-2xl md:text-3xl font-heading font-semibold">
              Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{userName}</span>.
            </p>
            <p className="text-muted-foreground">Your central hub for your account and agent activity.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Quick Start + Activity */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Start Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick Start</CardTitle>
                <CardDescription>Jump right into common actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <QuickLink to="/builder" icon={<PlusCircle className="size-4" />} label="Create New Agent" />
                  <QuickLink to="/marketplace" icon={<ShoppingBag className="size-4" />} label="Browse Marketplace" />
                  <QuickLink to="/agents" icon={<Bot className="size-4" />} label="View My Agents" />
                  <QuickLink to="/settings" icon={<TrendingUp className="size-4" />} label="View Earnings (Billing)" />
                  <QuickLink to="/settings" icon={<Users className="size-4" />} label="Invite & Earn (Referrals)" />
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Activity Feed</CardTitle>
                <CardDescription>Recent runs, purchases, and installs.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {activity.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <div className="rounded-md bg-muted p-2 text-muted-foreground">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Usage + Earnings */}
          <div className="space-y-6 lg:col-span-1">
            {/* Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Usage Overview</CardTitle>
                <CardDescription>Meters for runs, active agents, and plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Monthly Runs</span>
                    <span className="text-muted-foreground">
                      {monthlyRuns.used}/{monthlyRuns.limit}
                    </span>
                  </div>
                  <Progress value={(monthlyRuns.used / monthlyRuns.limit) * 100} aria-label="Monthly runs usage" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Active Agents</span>
                    <span className="text-muted-foreground">
                      {activeAgents.count}/{activeAgents.limit}
                    </span>
                  </div>
                  <Progress value={(activeAgents.count / activeAgents.limit) * 100} aria-label="Active agents usage" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Plan Limits</span>
                    <span className="text-muted-foreground">{planUsage.used}%</span>
                  </div>
                  <Progress value={planUsage.used} aria-label="Plan usage percent" />
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Earnings Summary</CardTitle>
                <CardDescription>For creators — this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-heading font-semibold">${earningsThisMonth.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total this month</p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link to="/settings" className="inline-flex items-center">
                      View analytics
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Button asChild variant="outline" className="justify-between">
      <Link to={to} className="flex items-center w-full">
        <span className="mr-2 text-muted-foreground">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="size-4" />
      </Link>
    </Button>
  );
}
