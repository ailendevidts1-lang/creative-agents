import React from "react";
import { Lock } from "lucide-react";
import { VoiceState } from "../MainLayout";

interface SiriCircleProps {
  voiceState: VoiceState;
  micMuted: boolean;
  onTap: () => void;
}

export function SiriCircle({ voiceState, micMuted, onTap }: SiriCircleProps) {
  const getCircleClasses = () => {
    const baseClasses = "w-64 h-64 rounded-full siri-circle cursor-pointer relative";
    
    if (micMuted) return `${baseClasses} opacity-50`;
    
    switch (voiceState) {
      case "listening":
        return `${baseClasses} voice-listening`;
      case "thinking":
        return `${baseClasses} voice-thinking`;
      case "speaking":
        return `${baseClasses} voice-speaking`;
      case "error":
        return `${baseClasses} border-destructive/50 shadow-destructive/30`;
      default:
        return baseClasses;
    }
  };

  const renderInnerContent = () => {
    if (micMuted) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-panel p-4 rounded-2xl">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      );
    }

    if (voiceState === "listening") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated waveform rings */}
          <div className="w-16 h-16 border-2 border-primary/40 rounded-full voice-ripple" />
          <div className="absolute w-12 h-12 border-2 border-primary/60 rounded-full voice-ripple" style={{ animationDelay: "0.3s" }} />
          <div className="absolute w-8 h-8 border-2 border-primary/80 rounded-full voice-ripple" style={{ animationDelay: "0.6s" }} />
        </div>
      );
    }

    if (voiceState === "thinking") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (voiceState === "speaking") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Concentric expanding rings */}
          <div className="w-20 h-20 border-2 border-primary/50 rounded-full animate-ping" />
          <div className="absolute w-16 h-16 border-2 border-primary/70 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
          <div className="absolute w-12 h-12 border-2 border-primary rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={getCircleClasses()}
      onClick={onTap}
    >
      {renderInnerContent()}
      
      {/* Tap hint for speaking state */}
      {voiceState === "speaking" && !micMuted && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="glass-panel px-4 py-2 rounded-full text-sm text-muted-foreground">
            Tap to interrupt
          </div>
        </div>
      )}
    </div>
  );
}