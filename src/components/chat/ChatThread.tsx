import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    name: string;
    parameters: Record<string, any>;
  }>;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}

interface ChatThreadProps {
  messages: Message[];
}

export function ChatThread({ messages }: ChatThreadProps) {
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-4 ${
              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-2xl glass-panel flex items-center justify-center ${
              message.role === "user" ? "bg-primary/10" : "bg-secondary/50"
            }`}>
              {message.role === "user" ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 space-y-2 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`chat-bubble max-w-2xl ${message.role}`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Tool Calls */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.toolCalls.map((toolCall, index) => (
                      <div key={index} className="glass-panel p-3 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            Tool: {toolCall.name}
                          </Badge>
                        </div>
                        <pre className="text-xs text-muted-foreground overflow-x-auto">
                          {JSON.stringify(toolCall.parameters, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.sources.map((source, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs hover:bg-primary/10 cursor-pointer"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        {source.title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}