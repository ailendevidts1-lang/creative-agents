import { useState, useCallback, useRef } from 'react';
import { ExecutiveAgent, AgentMessage, AgentSession, AgentPlan, AgentPipeline } from '@/services/ExecutiveAgent';

export interface UseExecutiveAgentReturn {
  // State
  isProcessing: boolean;
  currentSession: string | null;
  messages: AgentMessage[];
  sessions: AgentSession[];
  plans: AgentPlan[];
  pipelines: AgentPipeline[];
  error: string | null;
  
  // Actions
  startSession: (mode?: 'manual' | 'voice', persona?: string) => Promise<void>;
  sendMessage: (message: string, options?: any) => Promise<void>;
  getSessionHistory: () => Promise<void>;
  getPlansForSession: (sessionId: string) => Promise<void>;
  getPipelines: () => Promise<void>;
  createPipeline: (pipeline: any) => Promise<void>;
  runPipeline: (pipelineId: string) => Promise<void>;
  approveExecution: (executionId: string) => Promise<void>;
  denyExecution: (executionId: string) => Promise<void>;
  clearMessages: () => void;
  closeSession: () => void;
}

export const useExecutiveAgent = (): UseExecutiveAgentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [plans, setPlans] = useState<AgentPlan[]>([]);
  const [pipelines, setPipelines] = useState<AgentPipeline[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const agentRef = useRef<ExecutiveAgent | null>(null);

  // Initialize agent if not exists
  const getAgent = useCallback(() => {
    if (!agentRef.current) {
      agentRef.current = new ExecutiveAgent();
      
      // Set up event handlers
      agentRef.current.on('session_started', (message) => {
        console.log('Session started:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('interpretation', (message) => {
        console.log('Interpretation:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('plan', (message) => {
        console.log('Plan received:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('tool_call', (message) => {
        console.log('Tool call:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('tool_result', (message) => {
        console.log('Tool result:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('approval_request', (message) => {
        console.log('Approval requested:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('pipeline_update', (message) => {
        console.log('Pipeline update:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('log', (message) => {
        console.log('Agent log:', message);
        setMessages(prev => [...prev, message]);
      });

      agentRef.current.on('error', (message) => {
        console.error('Agent error:', message);
        setError(message.message);
        setMessages(prev => [...prev, message]);
        setIsProcessing(false);
      });

      agentRef.current.on('done', (message) => {
        console.log('Agent done:', message);
        setMessages(prev => [...prev, message]);
        setIsProcessing(false);
      });
    }
    
    return agentRef.current;
  }, []);

  const startSession = useCallback(async (mode: 'manual' | 'voice' = 'manual', persona: string = 'default') => {
    try {
      setError(null);
      setIsProcessing(true);
      
      const agent = getAgent();
      const sessionId = await agent.startSession(mode, persona);
      setCurrentSession(sessionId);
      
      setMessages([{
        type: 'session_started',
        sessionId,
        mode,
        persona,
        timestamp: Date.now()
      }]);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      setError(message);
      console.error('Start session error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [getAgent]);

  const sendMessage = useCallback(async (message: string, options: any = {}) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Add user message to history
      setMessages(prev => [...prev, {
        type: 'user_message',
        message,
        timestamp: Date.now()
      }]);
      
      const agent = getAgent();
      await agent.sendMessage(message, options);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Send message error:', err);
      setIsProcessing(false);
    }
  }, [getAgent]);

  const getSessionHistory = useCallback(async () => {
    try {
      const agent = getAgent();
      const history = await agent.getSessionHistory();
      setSessions(history);
    } catch (err) {
      console.error('Get session history error:', err);
    }
  }, [getAgent]);

  const getPlansForSession = useCallback(async (sessionId: string) => {
    try {
      const agent = getAgent();
      const sessionPlans = await agent.getPlansForSession(sessionId);
      setPlans(sessionPlans);
    } catch (err) {
      console.error('Get plans error:', err);
    }
  }, [getAgent]);

  const getPipelines = useCallback(async () => {
    try {
      const agent = getAgent();
      const allPipelines = await agent.getPipelines();
      setPipelines(allPipelines);
    } catch (err) {
      console.error('Get pipelines error:', err);
    }
  }, [getAgent]);

  const createPipeline = useCallback(async (pipeline: any) => {
    try {
      const agent = getAgent();
      const newPipeline = await agent.createPipeline(pipeline);
      if (newPipeline) {
        setPipelines(prev => [newPipeline, ...prev]);
      }
    } catch (err) {
      console.error('Create pipeline error:', err);
    }
  }, [getAgent]);

  const runPipeline = useCallback(async (pipelineId: string) => {
    try {
      const agent = getAgent();
      const runId = await agent.runPipeline(pipelineId);
      if (runId) {
        console.log('Pipeline run started:', runId);
      }
    } catch (err) {
      console.error('Run pipeline error:', err);
    }
  }, [getAgent]);

  const approveExecution = useCallback(async (executionId: string) => {
    try {
      const agent = getAgent();
      const success = await agent.approveExecution(executionId);
      if (success) {
        setMessages(prev => [...prev, {
          type: 'approval_granted',
          executionId,
          timestamp: Date.now()
        }]);
      }
    } catch (err) {
      console.error('Approve execution error:', err);
    }
  }, [getAgent]);

  const denyExecution = useCallback(async (executionId: string) => {
    try {
      const agent = getAgent();
      const success = await agent.denyExecution(executionId);
      if (success) {
        setMessages(prev => [...prev, {
          type: 'approval_denied',
          executionId,
          timestamp: Date.now()
        }]);
      }
    } catch (err) {
      console.error('Deny execution error:', err);
    }
  }, [getAgent]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const closeSession = useCallback(() => {
    const agent = getAgent();
    agent.closeSession();
    setCurrentSession(null);
    setIsProcessing(false);
    setError(null);
  }, [getAgent]);

  return {
    // State
    isProcessing,
    currentSession,
    messages,
    sessions,
    plans,
    pipelines,
    error,
    
    // Actions
    startSession,
    sendMessage,
    getSessionHistory,
    getPlansForSession,
    getPipelines,
    createPipeline,
    runPipeline,
    approveExecution,
    denyExecution,
    clearMessages,
    closeSession,
  };
};