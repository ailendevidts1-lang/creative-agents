import React from "react";
import { Home, Zap, FileCheck, BarChart3, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppScreen } from "../MainLayout";

interface BottomNavigationProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  pendingApprovalCount: number;
}

export function BottomNavigation({ 
  currentScreen, 
  onScreenChange, 
  pendingApprovalCount 
}: BottomNavigationProps) {
  const navItems = [
    { id: "home" as AppScreen, icon: Home, label: "Home" },
    { id: "skills" as AppScreen, icon: Zap, label: "Skills" },
    { 
      id: "approvals" as AppScreen, 
      icon: FileCheck, 
      label: "Approvals",
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined
    },
    { id: "analytics" as AppScreen, icon: BarChart3, label: "Analytics" },
    { id: "profile" as AppScreen, icon: User, label: "Profile" },
  ];

  return (
    <div className="glass-panel border-t border-border/30 px-4 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`bottom-nav-item relative ${isActive ? "active" : ""}`}
            >
              <div className="relative">
                <Icon className="w-6 h-6 mb-1" />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-accent text-accent-foreground">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}