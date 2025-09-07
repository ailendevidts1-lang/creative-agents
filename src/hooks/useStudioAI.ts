import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChangePlan {
  id: string;
  projectId: string;
  title: string;
  description: string;
  tasks: string[];
  files: string[];
  dependencies?: string[];
  estimatedTime?: string;
  complexity?: string;
  status: 'planning' | 'ready' | 'applied' | 'error';
  prompt: string;
  createdAt: string;
}

interface CodePatch {
  id: string;
  planId: string;
  file: string;
  action: 'create' | 'update' | 'delete';
  content?: string;
  diff?: string;
  description: string;
  status: 'ready' | 'applied' | 'error';
  createdAt: string;
}

interface PatchResponse {
  patches: CodePatch[];
  buildInstructions: string[];
  notes: string;
}

export function useStudioAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plans, setPlans] = useState<ChangePlan[]>([]);
  const [currentPatches, setCurrentPatches] = useState<PatchResponse | null>(null);

  const generatePlan = async (projectId: string, prompt: string, currentFiles?: Record<string, string>) => {
    setIsGenerating(true);
    
    try {
      console.log('Generating AI plan for:', prompt);
      
      const { data, error } = await supabase.functions.invoke('studio-ai-plan', {
        body: {
          projectId,
          prompt,
          currentFiles
        }
      });

      if (error) {
        console.error('Error generating plan:', error);
        throw new Error(error.message || 'Failed to generate plan');
      }

      const newPlan = data.plan as ChangePlan;
      console.log('Generated plan:', newPlan);
      
      setPlans(prev => [newPlan, ...prev]);
      return newPlan;
    } catch (error) {
      console.error('Failed to generate plan:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePatches = async (plan: ChangePlan, currentFiles?: Record<string, string>) => {
    setIsGenerating(true);
    
    try {
      console.log('Generating code patches for plan:', plan.id);
      
      const { data, error } = await supabase.functions.invoke('studio-ai-generate', {
        body: {
          planId: plan.id,
          plan,
          currentFiles
        }
      });

      if (error) {
        console.error('Error generating patches:', error);
        throw new Error(error.message || 'Failed to generate patches');
      }

      const patches = data as PatchResponse;
      console.log('Generated patches:', patches);
      
      setCurrentPatches(patches);
      return patches;
    } catch (error) {
      console.error('Failed to generate patches:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePlanStatus = (planId: string, status: ChangePlan['status']) => {
    setPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, status }
          : plan
      )
    );
  };

  const clearPatches = () => {
    setCurrentPatches(null);
  };

  return {
    isGenerating,
    plans,
    currentPatches,
    generatePlan,
    generatePatches,
    updatePlanStatus,
    clearPatches
  };
}