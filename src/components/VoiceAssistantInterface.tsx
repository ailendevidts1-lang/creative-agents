import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRealtimeVoiceAssistant } from '@/hooks/useRealtimeVoiceAssistant';

export function VoiceAssistantInterface() {
  const [textInput, setTextInput] = useState('');
  const {
    isConnected,
    isRecording,
    isSpeaking,
    messages,
    currentTranscript,
    error,
    startConversation,
    endConversation,
    sendTextMessage,
    clearMessages,
    clearError
  } = useRealtimeVoiceAssistant();

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">AI Voice Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Enhanced with skills: timers, notes, weather, search, and more
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected && (
              <>
                {isRecording && (
                  <Badge variant="default" className="bg-red-500">
                    <Mic className="w-3 h-3 mr-1" />
                    Listening
                  </Badge>
                )}
                
                {isSpeaking && (
                  <Badge variant="default" className="bg-blue-500">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speaking
                  </Badge>
                )}
                
                {!isRecording && !isSpeaking && (
                  <Badge variant="secondary">
                    Ready
                  </Badge>
                )}
              </>
            )}
            
            {!isConnected ? (
              <Button onClick={startConversation} className="glass-panel">
                <Mic className="w-4 h-4 mr-2" />
                Start Voice Assistant
              </Button>
            ) : (
              <Button onClick={endConversation} variant="outline" className="glass-panel">
                <MicOff className="w-4 h-4 mr-2" />
                End Conversation
              </Button>
            )}
          </div>
        </div>
        
        {/* Current Transcript */}
        {currentTranscript && (
          <div className="mt-3 p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">You're saying:</p>
            <p className="text-sm font-medium">{currentTranscript}</p>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={clearError} variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <Card className="glass-panel h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Conversation</h3>
              {messages.length > 0 && (
                <Button onClick={clearMessages} variant="ghost" size="sm">
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a conversation or type a message below
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.type === 'system'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.type === 'user' && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      {message.type === 'assistant' && (
                        <Badge variant="secondary" className="text-xs">
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Text Input */}
      {isConnected && (
        <Card className="glass-panel p-4">
          <form onSubmit={handleSendText} className="flex space-x-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a message or voice command..."
              className="glass-panel flex-1"
              disabled={!isConnected}
            />
            <Button type="submit" disabled={!textInput.trim() || !isConnected}>
              Send
            </Button>
          </form>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <p>
              <strong>Try saying:</strong> "Set a 5 minute timer for cooking", "What's the weather?", 
              "Create a note about the meeting", "Search for nearby restaurants"
            </p>
          </div>
        </Card>
      )}

      {/* Usage Instructions */}
      {!isConnected && (
        <Card className="glass-panel p-6">
          <h3 className="font-medium mb-3">Voice Assistant Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-primary mb-2">🕒 Timers & Alarms</h4>
              <p className="text-muted-foreground">
                "Set a 10 minute timer for cooking"<br />
                "List my timers"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">📝 Notes & Reminders</h4>
              <p className="text-muted-foreground">
                "Create a note about today's meeting"<br />
                "Show me my notes"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">🌤️ Weather</h4>
              <p className="text-muted-foreground">
                "What's the weather like?"<br />
                "Weather in New York"
              </p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">🔍 Web Search</h4>
              <p className="text-muted-foreground">
                "Search for nearby restaurants"<br />
                "What's the latest news about AI?"
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}