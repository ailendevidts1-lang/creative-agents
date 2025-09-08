import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useExecutiveAgent } from '@/hooks/useExecutiveAgent';
import { 
  Brain, 
  Send, 
  Mic, 
  MicOff, 
  Settings, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Bot
} from 'lucide-react';

const ExecutiveAgentInterface: React.FC = () => {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [persona, setPersona] = useState('default');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    isProcessing,
    currentSession,
    messages,
    pipelines,
    error,
    startSession,
    sendMessage,
    getPipelines,
    createPipeline,
    runPipeline,
    approveExecution,
    denyExecution,
    clearMessages,
    closeSession
  } = useExecutiveAgent();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Load pipelines on mount
    getPipelines();
  }, [getPipelines]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Agent Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleStartSession = async () => {
    await startSession(isVoiceMode ? 'voice' : 'manual', persona);
    toast({
      title: "Executive Agent Started",
      description: `Session started in ${isVoiceMode ? 'voice' : 'manual'} mode`,
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSession) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleApproval = async (executionId: string, approved: boolean) => {
    if (approved) {
      await approveExecution(executionId);
      toast({
        title: "Execution Approved",
        description: "The agent will now proceed with the approved action.",
      });
    } else {
      await denyExecution(executionId);
      toast({
        title: "Execution Denied",
        description: "The agent will skip this action and continue.",
      });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'session_started': return <Activity className="w-4 h-4 text-green-500" />;
      case 'interpretation': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'plan': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'tool_call': return <Settings className="w-4 h-4 text-purple-500" />;
      case 'tool_result': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approval_request': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Bot className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderMessage = (message: any, index: number) => {
    return (
      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
        {getMessageIcon(message.type)}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {message.type.replace('_', ' ')}
            </Badge>
            {message.timestamp && (
              <span className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {message.type === 'user_message' && (
            <p className="text-sm font-medium">{message.message}</p>
          )}
          
          {message.type === 'interpretation' && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Goal: {message.goal}</p>
              <p className="text-xs text-muted-foreground">
                Success Criteria: {message.success_criteria?.join(', ')}
              </p>
            </div>
          )}
          
          {message.type === 'plan' && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Execution Plan ({message.steps?.length || 0} steps)</p>
              <div className="space-y-1">
                {message.steps?.map((step: any, stepIndex: number) => (
                  <div key={stepIndex} className="text-xs p-2 bg-muted rounded flex items-center justify-between">
                    <span>{step.tool}</span>
                    <Badge variant={step.riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {step.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {message.type === 'tool_call' && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Executing: {message.tool}</p>
              <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(message.args, null, 2)}
              </pre>
            </div>
          )}
          
          {message.type === 'tool_result' && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Result for {message.stepId}</p>
              <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto max-h-32">
                {JSON.stringify(message.result, null, 2)}
              </pre>
            </div>
          )}
          
          {message.type === 'approval_request' && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-orange-600">Approval Required</p>
                <p className="text-sm">{message.summary}</p>
                <Badge variant="outline" className="mt-1">
                  Risk: {message.riskLevel}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleApproval(message.executionId, true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleApproval(message.executionId, false)}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Deny
                </Button>
              </div>
            </div>
          )}
          
          {message.type === 'log' && (
            <p className="text-xs text-muted-foreground">{message.message}</p>
          )}
          
          {message.type === 'error' && (
            <p className="text-sm text-red-600">{message.message}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Executive Agent</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered task orchestration and automation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentSession && (
              <Badge variant="outline" className="text-xs">
                Session: {currentSession.slice(-8)}
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={isVoiceMode ? 'bg-primary/10' : ''}
            >
              {isVoiceMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {isVoiceMode ? 'Voice' : 'Text'}
            </Button>
            
            {currentSession ? (
              <Button
                variant="outline"
                size="sm"
                onClick={closeSession}
                disabled={isProcessing}
              >
                End Session
              </Button>
            ) : (
              <Button
                onClick={handleStartSession}
                disabled={isProcessing}
                size="sm"
              >
                Start Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Agent Conversation
              {isProcessing && (
                <Badge variant="secondary" className="text-xs">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  Processing
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea ref={scrollRef} className="flex-1 pr-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a session to begin interacting with the Executive Agent</p>
                    <p className="text-sm mt-1">
                      The agent can help with planning, automation, and complex task execution
                    </p>
                  </div>
                ) : (
                  messages.map(renderMessage)
                )}
              </div>
            </ScrollArea>
            
            <Separator className="my-3" />
            
            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={currentSession ? "Describe what you need help with..." : "Start a session first"}
                disabled={!currentSession || isProcessing}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!currentSession || !inputMessage.trim() || isProcessing}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar - Pipelines */}
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Pipelines</CardTitle>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {pipelines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pipelines created yet
                  </p>
                ) : (
                  pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{pipeline.name}</h4>
                        <Badge variant={pipeline.status === 'active' ? 'default' : 'secondary'}>
                          {pipeline.status}
                        </Badge>
                      </div>
                      {pipeline.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {pipeline.description}
                        </p>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runPipeline(pipeline.id)}
                          className="text-xs"
                        >
                          Run
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveAgentInterface;