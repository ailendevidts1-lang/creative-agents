import { supabase } from '@/integrations/supabase/client';
import { NLUResult } from './types';

interface NLUConfig {
  model: string;
  threshold: number;
}

export class NLUService {
  private config: NLUConfig;
  private isInitialized = false;

  constructor(config: NLUConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('NLU Service initialized');
    this.isInitialized = true;
  }

  async processText(text: string): Promise<NLUResult> {
    if (!this.isInitialized) {
      throw new Error('NLU Service not initialized');
    }

    try {
      // Call our edge function for intent classification
      const { data, error } = await supabase.functions.invoke('classify-intent', {
        body: {
          text,
          model: this.config.model
        }
      });

      if (error) {
        console.error('NLU processing error:', error);
        // Return default classification
        return this.createFallbackResult(text);
      }

      const result: NLUResult = {
        intent: data.intent || 'general',
        entities: data.entities || {},
        confidence: data.confidence || 0.5,
        needsPlanning: data.needsPlanning || this.requiresPlanning(data.intent),
        isQuestion: data.isQuestion || this.isQuestion(text)
      };

      console.log('NLU Result:', result);
      return result;
    } catch (error) {
      console.error('NLU processing error:', error);
      return this.createFallbackResult(text);
    }
  }

  private createFallbackResult(text: string): NLUResult {
    // Simple rule-based fallback
    const intent = this.classifyIntent(text);
    const isQuestion = this.isQuestion(text);
    const needsPlanning = this.requiresPlanning(intent);

    return {
      intent,
      entities: this.extractBasicEntities(text),
      confidence: 0.6,
      needsPlanning,
      isQuestion
    };
  }

  private classifyIntent(text: string): string {
    const lowerText = text.toLowerCase();

    // Timer/Alarm intents
    if (lowerText.includes('timer') || lowerText.includes('alarm') || lowerText.includes('remind')) {
      return 'timer';
    }

    // Note-taking intents
    if (lowerText.includes('note') || lowerText.includes('write') || lowerText.includes('remember')) {
      return 'notes';
    }

    // Weather intents
    if (lowerText.includes('weather') || lowerText.includes('temperature') || lowerText.includes('forecast')) {
      return 'weather';
    }

    // Search intents
    if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look up')) {
      return 'search';
    }

    // Code/Development intents
    if (lowerText.includes('code') || lowerText.includes('function') || lowerText.includes('debug') || 
        lowerText.includes('implement') || lowerText.includes('project')) {
      return 'development';
    }

    // Question patterns
    if (this.isQuestion(text)) {
      return 'question';
    }

    return 'general';
  }

  private isQuestion(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    
    // Question words
    const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'did'];
    const startsWithQuestion = questionWords.some(word => lowerText.startsWith(word + ' '));
    
    // Ends with question mark
    const endsWithQuestionMark = lowerText.endsWith('?');
    
    return startsWithQuestion || endsWithQuestionMark;
  }

  private requiresPlanning(intent: string): boolean {
    const planningIntents = ['timer', 'notes', 'weather', 'search', 'development'];
    return planningIntents.includes(intent);
  }

  private extractBasicEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract time patterns for timers
    const timeRegex = /(\d+)\s*(minute|minutes|min|second|seconds|sec|hour|hours|hr)/gi;
    const timeMatches = text.match(timeRegex);
    if (timeMatches) {
      entities.duration = timeMatches[0];
    }

    // Extract locations for weather
    const locationRegex = /in\s+([A-Za-z\s]+?)(?:\s|$|,|\?)/gi;
    const locationMatch = locationRegex.exec(text);
    if (locationMatch) {
      entities.location = locationMatch[1].trim();
    }

    // Extract note content
    if (text.toLowerCase().includes('note')) {
      const noteRegex = /note\s*:?\s*(.+)/gi;
      const noteMatch = noteRegex.exec(text);
      if (noteMatch) {
        entities.content = noteMatch[1].trim();
      }
    }

    return entities;
  }

  updateConfig(config: Partial<NLUConfig>): void {
    this.config = { ...this.config, ...config };
  }
}