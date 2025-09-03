import { supabase } from '@/integrations/supabase/client';
import { TTSRequest } from './types';

interface TTSConfig {
  voice: string;
  speed: number;
  enabled: boolean;
}

export class TTSService {
  private config: TTSConfig;
  private isInitialized = false;
  private audioContext: AudioContext | null = null;
  private currentAudio: AudioBufferSourceNode | null = null;

  // Callbacks
  public onSpeakingStart: (() => void) | null = null;
  public onSpeakingEnd: (() => void) | null = null;

  constructor(config: TTSConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Web Audio API for better audio control
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      console.log('TTS Service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize TTS service:', error);
      throw error;
    }
  }

  async synthesize(request: TTSRequest): Promise<ArrayBuffer> {
    if (!this.isInitialized || !this.config.enabled) {
      throw new Error('TTS Service not initialized or disabled');
    }

    try {
      // Call our edge function for text-to-speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: request.text,
          voice: request.voice || this.config.voice,
          speed: request.speed || this.config.speed
        }
      });

      if (error) {
        throw new Error(`TTS synthesis failed: ${error.message}`);
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      // Convert base64 audio to ArrayBuffer
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = bytes.buffer;
      
      // Play the audio
      await this.playAudio(audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('TTS synthesis error:', error);
      
      // Fallback to browser's speech synthesis
      await this.fallbackSpeech(request.text);
      
      // Return empty buffer
      return new ArrayBuffer(0);
    }
  }

  private async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      // Decode audio data
      const decodedAudio = await this.audioContext.decodeAudioData(audioBuffer.slice(0));
      
      // Create audio source
      this.currentAudio = this.audioContext.createBufferSource();
      this.currentAudio.buffer = decodedAudio;
      this.currentAudio.connect(this.audioContext.destination);
      
      // Set up event listeners
      this.currentAudio.onended = () => {
        if (this.onSpeakingEnd) {
          this.onSpeakingEnd();
        }
        this.currentAudio = null;
      };

      // Start speaking callback
      if (this.onSpeakingStart) {
        this.onSpeakingStart();
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Play audio
      this.currentAudio.start();
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  private async fallbackSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(this.config.voice.toLowerCase())
      ) || voices[0];
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = this.config.speed;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        if (this.onSpeakingStart) {
          this.onSpeakingStart();
        }
      };

      utterance.onend = () => {
        if (this.onSpeakingEnd) {
          this.onSpeakingEnd();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.stop();
      this.currentAudio = null;
    }

    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    if (this.onSpeakingEnd) {
      this.onSpeakingEnd();
    }
  }

  async stop(): Promise<void> {
    this.stopSpeaking();
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    console.log('TTS Service stopped');
  }

  isSpeaking(): boolean {
    return this.currentAudio !== null || speechSynthesis.speaking;
  }

  updateConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
  }
}