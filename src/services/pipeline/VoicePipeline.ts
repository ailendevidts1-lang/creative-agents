import { 
  PipelineState, 
  PipelineMode, 
  PipelineEvent, 
  PipelineConfig, 
  PipelineCallbacks,
  VoiceCapture,
  ASRResult,
  NLUResult,
  Plan,
  ToolResult,
  RAGResult,
  TTSRequest
} from './types';
import { WakeWordDetector } from './WakeWordDetector';
import { VADService } from './VADService';
import { ASRService } from './ASRService';
import { NLUService } from './NLUService';
import { PlannerService } from './PlannerService';
import { ToolExecutor } from './ToolExecutor';
import { RAGService } from './RAGService';
import { TTSService } from './TTSService';
import { ContextStore } from './ContextStore';

export class VoicePipeline {
  private state: PipelineState = 'idle';
  private mode: PipelineMode = 'voice';
  private config: PipelineConfig;
  private callbacks: PipelineCallbacks;
  
  // Services
  private wakeWordDetector: WakeWordDetector;
  private vadService: VADService;
  private asrService: ASRService;
  private nluService: NLUService;
  private plannerService: PlannerService;
  private toolExecutor: ToolExecutor;
  private ragService: RAGService;
  private ttsService: TTSService;
  private contextStore: ContextStore;

  // Pipeline state
  private audioStream: MediaStream | null = null;
  private currentPlan: Plan | null = null;
  private isBargeInEnabled = true;
  private isInterrupted = false;

  constructor(config: PipelineConfig, callbacks: PipelineCallbacks) {
    this.config = config;
    this.callbacks = callbacks;

    // Initialize services
    this.wakeWordDetector = new WakeWordDetector(config.wakeWord);
    this.vadService = new VADService(config.vad);
    this.asrService = new ASRService(config.asr);
    this.nluService = new NLUService(config.nlu);
    this.plannerService = new PlannerService();
    this.toolExecutor = new ToolExecutor();
    this.ragService = new RAGService();
    this.ttsService = new TTSService(config.tts);
    this.contextStore = new ContextStore(config.context);

    // Set up service callbacks
    this.setupServiceCallbacks();
  }

  private setupServiceCallbacks() {
    // Wake word detection
    this.wakeWordDetector.onWakeWordDetected = () => {
      if (this.state === 'wake-listening') {
        this.handleWakeWordTriggered();
      }
    };

    // Voice Activity Detection
    this.vadService.onSpeechStart = () => {
      if (this.state === 'voice-detecting') {
        this.setState('speech-capturing');
      }
    };

    this.vadService.onSpeechEnd = (audioData: Float32Array) => {
      if (this.state === 'speech-capturing') {
        this.processAudioCapture(audioData);
      }
    };

    // ASR Results
    this.asrService.onResult = (result: ASRResult) => {
      this.handleASRResult(result);
    };

    // TTS Events
    this.ttsService.onSpeakingStart = () => {
      this.setState('tts-speaking');
    };

    this.ttsService.onSpeakingEnd = () => {
      if (this.state === 'tts-speaking') {
        this.returnToIdle();
      }
    };
  }

