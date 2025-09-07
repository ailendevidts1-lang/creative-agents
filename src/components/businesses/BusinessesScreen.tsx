import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, TrendingUp, DollarSign, Target, Calendar, Settings, Zap, Eye, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Load businesses
      const { data: businessesData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (businessError) throw businessError;

      // Load business ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('business_ideas')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ideasError) throw ideasError;

      // Load business plans
      const { data: plansData, error: plansError } = await supabase
        .from('business_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (plansError) throw plansError;

      // Transform data to match component interfaces
      setBusinesses(businessesData?.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        status: b.status as Business["status"],
        dailyRevenue: Number(b.daily_revenue) || 0,
        totalRevenue: Number(b.total_revenue) || 0,
        nextTasks: b.next_tasks || [],
        progress: b.progress || 0,
        description: b.description || "",
        roi: Number(b.roi) || 0,
        channels: b.channels || []
      })) || []);

      setIdeas(ideasData?.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description || "",
        expectedRoi: Number(i.expected_roi) || 0,
        rampTime: i.ramp_time || "",
        market: i.market || "",
        difficulty: (i.difficulty as BusinessIdea["difficulty"]) || "medium",
        investment: Number(i.investment) || 0
      })) || []);

      setPlans(plansData?.map(p => ({
        id: p.id,
        ideaId: p.idea_id || "",
        title: p.title,
        niche: p.niche || "",
        budget: Number(p.budget) || 0,
        timeline: p.timeline || "",
        channels: p.channels || [],
        milestones: p.milestones || [],
        ready: p.ready || false
      })) || []);

    } catch (error) {
      console.error('Error loading business data:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const generateNewIdea = async () => {
    try {
      setLoading(true);
      toast.loading("Generating new business idea...");

      const { data, error } = await supabase.functions.invoke('generate-business-idea', {
        body: {
          prompt: "Generate an innovative and profitable business idea",
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      if (data?.success && data?.businessIdea) {
        const idea = data.businessIdea;
        const newIdea: BusinessIdea = {
          id: Date.now().toString(),
          title: idea.title,
          description: idea.description,
          expectedRoi: parseInt(idea.startup_costs.replace(/[^0-9]/g, '')) || 300,
          rampTime: "2-4 months",
          market: idea.industry,
          difficulty: "medium",
          investment: parseInt(idea.startup_costs.replace(/[^0-9]/g, '')) || 2000
        };

        setIdeas(prev => [newIdea, ...prev]);
        toast.dismiss();
        toast.success("New business idea generated!");
      } else {
        throw new Error('Failed to generate business idea');
      }
    } catch (error) {
      console.error('Error generating idea:', error);
      toast.dismiss();
      toast.error('Failed to generate business idea');
    } finally {
      setLoading(false);
    }
  };

  const approveIdea = async (ideaId: string) => {
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) return;

      setLoading(true);
      toast.loading("Creating business plan...");

      const { data, error } = await supabase.functions.invoke('create-business-plan', {
        body: {
          businessIdeaId: ideaId,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      if (data?.success && data?.businessPlan) {
        const plan = data.businessPlan;
        const newPlan: BusinessPlan = {
          id: plan.id,
          ideaId,
          title: plan.title,
          niche: plan.content?.executive_summary || "Target audience analysis pending",
          budget: idea.investment,
          timeline: "8-12 weeks",
          channels: plan.content?.marketing_sales?.marketing_strategy ? 
            [plan.content.marketing_sales.marketing_strategy] : 
            ["Digital Marketing", "Social Media", "Direct Sales"],
          milestones: plan.content?.milestones?.map((m: any) => m.milestone) || 
            ["Market Research", "Product Development", "Beta Testing", "Launch", "Scale"],
          ready: true
        };

        setPlans(prev => [newPlan, ...prev]);
        setActiveTab("plans");
        toast.dismiss();
        toast.success("Business plan created! Review and approve to begin execution.");
      } else {
        throw new Error('Failed to create business plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.dismiss();
      toast.error('Failed to create business plan');
    } finally {
      setLoading(false);
    }
  };

  const approvePlan = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      setLoading(true);
      toast.loading("Starting business execution...");

      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Create business in database
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.data.user.id,
          name: plan.title.replace(" - Launch Plan", ""),
          type: "Digital Business",
          status: "planning",
          daily_revenue: 0,
          total_revenue: 0,
          roi: 0,
          progress: 5,
          description: "Automated business execution starting...",
          channels: plan.channels,
          next_tasks: ["Set up accounts", "Create initial content", "Launch marketing"]
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create automation pipeline
      const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('create-automation-pipeline', {
        body: {
          businessId: businessData.id,
          userId: user.data.user.id,
          automationType: 'comprehensive'
        }
      });

      if (pipelineError) console.warn('Pipeline creation warning:', pipelineError);

      const newBusiness: Business = {
        id: businessData.id,
        name: businessData.name,
        type: businessData.type,
        status: businessData.status as Business["status"],
        dailyRevenue: 0,
        totalRevenue: 0,
        nextTasks: businessData.next_tasks || [],
        progress: businessData.progress || 5,
        description: businessData.description || "",
        roi: 0,
        channels: businessData.channels || []
      };

      setBusinesses(prev => [newBusiness, ...prev]);
      setPlans(prev => prev.filter(p => p.id !== planId));
      setActiveTab("active");
      toast.dismiss();
      toast.success("Business execution started! AI is now working on your behalf.");
    } catch (error) {
      console.error('Error starting business:', error);
      toast.dismiss();
      toast.error('Failed to start business execution');
    } finally {
      setLoading(false);
    }
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