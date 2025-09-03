import { Plan } from './types';
import { QueuedExecution } from './ExecutionQueue';
import { ExecutionSummary } from './ExecutionSummarizer';

export interface ExecutionSession {
  id: string;
  planId: string;
  plan: Plan;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  executions: QueuedExecution[];
  summary?: ExecutionSummary;
  metadata: Record<string, any>;
}

export interface StateStoreConfig {
  persistToDisk: boolean;
  maxSessions: number;
  retentionDays: number;
}

export class ExecutionStateStore {
  private config: StateStoreConfig;
  private sessions: Map<string, ExecutionSession> = new Map();
  private sessionsByPlan: Map<string, string> = new Map(); // planId -> sessionId

  // Callbacks for state changes
  public onSessionStart: ((session: ExecutionSession) => void) | null = null;
  public onSessionUpdate: ((session: ExecutionSession) => void) | null = null;
  public onSessionComplete: ((session: ExecutionSession) => void) | null = null;

  constructor(config: StateStoreConfig) {
    this.config = config;
    
    if (config.persistToDisk) {
      this.loadPersistedSessions();
    }

    // Cleanup old sessions periodically
    this.startCleanupInterval();
  }

  startSession(plan: Plan): ExecutionSession {
    const sessionId = this.generateSessionId();
    
    const session: ExecutionSession = {
      id: sessionId,
      planId: plan.id,
      plan,
      status: 'running',
      startedAt: new Date(),
      executions: [],
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: Date.now()
      }
    };

    this.sessions.set(sessionId, session);
    this.sessionsByPlan.set(plan.id, sessionId);
    
    console.log('Started execution session:', sessionId, 'for plan:', plan.id);
    
    if (this.onSessionStart) {
      this.onSessionStart(session);
    }

    this.persistIfEnabled();
    return session;
  }

  updateSession(sessionId: string, updates: Partial<ExecutionSession>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn('Session not found for update:', sessionId);
      return;
    }

    // Update session
    Object.assign(session, updates);
    
    console.log('Updated execution session:', sessionId);
    
    if (this.onSessionUpdate) {
      this.onSessionUpdate(session);
    }

    this.persistIfEnabled();
  }

  addExecution(sessionId: string, execution: QueuedExecution): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn('Session not found for execution update:', sessionId);
      return;
    }

    // Update or add execution
    const existingIndex = session.executions.findIndex(e => e.id === execution.id);
    if (existingIndex >= 0) {
      session.executions[existingIndex] = execution;
    } else {
      session.executions.push(execution);
    }

    console.log('Updated execution in session:', sessionId, execution.id);
    
    if (this.onSessionUpdate) {
      this.onSessionUpdate(session);
    }

    this.persistIfEnabled();
  }

  completeSession(sessionId: string, summary: ExecutionSummary): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn('Session not found for completion:', sessionId);
      return;
    }

    session.status = summary.status === 'success' ? 'completed' : 
                   summary.status === 'failed' ? 'failed' : 'completed';
    session.completedAt = new Date();
    session.summary = summary;

    console.log('Completed execution session:', sessionId, 'with status:', session.status);
    
    if (this.onSessionComplete) {
      this.onSessionComplete(session);
    }

    this.persistIfEnabled();
  }

  cancelSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn('Session not found for cancellation:', sessionId);
      return;
    }

    session.status = 'cancelled';
    session.completedAt = new Date();

    console.log('Cancelled execution session:', sessionId);
    
    if (this.onSessionUpdate) {
      this.onSessionUpdate(session);
    }

    this.persistIfEnabled();
  }

  getSession(sessionId: string): ExecutionSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByPlan(planId: string): ExecutionSession | undefined {
    const sessionId = this.sessionsByPlan.get(planId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  getAllSessions(): ExecutionSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.startedAt.getTime() - a.startedAt.getTime()
    );
  }

  getRecentSessions(limit: number = 10): ExecutionSession[] {
    return this.getAllSessions().slice(0, limit);
  }

  getSessionsByStatus(status: ExecutionSession['status']): ExecutionSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === status);
  }

  getExecutionHistory(planId: string): QueuedExecution[] {
    const session = this.getSessionByPlan(planId);
    return session ? session.executions : [];
  }

  // Statistics methods
  getStatistics() {
    const allSessions = Array.from(this.sessions.values());
    const completed = allSessions.filter(s => s.status === 'completed');
    const failed = allSessions.filter(s => s.status === 'failed');
    const running = allSessions.filter(s => s.status === 'running');

    const successRate = allSessions.length > 0 ? 
      (completed.length / allSessions.length) * 100 : 0;

    const avgExecutionTime = completed.length > 0 ?
      completed.reduce((sum, s) => sum + (s.completedAt!.getTime() - s.startedAt.getTime()), 0) / completed.length : 0;

    return {
      totalSessions: allSessions.length,
      completed: completed.length,
      failed: failed.length,
      running: running.length,
      cancelled: allSessions.filter(s => s.status === 'cancelled').length,
      successRate: Math.round(successRate * 100) / 100,
      avgExecutionTimeMs: Math.round(avgExecutionTime)
    };
  }

  // Persistence methods
  private persistIfEnabled(): void {
    if (this.config.persistToDisk) {
      this.persistSessions();
    }
  }

  private persistSessions(): void {
    try {
      const sessionData = {
        sessions: Array.from(this.sessions.entries()),
        sessionsByPlan: Array.from(this.sessionsByPlan.entries()),
        timestamp: Date.now()
      };
      
      localStorage.setItem('execution-state-store', JSON.stringify(sessionData, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      }));
      
      console.log('Persisted execution state store');
    } catch (error) {
      console.error('Failed to persist execution state:', error);
    }
  }

  private loadPersistedSessions(): void {
    try {
      const stored = localStorage.getItem('execution-state-store');
      if (!stored) return;

      const sessionData = JSON.parse(stored, (key, value) => {
        if (value && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });

      // Restore sessions
      for (const [sessionId, session] of sessionData.sessions) {
        this.sessions.set(sessionId, session);
      }

      // Restore session mappings
      for (const [planId, sessionId] of sessionData.sessionsByPlan) {
        this.sessionsByPlan.set(planId, sessionId);
      }

      console.log(`Loaded ${this.sessions.size} persisted execution sessions`);
    } catch (error) {
      console.error('Failed to load persisted execution state:', error);
    }
  }

  private startCleanupInterval(): void {
    // Clean up old sessions every hour
    setInterval(() => {
      this.cleanupOldSessions();
    }, 60 * 60 * 1000);
  }

  private cleanupOldSessions(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let removedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startedAt < cutoffDate && session.status !== 'running') {
        this.sessions.delete(sessionId);
        this.sessionsByPlan.delete(session.planId);
        removedCount++;
      }
    }

    // Also enforce max sessions limit
    const allSessions = this.getAllSessions();
    if (allSessions.length > this.config.maxSessions) {
      const toRemove = allSessions.slice(this.config.maxSessions);
      for (const session of toRemove) {
        if (session.status !== 'running') {
          this.sessions.delete(session.id);
          this.sessionsByPlan.delete(session.planId);
          removedCount++;
        }
      }
    }

    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old execution sessions`);
      this.persistIfEnabled();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Utility methods
  clearAll(): void {
    this.sessions.clear();
    this.sessionsByPlan.clear();
    
    if (this.config.persistToDisk) {
      localStorage.removeItem('execution-state-store');
    }
    
    console.log('Cleared all execution sessions');
  }

  exportSessions(): string {
    return JSON.stringify({
      sessions: this.getAllSessions(),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}