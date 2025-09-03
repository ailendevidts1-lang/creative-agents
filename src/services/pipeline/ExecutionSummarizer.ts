import { Plan, PlanStep, ToolResult } from './types';
import { QueuedExecution } from './ExecutionQueue';

export interface ExecutionSummary {
  planId: string;
  planName: string;
  status: 'success' | 'partial' | 'failed';
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  executionTime: number;
  userFriendlyMessage: string;
  detailedResults: StepSummary[];
  actionableItems?: string[];
  nextSteps?: string[];
}

export interface StepSummary {
  stepId: string;
  stepName: string;
  status: 'completed' | 'failed' | 'skipped';
  result?: ToolResult;
  userMessage: string;
  importance: 'high' | 'medium' | 'low';
  category: string;
}

export class ExecutionSummarizer {
  
  async summarize(plan: Plan, executions: QueuedExecution[]): Promise<ExecutionSummary> {
    console.log('Summarizing execution results for plan:', plan.id);

    const completedExecutions = executions.filter(e => e.status === 'completed');
    const failedExecutions = executions.filter(e => e.status === 'failed');
    const successfulExecutions = completedExecutions.filter(e => e.result?.success);

    // Calculate execution time
    const startTime = Math.min(...executions.map(e => e.startedAt?.getTime() || Date.now()));
    const endTime = Math.max(...executions.map(e => e.completedAt?.getTime() || Date.now()));
    const executionTime = endTime - startTime;

    // Determine overall status
    let status: 'success' | 'partial' | 'failed';
    if (successfulExecutions.length === plan.steps.length) {
      status = 'success';
    } else if (successfulExecutions.length > 0) {
      status = 'partial';
    } else {
      status = 'failed';
    }

    // Create step summaries
    const detailedResults = this.createStepSummaries(executions);

    // Generate user-friendly message
    const userFriendlyMessage = this.generateUserMessage(plan, status, successfulExecutions, failedExecutions);

    // Generate actionable items and next steps
    const actionableItems = this.generateActionableItems(executions);
    const nextSteps = this.generateNextSteps(plan, status, successfulExecutions);

    const summary: ExecutionSummary = {
      planId: plan.id,
      planName: plan.summary,
      status,
      totalSteps: plan.steps.length,
      completedSteps: successfulExecutions.length,
      failedSteps: failedExecutions.length,
      executionTime,
      userFriendlyMessage,
      detailedResults,
      actionableItems: actionableItems.length > 0 ? actionableItems : undefined,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined
    };

    console.log('Execution summary generated:', summary);
    return summary;
  }

  private createStepSummaries(executions: QueuedExecution[]): StepSummary[] {
    return executions.map(execution => {
      const step = execution.step;
      const stepName = this.getStepDisplayName(step);
      const category = this.getStepCategory(step);
      const importance = this.getStepImportance(step);

      let status: 'completed' | 'failed' | 'skipped';
      if (execution.status === 'completed' && execution.result?.success) {
        status = 'completed';
      } else if (execution.status === 'failed') {
        status = 'failed';
      } else {
        status = 'skipped';
      }

      const userMessage = this.generateStepMessage(step, execution);

      return {
        stepId: step.id,
        stepName,
        status,
        result: execution.result,
        userMessage,
        importance,
        category
      };
    });
  }

