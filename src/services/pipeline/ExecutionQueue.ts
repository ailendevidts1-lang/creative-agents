import { Plan, PlanStep, ToolResult } from './types';

export interface QueuedExecution {
  id: string;
  planId: string;
  step: PlanStep;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  result?: ToolResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  nextRetryAt?: Date;
}

export interface ExecutionQueueConfig {
  maxConcurrent: number;
  defaultMaxAttempts: number;
  retryDelayMs: number;
  backoffMultiplier: number;
  maxRetryDelayMs: number;
}

export class ExecutionQueue {
  private config: ExecutionQueueConfig;
  private queue: QueuedExecution[] = [];
  private running: Map<string, QueuedExecution> = new Map();
  private completed: Map<string, QueuedExecution> = new Map();
  private isProcessing = false;

  // Callbacks
  public onStepStart: ((execution: QueuedExecution) => void) | null = null;
  public onStepComplete: ((execution: QueuedExecution) => void) | null = null;
  public onStepFailed: ((execution: QueuedExecution) => void) | null = null;
  public onQueueEmpty: (() => void) | null = null;

  constructor(config: ExecutionQueueConfig) {
    this.config = config;
  }

  addPlan(plan: Plan): void {
    console.log('Adding plan to execution queue:', plan.id);
    
    // Create dependency map
    const dependencyMap = new Map<string, string[]>();
    for (const step of plan.steps) {
      dependencyMap.set(step.id, step.dependencies);
    }

    // Add steps to queue in dependency order
    for (const step of plan.steps) {
      const queuedExecution: QueuedExecution = {
        id: `exec_${step.id}_${Date.now()}`,
        planId: plan.id,
        step,
        status: 'pending',
        attempts: 0,
        maxAttempts: this.config.defaultMaxAttempts
      };
      
      this.queue.push(queuedExecution);
    }

    console.log(`Added ${plan.steps.length} steps to queue`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('Starting execution queue processing');

    while (this.queue.length > 0 || this.running.size > 0) {
      // Process pending items
      await this.processNextItems();
      
      // Process retries
      await this.processRetries();
      
      // Wait a bit before next iteration
      await this.sleep(100);
    }

    this.isProcessing = false;
    console.log('Execution queue processing completed');
    
    if (this.onQueueEmpty) {
      this.onQueueEmpty();
    }
  }

  private async processNextItems(): Promise<void> {
    // Find items ready to execute
    const readyItems = this.queue.filter(item => 
      item.status === 'pending' && 
      this.areDependenciesCompleted(item) &&
      this.running.size < this.config.maxConcurrent
    );

    // Start execution for ready items
    for (const item of readyItems.slice(0, this.config.maxConcurrent - this.running.size)) {
      this.startExecution(item);
    }
  }

  private async processRetries(): Promise<void> {
    const now = new Date();
    const retryItems = this.queue.filter(item => 
      item.status === 'retrying' &&
      item.nextRetryAt &&
      item.nextRetryAt <= now &&
      this.running.size < this.config.maxConcurrent
    );

    for (const item of retryItems.slice(0, this.config.maxConcurrent - this.running.size)) {
      this.startExecution(item);
    }
  }

  private areDependenciesCompleted(item: QueuedExecution): boolean {
    if (!item.step.dependencies || item.step.dependencies.length === 0) {
      return true;
    }

    return item.step.dependencies.every(depId => {
      const dependency = this.findExecutionByStepId(depId);
      return dependency?.status === 'completed' && dependency.result?.success;
    });
  }

  private findExecutionByStepId(stepId: string): QueuedExecution | undefined {
    // Check running
    for (const execution of this.running.values()) {
      if (execution.step.id === stepId) {
        return execution;
      }
    }
    
    // Check completed
    for (const execution of this.completed.values()) {
      if (execution.step.id === stepId) {
        return execution;
      }
    }
    
    // Check queue
    return this.queue.find(exec => exec.step.id === stepId);
  }

  private async startExecution(item: QueuedExecution): Promise<void> {
    // Remove from queue and add to running
    this.queue = this.queue.filter(q => q.id !== item.id);
    item.status = 'running';
    item.startedAt = new Date();
    item.attempts++;
    this.running.set(item.id, item);

    console.log(`Starting execution: ${item.step.action} (attempt ${item.attempts})`);
    
    if (this.onStepStart) {
      this.onStepStart(item);
    }

    try {
      // Execute the step (this will be implemented by the ToolExecutor)
      const result = await this.executeStep(item.step);
      
      // Validate result
      const isValid = await this.validateResult(item.step, result);
      
      if (isValid) {
        // Success
        item.status = 'completed';
        item.result = result;
        item.completedAt = new Date();
        
        this.running.delete(item.id);
        this.completed.set(item.id, item);
        
        console.log(`Execution completed successfully: ${item.step.action}`);
        
        if (this.onStepComplete) {
          this.onStepComplete(item);
        }
      } else {
        // Validation failed - treat as error
        throw new Error('Result validation failed');
      }
      
    } catch (error) {
      console.error(`Execution failed: ${item.step.action}`, error);
      
      item.error = (error as Error).message;
      
      // Check if we should retry
      if (item.attempts < item.maxAttempts) {
        // Schedule retry
        const delay = this.calculateRetryDelay(item.attempts);
        item.status = 'retrying';
        item.nextRetryAt = new Date(Date.now() + delay);
        
        this.running.delete(item.id);
        this.queue.push(item);
        
        console.log(`Scheduling retry for ${item.step.action} in ${delay}ms`);
      } else {
        // Max attempts reached - mark as failed
        item.status = 'failed';
        item.completedAt = new Date();
        
        this.running.delete(item.id);
        this.completed.set(item.id, item);
        
        console.log(`Execution failed permanently: ${item.step.action}`);
        
        if (this.onStepFailed) {
          this.onStepFailed(item);
        }
      }
    }
  }

  private calculateRetryDelay(attempt: number): number {
    let delay = this.config.retryDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() - 0.5);
    delay += jitter;
    
    // Cap at maximum
    return Math.min(delay, this.config.maxRetryDelayMs);
  }

