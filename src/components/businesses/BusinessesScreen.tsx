import React, { useState } from "react";
import { ArrowLeft, Plus, TrendingUp, DollarSign, Target, Calendar, Settings, Zap, Eye, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Business {
  id: string;
  name: string;
  type: string;
  status: "planning" | "executing" | "live" | "paused";
  dailyRevenue: number;
  totalRevenue: number;
  nextTasks: string[];
  progress: number;
  description: string;
  roi: number;
  channels: string[];
}

interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  expectedRoi: number;
  rampTime: string;
  market: string;
  difficulty: "low" | "medium" | "high";
  investment: number;
}

interface BusinessPlan {
  id: string;
  ideaId: string;
  title: string;
  niche: string;
  budget: number;
  timeline: string;
  channels: string[];
  milestones: string[];
  ready: boolean;
}

interface BusinessesScreenProps {
  onBack: () => void;
}

export function BusinessesScreen({ onBack }: BusinessesScreenProps) {
  const [activeTab, setActiveTab] = useState("ideas");
  const [businesses, setBusinesses] = useState<Business[]>([
    {
      id: "1",
      name: "Tech Myths Shorts",
      type: "Content Business",
      status: "live",
      dailyRevenue: 127.50,
      totalRevenue: 3825,
      nextTasks: ["Upload tomorrow's video", "Reply to 5 comments", "Check analytics"],
      progress: 78,
      description: "Viral TikTok/YouTube Shorts debunking tech myths",
      roi: 340,
      channels: ["TikTok", "YouTube", "Instagram"]
    },
    {
      id: "2", 
      name: "Dental Website Agency",
      type: "Service Business",
      status: "executing",
      dailyRevenue: 85.20,
      totalRevenue: 1704,
      nextTasks: ["Complete Dr. Smith's site", "Send 3 cold emails", "Schedule consultation call"],
      progress: 45,
      description: "Custom websites for dental practices",
      roi: 280,
      channels: ["Email", "LinkedIn", "Cold Calling"]
    }
  ]);

  const [ideas, setIdeas] = useState<BusinessIdea[]>([
    {
      id: "1",
      title: "AI Recipe Optimizer",
      description: "Mobile app that optimizes recipes based on dietary restrictions and available ingredients",
      expectedRoi: 450,
      rampTime: "2-3 months",
      market: "Health & Nutrition",
      difficulty: "medium",
      investment: 2500
    },
    {
      id: "2",
      title: "Local Business Social Media Automation",
      description: "Automated social media posting and engagement for small businesses",
      expectedRoi: 320,
      rampTime: "6-8 weeks",
      market: "SMB Services",
      difficulty: "low",
      investment: 1200
    },
    {
      id: "3",
      title: "Niche Newsletter Empire",
      description: "Curated newsletters for specific professional niches with premium subscriptions",
      expectedRoi: 280,
      rampTime: "4-6 months",
      market: "Information Products",
      difficulty: "high",
      investment: 800
    }
  ]);

  const [plans, setPlans] = useState<BusinessPlan[]>([
    {
      id: "1",
      ideaId: "1",
      title: "AI Recipe Optimizer - Launch Plan",
      niche: "Health-conscious home cooks",
      budget: 2500,
      timeline: "12 weeks",
      channels: ["App Store", "Social Media", "Food Blogs"],
      milestones: ["MVP Development", "Beta Testing", "App Store Launch", "Marketing Campaign"],
      ready: true
    }
  ]);

  const generateNewIdea = () => {
    const sampleIdeas = [
      {
        title: "Virtual Interior Design Service",
        description: "AI-powered interior design consultations with 3D visualization",
        expectedRoi: 380,
        rampTime: "3-4 months",
        market: "Home & Design",
        difficulty: "medium" as const,
        investment: 3000
      },
      {
        title: "Automated Podcast Editing",
        description: "AI service that edits and enhances podcasts automatically",
        expectedRoi: 420,
        rampTime: "2-3 months", 
        market: "Creator Tools",
        difficulty: "high" as const,
        investment: 1800
      }
    ];

    const newIdea = {
      id: Date.now().toString(),
      ...sampleIdeas[Math.floor(Math.random() * sampleIdeas.length)]
    };

    setIdeas(prev => [newIdea, ...prev]);
    toast.success("New business idea generated!");
  };

  const approveIdea = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const newPlan: BusinessPlan = {
      id: Date.now().toString(),
      ideaId,
      title: `${idea.title} - Launch Plan`,
      niche: "Target audience analysis pending",
      budget: idea.investment,
      timeline: "8-12 weeks",
      channels: ["Digital Marketing", "Social Media", "Direct Sales"],
      milestones: ["Market Research", "Product Development", "Beta Testing", "Launch", "Scale"],
      ready: false
    };

    setPlans(prev => [newPlan, ...prev]);
    setActiveTab("plans");
    toast.success("Business plan created! Review and approve to begin execution.");
  };

  const approvePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const newBusiness: Business = {
      id: Date.now().toString(),
      name: plan.title.replace(" - Launch Plan", ""),
      type: "Digital Business",
      status: "planning",
      dailyRevenue: 0,
      totalRevenue: 0,
      nextTasks: ["Set up accounts", "Create initial content", "Launch marketing"],
      progress: 5,
      description: "Automated business execution starting...",
      roi: 0,
      channels: plan.channels
    };

    setBusinesses(prev => [newBusiness, ...prev]);
    setPlans(prev => prev.filter(p => p.id !== planId));
    setActiveTab("active");
    toast.success("Business execution started! AI is now working on your behalf.");
  };

  const getStatusColor = (status: Business["status"]) => {
    switch (status) {
      case "live": return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "executing": return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "planning": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
      case "paused": return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
      default: return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  const getDifficultyColor = (difficulty: BusinessIdea["difficulty"]) => {
    switch (difficulty) {
      case "low": return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
      case "high": return "bg-red-500/20 text-red-700 dark:text-red-300";
      default: return "bg-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  const totalRevenue = businesses.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalDailyRevenue = businesses.reduce((sum, b) => sum + b.dailyRevenue, 0);
  const activeBusiness = businesses.filter(b => b.status === "live" || b.status === "executing").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create Businesses
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered business generation and management
            </p>
          </div>
          <Button onClick={generateNewIdea} className="gap-2">
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${totalDailyRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Daily Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{activeBusiness}</div>
            <div className="text-xs text-muted-foreground">Active Businesses</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ideas">Ideas ({ideas.length})</TabsTrigger>
            <TabsTrigger value="plans">Plans ({plans.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({businesses.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Ideas Tab */}
          <TabsContent value="ideas" className="space-y-4">
            <div className="text-center py-6">
              <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Business Idea Generator</h3>
              <p className="text-muted-foreground mb-4">Get AI-suggested business ideas with market analysis and ROI projections</p>
            </div>

            <div className="grid gap-4">
              {ideas.map((idea) => (
                <Card key={idea.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(idea.difficulty)}>
                        {idea.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Expected ROI</div>
                        <div className="text-lg font-semibold text-green-600">{idea.expectedRoi}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Ramp Time</div>
                        <div className="text-lg font-semibold">{idea.rampTime}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Market</div>
                        <div className="text-lg font-semibold">{idea.market}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Investment</div>
                        <div className="text-lg font-semibold">${idea.investment}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => approveIdea(idea.id)} className="flex-1">
                        <Target className="h-4 w-4 mr-2" />
                        Start Planning
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Business Plans Yet</h3>
                <p className="text-muted-foreground">Approve an idea to create your first business plan</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">Target: {plan.niche}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Budget</div>
                          <div className="text-lg font-semibold">${plan.budget}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Timeline</div>
                          <div className="text-lg font-semibold">{plan.timeline}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Channels</div>
                          <div className="text-sm">{plan.channels.join(", ")}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Milestones</div>
                        <div className="grid grid-cols-2 gap-2">
                          {plan.milestones.map((milestone, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                              {milestone}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => approvePlan(plan.id)} 
                          className="flex-1"
                          disabled={!plan.ready}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {plan.ready ? "Start Execution" : "Plan in Progress..."}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Businesses Tab */}
          <TabsContent value="active" className="space-y-4">
            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Businesses</h3>
                <p className="text-muted-foreground">Create and approve a plan to launch your first business</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {businesses.map((business) => (
                  <Card key={business.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{business.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{business.description}</p>
                        </div>
                        <Badge className={getStatusColor(business.status)}>
                          {business.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Daily Revenue</div>
                          <div className="text-lg font-semibold text-green-600">
                            ${business.dailyRevenue.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Revenue</div>
                          <div className="text-lg font-semibold">${business.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                          <div className="text-lg font-semibold text-accent">{business.roi}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Progress</div>
                          <div className="flex items-center gap-2">
                            <Progress value={business.progress} className="flex-1" />
                            <span className="text-sm font-medium">{business.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Next Tasks</div>
                        <div className="space-y-1">
                          {business.nextTasks.slice(0, 3).map((task, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Manager
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Business Analytics</h3>
              <p className="text-muted-foreground">Comprehensive analytics and insights coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}