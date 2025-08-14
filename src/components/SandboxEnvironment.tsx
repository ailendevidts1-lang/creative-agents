import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectPlan } from '@/agents/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/services/aiCodeService';
import { 
  Play, 
  RefreshCw, 
  Bug, 
  Code, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface SandboxEnvironmentProps {
  project: ProjectPlan;
  onClose: () => void;
}

interface TestResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  output?: string;
  previewUrl?: string;
}

export const SandboxEnvironment: React.FC<SandboxEnvironmentProps> = ({ project, onClose }) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runSandbox = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('run-sandbox', {
        body: { 
          projectId: project.id,
          codeStructure: project.metadata?.codeStructure 
        }
      });

      if (error) {
        console.error('Sandbox error:', error);
        setTestResult({
          success: false,
          errors: [error.message]
        });
        return;
      }

      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "Sandbox Started",
          description: "Your project is now running in the sandbox environment",
        });
      } else {
        toast({
          title: "Issues Detected",
          description: `Found ${data.errors?.length || 0} errors`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sandbox failed:', error);
      setTestResult({
        success: false,
        errors: ['Failed to start sandbox environment']
      });
      toast({
        title: "Error",
        description: "Failed to start sandbox environment",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const autoFix = async () => {
    if (!testResult?.errors?.length) return;

    setIsAutoFixing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('autofix-code', {
        body: { 
          projectId: project.id,
          errors: testResult.errors,
          codeStructure: project.metadata?.codeStructure
        }
      });

      if (error) {
        console.error('Autofix error:', error);
        toast({
          title: "Autofix Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Issues Fixed",
        description: "Code has been automatically fixed. Running tests again...",
      });

      // Re-run the sandbox after fixing
      setTimeout(() => runSandbox(), 1000);

    } catch (error) {
      console.error('Autofix failed:', error);
      toast({
        title: "Error",
        description: "Failed to auto-fix issues",
        variant: "destructive",
      });
    } finally {
      setIsAutoFixing(false);
    }
  };

  const editProject = async () => {
    if (!editPrompt.trim()) return;

    setIsEditing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('edit-project', {
        body: { 
          projectId: project.id,
          prompt: editPrompt,
          codeStructure: project.metadata?.codeStructure
        }
      });

      if (error) {
        console.error('Edit error:', error);
        toast({
          title: "Edit Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project Updated",
        description: "Changes applied successfully. Running tests...",
      });

      setEditPrompt('');
      // Re-run the sandbox after editing
      setTimeout(() => runSandbox(), 1000);

    } catch (error) {
      console.error('Edit failed:', error);
      toast({
        title: "Error",
        description: "Failed to apply changes",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sandbox Environment</h2>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            {/* Run Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Sandbox Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={runSandbox} 
                    disabled={isRunning}
                    className="flex-1"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Project
                      </>
                    )}
                  </Button>
                  
                  {testResult?.errors?.length > 0 && (
                    <Button 
                      onClick={autoFix} 
                      disabled={isAutoFixing}
                      variant="secondary"
                    >
                      {isAutoFixing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <Bug className="h-4 w-4 mr-2" />
                          Auto Fix
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {testResult?.previewUrl && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(testResult.previewUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge 
                    variant={testResult.success ? "default" : "destructive"}
                    className="w-full justify-center"
                  >
                    {testResult.success ? "All Tests Passed" : "Issues Detected"}
                  </Badge>

                  {testResult.errors?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                      <div className="space-y-1">
                        {testResult.errors.map((error, index) => (
                          <div key={index} className="text-sm bg-red-50 dark:bg-red-950 p-2 rounded border">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResult.warnings?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-600 mb-2">Warnings:</h4>
                      <div className="space-y-1">
                        {testResult.warnings.map((warning, index) => (
                          <div key={index} className="text-sm bg-yellow-50 dark:bg-yellow-950 p-2 rounded border">
                            {warning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Edit Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Edit Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe the changes you want to make to the project..."
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={editProject} 
                  disabled={isEditing || !editPrompt.trim()}
                  className="w-full"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying Changes...
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Apply Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                {testResult?.previewUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={testResult.previewUrl}
                    className="w-full h-full border-0 rounded-b-lg"
                    title="Project Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Click "Run Project" to see the live preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};