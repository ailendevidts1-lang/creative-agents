import { useCallback, useEffect, useRef, useState } from 'react';
import { VoicePipeline } from '@/services/pipeline/VoicePipeline';
import { 
  PipelineState, 
  PipelineMode, 
  PipelineEvent, 
  PipelineConfig,
  PipelineCallbacks 
} from '@/services/pipeline/types';

const defaultConfig: PipelineConfig = {
  wakeWord: {
    enabled: true,
    threshold: 0.01,
    phrase: 'hey jarvis'
  },
  vad: {
    threshold: 0.01,
    silenceTimeout: 1500,
    minSpeechDuration: 500
  },
  asr: {
    language: 'en',
    model: 'whisper-1'
  },
  nlu: {
    model: 'gpt-4o-mini',
    threshold: 0.7
  },
  tts: {
    voice: 'alloy',
    speed: 1.0,
    enabled: true
  },
  context: {
    maxHistory: 50,
    persistenceEnabled: true
  }
};

export function useVoicePipeline(customConfig?: Partial<PipelineConfig>) {
  const [state, setState] = useState<PipelineState>('idle');
  const [mode, setMode] = useState<PipelineMode>('voice');
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  
  const pipelineRef = useRef<VoicePipeline | null>(null);
  const configRef = useRef<PipelineConfig>({ ...defaultConfig, ...customConfig });

  // Pipeline callbacks
  const callbacks: PipelineCallbacks = {
    onStateChange: useCallback((newState: PipelineState) => {
      setState(newState);
    }, []),

    onEvent: useCallback((event: PipelineEvent) => {
      setEvents(prev => [...prev.slice(-19), event]); // Keep last 20 events
    }, []),

    onError: useCallback((error: Error) => {
      console.error('Pipeline error:', error);
      setError(error);
    }, []),

    onResponse: useCallback((text: string, audio?: ArrayBuffer) => {
      setLastResponse(text);
      // Audio will be played automatically by TTS service
    }, [])
  };

  // Initialize pipeline
  const initialize = useCallback(async () => {
    if (isInitialized || pipelineRef.current) {
      return;
    }

    try {
      const pipeline = new VoicePipeline(configRef.current, callbacks);
      pipelineRef.current = pipeline;
      
      await pipeline.initialize();
      setIsInitialized(true);
      setError(null);
      
      console.log('Voice pipeline initialized');
    } catch (err) {
      console.error('Failed to initialize pipeline:', err);
      setError(err as Error);
    }
  }, [isInitialized, callbacks]);

  // Shutdown pipeline
  const shutdown = useCallback(async () => {
    if (!pipelineRef.current) return;

    try {
      await pipelineRef.current.shutdown();
      pipelineRef.current = null;
      setIsInitialized(false);
      setState('idle');
      
      console.log('Voice pipeline shut down');
    } catch (err) {
      console.error('Failed to shutdown pipeline:', err);
      setError(err as Error);
    }
  }, []);

  // Set pipeline mode
  const setPipelineMode = useCallback((newMode: PipelineMode) => {
    if (!pipelineRef.current) return;
    
    pipelineRef.current.setMode(newMode);
    setMode(newMode);
  }, []);

  // Manual text input
  const processText = useCallback(async (text: string) => {
    if (!pipelineRef.current || !text.trim()) return;
    
    try {
      await pipelineRef.current.processManualInput(text.trim());
    } catch (err) {
      console.error('Failed to process text:', err);
      setError(err as Error);
    }
  }, []);

  // Push-to-talk controls
  const handlePushToTalk = useCallback((pressed: boolean) => {
    if (!pipelineRef.current) return;
    
    pipelineRef.current.handlePushToTalk(pressed);
  }, []);

  // Barge-in (interrupt TTS)
  const handleBargeIn = useCallback(() => {
    if (!pipelineRef.current) return;
    
    pipelineRef.current.handleBargeIn();
  }, []);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<PipelineConfig>) => {
    configRef.current = { ...configRef.current, ...updates };
    
    if (pipelineRef.current) {
      pipelineRef.current.updateConfig(updates);
    }
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
    
    // Cleanup on unmount
    return () => {
      shutdown();
    };
  }, [initialize, shutdown]);

  return {
    // State
    state,
    mode,
    isInitialized,
    error,
    lastResponse,
    events,
    config: configRef.current,

    // Actions
    initialize,
    shutdown,
    setPipelineMode,
    processText,
    handlePushToTalk,
    handleBargeIn,
    updateConfig,
    clearError,
    clearEvents,

    // Computed state
    isListening: state === 'wake-listening' || state === 'voice-detecting' || state === 'speech-capturing',
    isProcessing: state === 'speech-processing' || state === 'nlu-processing' || state === 'planning' || state === 'tool-executing',
    isSpeaking: state === 'tts-speaking',
    isActive: state !== 'idle' && state !== 'error',
    hasError: error !== null
  };
}