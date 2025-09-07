import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function useBusinessService() {
  const [loading, setLoading] = useState(false);

  const generateBusinessIdea = async (prompt?: string): Promise<BusinessIdea | null> => {
    try {
      setLoading(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Please log in to generate business ideas');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('generate-business-idea', {
        body: {
          prompt: prompt || "Generate an innovative and profitable business idea",
          userId: user.data.user.id,
          industry: "Technology",
          budget: "5000"
        }
      });

      if (error) throw error;

      if (data?.success && data?.businessIdea) {
        const idea = data.businessIdea;
        // Find the newly created idea from the database
        const { data: dbIdea, error: dbError } = await supabase
          .from('business_ideas')
          .select('*')
          .eq('user_id', user.data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (dbError) throw dbError;

        return {
          id: dbIdea.id,
          title: dbIdea.title,
          description: dbIdea.description || '',
          expectedRoi: Number(dbIdea.expected_roi) || 300,
          rampTime: dbIdea.ramp_time || "2-4 months",
          market: dbIdea.market || dbIdea.industry || "Technology",
          difficulty: (dbIdea.difficulty as BusinessIdea["difficulty"]) || "medium",
          investment: Number(dbIdea.investment) || 2000
        };
      }

      throw new Error('Failed to generate business idea');
    } catch (error) {
      console.error('Error generating idea:', error);
      toast.error('Failed to generate business idea');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createBusinessPlan = async (ideaId: string): Promise<BusinessPlan | null> => {
    try {
      setLoading(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Please log in to create business plans');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-business-plan', {
        body: {
          businessIdeaId: ideaId,
          userId: user.data.user.id
        }
      });

      if (error) throw error;

      if (data?.success && data?.businessPlan) {
        const plan = data.businessPlan;
        return {
          id: plan.id,
          ideaId,
          title: plan.title,
          niche: plan.content?.executive_summary || "Target audience analysis pending",
          budget: plan.content?.financial_projections?.startup_costs ? 
            parseInt(plan.content.financial_projections.startup_costs.replace(/[^0-9]/g, '')) : 2500,
          timeline: "8-12 weeks",
          channels: plan.content?.marketing_sales?.marketing_strategy ? 
            [plan.content.marketing_sales.marketing_strategy] : 
            ["Digital Marketing", "Social Media", "Direct Sales"],
          milestones: plan.content?.milestones?.map((m: any) => m.milestone) || 
            ["Market Research", "Product Development", "Beta Testing", "Launch", "Scale"],
          ready: true
        };
      }

      throw new Error('Failed to create business plan');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create business plan');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startBusiness = async (plan: BusinessPlan): Promise<Business | null> => {
    try {
      setLoading(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Please log in to start businesses');
        return null;
      }

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

      // Create automation pipeline and execute initial launch
      try {
        const [pipelineData, launchData] = await Promise.all([
          supabase.functions.invoke('create-automation-pipeline', {
            body: {
              businessId: businessData.id,
              userId: user.data.user.id,
              automationType: 'comprehensive'
            }
          }),
          supabase.functions.invoke('execute-business-launch', {
            body: {
              businessPlan: plan,
              userId: user.data.user.id
            }
          })
        ]);

        // Update business with launch results if available
        if (launchData.data?.success && launchData.data?.execution) {
          const execution = launchData.data.execution;
            await supabase
              .from('businesses')
              .update({
                progress: execution.execution_summary?.progress_percentage || 15,
                next_tasks: execution.execution_summary?.next_priority_tasks || ["Set up accounts", "Create initial content", "Launch marketing"],
                metadata: {
                  launch_execution: execution,
                  automated_at: new Date().toISOString()
                }
              })
              .eq('id', businessData.id);
        }
      } catch (pipelineError) {
        console.warn('Pipeline/Launch execution warning:', pipelineError);
        // Continue even if pipeline creation fails
      }

      return {
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
    } catch (error) {
      console.error('Error starting business:', error);
      toast.error('Failed to start business execution');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        // Return empty arrays if no user is logged in
        return { businesses: [], ideas: [], plans: [] };
      }

      // Load businesses
      const { data: businessesData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });
      
      if (businessError) throw businessError;

      // Load business ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });
        
      if (ideasError) throw ideasError;

      // Load business plans
      const { data: plansData, error: plansError } = await supabase
        .from('business_plans')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });
        
      if (plansError) throw plansError;

      // Transform data to match component interfaces
      const businesses: Business[] = businessesData?.map(b => ({
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
      })) || [];

      const ideas: BusinessIdea[] = ideasData?.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description || "",
        expectedRoi: Number(i.expected_roi) || 0,
        rampTime: i.ramp_time || "",
        market: i.market || i.industry || "",
        difficulty: (i.difficulty as BusinessIdea["difficulty"]) || "medium",
        investment: Number(i.investment) || 0
      })) || [];

      const plans: BusinessPlan[] = plansData?.map(p => ({
        id: p.id,
        ideaId: p.idea_id || p.business_idea_id || "",
        title: p.title,
        niche: p.niche || "",
        budget: Number(p.budget) || 0,
        timeline: p.timeline || "",
        channels: p.channels || [],
        milestones: p.milestones || [],
        ready: p.ready || false
      })) || [];

      return { businesses, ideas, plans };
    } catch (error) {
      console.error('Error loading business data:', error);
      toast.error('Failed to load business data');
      return { businesses: [], ideas: [], plans: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateBusinessIdea,
    createBusinessPlan,
    startBusiness,
    loadBusinessData
  };
}