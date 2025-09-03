interface WakeWordConfig {
  enabled: boolean;
  threshold: number;
  phrase: string;
}

export class WakeWordDetector {
  private isRunning = false;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private config: WakeWordConfig;
  
  // Simple wake word detection (in production, use a proper wake word engine)
  private audioBuffer: Float32Array[] = [];
  private bufferDuration = 2000; // 2 seconds
  private detectionCooldown = 3000; // 3 seconds
  private lastDetection = 0;

  public onWakeWordDetected: (() => void) | null = null;

  constructor(config: WakeWordConfig) {
    this.config = config;
  }

  async start(stream: MediaStream): Promise<void> {
    if (!this.config.enabled || this.isRunning) return;

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
      console.log('Wake word detector started');
    } catch (error) {
      console.error('Failed to start wake word detector:', error);
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

    this.audioBuffer = [];
    this.isRunning = false;
    console.log('Wake word detector stopped');
  }

  private processAudioFrame(audioData: Float32Array): void {
    // Add to rolling buffer
    this.audioBuffer.push(audioData);
    
    // Keep buffer size manageable (2 seconds of audio)
    const maxFrames = Math.floor((this.bufferDuration / 1000) * 16000 / 4096);
    while (this.audioBuffer.length > maxFrames) {
      this.audioBuffer.shift();
    }

    // Simple wake word detection based on audio energy and patterns
    const energy = this.calculateAudioEnergy(audioData);
    const isLikelySpeech = energy > this.config.threshold;
    
    if (isLikelySpeech && this.shouldDetectWakeWord()) {
      // In a real implementation, this would use a proper wake word engine
      // For now, we'll trigger on speech energy above threshold
      this.triggerWakeWord();
    }
  }

  private calculateAudioEnergy(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  private shouldDetectWakeWord(): boolean {
    const now = Date.now();
    return (now - this.lastDetection) > this.detectionCooldown;
  }

  private triggerWakeWord(): void {
    this.lastDetection = Date.now();
    console.log('Wake word detected!');
    
    if (this.onWakeWordDetected) {
      this.onWakeWordDetected();
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }

  updateConfig(config: Partial<WakeWordConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
