import { supabase } from '@/integrations/supabase/client';
import { ASRResult } from './types';

interface ASRConfig {
  language: string;
  model: string;
}

export class ASRService {
  private config: ASRConfig;
  private isInitialized = false;

  // Callbacks
  public onResult: ((result: ASRResult) => void) | null = null;

  constructor(config: ASRConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Check if we can access the transcription service
    try {
      console.log('ASR Service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize ASR service:', error);
      throw error;
    }
  }

  async processAudio(audioData: Float32Array): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('ASR Service not initialized');
    }

    try {
      // Convert Float32Array to base64 for transmission
      const base64Audio = this.encodeAudioData(audioData);
      
      // Call our edge function for transcription
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          audio: base64Audio,
          language: this.config.language,
          model: this.config.model
        }
      });

      if (error) {
        throw new Error(`Transcription failed: ${error.message}`);
      }

      const result: ASRResult = {
        transcript: data.text || '',
        confidence: data.confidence || 0.9,
        isFinal: true
      };

      console.log('ASR Result:', result);
      
      if (this.onResult && result.transcript.trim()) {
        this.onResult(result);
      }
    } catch (error) {
      console.error('ASR processing error:', error);
      
      // Return error result
      const errorResult: ASRResult = {
        transcript: '',
        confidence: 0,
        isFinal: true
      };
      
      if (this.onResult) {
        this.onResult(errorResult);
      }
    }
  }

  async stop(): Promise<void> {
    // Clean up any resources
    console.log('ASR Service stopped');
  }

  private encodeAudioData(float32Array: Float32Array): string {
    // Convert Float32 to Int16 for better compression
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000; // Process in chunks to avoid call stack limits
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  updateConfig(config: Partial<ASRConfig>): void {
    this.config = { ...this.config, ...config };
  }
}