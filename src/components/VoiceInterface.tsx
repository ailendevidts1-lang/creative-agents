import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { AICodeService } from '@/services/aiCodeService';
import { Mic, MicOff, Bot, MessageSquare } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{type: string, content: string, timestamp: Date}>>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    // Handle different event types
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    } else if (event.type === 'response.audio_transcript.delta') {
      // Handle AI speech transcription
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.type === 'ai' && 
            Date.now() - lastMessage.timestamp.getTime() < 2000) {
          // Update the last AI message
          return prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, content: msg.content + event.delta }
              : msg
          );
        } else {
          // Create new AI message
          return [...prev, {
            type: 'ai',
            content: event.delta,
            timestamp: new Date()
          }];
        }
      });
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      // Handle user speech transcription
      setMessages(prev => [...prev, {
        type: 'user',
        content: event.transcript,
        timestamp: new Date()
      }]);
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      // Get ephemeral token from our edge function
      const tokenResult = await AICodeService.createRealtimeToken();
      
      if (!tokenResult.success || !tokenResult.token?.client_secret?.value) {
        throw new Error(tokenResult.error || 'Failed to get ephemeral token');
      }

      const ephemeralToken = tokenResult.token.client_secret.value;

      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init(ephemeralToken);
      setIsConnected(true);
      
      toast({
        title: "🎤 Voice Assistant Connected",
        description: "You can now speak with your AI development assistant",
      });

      // Send initial greeting
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.sendMessage("Hello! I'm your AI development assistant. How can I help you with your projects today?");
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start voice conversation',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    onSpeakingChange?.(false);
    
    toast({
      title: "Voice Assistant Disconnected",
      description: "Conversation ended",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI Development Assistant
          {isConnected && (
            <Badge variant={isSpeaking ? "default" : "secondary"}>
              {isSpeaking ? "Speaking" : "Listening"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        {messages.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-secondary/20 rounded-lg">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  <div className="flex items-center gap-1 mb-1">
                    {message.type === 'user' ? <MessageSquare className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span className="text-xs opacity-70">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                  </div>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connection Status */}
        <div className="flex flex-col items-center gap-4">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Bot className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Voice Assistant
                </>
              )}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
                isSpeaking ? 'bg-primary animate-pulse' : 'bg-green-500'
              }`}>
                {isSpeaking ? (
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-white rounded animate-pulse"></div>
                    <div className="w-1 h-6 bg-white rounded animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-white rounded animate-pulse delay-150"></div>
                  </div>
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                {isSpeaking ? "AI is speaking..." : "Listening... speak naturally"}
              </p>
              
              <Button 
                onClick={endConversation}
                variant="outline"
                size="sm"
              >
                <MicOff className="h-4 w-4 mr-2" />
                End Conversation
              </Button>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        {!isConnected && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Ask about:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>How to implement specific features</li>
              <li>Best practices for your tech stack</li>
              <li>Deployment and architecture guidance</li>
              <li>Debugging and troubleshooting</li>
              <li>Code review and optimization</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceInterface;