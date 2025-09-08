import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Activity,
  Brain,
  Zap
} from 'lucide-react';

interface AgentVoiceInterfaceProps {
  onMessage?: (message: string) => void;
  onStatusChange?: (status: string) => void;
}

const AgentVoiceInterface: React.FC<AgentVoiceInterfaceProps> = ({
  onMessage,
  onStatusChange
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [transcript, setTranscript] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      setStatus('Connecting...');
      
      // Connect to agent voice WebSocket
      const wsUrl = `wss://akdlvhfrslztmhsiurqo.functions.supabase.co/functions/v1/agent-voice`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to Agent Voice interface');
        setIsConnected(true);
        setStatus('Connected');
        
        // Create session
        const sessionId = `voice_${Date.now()}`;
        wsRef.current?.send(JSON.stringify({
          type: 'session.create',
          sessionId,
          userId: 'demo-user'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleAgentMessage(data);
        } catch (error) {
          console.error('Failed to parse agent message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Agent voice connection closed');
        setIsConnected(false);
        setIsListening(false);
        setStatus('Disconnected');
      };

      wsRef.current.onerror = (error) => {
        console.error('Agent voice WebSocket error:', error);
        setStatus('Connection Error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to Agent Voice service",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('Error connecting to agent voice:', error);
      setStatus('Error');
      toast({
        title: "Connection Failed",
        description: "Could not establish voice connection",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsConnected(false);
    setIsListening(false);
    setStatus('Disconnected');
  };

  const handleAgentMessage = (data: any) => {
    console.log('Agent message:', data.type, data);
    
    switch (data.type) {
      case 'session.created':
        setStatus('Ready');
        toast({
          title: "Agent Ready",
          description: "Voice interface is ready for commands",
        });
        break;
        
      case 'agent.thinking':
        setStatus(data.message || 'Processing...');
        break;
        
      case 'agent.plan':
        setStatus(`Planning: ${data.steps?.length || 0} steps`);
        break;
        
      case 'agent.executing':
        setStatus(`Executing: ${data.tool}`);
        break;
        
      case 'agent.result':
        setStatus('Task completed');
        break;
        
      case 'agent.approval_needed':
        setStatus('Approval required');
        toast({
          title: "Approval Required",
          description: data.summary,
          variant: "default",
        });
        break;
        
      case 'agent.response':
        setAgentResponse(data.text);
        setStatus('Ready');
        if (data.text && onMessage) {
          onMessage(data.text);
        }
        break;
        
      case 'agent.error':
        setStatus('Error');
        toast({
          title: "Agent Error",
          description: data.message,
          variant: "destructive",
        });
        break;
        
      default:
        console.log('Unknown agent message type:', data.type);
    }
    
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setIsListening(true);
      setStatus('Listening...');
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect data every second

      // Auto-stop after 10 seconds (safety measure)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopListening();
        }
      }, 10000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('Microphone Error');
      toast({
        title: "Microphone Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    setStatus('Processing...');
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to text (mock for now)
      const mockTranscript = "Tell me the weather in New York";
      setTranscript(mockTranscript);
      
      // Send to agent
      if (wsRef.current && mockTranscript) {
        wsRef.current.send(JSON.stringify({
          type: 'voice.input',
          transcript: mockTranscript,
          partial: false
        }));
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('Processing Error');
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-gray-500';
    if (isListening) return 'text-red-500';
    if (status.includes('Error')) return 'text-red-500';
    if (status === 'Ready') return 'text-green-500';
    return 'text-blue-500';
  };

  const getStatusIcon = () => {
    if (isListening) return <Activity className="w-4 h-4 animate-pulse" />;
    if (status.includes('Planning')) return <Brain className="w-4 h-4" />;
    if (status.includes('Executing')) return <Zap className="w-4 h-4" />;
    if (status.includes('Error')) return <VolumeX className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="font-medium">Agent Voice Interface</h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {status}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="space-y-2">
            <div className={`w-20 h-20 mx-auto rounded-full border-4 ${
              isListening 
                ? 'border-red-500 bg-red-50 animate-pulse' 
                : isConnected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 bg-gray-50'
            } flex items-center justify-center cursor-pointer transition-all`}
            onClick={isConnected ? (isListening ? stopListening : startListening) : connect}
            >
              {isListening ? (
                <Mic className="w-8 h-8 text-red-500" />
              ) : (
                <MicOff className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {!isConnected 
                ? 'Click to connect to voice agent'
                : isListening 
                  ? 'Listening... Click to stop'
                  : 'Click to start voice command'
              }
            </p>
          </div>

          <div className="space-y-2">
            {!isConnected ? (
              <Button onClick={connect} className="w-full">
                Connect Voice Agent
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={isListening ? stopListening : startListening}
                  disabled={!isConnected}
                  className="flex-1"
                  variant={isListening ? "destructive" : "default"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Listening
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={disconnect}
                  variant="outline"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {transcript && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">You said:</h4>
            <p className="text-sm bg-muted p-3 rounded">
              "{transcript}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Agent Response */}
      {agentResponse && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Agent response:</h4>
            <p className="text-sm bg-primary/5 p-3 rounded">
              {agentResponse}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentVoiceInterface;