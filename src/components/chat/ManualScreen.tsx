import React, { useState, useCallback, useEffect } from "react";
import { ChatThread } from "./ChatThread";
import { PromptBar } from "./PromptBar";
import { PlanPreview } from "./PlanPreview";
import { ToolResultCard } from "./ToolResultCard";
import { AppState } from "../MainLayout";
import { useVoicePipeline } from "@/hooks/useVoicePipeline";
import { PipelineState, Plan, ToolResult } from "@/services/pipeline/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Search, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { skillsIntegrator } from "@/services/SkillsIntegrator";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "plan" | "tool-result" | "error";
  metadata?: {
    planId?: string;
    toolResults?: any[];
    sources?: any[];
    confidence?: number;
  };
}

interface ManualScreenProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onSwitchToVoice: () => void;
}

export function ManualScreen({ appState, updateAppState, onSwitchToVoice }: ManualScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with tasks, answer questions, create timers, take notes, get weather, and much more. What would you like to do today?",
      timestamp: new Date(),
      type: "text"
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [pendingPlanExecution, setPendingPlanExecution] = useState<Plan | null>(null);
  const [lastToolResults, setLastToolResults] = useState<ToolResult[]>([]);

  // Initialize pipeline in manual mode
  const pipeline = useVoicePipeline({
    wakeWord: { enabled: false, threshold: 0.01, phrase: "hey jarvis" },
    tts: { voice: "alloy", speed: 1.0, enabled: false } // Disable TTS for manual mode
  });

  // Set pipeline to manual mode
  useEffect(() => {
    if (pipeline.isInitialized) {
      pipeline.setPipelineMode("manual");
    }
  }, [pipeline.isInitialized, pipeline.setPipelineMode]);

  // Handle pipeline state changes
  useEffect(() => {
    setIsProcessing(pipeline.isProcessing);
    
    // Update app state based on pipeline state
    const voiceStateMap: Record<PipelineState, AppState["voiceState"]> = {
      'idle': 'idle',
      'wake-listening': 'idle',
      'wake-triggered': 'idle', 
      'voice-detecting': 'idle',
      'speech-capturing': 'idle',
      'speech-processing': 'transcribing',
      'nlu-processing': 'thinking',
      'planning': 'thinking',
      'tool-executing': 'thinking',
      'evidence-gathering': 'thinking',
      'response-generating': 'thinking',
      'tts-speaking': 'speaking',
      'error': 'error'
    };
    
    updateAppState({ voiceState: voiceStateMap[pipeline.state] });
  }, [pipeline.state, pipeline.isProcessing, updateAppState]);

  // Handle pipeline responses (including tool results) - only if pipeline is working
  useEffect(() => {
    if (pipeline.lastResponse && pipeline.lastResponse.trim()) {
      const responseMessage: Message = {
        id: `pipeline-response-${Date.now()}`,
        role: "assistant",
        content: pipeline.lastResponse,
        timestamp: new Date(),
        type: "text"
      };
      
      // Only add if we don't already have this response
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.content === pipeline.lastResponse) {
          return prev;
        }
        return [...prev, responseMessage];
      });
      
      setIsProcessing(false);
    }
  }, [pipeline.lastResponse]);
  // Handle pipeline events for enhanced chat experience
  useEffect(() => {
    const events = pipeline.events;
    const latestEvent = events[events.length - 1];
    
    if (latestEvent) {
      switch (latestEvent.type) {
        case 'plan-created':
          if (latestEvent.data) {
            setCurrentPlan(latestEvent.data);
            // Auto-approve plans for now, but could show preview
            // setShowPlanPreview(true);
            // setPendingPlanExecution(latestEvent.data);
          }
          break;
          
        case 'tools-completed':
          if (latestEvent.data?.results) {
            setLastToolResults(latestEvent.data.results);
            
            // Create a separate tool results message after the text response
            setTimeout(() => {
              const toolResultMessage: Message = {
                id: `tool-results-${latestEvent.timestamp}`,
                role: "assistant",
                content: "Here are the detailed results:",
                timestamp: new Date(),
                type: "tool-result",
                metadata: {
                  toolResults: latestEvent.data.results,
                  planId: currentPlan?.id
                }
              };
              setMessages(prev => {
                // Check if we haven't already added this tool result
                if (!prev.some(msg => msg.id === toolResultMessage.id)) {
                  return [...prev, toolResultMessage];
                }
                return prev;
              });
            }, 500);
          }
          break;
          
        case 'evidence-gathered':
          if (latestEvent.data?.evidence) {
            // Could show evidence sources in chat
            console.log('Evidence gathered:', latestEvent.data.evidence);
          }
          break;
      }
    }
  }, [pipeline.events, currentPlan]);

  const handlePlanApprove = useCallback(() => {
    if (pendingPlanExecution) {
      // Execute the plan
      setShowPlanPreview(false);
      setPendingPlanExecution(null);
      // Plan execution will be handled by the pipeline
    }
  }, [pendingPlanExecution]);

  const handlePlanReject = useCallback(() => {
    setShowPlanPreview(false);
    setPendingPlanExecution(null);
    
    // Add rejection message
    const rejectionMessage: Message = {
      id: `plan-rejected-${Date.now()}`,
      role: "assistant", 
      content: "Plan execution cancelled. How else can I help you?",
      timestamp: new Date(),
      type: "text"
    };
    setMessages(prev => [...prev, rejectionMessage]);
  }, []);

  // Handle errors with better fallback
  useEffect(() => {
    if (pipeline.error) {
      console.error('Pipeline error:', pipeline.error);
      
      // Only show error if we don't have a recent successful response
      const now = Date.now();
      const recentMessages = messages.filter(m => 
        (now - m.timestamp.getTime()) < 5000 && m.role === 'assistant'
      );
      
      if (recentMessages.length === 0) {
        const errorMessage: Message = {
          id: `pipeline-error-${Date.now()}`,
          role: "system",
          content: `I'm having some technical difficulties. Let me try a simpler approach to help you.`,
          timestamp: new Date(),
          type: "error"
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
      pipeline.clearError();
      setIsProcessing(false);
    }
  }, [pipeline.error, pipeline.clearError, messages]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user", 
      content: content.trim(),
      timestamp: new Date(),
      type: "text"
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsProcessing(true);
      let responseGenerated = false;

      // First try the full pipeline for complex requests (only if initialized and in manual mode)
      if (pipeline.isInitialized && pipeline.mode === 'manual') {
        try {
          console.log('Processing through pipeline:', content.trim());
          await pipeline.processText(content.trim());
          
          // Wait a bit to see if pipeline generates a response
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (pipeline.lastResponse && pipeline.lastResponse.trim()) {
            responseGenerated = true;
            console.log('Pipeline generated response:', pipeline.lastResponse);
          }
        } catch (pipelineError) {
          console.error('Pipeline processing failed:', pipelineError);
        }
      }

      // If no response from pipeline, try direct skill execution
      if (!responseGenerated) {
        console.log('Attempting direct skill execution');
        const skillResponse = await tryDirectSkillExecution(content.trim());
        
        if (skillResponse) {
          const aiMessage: Message = {
            id: `skill-${Date.now()}`,
            role: "assistant",
            content: skillResponse.message,
            timestamp: new Date(),
            type: "text",
            metadata: {
              toolResults: [skillResponse]
            }
          };
          setMessages(prev => [...prev, aiMessage]);
          responseGenerated = true;
        }
      }

      // If no response from skills, use simple chat fallback
      if (!responseGenerated) {
        console.log('Using fallback simple chat');
        const { data, error } = await supabase.functions.invoke('simple-chat', {
          body: {
            message: content.trim(),
            context: messages.slice(-5).map(m => ({
              type: m.role,
              content: m.content
            }))
          }
        });

        if (error) {
          console.error('Simple chat error:', error);
          throw new Error(`Chat service error: ${error.message}`);
        }

        if (data?.response) {
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            type: "text"
          };
          setMessages(prev => [...prev, aiMessage]);
          responseGenerated = true;
        }
      }

      // Final fallback - always provide some response
      if (!responseGenerated) {
        const fallbackMessage: Message = {
          id: `fallback-${Date.now()}`,
          role: "assistant",
          content: "I understand you said: \"" + content.trim() + "\". I'm processing your request, but I'm having some technical difficulties right now. How else can I help you?",
          timestamp: new Date(),
          type: "text"
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }

    } catch (error) {
      console.error("Failed to get AI response:", error);
      
      // Always provide an error response
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `I apologize, but I'm experiencing some technical issues. I heard you say: "${content.trim()}". Let me try to help you in a different way. What specific task would you like me to assist with?`,
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, pipeline, messages]);

  // Helper function to try direct skill execution for simple requests
  const tryDirectSkillExecution = async (query: string): Promise<any | null> => {
    const lowerQuery = query.toLowerCase();
    
    try {
      // Timer patterns
      if (lowerQuery.includes('timer') && (lowerQuery.includes('set') || lowerQuery.includes('create'))) {
        const duration = extractDurationFromText(query);
        const name = extractTimerNameFromText(query);
        
        const result = await skillsIntegrator.executeSkill('create_timer', {
          name: name,
          duration: duration
        });
        
        if (result.success) {
          return { ...result, type: 'timer' };
        }
      }
      
      // Note patterns
      if ((lowerQuery.includes('note') || lowerQuery.includes('reminder')) && 
          (lowerQuery.includes('create') || lowerQuery.includes('make') || lowerQuery.includes('add'))) {
        const title = extractNoteTitleFromText(query);
        
        const result = await skillsIntegrator.executeSkill('create_note', {
          title: title,
          content: query
        });
        
        if (result.success) {
          return { ...result, type: 'note' };
        }
      }
      
      // Weather patterns
      if (lowerQuery.includes('weather') || lowerQuery.includes('temperature')) {
        const location = extractLocationFromText(query) || 'current';
        
        const result = await skillsIntegrator.executeSkill('get_weather', {
          location: location
        });
        
        if (result.success) {
          return { ...result, type: 'weather' };
        }
      }
      
      // Search patterns  
      if (lowerQuery.includes('search') || lowerQuery.includes('find') || lowerQuery.includes('look up')) {
        const searchQuery = extractSearchQueryFromText(query);
        
        const result = await skillsIntegrator.executeSkill('web_search', {
          query: searchQuery
        });
        
        if (result.success) {
          return { ...result, type: 'search' };
        }
      }
      
      // List patterns
      if (lowerQuery.includes('list') && lowerQuery.includes('timer')) {
        const result = await skillsIntegrator.executeSkill('list_timers', {});
        if (result.success) {
          return { ...result, type: 'timer_list' };
        }
      }
      
      if (lowerQuery.includes('list') && lowerQuery.includes('note')) {
        const result = await skillsIntegrator.executeSkill('list_notes', { limit: 10 });
        if (result.success) {
          return { ...result, type: 'note_list' };
        }
      }
      
    } catch (error) {
      console.error('Direct skill execution failed:', error);
    }
    
    return null;
  };

  // Helper functions for text extraction
  const extractDurationFromText = (text: string): number => {
    const durationRegex = /(\d+)\s*(minute|minutes|min|second|seconds|sec|hour|hours|hr)/i;
    const match = text.match(durationRegex);
    
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('second') || unit.includes('sec')) {
        return value;
      } else if (unit.includes('minute') || unit.includes('min')) {
        return value * 60;
      } else if (unit.includes('hour') || unit.includes('hr')) {
        return value * 60 * 60;
      }
    }
    
    return 5 * 60; // Default 5 minutes
  };

  const extractTimerNameFromText = (text: string): string => {
    const nameRegex = /timer\s+(?:for\s+)?(.+?)(?:\s+(?:for|in)\s+\d+|\s*$)/i;
    const match = text.match(nameRegex);
    
    if (match && match[1] && !match[1].match(/\d+\s*(?:minute|min|second|sec|hour|hr)/i)) {
      return match[1].trim();
    }
    
    return 'Timer';
  };

  const extractNoteTitleFromText = (text: string): string => {
    const titleRegex = /(?:note|reminder)\s+(?:about\s+)?(.+?)(?:\s*:|$)/i;
    const match = text.match(titleRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return `Note - ${new Date().toLocaleDateString()}`;
  };

  const extractLocationFromText = (text: string): string | null => {
    const locationRegex = /(?:weather|temperature)\s+(?:in|for|at)\s+(.+?)(?:\s|$)/i;
    const match = text.match(locationRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return null;
  };

  const extractSearchQueryFromText = (text: string): string => {
    const searchRegex = /(?:search|find|look\s+up)\s+(?:for\s+)?(.+)/i;
    const match = text.match(searchRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return text;
  };

  // Format pipeline events for display
  const getPipelineStatusDisplay = () => {
    switch (pipeline.state) {
      case 'nlu-processing':
        return { icon: Brain, text: "Understanding your request...", color: "blue" };
      case 'planning':
        return { icon: Settings, text: "Creating execution plan...", color: "amber" };
      case 'tool-executing':
        return { icon: Loader2, text: "Executing tools...", color: "green" };
      case 'evidence-gathering':
        return { icon: Search, text: "Gathering information...", color: "purple" };
      case 'response-generating':
        return { icon: Brain, text: "Generating response...", color: "indigo" };
      case 'error':
        return { icon: AlertCircle, text: "Error occurred", color: "red" };
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Pipeline Status Bar */}
      {isProcessing && (
        <div className="border-b bg-muted/30 p-3">
          {(() => {
            const status = getPipelineStatusDisplay();
            if (!status) return null;
            
            const Icon = status.icon;
            return (
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 animate-pulse text-${status.color}-500`} />
                <span className="text-sm text-muted-foreground">{status.text}</span>
                <Badge variant="secondary" className="ml-auto">
                  Processing
                </Badge>
              </div>
            );
          })()}
        </div>
      )}

      {/* Error Display */}
      {pipeline.hasError && (
        <div className="border-b bg-destructive/10 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Pipeline Error</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={pipeline.clearError}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 relative">
        <ChatThread messages={messages} />
        
        {/* Tool Results Overlay */}
        {lastToolResults.length > 0 && messages.some(m => m.type === "tool-result") && (
          <div className="absolute bottom-4 right-4 max-w-lg">
            <ToolResultCard 
              results={lastToolResults}
              planSummary={currentPlan?.summary}
            />
          </div>
        )}
        
        {/* Plan Preview Modal */}
        {showPlanPreview && pendingPlanExecution && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <PlanPreview
                plan={pendingPlanExecution}
                onApprove={handlePlanApprove}
                onReject={handlePlanReject}
                isExecuting={pipeline.state === 'tool-executing'}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Input Bar */}
      <PromptBar 
        onSendMessage={handleSendMessage}
        onSwitchToVoice={onSwitchToVoice}
        disabled={isProcessing}
      />
    </div>
  );
}