  // Public API
  async initialize(): Promise<void> {
    try {
      await this.initializeAudio();
      await this.asrService.initialize();
      await this.nluService.initialize();
      await this.ttsService.initialize();
      
      if (this.config.wakeWord.enabled) {
        await this.startWakeWordListening();
      } else {
        this.setState('idle');
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  async shutdown(): Promise<void> {
    await this.wakeWordDetector.stop();
    await this.vadService.stop();
    await this.asrService.stop();
    await this.ttsService.stop();
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    this.setState('idle');
  }

  setMode(mode: PipelineMode): void {
    this.mode = mode;
    if (mode === 'voice' && this.config.wakeWord.enabled) {
      this.startWakeWordListening();
    } else if (mode === 'manual') {
      this.wakeWordDetector.stop();
      this.setState('idle');
    }
  }

  // Voice Interaction Pipeline
  async startWakeWordListening(): Promise<void> {
    if (this.mode !== 'voice') return;
    
    this.setState('wake-listening');
    await this.wakeWordDetector.start(this.audioStream!);
  }

  handleWakeWordTriggered(): void {
    this.setState('wake-triggered');
    this.emitEvent('wake-word-detected');
    this.startVoiceActivation();
  }

  startVoiceActivation(): void {
    this.setState('voice-detecting');
    this.vadService.start(this.audioStream!);
  }

  handlePushToTalk(pressed: boolean): void {
    if (this.mode !== 'voice') return;

    if (pressed) {
      // Bypass wake word, start VAD directly
      this.setState('voice-detecting');
      this.vadService.start(this.audioStream!);
    } else {
      // End capture and process
      this.vadService.forceEndCapture();
    }
  }

  handleBargeIn(): void {
    if (!this.isBargeInEnabled) return;
    
    this.isInterrupted = true;
    this.ttsService.stopSpeaking();
    this.setState('voice-detecting');
    this.vadService.start(this.audioStream!);
  }

  // Manual Chat Pipeline
  async processManualInput(text: string): Promise<void> {
    try {
      this.setState('nlu-processing');
      this.contextStore.addEntry('user', text);
      
      const nluResult = await this.nluService.processText(text);
      await this.handleNLUResult(nluResult, text);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // Core Pipeline Processing
  private async processAudioCapture(audioData: Float32Array): Promise<void> {
    try {
      this.setState('speech-processing');
      this.asrService.processAudio(audioData);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleASRResult(result: ASRResult): Promise<void> {
    if (!result.isFinal) return;

    try {
      this.contextStore.addEntry('user', result.transcript);
      this.setState('nlu-processing');
      
      const nluResult = await this.nluService.processText(result.transcript);
      await this.handleNLUResult(nluResult, result.transcript);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleNLUResult(nluResult: NLUResult, originalText: string): Promise<void> {
    try {
      if (nluResult.needsPlanning) {
        await this.executePlanningPipeline(originalText, nluResult);
      } else if (nluResult.isQuestion) {
        await this.executeRAGPipeline(originalText, nluResult);
      } else {
        // Direct response
        await this.generateResponse(`I understand you said: "${originalText}". How can I help you with that?`);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // Tool/Skill Execution Pipeline
  private async executePlanningPipeline(query: string, nluResult: NLUResult): Promise<void> {
    try {
      this.setState('planning');
      
      const context = this.contextStore.getContext();
      const plan = await this.plannerService.createPlan(query, nluResult, context);
      this.currentPlan = plan;
      
      this.setState('tool-executing');
      const results = await this.toolExecutor.executePlan(plan);
      
      await this.generatePlanSummary(plan, results);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // Grounded Answering Pipeline (RAG)
  private async executeRAGPipeline(query: string, nluResult: NLUResult): Promise<void> {
    try {
      this.setState('evidence-gathering');
      
      const context = this.contextStore.getContext();
      const ragResult = await this.ragService.processQuery(query, context);
      
      this.setState('response-generating');
      await this.generateRAGResponse(query, ragResult);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async generatePlanSummary(plan: Plan, results: ToolResult[]): Promise<void> {
    this.setState('response-generating');
    
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    let summary = `I executed your plan with ${plan.steps.length} steps. `;
    
    if (successfulResults.length === results.length) {
      summary += "All steps completed successfully. ";
    } else if (successfulResults.length > 0) {
      summary += `${successfulResults.length} steps succeeded, ${failedResults.length} failed. `;
    } else {
      summary += "Unfortunately, all steps failed. ";
    }

    // Add specific results
    if (successfulResults.length > 0) {
      const resultData = successfulResults.map(r => r.data).filter(Boolean);
      if (resultData.length > 0) {
        summary += `Here's what I found: ${JSON.stringify(resultData)}`;
      }
    }

    await this.generateResponse(summary);
  }

  private async generateRAGResponse(query: string, ragResult: RAGResult): Promise<void> {
    let response = ragResult.summary;
    
    if (ragResult.evidence.length > 0) {
      response += "\n\nSources: ";
      response += ragResult.evidence
        .slice(0, 3) // Top 3 sources
        .map(e => e.source)
        .join(", ");
    }

    await this.generateResponse(response);
  }

  private async generateResponse(text: string): Promise<void> {
    try {
      this.contextStore.addEntry('assistant', text);
      
      if (this.mode === 'voice' && this.config.tts.enabled) {
        const ttsRequest: TTSRequest = {
          text,
          voice: this.config.tts.voice,
          speed: this.config.tts.speed
        };
        
        const audioBuffer = await this.ttsService.synthesize(ttsRequest);
        this.callbacks.onResponse(text, audioBuffer);
      } else {
        this.callbacks.onResponse(text);
        this.returnToIdle();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // State Management
  private setState(newState: PipelineState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange(newState);
      this.emitEvent('state-change', { from: this.state, to: newState });
    }
  }

  private emitEvent(type: string, data?: any): void {
    const event: PipelineEvent = {
      type,
      data,
      timestamp: new Date()
    };
    this.callbacks.onEvent(event);
  }

  private handleError(error: Error): void {
    this.setState('error');
    this.callbacks.onError(error);
    
    // Try to recover
    setTimeout(() => {
      if (this.state === 'error') {
        this.returnToIdle();
      }
    }, 2000);
  }

  private returnToIdle(): void {
    this.isInterrupted = false;
    this.currentPlan = null;
    
    if (this.mode === 'voice' && this.config.wakeWord.enabled) {
      this.startWakeWordListening();
    } else {
      this.setState('idle');
    }
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (error) {
      throw new Error('Failed to access microphone: ' + (error as Error).message);
    }
  }

  // Getters
  getState(): PipelineState {
    return this.state;
  }

  getMode(): PipelineMode {
    return this.mode;
  }

  getConfig(): PipelineConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}