  private async executeStep(step: PlanStep): Promise<ToolResult> {
    // This is a placeholder - actual execution is handled by ToolExecutor
    // The queue just manages the orchestration
    throw new Error('executeStep must be implemented by the ToolExecutor');
  }

  private async validateResult(step: PlanStep, result: ToolResult): Promise<boolean> {
    // Basic validation - can be enhanced with step-specific rules
    if (!result.success) {
      return false;
    }
    
    // Step-specific validation
    switch (step.type) {
      case 'skill':
        return this.validateSkillResult(step, result);
      case 'api':
        return this.validateApiResult(step, result);
      case 'search':
        return this.validateSearchResult(step, result);
      default:
        return true; // Default to valid
    }
  }

  private validateSkillResult(step: PlanStep, result: ToolResult): boolean {
    // Validate skill-specific requirements
    if (step.action === 'create_timer' && result.data?.timer) {
      return result.data.timer.id && result.data.timer.name;
    }
    
    if (step.action === 'create_note' && result.data?.note) {
      return result.data.note.id && result.data.note.title;
    }
    
    return true; // Default to valid
  }

  private validateApiResult(step: PlanStep, result: ToolResult): boolean {
    // Validate API-specific requirements
    if (step.action === 'get_weather' && result.data?.weather) {
      return result.data.weather.temperature !== undefined;
    }
    
    return true; // Default to valid
  }

  private validateSearchResult(step: PlanStep, result: ToolResult): boolean {
    // Validate search-specific requirements
    if (step.action === 'web_search' && result.data?.searchResults) {
      return Array.isArray(result.data.searchResults.sources);
    }
    
    return true; // Default to valid
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for monitoring
  getQueueStatus() {
    return {
      pending: this.queue.filter(q => q.status === 'pending').length,
      running: this.running.size,
      retrying: this.queue.filter(q => q.status === 'retrying').length,
      completed: Array.from(this.completed.values()).filter(c => c.status === 'completed').length,
      failed: Array.from(this.completed.values()).filter(c => c.status === 'failed').length
    };
  }

  getExecutionResults(planId: string): QueuedExecution[] {
    const results: QueuedExecution[] = [];
    
    // Add completed executions
    for (const execution of this.completed.values()) {
      if (execution.planId === planId) {
        results.push(execution);
      }
    }
    
    // Add running executions  
    for (const execution of this.running.values()) {
      if (execution.planId === planId) {
        results.push(execution);
      }
    }
    
    // Add pending/retrying executions
    for (const execution of this.queue) {
      if (execution.planId === planId) {
        results.push(execution);
      }
    }
    
    return results.sort((a, b) => a.step.id.localeCompare(b.step.id));
  }

  clear(): void {
    this.queue = [];
    this.running.clear();
    this.completed.clear();
    this.isProcessing = false;
  }
}