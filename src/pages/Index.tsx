import { WelcomeBanner } from "@/components/WelcomeBanner";
import { AgentCard } from "@/components/AgentCard";
import { MetricCard } from "@/components/MetricCard";
import { ActivityItem } from "@/components/ActivityItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  BookOpen, 
  MessageCircle,
  Award,
  ExternalLink,
  Play,
  MoreHorizontal,
  Filter,
  Plus,
  Bot
} from "lucide-react";

const Index = () => {
  // Mock data
  const featuredAgents = [
    {
      id: "1",
      name: "Research Assistant Pro",
      description: "Automates comprehensive market research and competitive analysis with real-time data gathering",
      category: "Research",
      rating: 4.9,
      runs: 15420,
      price: 12,
      avatar: "🔍",
      isPopular: true
    },
    {
      id: "2", 
      name: "Sales Report Generator",
      description: "Creates weekly sales reports with insights, trends, and actionable recommendations",
      category: "Analytics",
      rating: 4.7,
      runs: 8930,
      price: 8,
      avatar: "📊"
    },
    {
      id: "3",
      name: "Code Review Assistant", 
      description: "Reviews pull requests and provides security analysis with improvement suggestions",
      category: "Development",
      rating: 4.8,
      runs: 12340,
      price: 15,
      avatar: "⚡"
    },
    {
      id: "4",
      name: "Content Optimizer",
      description: "Optimizes blog posts and marketing content for SEO and engagement metrics",
      category: "Marketing", 
      rating: 4.6,
      runs: 6720,
      price: 10,
      avatar: "✨"
    },
    {
      id: "5",
      name: "Legal Document Analyzer",
      description: "Reviews contracts and legal documents for compliance and risk assessment",
      category: "Legal",
      rating: 4.9,
      runs: 3210,
      price: 25,
      avatar: "⚖️"
    },
    {
      id: "6",
      name: "Email Campaign Manager",
      description: "Creates and schedules personalized email campaigns with A/B testing",
      category: "Marketing",
      rating: 4.5,
      runs: 9850,
      price: 7,
      avatar: "📧"
    }
  ];

  const myAgents = [
    {
      name: "My Research Bot",
      type: "Research",
      lastRun: "2 hours ago",
      status: "active" as const,
      timeSaved: "12 hours"
    },
    {
      name: "Sales Analyzer",
      type: "Analytics", 
      lastRun: "1 day ago",
      status: "paused" as const,
      timeSaved: "8 hours"
    },
    {
      name: "Content Writer",
      type: "Content",
      lastRun: "3 days ago", 
      status: "error" as const,
      timeSaved: "15 hours"
    }
  ];

  const recentActivities = [
    {
      type: "completion" as const,
      title: "Research task completed",
      description: "Market analysis for Q4 strategy completed successfully",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      agentName: "Research Assistant Pro"
    },
    {
      type: "revenue" as const,
      title: "Agent sale",
      description: "Your Sales Report Generator was purchased",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      amount: 8,
      agentName: "Sales Report Generator"
    },
    {
      type: "review" as const,
      title: "New 5-star review",
      description: "Great agent! Saved me hours of work every week",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      agentName: "Code Review Assistant"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <WelcomeBanner 
          userName="Alex"
          onboardingProgress={{ completed: 3, total: 5 }}
        />

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Marketplace Highlights */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Featured Agents</h2>
                  <p className="text-muted-foreground">Popular AI agents trending this week</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="btn-glass">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="btn-glass">
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {featuredAgents.map((agent) => (
                  <AgentCard key={agent.id} {...agent} />
                ))}
              </div>
            </section>

            {/* My Agents */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">My Agents</h2>
                  <p className="text-muted-foreground">Your deployed agents and their performance</p>
                </div>
                <Button className="btn-warm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </div>
              
              <div className="card-premium space-y-4">
                {myAgents.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{agent.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">{agent.type}</Badge>
                          <span>•</span>
                          <span>Last run {agent.lastRun}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Saved</div>
                        <div className="font-medium text-foreground">{agent.timeSaved}</div>
                      </div>
                      <Badge 
                        className={`${
                          agent.status === 'active' ? 'status-active' : 
                          agent.status === 'paused' ? 'status-paused' : 
                          'status-error'
                        }`}
                      >
                        {agent.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="btn-glass">
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="btn-glass">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue & Usage Summary */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">This Month</h3>
              <div className="space-y-4">
                <MetricCard
                  title="Revenue Earned"
                  value="$247"
                  subtitle="From 23 agent sales"
                  icon={DollarSign}
                  trend={{ value: "23%", isPositive: true }}
                />
                <MetricCard
                  title="Agent Runs"
                  value="1,327"
                  subtitle="Across all your agents"
                  icon={TrendingUp}
                  trend={{ value: "12%", isPositive: true }}
                />
                <MetricCard
                  title="Time Saved"
                  value="47h"
                  subtitle="By users of your agents"
                  icon={Clock}
                />
              </div>
            </section>

            {/* Activity Feed */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 btn-glass">
                View All Activity
              </Button>
            </section>

            {/* Education & Community */}
            <section className="card-glow">
              <h3 className="text-lg font-semibold text-foreground mb-4">Learn & Connect</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-left">
                  <BookOpen className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Agent Creation Guide</div>
                    <div className="text-xs text-muted-foreground">Build your first AI agent</div>
                  </div>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-left">
                  <MessageCircle className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Community Forum</div>
                    <div className="text-xs text-muted-foreground">Get help from other creators</div>
                  </div>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-left">
                  <Award className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Agent of the Month</div>
                    <div className="text-xs text-muted-foreground">Featured success stories</div>
                  </div>
                </Button>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="card-premium bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">234</div>
                <div className="text-sm text-muted-foreground">Agents ran in the last hour</div>
                <div className="flex items-center justify-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  Live marketplace activity
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;