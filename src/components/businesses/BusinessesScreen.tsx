import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, TrendingUp, DollarSign, Target, Calendar, Settings, Zap, Eye, BarChart3, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessService } from "@/hooks/useBusinessService";

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
  const [showIdeaDialog, setShowIdeaDialog] = useState(false);
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [autoExecutePipeline, setAutoExecutePipeline] = useState(true);
  const [pipelineProgress, setPipelineProgress] = useState<{
    stage: 'idle' | 'generating' | 'planning' | 'executing' | 'complete';
    message: string;
  }>({ stage: 'idle', message: '' });
  const businessService = useBusinessService();

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    const data = await businessService.loadBusinessData();
    setBusinesses(data.businesses);
    setIdeas(data.ideas);
    setPlans(data.plans);
  };
      
  const executeFullPipeline = async (prompt: string) => {
    try {
      setPipelineProgress({ stage: 'generating', message: 'Generating business idea...' });
      
      // Step 1: Generate business idea
      const newIdea = await businessService.generateBusinessIdea(prompt);
      if (!newIdea) throw new Error('Failed to generate idea');
      
      setIdeas(prev => [newIdea, ...prev]);
      toast.success("Business idea generated!");

      if (!autoExecutePipeline) {
        setPipelineProgress({ stage: 'idle', message: '' });
        return;
      }

      // Step 2: Create business plan
      setPipelineProgress({ stage: 'planning', message: 'Creating comprehensive business plan...' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for UX
      
      const newPlan = await businessService.createBusinessPlan(newIdea.id);
      if (!newPlan) throw new Error('Failed to create plan');
      
      setPlans(prev => [newPlan, ...prev]);
      toast.success("Business plan created!");

      // Step 3: Start business execution
      setPipelineProgress({ stage: 'executing', message: 'Starting automated business execution...' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for UX
      
      const newBusiness = await businessService.startBusiness(newPlan);
      if (!newBusiness) throw new Error('Failed to start business');
      
      setBusinesses(prev => [newBusiness, ...prev]);
      setPlans(prev => prev.filter(p => p.id !== newPlan.id));
      
      setPipelineProgress({ stage: 'complete', message: 'Business launched successfully!' });
      setActiveTab("active");
      toast.success("🎉 Full business pipeline completed! Your AI business is now running.");
      
      // Reset after showing completion
      setTimeout(() => {
        setPipelineProgress({ stage: 'idle', message: '' });
      }, 3000);

    } catch (error) {
      console.error('Pipeline error:', error);
      setPipelineProgress({ stage: 'idle', message: '' });
      toast.error('Pipeline failed: ' + (error as Error).message);
    }
  };

  const generateNewIdea = async () => {
    if (!ideaPrompt.trim()) {
      toast.error("Please enter a business idea description");
      return;
    }

    setShowIdeaDialog(false);
    await executeFullPipeline(ideaPrompt);
    setIdeaPrompt("");
  };

  const approveIdea = async (ideaId: string) => {
    const newPlan = await businessService.createBusinessPlan(ideaId);
    if (newPlan) {
      setPlans(prev => [newPlan, ...prev]);
      setActiveTab("plans");
      toast.success("Business plan created! Review and approve to begin execution.");
    }
  };

  const approvePlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const newBusiness = await businessService.startBusiness(plan);
    if (newBusiness) {
      setBusinesses(prev => [newBusiness, ...prev]);
      setPlans(prev => prev.filter(p => p.id !== planId));
      setActiveTab("active");
      toast.success("Business execution started! AI is now working on your behalf.");
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
          <Dialog open={showIdeaDialog} onOpenChange={setShowIdeaDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={businessService.loading || pipelineProgress.stage !== 'idle'}>
                <Plus className="h-4 w-4" />
                {pipelineProgress.stage !== 'idle' ? pipelineProgress.message : "New Business"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Business</DialogTitle>
                <DialogDescription>
                  Describe your business idea and we'll generate a complete business plan and start execution automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="idea-prompt">Business Idea Description</Label>
                  <Textarea
                    id="idea-prompt"
                    placeholder="Describe your business idea... (e.g., 'A mobile app that helps people find local farmers markets and track seasonal produce availability')"
                    value={ideaPrompt}
                    onChange={(e) => setIdeaPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-pipeline"
                    checked={autoExecutePipeline}
                    onCheckedChange={setAutoExecutePipeline}
                  />
                  <Label htmlFor="auto-pipeline" className="text-sm">
                    Auto-execute full pipeline (Idea → Plan → Launch)
                  </Label>
                </div>
                {autoExecutePipeline && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <strong>Full Pipeline Mode:</strong> We'll automatically generate your business idea, create a comprehensive plan, and start execution. This process takes 2-3 minutes.
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={generateNewIdea}
                  disabled={!ideaPrompt.trim() || businessService.loading}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {autoExecutePipeline ? "Launch Full Pipeline" : "Generate Idea"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

        {/* Pipeline Progress Indicator */}
        {pipelineProgress.stage !== 'idle' && (
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-lg p-6 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {pipelineProgress.stage === 'complete' ? (
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
                    <Settings className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-foreground mb-2">{pipelineProgress.message}</div>
                <Progress 
                  value={
                    pipelineProgress.stage === 'generating' ? 25 :
                    pipelineProgress.stage === 'planning' ? 50 :
                    pipelineProgress.stage === 'executing' ? 75 :
                    pipelineProgress.stage === 'complete' ? 100 : 0
                  } 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Generate Idea</span>
                  <span>Create Plan</span>
                  <span>Launch Business</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}

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