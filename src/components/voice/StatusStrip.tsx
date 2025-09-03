import React from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { VoiceState } from "../MainLayout";

interface StatusStripProps {
  voiceState: VoiceState;
  wakeEnabled: boolean;
  micMuted: boolean;
}

export function StatusStrip({ voiceState, wakeEnabled, micMuted }: StatusStripProps) {
  const getStatusText = () => {
    if (micMuted) return "Microphone muted";
    
    switch (voiceState) {
      case "idle":
        return wakeEnabled ? "Listening for 'Hey Assistant'..." : "Ready";
      case "listening":
        return "Listening...";
      case "capturing":
        return "Processing audio...";
      case "transcribing":
        return "Understanding...";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Something went wrong";
      default:
        return "Ready";
    }
  };

  const getStatusIcon = () => {
    if (micMuted) return <MicOff className="w-4 h-4 text-destructive" />;
    if (voiceState === "speaking") return <Volume2 className="w-4 h-4 text-primary" />;
    return <Mic className="w-4 h-4 text-primary" />;
  };

  const showWaveform = voiceState === "listening" || voiceState === "speaking";

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Status Text */}
      <div className="glass-panel px-6 py-3 rounded-2xl">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Waveform Visualizer */}
      {showWaveform && (
        <div className="flex items-center space-x-1">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="w-1 bg-primary/60 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 8}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}