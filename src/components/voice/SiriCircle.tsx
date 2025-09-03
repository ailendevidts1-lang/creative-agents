import React from "react";
import { Lock } from "lucide-react";
import { VoiceState } from "../MainLayout";

interface SiriCircleProps {
  voiceState: VoiceState;
  micMuted: boolean;
  onTap: () => void;
}

export function SiriCircle({ voiceState, micMuted, onTap }: SiriCircleProps) {
  const getSphereClasses = () => {
    const baseClasses = "w-64 h-64 jarvis-sphere cursor-pointer relative";
    
    if (micMuted) return `${baseClasses} opacity-50`;
    
    switch (voiceState) {
      case "listening":
        return `${baseClasses} jarvis-listening`;
      case "thinking":
        return `${baseClasses} jarvis-thinking`;
      case "speaking":
        return `${baseClasses} jarvis-speaking`;
      case "error":
        return `${baseClasses} opacity-60`;
      default:
        return baseClasses;
    }
  };

  const generateJarvisParticles = () => {
    if (micMuted) return null;
    
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * (Math.PI / 180);
      const radius = 140 + Math.sin(Date.now() / 1000 + i) * 20;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      particles.push(
        <div
          key={i}
          className="jarvis-particle"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      );
    }
    return particles;
  };

  const renderJarvisCore = () => {
    if (micMuted) {
      return (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl">
            <Lock className="w-12 h-12 text-muted-foreground/60" />
          </div>
        </div>
      );
    }

    const getCoreContent = () => {
      switch (voiceState) {
        case "listening":
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Jarvis listening interface */}
              <div className="w-20 h-20 border border-primary/60 rounded-full relative">
                <div className="absolute inset-2 border border-primary/40 rounded-full">
                  <div className="absolute inset-2 border border-primary/20 rounded-full" />
                </div>
              </div>
            </div>
          );
        case "thinking":
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Jarvis thinking nexus */}
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-2 border-primary/40 rounded-full animate-spin" />
                <div className="absolute inset-2 border-2 border-accent/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                <div className="absolute inset-4 bg-primary/60 rounded-full animate-pulse" />
              </div>
            </div>
          );
        case "speaking":
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Jarvis speaking visualizer */}
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{ 
                      height: '20px',
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            </div>
          );
        default:
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary/60 rounded-full animate-pulse" />
            </div>
          );
      }
    };

    return getCoreContent();
  };

  return (
    <div className="relative">
      {/* Floating Jarvis particles */}
      {generateJarvisParticles()}
      
      {/* Main Jarvis sphere */}
      <div
        className={getSphereClasses()}
        onClick={onTap}
      >
        {/* Jarvis grid overlay */}
        <div className="jarvis-grid" />
        
        {/* Core interface */}
        {renderJarvisCore()}
        
        {/* Additional visual effects for different states */}
        {voiceState === "listening" && !micMuted && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        )}
        
        {voiceState === "error" && (
          <div className="absolute inset-0 rounded-full border-2 border-destructive/60 animate-pulse" />
        )}
      </div>
      
      {/* Tap hint for speaking state */}
      {voiceState === "speaking" && !micMuted && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="glass-panel px-6 py-3 rounded-2xl text-sm text-muted-foreground backdrop-blur-xl">
            Tap to interrupt
          </div>
        </div>
      )}
    </div>
  );
}