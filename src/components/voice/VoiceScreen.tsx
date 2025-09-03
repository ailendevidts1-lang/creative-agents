import React from "react";
import { SiriCircle } from "./SiriCircle";
import { StatusStrip } from "./StatusStrip";
import { VoiceDock } from "./VoiceDock";
import { AppState } from "../MainLayout";
import { useVoicePipeline } from "@/hooks/useVoicePipeline";

interface VoiceScreenProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

export function VoiceScreen({ appState, updateAppState }: VoiceScreenProps) {
  const pipeline = useVoicePipeline();
  
  const handleVoiceStateChange = (voiceState: AppState["voiceState"]) => {
    updateAppState({ voiceState });
  };

  const handleMicMute = () => {
    updateAppState({ micMuted: !appState.micMuted, voiceState: "idle" });
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
      // Simulate processing
      setTimeout(() => updateAppState({ voiceState: "thinking" }), 1000);
      setTimeout(() => updateAppState({ voiceState: "speaking" }), 3000);
      setTimeout(() => updateAppState({ voiceState: "idle" }), 6000);
    }
  };

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