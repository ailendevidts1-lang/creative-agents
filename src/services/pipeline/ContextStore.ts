import { ContextEntry } from './types';

interface ContextConfig {
  maxHistory: number;
  persistenceEnabled: boolean;
}

export class ContextStore {
  private config: ContextConfig;
  private entries: ContextEntry[] = [];
  private sessionId: string;

  constructor(config: ContextConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    
    if (config.persistenceEnabled) {
      this.loadPersistedContext();
    }
  }

  addEntry(type: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>): void {
    const entry: ContextEntry = {
      id: this.generateId(),
      type,
      content,
      timestamp: new Date(),
      metadata
    };

    this.entries.push(entry);
    
    // Maintain max history limit
    while (this.entries.length > this.config.maxHistory) {
      this.entries.shift();
    }

    if (this.config.persistenceEnabled) {
      this.persistContext();
    }

    console.log('Added context entry:', entry);
  }

  getContext(limit?: number): ContextEntry[] {
    const contextLimit = limit || this.config.maxHistory;
    return this.entries.slice(-contextLimit);
  }

  getRecentContext(minutes: number = 30): ContextEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.entries.filter(entry => entry.timestamp > cutoff);
  }

  getContextByType(type: 'user' | 'assistant' | 'system', limit?: number): ContextEntry[] {
    const filtered = this.entries.filter(entry => entry.type === type);
    return limit ? filtered.slice(-limit) : filtered;
  }

  searchContext(query: string): ContextEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter(entry => 
      entry.content.toLowerCase().includes(lowerQuery)
    );
  }

  getConversationSummary(): string {
    const recentEntries = this.getRecentContext(15); // Last 15 minutes
    
    if (recentEntries.length === 0) {
      return "No recent conversation history.";
    }

    const userQueries = recentEntries
      .filter(entry => entry.type === 'user')
      .map(entry => entry.content)
      .slice(-3); // Last 3 user inputs

    const assistantResponses = recentEntries
      .filter(entry => entry.type === 'assistant')
      .map(entry => entry.content)
      .slice(-3); // Last 3 assistant responses

    let summary = "Recent conversation topics: ";
    
    if (userQueries.length > 0) {
      summary += userQueries.join(", ");
    }

    return summary;
  }

  clearContext(): void {
    this.entries = [];
    
    if (this.config.persistenceEnabled) {
      this.clearPersistedContext();
    }
    
    console.log('Context cleared');
  }

  updateConfig(config: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Persistence methods
  private persistContext(): void {
    if (!this.config.persistenceEnabled) return;
    
    try {
      const contextData = {
        sessionId: this.sessionId,
        entries: this.entries,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('voice-pipeline-context', JSON.stringify(contextData));
    } catch (error) {
      console.error('Failed to persist context:', error);
    }
  }

  private loadPersistedContext(): void {
    try {
      const stored = localStorage.getItem('voice-pipeline-context');
      if (!stored) return;

      const contextData = JSON.parse(stored);
      
      // Only load context from recent sessions (last 24 hours)
      const storedTime = new Date(contextData.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (storedTime > dayAgo && contextData.entries) {
        this.entries = contextData.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        
        console.log(`Loaded ${this.entries.length} persisted context entries`);
      }
    } catch (error) {
      console.error('Failed to load persisted context:', error);
    }
  }

  private clearPersistedContext(): void {
    try {
      localStorage.removeItem('voice-pipeline-context');
    } catch (error) {
      console.error('Failed to clear persisted context:', error);
    }
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateSessionId(): string {
    return 'session-' + this.generateId();
  }

  // Getters
  getSessionId(): string {
    return this.sessionId;
  }

  getEntryCount(): number {
    return this.entries.length;
  }
}