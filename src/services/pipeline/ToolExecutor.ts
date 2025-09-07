import { supabase } from '@/integrations/supabase/client';
import { Plan, PlanStep, ToolResult } from './types';
import { ExecutionQueue, QueuedExecution, ExecutionQueueConfig } from './ExecutionQueue';
import { ExecutionValidator, ValidationResult } from './ExecutionValidator';
import { ExecutionSummarizer, ExecutionSummary } from './ExecutionSummarizer';
import { ExecutionStateStore, ExecutionSession, StateStoreConfig } from './ExecutionStateStore';
import { skillsIntegrator } from '@/services/SkillsIntegrator';

export class ToolExecutor {
  private executionQueue: ExecutionQueue;
  private validator: ExecutionValidator;
  private summarizer: ExecutionSummarizer;
  private stateStore: ExecutionStateStore;
  private currentSession: ExecutionSession | null = null;

  // Callbacks
  public onPlanStart: ((plan: Plan, session: ExecutionSession) => void) | null = null;
  public onStepStart: ((execution: QueuedExecution) => void) | null = null;
  public onStepComplete: ((execution: QueuedExecution, validation: ValidationResult) => void) | null = null;
  public onStepFailed: ((execution: QueuedExecution, validation: ValidationResult) => void) | null = null;
  public onPlanComplete: ((plan: Plan, summary: ExecutionSummary) => void) | null = null;

  constructor() {
    // Configure execution queue
    const queueConfig: ExecutionQueueConfig = {
      maxConcurrent: 3,
      defaultMaxAttempts: 3,
      retryDelayMs: 1000,
      backoffMultiplier: 2,
      maxRetryDelayMs: 10000
    };

    // Configure state store
    const stateConfig: StateStoreConfig = {
      persistToDisk: true,
      maxSessions: 100,
      retentionDays: 7
    };

    this.executionQueue = new ExecutionQueue(queueConfig);
    this.validator = new ExecutionValidator();
    this.summarizer = new ExecutionSummarizer();
    this.stateStore = new ExecutionStateStore(stateConfig);

    this.setupQueueCallbacks();
  }

  private setupQueueCallbacks(): void {
    this.executionQueue.onStepStart = (execution) => {
      console.log('Step started:', execution.step.action);
      
      // Update state store
      if (this.currentSession) {
        this.stateStore.addExecution(this.currentSession.id, execution);
      }
      
      if (this.onStepStart) {
        this.onStepStart(execution);
      }
    };

    this.executionQueue.onStepComplete = async (execution) => {
      console.log('Step completed:', execution.step.action);
      
      // Validate result
      const validation = await this.validator.validate(execution.step, execution.result!);
      
      // Update state store
      if (this.currentSession) {
        this.stateStore.addExecution(this.currentSession.id, execution);
      }
      
      if (this.onStepComplete) {
        this.onStepComplete(execution, validation);
      }
    };

    this.executionQueue.onStepFailed = async (execution) => {
      console.log('Step failed:', execution.step.action, execution.error);
      
      // Create a validation result for failed step
      const validation: ValidationResult = {
        isValid: false,
        confidence: 1.0,
        reasons: [execution.error || 'Step execution failed'],
        canRetry: execution.attempts < execution.maxAttempts
      };
      
      // Update state store
      if (this.currentSession) {
        this.stateStore.addExecution(this.currentSession.id, execution);
      }
      
      if (this.onStepFailed) {
        this.onStepFailed(execution, validation);
      }
    };

    this.executionQueue.onQueueEmpty = async () => {
      console.log('Execution queue empty - generating summary');
      await this.completePlanExecution();
    };

    // Override the queue's executeStep method to use our implementation
    (this.executionQueue as any).executeStep = this.executeStepImplementation.bind(this);
  }

