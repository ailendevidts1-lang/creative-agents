export type PipelineState = 
  | 'idle'
  | 'wake-listening' 
  | 'wake-triggered'
  | 'voice-detecting'
  | 'speech-capturing'
  | 'speech-processing'
  | 'nlu-processing'
  | 'planning'
  | 'tool-executing'
  | 'evidence-gathering'
  | 'response-generating'
  | 'tts-speaking'
  | 'error';

export type PipelineMode = 'voice' | 'manual';

export interface PipelineEvent {
  type: string;
  data?: any;
  timestamp: Date;
}

export interface VoiceCapture {
  audioData: Float32Array;
  sampleRate: number;
  channels: number;
}

export interface ASRResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface NLUResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  needsPlanning: boolean;
  isQuestion: boolean;
}

export interface Plan {
  id: string;
  steps: PlanStep[];
  summary: string;
  estimatedDuration: number;
}

export interface PlanStep {
  id: string;
  type: 'skill' | 'api' | 'search' | 'computation';
  action: string;
  parameters: Record<string, any>;
  dependencies: string[];
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface EvidenceItem {
  source: string;
  content: string;
  relevance: number;
  url?: string;
  timestamp?: Date;
}

export interface RAGResult {
  evidence: EvidenceItem[];
  summary: string;
  confidence: number;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  emotion?: string;
}

export interface ContextEntry {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PipelineConfig {
  wakeWord: {
    enabled: boolean;
    threshold: number;
    phrase: string;
  };
  vad: {
    threshold: number;
    silenceTimeout: number;
    minSpeechDuration: number;
  };
  asr: {
    language: string;
    model: string;
  };
  nlu: {
    model: string;
    threshold: number;
  };
  tts: {
    voice: string;
    speed: number;
    enabled: boolean;
  };
  context: {
    maxHistory: number;
    persistenceEnabled: boolean;
  };
}

export interface PipelineCallbacks {
  onStateChange: (state: PipelineState) => void;
  onEvent: (event: PipelineEvent) => void;
  onError: (error: Error) => void;
  onResponse: (response: string, audio?: ArrayBuffer) => void;
}