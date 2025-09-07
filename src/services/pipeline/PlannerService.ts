import { supabase } from '@/integrations/supabase/client';
import { Plan, PlanStep, NLUResult, ContextEntry } from './types';
import { getSkillCapabilities } from './SkillToolDefinitions';

export class PlannerService {
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async createPlan(query: string, nluResult: NLUResult, context: ContextEntry[]): Promise<Plan> {
    try {
      // Call our edge function for AI planning with skill capabilities
      const { data, error } = await supabase.functions.invoke('create-plan', {
        body: {
          query,
          intent: nluResult.intent,
          entities: nluResult.entities,
          context: context.slice(-5), // Last 5 context entries
          availableSkills: getSkillCapabilities() // Include available skills
        }
      });

      if (error || !data) {
        console.error('Planning service error:', error);
        return this.createFallbackPlan(query, nluResult);
      }

      return {
        id: this.generateId(),
        steps: data.steps || [],
        summary: data.summary || `Plan for: ${query}`,
        estimatedDuration: data.estimatedDuration || 5000
      };
    } catch (error) {
      console.error('Planning error:', error);
      return this.createFallbackPlan(query, nluResult);
    }
  }

  private createFallbackPlan(query: string, nluResult: NLUResult): Plan {
    const steps: PlanStep[] = [];

    // Enhanced intent matching for all integrated skills
    switch (nluResult.intent) {
      case 'timer':
      case 'create_timer':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'create_timer',
          parameters: {
            duration: this.extractDuration(query),
            name: this.extractTimerName(query)
          },
          dependencies: []
        });
        break;

      case 'list_timers':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'list_timers',
          parameters: {},
          dependencies: []
        });
        break;

      case 'notes':
      case 'create_note':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'create_note',
          parameters: {
            title: this.extractNoteTitle(query),
            content: nluResult.entities.content || query
          },
          dependencies: []
        });
        break;

      case 'list_notes':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'list_notes',
          parameters: { limit: 10 },
          dependencies: []
        });
        break;

      case 'weather':
      case 'get_weather':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'get_weather',
          parameters: {
            location: nluResult.entities.location || 'current'
          },
          dependencies: []
        });
        break;

      case 'search':
      case 'web_search':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'web_search',
          parameters: {
            query: this.extractSearchQuery(query)
          },
          dependencies: []
        });
        break;

      case 'code':
      case 'generate_code':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'generate_code',
          parameters: {
            description: query,
            language: nluResult.entities.language || 'javascript'
          },
          dependencies: []
        });
        break;

      case 'project':
      case 'generate_project':
        steps.push({
          id: this.generateId(),
          type: 'skill',
          action: 'generate_project',
          parameters: {
            prompt: query,
            language: nluResult.entities.language || 'javascript',
            framework: nluResult.entities.framework
          },
          dependencies: []
        });
        break;

      default:
        steps.push({
          id: this.generateId(),
          type: 'computation',
          action: 'process_general_query',
          parameters: {
            query,
            intent: nluResult.intent
          },
          dependencies: []
        });
    }

    return {
      id: this.generateId(),
      steps,
      summary: `Execute ${nluResult.intent} task: ${query}`,
      estimatedDuration: 3000
    };
  }

  private extractDuration(query: string): number {
    // Extract duration from text like "5 minutes", "30 seconds", "1 hour"
    const durationRegex = /(\d+)\s*(minute|minutes|min|second|seconds|sec|hour|hours|hr)/i;
    const match = query.match(durationRegex);
    
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('second') || unit.includes('sec')) {
        return value * 1000; // Convert to milliseconds
      } else if (unit.includes('minute') || unit.includes('min')) {
        return value * 60 * 1000;
      } else if (unit.includes('hour') || unit.includes('hr')) {
        return value * 60 * 60 * 1000;
      }
    }
    
    // Default to 5 minutes
    return 5 * 60 * 1000;
  }

  private extractTimerName(query: string): string {
    // Try to extract a name for the timer
    const nameRegex = /timer\s+(?:for\s+)?(.+?)(?:\s+(?:for|in)\s+\d+|\s*$)/i;
    const match = query.match(nameRegex);
    
    if (match && match[1] && !match[1].match(/\d+\s*(?:minute|min|second|sec|hour|hr)/i)) {
      return match[1].trim();
    }
    
    return 'Timer';
  }

  private extractNoteTitle(query: string): string {
    // Extract title from note creation queries
    const titleRegex = /(?:note|write)\s+(?:about\s+)?(.+?)(?:\s*:|$)/i;
    const match = query.match(titleRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return `Note - ${new Date().toLocaleDateString()}`;
  }

  private extractSearchQuery(query: string): string {
    // Extract search terms
    const searchRegex = /(?:search|find|look\s+up)\s+(?:for\s+)?(.+)/i;
    const match = query.match(searchRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return query;
  }
}