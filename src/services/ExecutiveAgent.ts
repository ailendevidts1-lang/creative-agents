import { supabase } from '@/integrations/supabase/client';

export interface AgentSession {
  id: string;
  session_id: string;
  user_id: string;
  mode: 'manual' | 'voice';
  persona: string;
  scopes: string[];
  policy: Record<string, any>;
  context: Record<string, any>;
  status: string;
}

export interface AgentPlan {
  id: string;
  goal: string;
  constraints: Record<string, any>;
  success_criteria: string[];
  dag_steps: PlanStep[];
  status: string;
}

export interface PlanStep {
  id: string;
  tool: string;
  args: Record<string, any>;
  dependencies: string[];
  dryRun: boolean;
  needsApproval: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AgentExecution {
  id: string;
  step_id: string;
  tool_name: string;
  parameters: Record<string, any>;
  result?: any;
  status: string;
  needs_approval: boolean;
  artifacts: any[];
}

export interface AgentPipeline {
  id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  dag: PlanStep[];
  kpis: string[];
  schedule?: Record<string, any>;
  status: string;
}

export interface AgentMessage {
  type: 'session_started' | 'interpretation' | 'plan' | 'tool_call' | 'tool_result' | 'approval_request' | 'pipeline_update' | 'log' | 'error' | 'done' | 'user_message' | 'approval_granted' | 'approval_denied';
  [key: string]: any;
}

export class ExecutiveAgent {
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;
  private messageHandlers: Map<string, (message: AgentMessage) => void> = new Map();

  constructor() {}

  async startSession(mode: 'manual' | 'voice' = 'manual', persona: string = 'default'): Promise<string> {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Starting Executive Agent session: ${this.sessionId}`);
    return this.sessionId;
  }

  async sendMessage(
    message: string, 
    options: {
      attachments?: any[];
      capabilities?: string[];
      persona?: string;
    } = {}
  ): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session. Call startSession() first.');
    }

    console.log('Executive Agent processing message:', message);

    try {
      const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: {
          sessionId: this.sessionId,
          message,
          mode: 'manual',
          attachments: options.attachments || [],
          persona: options.persona || 'default',
          capabilities: options.capabilities || []
        }
      });

      if (error) {
        console.error('Agent orchestrator error:', error);
        this.emit('error', { type: 'error', message: error.message });
        return;
      }

      // Handle streaming response
      this.handleStreamingResponse(data);

    } catch (error) {
      console.error('Send message error:', error);
      this.emit('error', { type: 'error', message: (error as Error).message });
    }
  }

  private handleStreamingResponse(response: any) {
    // For now, emit a simple completion message
    // In a real implementation, this would parse SSE stream
    this.emit('interpretation', {
      type: 'interpretation',
      goal: 'Process user request',
      constraints: {},
      success_criteria: ['Task completed']
    });

    this.emit('plan', {
      type: 'plan',
      steps: [{
        id: 'step1',
        tool: 'general_processing',
        args: { message: 'Processing request' },
        dependencies: [],
        dryRun: false,
        needsApproval: false,
        riskLevel: 'low'
      }]
    });

    this.emit('done', { type: 'done' });
  }

  on(eventType: string, handler: (message: AgentMessage) => void) {
    this.messageHandlers.set(eventType, handler);
  }

  private emit(eventType: string, message: AgentMessage) {
    const handler = this.messageHandlers.get(eventType);
    if (handler) {
      handler(message);
    }
  }

  async getSessionHistory(): Promise<AgentSession[]> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching session history:', error);
      return [];
    }

    return (data || []) as AgentSession[];
  }

  async getPlansForSession(sessionId: string): Promise<AgentPlan[]> {
    const { data, error } = await supabase
      .from('agent_plans')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return (data || []) as unknown as AgentPlan[];
  }

  async getExecutionsForPlan(planId: string): Promise<AgentExecution[]> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching executions:', error);
      return [];
    }

    return (data || []) as AgentExecution[];
  }

  async getPipelines(): Promise<AgentPipeline[]> {
    const { data, error } = await supabase
      .from('agent_pipelines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pipelines:', error);
      return [];
    }

    return (data || []) as unknown as AgentPipeline[];
  }

  async createPipeline(pipeline: Omit<AgentPipeline, 'id'>): Promise<AgentPipeline | null> {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    
    if (!userId) return null;

    const { data, error } = await supabase
      .from('agent_pipelines')
      .insert({ 
        name: pipeline.name,
        description: pipeline.description,
        config: pipeline.config as any,
        dag: pipeline.dag as any,
        kpis: pipeline.kpis as any,
        schedule: pipeline.schedule as any,
        status: pipeline.status,
        user_id: userId 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pipeline:', error);
      return null;
    }

    return data as unknown as AgentPipeline;
  }

  async runPipeline(pipelineId: string): Promise<string | null> {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    
    if (!userId) return null;

    const { data, error } = await supabase
      .from('pipeline_runs')
      .insert({
        pipeline_id: pipelineId,
        user_id: userId,
        trigger_type: 'manual',
        status: 'running'
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting pipeline run:', error);
      return null;
    }

    return data.id;
  }

  async getPipelineRuns(pipelineId: string) {
    const { data, error } = await supabase
      .from('pipeline_runs')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching pipeline runs:', error);
      return [];
    }

    return data || [];
  }

  async approveExecution(executionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('agent_approvals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('execution_id', executionId);

    if (error) {
      console.error('Error approving execution:', error);
      return false;
    }

    return true;
  }

  async denyExecution(executionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('agent_approvals')
      .update({ status: 'denied' })
      .eq('execution_id', executionId);

    if (error) {
      console.error('Error denying execution:', error);
      return false;
    }

    return true;
  }

  async getMemories(namespace: string = 'general') {
    const { data, error } = await supabase
      .from('agent_memories')
      .select('*')
      .eq('namespace', namespace)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories:', error);
      return [];
    }

    return data || [];
  }

  closeSession() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.sessionId = null;
    this.messageHandlers.clear();
  }
}

// Singleton instance
export const executiveAgent = new ExecutiveAgent();