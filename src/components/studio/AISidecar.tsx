import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Bot, Code, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useStudioAI } from '@/hooks/useStudioAI';
import { useToast } from '@/hooks/use-toast';

interface AISidecarProps {
  projectId?: string;
  currentFiles?: Record<string, string>;
  onApplyPatches?: (patches: any[]) => void;
}

export function AISidecar({ projectId, currentFiles, onApplyPatches }: AISidecarProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { 
    isGenerating, 
    plans, 
    currentPatches, 
    generatePlan, 
    generatePatches, 
    updatePlanStatus,
    clearPatches 
  } = useStudioAI();
  const { toast } = useToast();

  const handleAskAI = async () => {
    if (!prompt.trim() || !projectId) return;

    try {
      await generatePlan(projectId, prompt, currentFiles);
      setPrompt('');
      toast({
        title: "Plan Generated",
        description: "AI has created a new implementation plan",
      });
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCode = async (plan: any) => {
    try {
      await generatePatches(plan, currentFiles);
      toast({
        title: "Code Generated",
        description: "AI has generated code patches for your plan",
      });
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyPlan = (plan: any) => {
    if (currentPatches && onApplyPatches) {
      onApplyPatches(currentPatches.patches);
      updatePlanStatus(plan.id, 'applied');
      clearPatches();
      toast({
        title: "Changes Applied",
        description: "Code patches have been applied to your project",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="ml-2">Ready</Badge>;
      case 'applied':
        return <Badge variant="outline" className="ml-2">Applied</Badge>;
      case 'planning':
        return <Badge variant="secondary" className="ml-2">Planning</Badge>;
      case 'error':
        return <Badge variant="destructive" className="ml-2">Error</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2">{status}</Badge>;
    }
  };

  return (
    <div className="h-full border-l">
      <Tabs defaultValue="chat" className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="patches">Patches</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="h-full p-4">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </h3>
              <p className="text-sm text-muted-foreground">
                Describe what you want to build or change, and I'll create a plan with code patches.
              </p>
            </div>

            <div className="flex-1">
              <ScrollArea className="h-full">
                {plans.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ask me to help with your project!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plans.map(plan => (
                      <Card 
                        key={plan.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            {plan.title}
                            {getStatusBadge(plan.status)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2">
                            {plan.description}
                          </p>
                          <p className="text-xs">
                            {plan.files.length} files • {plan.tasks.length} tasks
                          </p>
                          {plan.estimatedTime && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {plan.estimatedTime}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Ask AI to implement a feature, fix a bug, or refactor code..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleAskAI}
                disabled={!prompt.trim() || isGenerating || !projectId}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="h-full p-4">
          {selectedPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Plan Details</h3>
                <Button
                  onClick={() => setSelectedPlan(null)}
                  variant="ghost"
                  size="sm"
                >
                  Back
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    {selectedPlan.title}
                    {getStatusBadge(selectedPlan.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedPlan.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Tasks
                      </h4>
                      <ul className="space-y-1">
                        {selectedPlan.tasks.map((task: string, index: number) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Files to Change
                      </h4>
                      <ul className="space-y-1">
                        {selectedPlan.files.map((file: string, index: number) => (
                          <li key={index} className="text-sm font-mono text-muted-foreground">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedPlan.dependencies && selectedPlan.dependencies.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Dependencies</h4>
                        <ul className="space-y-1">
                          {selectedPlan.dependencies.map((dep: string, index: number) => (
                            <li key={index} className="text-sm font-mono text-muted-foreground">
                              {dep}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedPlan.status === 'ready' && (
                        <Button 
                          onClick={() => handleGenerateCode(selectedPlan)}
                          disabled={isGenerating}
                          className="flex-1"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Code'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a plan to view details</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="patches" className="h-full p-4">
          {currentPatches ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Generated Patches</h3>
                <Button 
                  onClick={() => handleApplyPlan(selectedPlan)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Apply All
                </Button>
              </div>

              {currentPatches.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Implementation Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{currentPatches.notes}</p>
                  </CardContent>
                </Card>
              )}

              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {currentPatches.patches.map((patch, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="font-mono">{patch.file}</span>
                          <Badge variant={patch.action === 'create' ? 'default' : 'secondary'}>
                            {patch.action}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">{patch.description}</p>
                        {patch.diff && (
                          <div className="bg-muted p-2 rounded text-xs font-mono overflow-auto max-h-32">
                            <pre>{patch.diff}</pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {currentPatches.buildInstructions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Build Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs font-mono space-y-1">
                      {currentPatches.buildInstructions.map((instruction, index) => (
                        <li key={index} className="text-muted-foreground">$ {instruction}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patches generated yet</p>
              <p className="text-xs mt-2">Generate code from a plan first</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}