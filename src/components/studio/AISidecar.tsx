import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Bot, Code, FileText, CheckCircle } from 'lucide-react';

interface ChangePlan {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  files: string[];
  status: 'planning' | 'ready' | 'applied';
}

interface AISidecarProps {
  projectId?: string;
}

export function AISidecar({ projectId }: AISidecarProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plans, setPlans] = useState<ChangePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ChangePlan | null>(null);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI planning
    setTimeout(() => {
      const newPlan: ChangePlan = {
        id: Date.now().toString(),
        title: `Implement: ${prompt.slice(0, 30)}...`,
        description: prompt,
        tasks: [
          'Analyze current codebase structure',
          'Generate necessary components',
          'Update routing configuration',
          'Add required dependencies',
          'Write unit tests'
        ],
        files: [
          'src/components/NewFeature.tsx',
          'src/hooks/useNewFeature.ts',
          'src/App.tsx',
          'package.json'
        ],
        status: 'ready'
      };

      setPlans(prev => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
      setPrompt('');
      setIsGenerating(false);
    }, 2000);
  };

  const handleApplyPlan = (plan: ChangePlan) => {
    setPlans(prev => 
      prev.map(p => 
        p.id === plan.id 
          ? { ...p, status: 'applied' }
          : p
      )
    );
  };

  return (
    <div className="h-full border-l">
      <Tabs defaultValue="chat" className="h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="h-full p-4">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </h3>
              <p className="text-sm text-muted-foreground">
                Describe what you want to build or change, and I'll create a plan with code diffs.
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
                            <Badge 
                              variant={plan.status === 'applied' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {plan.status}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2">
                            {plan.description}
                          </p>
                          <p className="text-xs">
                            {plan.files.length} files • {plan.tasks.length} tasks
                          </p>
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
                disabled={!prompt.trim() || isGenerating}
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
                    <Badge variant={selectedPlan.status === 'applied' ? 'default' : 'secondary'}>
                      {selectedPlan.status}
                    </Badge>
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
                        {selectedPlan.tasks.map((task, index) => (
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
                        {selectedPlan.files.map((file, index) => (
                          <li key={index} className="text-sm font-mono text-muted-foreground">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedPlan.status === 'ready' && (
                      <Button 
                        onClick={() => handleApplyPlan(selectedPlan)}
                        className="w-full"
                      >
                        Apply Changes
                      </Button>
                    )}
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
      </Tabs>
    </div>
  );
}