  async executePlan(plan: Plan): Promise<ToolResult[]> {
    console.log('Starting plan execution:', plan.id);
    
    // Start execution session
    this.currentSession = this.stateStore.startSession(plan);
    
    if (this.onPlanStart) {
      this.onPlanStart(plan, this.currentSession);
    }

    // Add plan to execution queue
    this.executionQueue.addPlan(plan);
    
    // Wait for completion (this is handled by the queue callbacks)
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (!this.currentSession) {
          resolve([]);
          return;
        }

        const session = this.stateStore.getSession(this.currentSession.id);
        if (session && (session.status === 'completed' || session.status === 'failed')) {
          const results = session.executions.map(e => e.result!).filter(r => r !== undefined);
          resolve(results);
        } else {
          // Check again in 100ms
          setTimeout(checkCompletion, 100);
        }
      };

      checkCompletion();
    });
  }

  private async completePlanExecution(): Promise<void> {
    if (!this.currentSession) return;

    const session = this.stateStore.getSession(this.currentSession.id);
    if (!session) return;

    // Generate summary
    const summary = await this.summarizer.summarize(session.plan, session.executions);
    
    // Update state store
    this.stateStore.completeSession(session.id, summary);
    
    if (this.onPlanComplete) {
      this.onPlanComplete(session.plan, summary);
    }

    // Clear current session
    this.currentSession = null;
  }

  // This method replaces the queue's executeStep method
  private async executeStepImplementation(step: PlanStep): Promise<ToolResult> {
    console.log('Executing step:', step.action, step.type);

    try {
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
          throw new Error(`Unknown step type: ${step.type}`);
      }
    } catch (error) {
      console.error('Step execution failed:', error);
      return {
        success: false,
        error: (error as Error).message,
        metadata: { stepId: step.id, action: step.action, type: step.type }
      };
    }
  }

  // Enhanced skill implementations with better error handling
  private async executeSkill(step: PlanStep): Promise<ToolResult> {
    console.log('Executing skill:', step.action);

    try {
      // Use the integrated skills system
      const result = await skillsIntegrator.executeSkill(step.action, step.parameters);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          metadata: { 
            action: step.action, 
            type: 'skill',
            message: result.message
          }
        };
      } else {
        throw new Error(result.error || 'Skill execution failed');
      }
    } catch (error) {
      // Fallback to legacy implementations for compatibility
      switch (step.action) {
        case 'create_timer':
          return await this.createTimerWithValidation(step.parameters);
        
        case 'create_note':
          return await this.createNoteWithValidation(step.parameters);

        case 'list_timers':
          return await this.listTimers();
          
        case 'list_notes':
          return await this.listNotes();
        
        default:
          throw new Error(`Unknown skill action: ${step.action}`);
      }
    }
  }

  private async executeAPI(step: PlanStep): Promise<ToolResult> {
    console.log('Executing API call:', step.action);

    try {
      // Use the integrated skills system for API calls too
      const result = await skillsIntegrator.executeSkill(step.action, step.parameters);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          metadata: { 
            action: step.action, 
            type: 'api',
            message: result.message
          }
        };
      } else {
        throw new Error(result.error || 'API execution failed');
      }
    } catch (error) {
      // Fallback to legacy implementations
      switch (step.action) {
        case 'get_weather':
          return await this.getWeatherWithValidation(step.parameters);
        
        default:
          throw new Error(`Unknown API action: ${step.action}`);
      }
    }
  }

  private async executeSearch(step: PlanStep): Promise<ToolResult> {
    console.log('Executing search:', step.action);

    try {
      // Use the integrated skills system for search operations
      const result = await skillsIntegrator.executeSkill(step.action, step.parameters);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          metadata: { 
            action: step.action, 
            type: 'search',
            message: result.message
          }
        };
      } else {
        throw new Error(result.error || 'Search execution failed');
      }
    } catch (error) {
      // Fallback to legacy implementations
      switch (step.action) {
        case 'web_search':
          return await this.performWebSearchWithValidation(step.parameters);
        
        default:
          throw new Error(`Unknown search action: ${step.action}`);
      }
    }
  }

  private async executeComputation(step: PlanStep): Promise<ToolResult> {
    console.log('Executing computation:', step.action);
    
    // For general queries, return a simple response
    return {
      success: true,
      data: {
        response: `Processed request: ${step.parameters.query || 'Unknown query'}`,
        intent: step.parameters.intent || 'general',
        message: `I've processed your ${step.parameters.intent || 'general'} request`
      },
      metadata: { action: step.action, type: 'computation' }
    };
  }

  private async createTimerWithValidation(params: any): Promise<ToolResult> {
    try {
      // Validate parameters
      if (!params.duration || typeof params.duration !== 'number') {
        throw new Error('Timer duration is required and must be a number');
      }

      if (params.duration <= 0 || params.duration > 24 * 60 * 60 * 1000) {
        throw new Error('Timer duration must be between 1ms and 24 hours');
      }

      const { data, error } = await supabase
        .from('timers')
        .insert([{
          name: params.name || 'Timer',
          duration: params.duration,
          remaining: params.duration,
          expires_at: new Date(Date.now() + params.duration).toISOString(),
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
          message: `Created timer "${params.name || 'Timer'}" for ${Math.round(params.duration / 60000)} minutes`
        },
        metadata: { action: 'create_timer', timerId: data.id }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        metadata: { action: 'create_timer' }
      };
    }
  }

  private async createNoteWithValidation(params: any): Promise<ToolResult> {
    try {
      // Validate parameters
      if (!params.title || typeof params.title !== 'string') {
        throw new Error('Note title is required and must be a string');
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: params.title,
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
        },
        metadata: { action: 'create_note', noteId: data.id }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        metadata: { action: 'create_note' }
      };
    }
  }

  private async listTimers(): Promise<ToolResult> {
    try {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return {
        success: true,
        data: {
          timers: data || [],
          message: `Found ${data?.length || 0} active timer${data?.length !== 1 ? 's' : ''}`
        },
        metadata: { action: 'list_timers', count: data?.length || 0 }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        metadata: { action: 'list_timers' }
      };
    }
  }

  private async listNotes(): Promise<ToolResult> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return {
        success: true,
        data: {
          notes: data || [],
          message: `Found ${data?.length || 0} note${data?.length !== 1 ? 's' : ''}`
        },
        metadata: { action: 'list_notes', count: data?.length || 0 }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        metadata: { action: 'list_notes' }
      };
    }
  }

  private async getWeatherWithValidation(params: any): Promise<ToolResult> {
    try {
      if (!params.location) {
        params.location = 'current'; // Default to current location
      }

      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location: params.location }
      });

      if (error) throw error;

      // Validate weather data
      if (!data || typeof data.temperature === 'undefined') {
        throw new Error('Invalid weather data received');
      }

      return {
        success: true,
        data: {
          weather: data,
          message: `Weather for ${params.location}: ${data.description}, ${data.temperature}°C`
        },
        metadata: { action: 'get_weather', location: params.location }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        metadata: { action: 'get_weather', location: params.location }
      };
    }
  }

  private async performWebSearchWithValidation(params: any): Promise<ToolResult> {
    try {
      if (!params.query || typeof params.query !== 'string') {
        throw new Error('Search query is required and must be a string');
      }

      const { data, error } = await supabase.functions.invoke('search-qa', {
        body: { 
          query: params.query,
          includeWeb: true,
          maxResults: 5
        }
      });

      if (error) throw error;

      // Validate search results
      if (!data) {
        throw new Error('No search results returned');
      }

      return {
        success: true,
        data: {
          searchResults: data,
          message: `Found search results for: ${params.query}`
        },
        metadata: { action: 'web_search', query: params.query }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        metadata: { action: 'web_search', query: params.query }
      };
    }
  }

  // Public methods for external access
  getExecutionStatistics() {
    return this.stateStore.getStatistics();
  }

  getRecentSessions(limit: number = 10) {
    return this.stateStore.getRecentSessions(limit);
  }

  getCurrentSession(): ExecutionSession | null {
    return this.currentSession;
  }

  cancelCurrentExecution(): boolean {
    if (this.currentSession) {
      this.stateStore.cancelSession(this.currentSession.id);
      this.executionQueue.clear();
      this.currentSession = null;
      return true;
    }
    return false;
  }
}