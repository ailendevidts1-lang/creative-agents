interface VADConfig {
  threshold: number;
  silenceTimeout: number;
  minSpeechDuration: number;
}

export class VADService {
  private isRunning = false;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private config: VADConfig;

  // VAD state
  private isSpeaking = false;
  private speechStartTime = 0;
  private silenceStartTime = 0;
  private audioBuffer: Float32Array[] = [];
  private energyHistory: number[] = [];
  private energyHistorySize = 10;

  // Callbacks
  public onSpeechStart: (() => void) | null = null;
  public onSpeechEnd: ((audioData: Float32Array) => void) | null = null;

  constructor(config: VADConfig) {
    this.config = config;
  }

  async start(stream: MediaStream): Promise<void> {
    if (this.isRunning) return;

    try {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        this.processAudioFrame(new Float32Array(inputData));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isRunning = true;
      this.resetState();
      console.log('VAD service started');
    } catch (error) {
      console.error('Failed to start VAD service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.resetState();
    this.isRunning = false;
    console.log('VAD service stopped');
  }

  forceEndCapture(): void {
    if (this.isSpeaking) {
      this.endSpeech();
    }
  }

  private processAudioFrame(audioData: Float32Array): void {
    // Calculate audio energy
    const energy = this.calculateAudioEnergy(audioData);
    
    // Update energy history for dynamic threshold
    this.energyHistory.push(energy);
    if (this.energyHistory.length > this.energyHistorySize) {
      this.energyHistory.shift();
    }

    // Calculate dynamic threshold
    const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
    const dynamicThreshold = Math.max(this.config.threshold, avgEnergy * 2);

    const isSpeechFrame = energy > dynamicThreshold;
    const now = Date.now();

    if (isSpeechFrame && !this.isSpeaking) {
      // Speech started
      this.startSpeech(now);
    } else if (!isSpeechFrame && this.isSpeaking) {
      // Potential end of speech
      if (this.silenceStartTime === 0) {
        this.silenceStartTime = now;
      } else if (now - this.silenceStartTime > this.config.silenceTimeout) {
        // Silence timeout reached
        this.endSpeech();
      }
    } else if (isSpeechFrame && this.isSpeaking) {
      // Continuing speech, reset silence timer
      this.silenceStartTime = 0;
    }

    // Buffer audio during speech
    if (this.isSpeaking) {
      this.audioBuffer.push(audioData);
    }
  }

  private calculateAudioEnergy(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  private startSpeech(timestamp: number): void {
    this.isSpeaking = true;
    this.speechStartTime = timestamp;
    this.silenceStartTime = 0;
    this.audioBuffer = [];
    
    console.log('Speech detected, starting capture');
    
    if (this.onSpeechStart) {
      this.onSpeechStart();
    }
  }

  private endSpeech(): void {
    if (!this.isSpeaking) return;

    const speechDuration = Date.now() - this.speechStartTime;
    
    // Check minimum speech duration
    if (speechDuration < this.config.minSpeechDuration) {
      console.log('Speech too short, ignoring');
      this.resetState();
      return;
    }

    // Combine audio buffer
    const totalSamples = this.audioBuffer.reduce((total, buffer) => total + buffer.length, 0);
    const combinedAudio = new Float32Array(totalSamples);
    let offset = 0;
    
    for (const buffer of this.audioBuffer) {
      combinedAudio.set(buffer, offset);
      offset += buffer.length;
    }

    console.log(`Speech ended, captured ${speechDuration}ms of audio`);
    
    if (this.onSpeechEnd) {
      this.onSpeechEnd(combinedAudio);
    }

    this.resetState();
  }

  private resetState(): void {
    this.isSpeaking = false;
    this.speechStartTime = 0;
    this.silenceStartTime = 0;
    this.audioBuffer = [];
  }

  isActive(): boolean {
    return this.isRunning;
  }

  isSpeechActive(): boolean {
    return this.isSpeaking;
  }

  updateConfig(config: Partial<VADConfig>): void {
    this.config = { ...this.config, ...config };
  }
}