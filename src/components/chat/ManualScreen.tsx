import React, { useState } from "react";
import { ChatThread } from "./ChatThread";
import { PromptBar } from "./PromptBar";
import { AppState } from "../MainLayout";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ManualScreenProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onSwitchToVoice: () => void;
}

export function ManualScreen({ appState, updateAppState, onSwitchToVoice }: ManualScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with tasks, answer questions, and manage your social media presence. What would you like to do today?",
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you want me to help with that. Let me process your request and provide the best assistance possible.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatThread messages={messages} />
      
      <PromptBar 
        onSendMessage={handleSendMessage}
        onSwitchToVoice={onSwitchToVoice}
      />
    </div>
  );
}