import React, { useState } from 'react';
import { Code, Rocket, GitBranch, Play, Settings, FileText, Database, Globe, Github, MessageSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'scaffolding' | 'developing' | 'deploying' | 'deployed';
  progress: number;
  url?: string;
  githubUrl?: string;
  createdAt: Date;
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
  progress: number;
}

export function PromptToCodeSkill() {
  const [mode, setMode] = useState<'chat' | 'build'>('chat');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const { toast } = useToast();

  const defaultPipelineSteps: PipelineStep[] = [
    { id: 'ideate', name: 'Ideate', status: 'pending', description: 'Analyzing prompt and requirements', progress: 0 },
    { id: 'scaffold', name: 'Scaffold', status: 'pending', description: 'Generating project structure', progress: 0 },
    { id: 'iterate', name: 'Iterate', status: 'pending', description: 'Building core components', progress: 0 },
    { id: 'integrate', name: 'Integrate', status: 'pending', description: 'Setting up APIs and database', progress: 0 },
    { id: 'version', name: 'Version', status: 'pending', description: 'Syncing with GitHub', progress: 0 },
    { id: 'deploy', name: 'Deploy', status: 'pending', description: 'Publishing to domain', progress: 0 },
  ];

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setPipelineSteps([...defaultPipelineSteps]);

    try {
      if (mode === 'chat') {
        // Chat mode - meta-prompt analysis without code changes
        await processChatMode(prompt);
      } else {
        // Build mode - full project generation
        await processBuildMode(prompt);
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      toast({
        title: "Pipeline Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processChatMode = async (userPrompt: string) => {
    // Simulate meta-prompt analysis
    const steps = [...pipelineSteps];
    
    // Step 1: Ideate
    steps[0].status = 'active';
    setPipelineSteps([...steps]);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    steps[0].status = 'completed';
    steps[0].progress = 100;
    setPipelineSteps([...steps]);

    toast({
      title: "Analysis Complete",
      description: "I understand your request. Switch to Build mode to generate the actual project.",
    });
  };

  const processBuildMode = async (userPrompt: string) => {
    const projectId = `project-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name: extractProjectName(userPrompt),
      description: userPrompt,
      status: 'planning',
      progress: 0,
      createdAt: new Date()
    };

    setCurrentProject(newProject);
    const steps = [...pipelineSteps];

    // Execute pipeline steps
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'active';
      setPipelineSteps([...steps]);
      
      await executeStep(steps[i], newProject, userPrompt);
      
      steps[i].status = 'completed';
      steps[i].progress = 100;
      newProject.progress = ((i + 1) / steps.length) * 100;
      setPipelineSteps([...steps]);
      setCurrentProject({...newProject});
    }

    newProject.status = 'deployed';
    newProject.url = `https://${projectId}.lovable.app`;
    newProject.githubUrl = `https://github.com/user/${projectId}`;
    
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);

    toast({
      title: "Project Generated!",
      description: `Your ${newProject.name} is ready and deployed.`,
    });
  };

  const executeStep = async (step: PipelineStep, project: Project, userPrompt: string) => {
    // Simulate different pipeline steps
    switch (step.id) {
      case 'ideate':
        await simulateIdeation(userPrompt);
        break;
      case 'scaffold':
        await simulateScaffolding(project);
        break;
      case 'iterate':
        await simulateIteration(project);
        break;
      case 'integrate':
        await simulateIntegration(project);
        break;
      case 'version':
        await simulateVersioning(project);
        break;
      case 'deploy':
        await simulateDeployment(project);
        break;
    }
  };

  const simulateIdeation = async (prompt: string) => {
    // Simulate AI planning and architecture analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const simulateScaffolding = async (project: Project) => {
    // Simulate project structure generation
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const simulateIteration = async (project: Project) => {
    // Simulate component and logic creation
    await new Promise(resolve => setTimeout(resolve, 4000));
  };

  const simulateIntegration = async (project: Project) => {
    // Simulate API and database setup
    await new Promise(resolve => setTimeout(resolve, 2500));
  };

  const simulateVersioning = async (project: Project) => {
    // Simulate GitHub sync
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const simulateDeployment = async (project: Project) => {
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const extractProjectName = (prompt: string): string => {
    // Simple extraction logic - in real implementation, this would use AI
    const keywords = prompt.toLowerCase().match(/(?:build|create|make)\s+(?:a|an)?\s*([^,.!?]+)/);
    return keywords ? keywords[1].trim() : 'New Project';
  };

  const renderPipeline = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pipeline Progress</h3>
      {pipelineSteps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step.status === 'completed' ? 'bg-primary text-primary-foreground' :
            step.status === 'active' ? 'bg-primary/20 text-primary animate-pulse' :
            step.status === 'error' ? 'bg-destructive text-destructive-foreground' :
            'bg-muted text-muted-foreground'
          }`}>
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{step.name}</span>
              {step.status === 'active' && <Badge variant="secondary">Processing...</Badge>}
              {step.status === 'completed' && <Badge variant="default">Done</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {step.status === 'active' && (
              <Progress value={step.progress} className="mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Generated Projects</h3>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects generated yet. Create your first one!</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={project.status === 'deployed' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {project.progress.toFixed(0)}% complete
                    </span>
                  </div>
                  <Progress value={project.progress} className="mb-2" />
                </div>
                <div className="flex space-x-2 ml-4">
                  {project.url && (
                    <Button size="sm" variant="outline" onClick={() => window.open(project.url, '_blank')}>
                      <Globe className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button size="sm" variant="outline" onClick={() => window.open(project.githubUrl, '_blank')}>
                      <Github className="w-4 h-4 mr-1" />
                      Code
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Code className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Prompt-to-Code System</h2>
        </div>
        <p className="text-muted-foreground">
          Transform natural language into production-ready software projects
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'chat' | 'build')} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat Mode</span>
            </TabsTrigger>
            <TabsTrigger value="build" className="flex items-center space-x-2">
              <Rocket className="w-4 h-4" />
              <span>Build Mode</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Prompt Input */}
      <Card className="p-4">
        <form onSubmit={handlePromptSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === 'chat' ? 'Describe your project idea' : 'Build your project'}
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'chat' 
                ? "e.g., I want to build a task management app with team collaboration..."
                : "e.g., Create a modern e-commerce store with payment integration and admin dashboard"
              }
              className="min-h-[100px]"
              disabled={isProcessing}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!prompt.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {mode === 'chat' ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Analyze Project
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Generate Project
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Pipeline Visualization */}
      {(isProcessing || currentProject) && (
        <Card className="p-4">
          {renderPipeline()}
        </Card>
      )}

      {/* Projects List */}
      <Card className="p-4">
        {renderProjects()}
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Full-Stack Features
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• React + TypeScript frontend</li>
            <li>• Supabase backend integration</li>
            <li>• Authentication & user management</li>
            <li>• Real-time database updates</li>
            <li>• File storage & CDN</li>
            <li>• Edge functions for API logic</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Deployment & Hosting
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Automatic GitHub sync</li>
            <li>• One-click publishing</li>
            <li>• Custom domain support</li>
            <li>• SSL certificates included</li>
            <li>• Global CDN delivery</li>
            <li>• Version control & rollbacks</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}