import React, { useState } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptBarProps {
  onSendMessage: (message: string) => void;
  onSwitchToVoice: () => void;
}

export function PromptBar({ onSendMessage, onSwitchToVoice }: PromptBarProps) {
  const [message, setMessage] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isMultiline) {
        if (e.shiftKey) {
          handleSubmit();
          e.preventDefault();
        }
      } else {
        if (!e.shiftKey) {
          handleSubmit();
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div className="glass-panel border-t border-border/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-[48px] max-h-32 resize-none glass-panel border-border/40 
                         bg-input/50 text-foreground placeholder:text-muted-foreground 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 
                         focus:border-primary/50 luxury-transition"
              rows={1}
            />
            
            {/* Multiline Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMultiline(!isMultiline)}
              className="absolute bottom-2 right-12 w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
            >
              ⏎
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="lg"
              className="w-12 h-12 rounded-2xl metal-highlight hover:neon-glow luxury-transition"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={onSwitchToVoice}
              className="w-12 h-12 rounded-2xl metal-highlight hover:neon-glow luxury-transition"
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!message.trim()}
              size="lg"
              className="w-12 h-12 rounded-2xl neon-glow luxury-transition"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Keyboard Hints */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isMultiline ? "Shift + Enter to send" : "Enter to send, Shift + Enter for new line"}
          </span>
          <span>Attach files • Switch to voice • Send message</span>
        </div>
      </div>
    </div>
  );
}