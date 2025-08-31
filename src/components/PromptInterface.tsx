import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";

interface PromptInterfaceProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export function PromptInterface({ onSubmit, isGenerating }: PromptInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = () => {
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // TODO: Implement speech recognition
  };

  const examplePrompts = [
    "Build me an AI voice assistant that can manage my email, calendar, and control smart home devices",
    "Create a trading bot that monitors crypto arbitrage opportunities across multiple exchanges", 
    "Make a custom Linux OS optimized for Raspberry Pi retail kiosks",
    "Design a decentralized marketplace with built-in AI recommendation engine"
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Describe your digital vision in natural language..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chatgpt-input pr-24"
          rows={6}
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleVoiceInput}
            className={`${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Try these examples:</p>
        <div className="grid grid-cols-1 gap-2">
          {examplePrompts.map((example, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-left h-auto p-3 text-xs text-muted-foreground hover:text-foreground border border-border/30 justify-start"
              onClick={() => setPrompt(example)}
            >
              "{example}"
            </Button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Cmd+Enter</kbd> to submit
      </div>
    </div>
  );
}