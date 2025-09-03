import React, { useState } from "react";
import { Mic, MicOff, RadioIcon, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceState } from "../MainLayout";

interface VoiceDockProps {
  micMuted: boolean;
  wakeEnabled: boolean;
  voiceState: VoiceState;
  onMicMute: () => void;
  onWakeToggle: () => void;
  onPushToTalk: (isPressed: boolean) => void;
}

export function VoiceDock({ 
  micMuted, 
  wakeEnabled, 
  voiceState,
  onMicMute, 
  onWakeToggle, 
  onPushToTalk 
}: VoiceDockProps) {
  const [isPTTPressed, setIsPTTPressed] = useState(false);

  const handlePTTMouseDown = () => {
    if (micMuted) return;
    setIsPTTPressed(true);
    onPushToTalk(true);
  };

  const handlePTTMouseUp = () => {
    if (micMuted) return;
    setIsPTTPressed(false);
    onPushToTalk(false);
  };

  const handlePTTClick = () => {
    if (micMuted) return;
    // Quick tap for hands-free toggle
    if (voiceState === "idle") {
      onPushToTalk(true);
      setTimeout(() => onPushToTalk(false), 3000); // Auto-stop after 3s
    }
  };

  return (
    <div className="glass-panel p-4 rounded-3xl">
      <div className="flex items-center space-x-4">
        {/* Push-to-Talk */}
        <div className="relative">
          <Button
            variant="ghost"
            size="lg"
            className={`w-16 h-16 rounded-2xl luxury-transition ${
              isPTTPressed 
                ? "neon-glow bg-primary/20 border-primary/40" 
                : "metal-highlight hover:neon-glow"
            } ${micMuted ? "opacity-50 cursor-not-allowed" : ""}`}
            onMouseDown={handlePTTMouseDown}
            onMouseUp={handlePTTMouseUp}
            onMouseLeave={handlePTTMouseUp}
            onClick={handlePTTClick}
            disabled={micMuted}
          >
            <Mic className={`w-6 h-6 ${isPTTPressed ? "text-primary" : "text-foreground"}`} />
          </Button>
          
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
            Push to Talk
          </div>
        </div>

        {/* Wake Word Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="lg"
            className={`w-16 h-16 rounded-2xl luxury-transition ${
              wakeEnabled && !micMuted
                ? "neon-glow bg-primary/20 border-primary/40 text-primary" 
                : "metal-highlight hover:neon-glow text-muted-foreground"
            } ${micMuted ? "opacity-50" : ""}`}
            onClick={onWakeToggle}
            disabled={micMuted}
          >
            {wakeEnabled ? <Radio className="w-6 h-6" /> : <RadioIcon className="w-6 h-6" />}
          </Button>
          
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
            Wake Word
          </div>
        </div>

        {/* Mic Mute */}
        <div className="relative">
          <Button
            variant="ghost"
            size="lg"
            className={`w-16 h-16 rounded-2xl luxury-transition ${
              micMuted 
                ? "bg-destructive/20 border-destructive/40 text-destructive hover:bg-destructive/30" 
                : "metal-highlight hover:neon-glow text-foreground"
            }`}
            onClick={onMicMute}
          >
            {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
            {micMuted ? "Unmute" : "Mute"}
          </div>
        </div>
      </div>
    </div>
  );
}