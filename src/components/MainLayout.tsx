import React, { useState } from "react";
import { VoiceScreen } from "./voice/VoiceScreen";
import { ManualScreen } from "./chat/ManualScreen";
import { TopBar } from "./layout/TopBar";
import { BottomNavigation } from "./layout/BottomNavigation";
import { SkillsScreen } from "./skills/SkillsScreen";
import { ApprovalsScreen } from "./social/ApprovalsScreen";
import { AnalyticsScreen } from "./analytics/AnalyticsScreen";
import { ProfileScreen } from "./profile/ProfileScreen";

export type AppMode = "voice" | "manual";
export type AppScreen = "home" | "skills" | "approvals" | "analytics" | "profile";
export type VoiceState = "idle" | "listening" | "capturing" | "transcribing" | "thinking" | "speaking" | "error";

export interface AppState {
  mode: AppMode;
  screen: AppScreen;
  voiceState: VoiceState;
  micMuted: boolean;
  wakeEnabled: boolean;
  pendingApprovalCount: number;
  networkState: "online" | "degraded" | "offline";
}

export function MainLayout() {
  const [appState, setAppState] = useState<AppState>({
    mode: "voice",
    screen: "home",
    voiceState: "idle",
    micMuted: false,
    wakeEnabled: true,
    pendingApprovalCount: 3,
    networkState: "online"
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const switchMode = (mode: AppMode) => {
    updateAppState({ 
      mode,
      voiceState: mode === "manual" ? "idle" : appState.voiceState
    });
  };

  const switchScreen = (screen: AppScreen) => {
    updateAppState({ screen });
  };

  const renderMainContent = () => {
    if (appState.screen !== "home") {
      switch (appState.screen) {
        case "skills":
          return <SkillsScreen onBack={() => switchScreen("home")} />;
        case "approvals":
          return <ApprovalsScreen onBack={() => switchScreen("home")} />;
        case "analytics":
          return <AnalyticsScreen onBack={() => switchScreen("home")} />;
        case "profile":
          return <ProfileScreen onBack={() => switchScreen("home")} />;
        default:
          return null;
      }
    }

    return appState.mode === "voice" ? (
      <VoiceScreen 
        appState={appState}
        updateAppState={updateAppState}
      />
    ) : (
      <ManualScreen 
        appState={appState}
        updateAppState={updateAppState}
        onSwitchToVoice={() => switchMode("voice")}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar 
        mode={appState.mode}
        onModeSwitch={switchMode}
        networkState={appState.networkState}
      />
      
      <main className="flex-1 overflow-hidden">
        {renderMainContent()}
      </main>

      {appState.mode === "voice" && (
        <BottomNavigation 
          currentScreen={appState.screen}
          onScreenChange={switchScreen}
          pendingApprovalCount={appState.pendingApprovalCount}
        />
      )}
    </div>
  );
}