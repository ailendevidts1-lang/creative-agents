import { supabase } from '@/integrations/supabase/client';
import { Plan, PlanStep, ToolResult } from './types';

export class ToolExecutor {
  async executePlan(plan: Plan): Promise<ToolResult[]> {
    console.log('Executing plan:', plan);
    
    const results: ToolResult[] = [];
    
    // Execute steps in dependency order
    const executedSteps = new Set<string>();
    
    for (const step of plan.steps) {
      // Check dependencies
      const canExecute = step.dependencies.every(dep => executedSteps.has(dep));
      
      if (!canExecute) {
        results.push({
          success: false,
          error: `Dependencies not met for step: ${step.id}`,
          metadata: { stepId: step.id, action: step.action }
        });
        continue;
      }

      // Execute step
      try {
        const result = await this.executeStep(step);
        results.push(result);
        
        if (result.success) {
          executedSteps.add(step.id);
        }
      } catch (error) {
        console.error('Step execution error:', error);
        results.push({
          success: false,
          error: (error as Error).message,
          metadata: { stepId: step.id, action: step.action }
        });
      }
    }
    
    return results;
  }

  private async executeStep(step: PlanStep): Promise<ToolResult> {
    console.log('Executing step:', step);

    switch (step.type) {
      case 'skill':
        return await this.executeSkill(step);
      
      case 'api':
        return await this.executeAPI(step);
      
      case 'search':
        return await this.executeSearch(step);
      
      case 'computation':
        return await this.executeComputation(step);
      
      default:
        return {
          success: false,
          error: `Unknown step type: ${step.type}`
        };
    }
  }

  private async executeSkill(step: PlanStep): Promise<ToolResult> {
    switch (step.action) {
      case 'create_timer':
        return await this.createTimer(step.parameters);
      
      case 'create_note':
        return await this.createNote(step.parameters);
      
      default:
        return {
          success: false,
          error: `Unknown skill action: ${step.action}`
        };
    }
  }

  private async executeAPI(step: PlanStep): Promise<ToolResult> {
    switch (step.action) {
      case 'get_weather':
        return await this.getWeather(step.parameters);
      
      default:
        return {
          success: false,
          error: `Unknown API action: ${step.action}`
        };
    }
  }

  private async executeSearch(step: PlanStep): Promise<ToolResult> {
    switch (step.action) {
      case 'web_search':
        return await this.performWebSearch(step.parameters);
      
      default:
        return {
          success: false,
          error: `Unknown search action: ${step.action}`
        };
    }
  }

  private async executeComputation(step: PlanStep): Promise<ToolResult> {
    // For general queries, return a simple response
    return {
      success: true,
      data: {
        response: `I processed your request: ${step.parameters.query}`,
        intent: step.parameters.intent
      }
    };
  }

  // Skill implementations
  private async createTimer(params: any): Promise<ToolResult> {
    try {
      const { data, error } = await supabase
        .from('timers')
        .insert([{
          name: params.name || 'Timer',
          duration: params.duration || 300000, // 5 minutes default
          remaining: params.duration || 300000,
          expires_at: new Date(Date.now() + (params.duration || 300000)).toISOString(),
          status: 'active',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          timer: data,
          message: `Created timer "${params.name}" for ${Math.round((params.duration || 300000) / 60000)} minutes`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async createNote(params: any): Promise<ToolResult> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: params.title || 'New Note',
          content: params.content || '',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          note: data,
          message: `Created note "${params.title}"`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async getWeather(params: any): Promise<ToolResult> {
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location: params.location || 'current' }
      });

      if (error) throw error;

      return {
        success: true,
        data: {
          weather: data,
          message: `Weather for ${params.location}: ${data.description}, ${data.temperature}°C`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async performWebSearch(params: any): Promise<ToolResult> {
    try {
      const { data, error } = await supabase.functions.invoke('search-qa', {
        body: { 
          query: params.query,
          includeWeb: true 
        }
      });

      if (error) throw error;

      return {
        success: true,
        data: {
          searchResults: data,
          message: `Found search results for: ${params.query}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}