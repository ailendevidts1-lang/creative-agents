import React from "react";
import { Button } from "@/components/ui/button";
import { Home, FolderOpen, Settings, Cpu, Monitor } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: "home" | "projects" | "settings" | "studio") => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="w-64 glass border-r border-border/60 p-6 space-y-6">
      {/* Logo */}
      <div className="flex items-center gap-3 pb-6 border-b border-border/30">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow">
          <Cpu className="w-6 h-6 text-primary animate-neural-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg gradient-text">AI Hyper-Engine</h1>
          <p className="text-xs text-muted-foreground">Digital Reality Builder</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          className={`nav-item w-full justify-start ${
            currentPage === "home" ? "active" : ""
          }`}
          onClick={() => onPageChange("home")}
        >
          <Home className="w-5 h-5" />
          Main Page
        </Button>

        <Button
          variant="ghost"
          className={`nav-item w-full justify-start ${
            currentPage === "projects" ? "active" : ""
          }`}
          onClick={() => onPageChange("projects")}
        >
          <FolderOpen className="w-5 h-5" />
          Projecten
        </Button>

        <Button
          variant="ghost"
          className={`nav-item w-full justify-start ${
            currentPage === "studio" ? "active" : ""
          }`}
          onClick={() => onPageChange("studio")}
        >
          <Settings className="w-5 h-5" />
          Studio
        </Button>

        <Button
          variant="ghost"
          className={`nav-item w-full justify-start ${
            currentPage === "settings" ? "active" : ""
          }`}
          onClick={() => onPageChange("settings")}
        >
          <Monitor className="w-5 h-5" />
          Instellingen
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="mt-auto pt-6 border-t border-border/30">
        <div className="ai-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">System Active</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI agents ready for deployment
          </p>
        </div>
      </div>
    </nav>
  );
}