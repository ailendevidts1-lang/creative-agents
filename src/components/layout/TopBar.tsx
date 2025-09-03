import React from "react";
import { Settings, Shield, History, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppMode } from "../MainLayout";

interface TopBarProps {
  mode: AppMode;
  onModeSwitch: (mode: AppMode) => void;
  networkState: "online" | "degraded" | "offline";
}

export function TopBar({ mode, onModeSwitch, networkState }: TopBarProps) {
  const getNetworkColor = () => {
    switch (networkState) {
      case "online": return "bg-primary";
      case "degraded": return "bg-yellow-500";
      case "offline": return "bg-destructive";
    }
  };

  return (
    <div className="glass-panel sticky top-0 z-50 px-6 py-4 border-b border-border/30">
      <div className="flex items-center justify-between">
        {/* Left: App Icon */}
        <Button
          variant="ghost"
          size="sm"
          className="metal-highlight rounded-xl p-2 hover:neon-glow luxury-transition"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent" />
        </Button>

        {/* Center: Mode Switch */}
        <div className="flex items-center glass-panel rounded-2xl p-1">
          <Button
            variant={mode === "voice" ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeSwitch("voice")}
            className={`px-6 py-2 rounded-xl luxury-transition ${
              mode === "voice" 
                ? "neon-glow bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Voice
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeSwitch("manual")}
            className={`px-6 py-2 rounded-xl luxury-transition ${
              mode === "manual" 
                ? "neon-glow bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manual
          </Button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getNetworkColor()}`} />
            <span className="text-xs text-muted-foreground capitalize">
              {networkState}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="metal-highlight rounded-xl hover:neon-glow luxury-transition"
          >
            <History className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="metal-highlight rounded-xl hover:neon-glow luxury-transition"
          >
            <Shield className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="metal-highlight rounded-xl hover:neon-glow luxury-transition relative"
          >
            <FileCheck className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-accent text-accent-foreground">
              3
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  );
}