  private getStepDisplayName(step: PlanStep): string {
    const actionNames: Record<string, string> = {
      'create_timer': 'Create Timer',
      'create_note': 'Create Note',
      'get_weather': 'Get Weather',
      'web_search': 'Web Search',
      'process_request': 'Process Request',
      'list_notes': 'List Notes',
      'list_timers': 'List Timers'
    };

    return actionNames[step.action] || step.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getStepCategory(step: PlanStep): string {
    const categories: Record<string, string> = {
      'skill': 'Personal Productivity',
      'api': 'Information Retrieval',
      'search': 'Knowledge Discovery',
      'computation': 'Data Processing'
    };

    return categories[step.type] || 'General';
  }

  private getStepImportance(step: PlanStep): 'high' | 'medium' | 'low' {
    // Core user-requested actions are high importance
    if (['create_timer', 'create_note', 'get_weather'].includes(step.action)) {
      return 'high';
    }
    
    // Information gathering is medium importance
    if (['web_search', 'knowledge_search'].includes(step.action)) {
      return 'medium';
    }
    
    // Processing and utilities are low importance
    return 'low';
  }

  private generateStepMessage(step: PlanStep, execution: QueuedExecution): string {
    if (execution.status === 'completed' && execution.result?.success) {
      return this.generateSuccessMessage(step, execution.result);
    } else if (execution.status === 'failed') {
      return this.generateFailureMessage(step, execution.error);
    } else {
      return `Step was skipped or not executed`;
    }
  }

  private generateSuccessMessage(step: PlanStep, result: ToolResult): string {
    switch (step.action) {
      case 'create_timer':
        if (result.data?.timer) {
          const timer = result.data.timer;
          const duration = Math.round(timer.duration / 60000);
          return `Created timer "${timer.name}" for ${duration} minutes`;
        }
        return 'Timer created successfully';

      case 'create_note':
        if (result.data?.note) {
          const note = result.data.note;
          return `Created note "${note.title}"`;
        }
        return 'Note created successfully';

      case 'get_weather':
        if (result.data?.weather) {
          const weather = result.data.weather;
          const location = weather.location || 'your location';
          return `Weather for ${location}: ${weather.description}, ${weather.temperature}°C`;
        }
        return 'Weather information retrieved';

      case 'web_search':
        if (result.data?.searchResults?.sources) {
          const count = result.data.searchResults.sources.length;
          return `Found ${count} relevant search result${count !== 1 ? 's' : ''}`;
        }
        return 'Web search completed';

      default:
        return result.data?.message || 'Operation completed successfully';
    }
  }

  private generateFailureMessage(step: PlanStep, error?: string): string {
    const baseMessages: Record<string, string> = {
      'create_timer': 'Failed to create timer',
      'create_note': 'Failed to create note',
      'get_weather': 'Failed to get weather information',
      'web_search': 'Failed to perform web search'
    };

    const baseMessage = baseMessages[step.action] || `Failed to execute ${step.action}`;
    
    if (error) {
      return `${baseMessage}: ${error}`;
    }
    
    return baseMessage;
  }

  private generateUserMessage(
    plan: Plan, 
    status: 'success' | 'partial' | 'failed',
    successfulExecutions: QueuedExecution[],
    failedExecutions: QueuedExecution[]
  ): string {
    const totalSteps = plan.steps.length;
    const successCount = successfulExecutions.length;
    const failureCount = failedExecutions.length;

    if (status === 'success') {
      if (totalSteps === 1) {
        const step = successfulExecutions[0]?.step;
        const result = successfulExecutions[0]?.result;
        if (step && result) {
          return this.generateSuccessMessage(step, result);
        }
        return 'Task completed successfully!';
      } else {
        return `Great! I've successfully completed all ${totalSteps} steps of your request. ${this.getHighlightMessage(successfulExecutions)}`;
      }
    } else if (status === 'partial') {
      const highlights = this.getHighlightMessage(successfulExecutions);
      return `I've completed ${successCount} out of ${totalSteps} tasks. ${highlights} However, ${failureCount} task${failureCount !== 1 ? 's' : ''} encountered issues.`;
    } else {
      return `I encountered problems completing your request. ${failureCount} task${failureCount !== 1 ? 's' : ''} failed to execute properly. Let me know if you'd like me to try a different approach.`;
    }
  }

  private getHighlightMessage(successfulExecutions: QueuedExecution[]): string {
    const highlights: string[] = [];
    
    for (const execution of successfulExecutions) {
      const step = execution.step;
      const result = execution.result;
      
      if (!result?.success) continue;

      switch (step.action) {
        case 'create_timer':
          if (result.data?.timer) {
            highlights.push(`your timer "${result.data.timer.name}" is now running`);
          }
          break;
        case 'create_note':
          if (result.data?.note) {
            highlights.push(`your note "${result.data.note.title}" has been saved`);
          }
          break;
        case 'get_weather':
          if (result.data?.weather) {
            highlights.push(`the weather is ${result.data.weather.description}`);
          }
          break;
        case 'web_search':
          if (result.data?.searchResults?.sources?.length) {
            highlights.push(`I found ${result.data.searchResults.sources.length} relevant sources`);
          }
          break;
      }
    }

    if (highlights.length === 0) return '';
    if (highlights.length === 1) return highlights[0].charAt(0).toUpperCase() + highlights[0].slice(1) + '.';
    
    const lastHighlight = highlights.pop();
    return highlights.join(', ') + ` and ${lastHighlight}.`;
  }

  private generateActionableItems(executions: QueuedExecution[]): string[] {
    const items: string[] = [];
    
    const failedExecutions = executions.filter(e => e.status === 'failed');
    for (const execution of failedExecutions) {
      const step = execution.step;
      
      switch (step.action) {
        case 'create_timer':
          items.push('You can try creating the timer manually or with different settings');
          break;
        case 'create_note':
          items.push('You can try creating the note again or use a different title');
          break;
        case 'get_weather':
          items.push('Try requesting weather for a specific city or check your location settings');
          break;
        case 'web_search':
          items.push('Try rephrasing your search query or being more specific');
          break;
      }
    }

    // Remove duplicates
    return [...new Set(items)];
  }

  private generateNextSteps(plan: Plan, status: 'success' | 'partial' | 'failed', successfulExecutions: QueuedExecution[]): string[] {
    const nextSteps: string[] = [];

    if (status === 'success') {
      // Suggest follow-up actions based on what was accomplished
      for (const execution of successfulExecutions) {
        const step = execution.step;
        
        switch (step.action) {
          case 'create_timer':
            nextSteps.push('I can help you create more timers or check on this one later');
            break;
          case 'create_note':
            nextSteps.push('I can help you edit the note, create more notes, or find your notes later');
            break;
          case 'get_weather':
            nextSteps.push('I can get weather for other locations or set up weather alerts');
            break;
        }
      }
    } else {
      // Suggest recovery actions
      nextSteps.push('Let me know if you\'d like me to try again or help with something else');
      if (status === 'partial') {
        nextSteps.push('I can retry the failed tasks or help you accomplish them a different way');
      }
    }

    // Remove duplicates and limit to 3 suggestions
    return [...new Set(nextSteps)].slice(0, 3);
  }
}