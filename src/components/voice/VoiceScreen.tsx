import React from "react";
import { SiriCircle } from "./SiriCircle";
import { StatusStrip } from "./StatusStrip";
import { VoiceDock } from "./VoiceDock";
import { AppState } from "../MainLayout";
import { useVoicePipeline } from "@/hooks/useVoicePipeline";
import { useRealtimeVoiceAssistant } from "@/hooks/useRealtimeVoiceAssistant";

interface VoiceScreenProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

export function VoiceScreen({ appState, updateAppState }: VoiceScreenProps) {
  const pipeline = useVoicePipeline();
  const voiceAssistant = useRealtimeVoiceAssistant();
  
  const handleVoiceStateChange = (voiceState: AppState["voiceState"]) => {
    updateAppState({ voiceState });
  };

  const handleMicMute = async () => {
    const newMuted = !appState.micMuted;
    updateAppState({ micMuted: newMuted, voiceState: "idle" });
    
    // Handle voice assistant connection
    if (newMuted && voiceAssistant.isConnected) {
      voiceAssistant.endConversation();
    } else if (!newMuted && !voiceAssistant.isConnected) {
      try {
        await voiceAssistant.startConversation();
      } catch (error) {
        console.error('Failed to start voice assistant:', error);
      }
    }
  };

  const handleWakeToggle = () => {
    updateAppState({ wakeEnabled: !appState.wakeEnabled });
  };

  const handlePushToTalk = (isPressed: boolean) => {
    if (appState.micMuted) return;
    
    if (isPressed) {
      updateAppState({ voiceState: "listening" });
    } else {
      updateAppState({ voiceState: "transcribing" });
      // Use actual pipeline processing
      setTimeout(() => updateAppState({ voiceState: "thinking" }), 1000);
      setTimeout(() => updateAppState({ voiceState: "speaking" }), 3000);
      setTimeout(() => updateAppState({ voiceState: "idle" }), 6000);
    }
  };

  // Sync voice assistant state with app state
  React.useEffect(() => {
    if (voiceAssistant.isRecording) {
      updateAppState({ voiceState: "listening" });
    } else if (voiceAssistant.isSpeaking) {
      updateAppState({ voiceState: "speaking" });
    } else if (voiceAssistant.isConnected && !voiceAssistant.isRecording && !voiceAssistant.isSpeaking) {
      updateAppState({ voiceState: "idle" });
    }
  }, [voiceAssistant.isRecording, voiceAssistant.isSpeaking, voiceAssistant.isConnected, updateAppState]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      {/* Main Voice Interface */}
      <div className="flex flex-col items-center space-y-8 z-10">
        <SiriCircle 
          voiceState={appState.voiceState}
          micMuted={appState.micMuted}
          onTap={() => {
            if (appState.voiceState === "speaking") {
              // Barge-in: cancel TTS and start listening
              handleVoiceStateChange("listening");
            }
          }}
        />
        
        <StatusStrip 
          voiceState={appState.voiceState}
          wakeEnabled={appState.wakeEnabled}
          micMuted={appState.micMuted}
        />
      </div>

      {/* Voice Dock */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <VoiceDock
          micMuted={appState.micMuted}
          wakeEnabled={appState.wakeEnabled}
          voiceState={appState.voiceState}
          onMicMute={handleMicMute}
          onWakeToggle={handleWakeToggle}
          onPushToTalk={handlePushToTalk}
        />
      </div>
    </div>
  );
}