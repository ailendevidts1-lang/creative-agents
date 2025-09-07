import React, { useState } from 'react';
import { Code, Rocket, GitBranch, Play, Settings, FileText, Database, Globe, Github, MessageSquare, Upload, Download, Package, Monitor, Smartphone, Terminal, FolderOpen, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  description: string;
  type: 'website' | 'desktop-app' | 'mobile-app' | 'cli-tool' | 'backend-service';
  platform: 'web' | 'windows' | 'mac' | 'linux' | 'ios' | 'android' | 'cross-platform';
  status: 'planning' | 'scaffolding' | 'developing' | 'building' | 'deployed';
  progress: number;
  url?: string;
  githubUrl?: string;
  zipUrl?: string;
  installerUrls?: {
    windows?: string;
    mac?: string;
    linux?: string;
  };
  techStack: string[];
  createdAt: Date;
  lastUpdated: Date;
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
  progress: number;
}

export function PromptToCodeSkill() {
  const [mode, setMode] = useState<'chat' | 'build' | 'manual'>('chat');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('website');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('web');
  const { toast } = useToast();

  const defaultPipelineSteps: PipelineStep[] = [
    { id: 'ideate', name: 'Ideate', status: 'pending', description: 'Analyzing requirements and creating architecture', progress: 0 },
    { id: 'scaffold', name: 'Scaffold', status: 'pending', description: 'Generating project structure and file tree', progress: 0 },
    { id: 'iterate', name: 'Iterate', status: 'pending', description: 'Building UI components and core logic', progress: 0 },
    { id: 'integrate', name: 'Integrate', status: 'pending', description: 'Setting up APIs, database, and third-party services', progress: 0 },
    { id: 'build', name: 'Build', status: 'pending', description: 'Creating export packages and installers', progress: 0 },
    { id: 'version', name: 'Version', status: 'pending', description: 'Syncing with GitHub and version control', progress: 0 },
    { id: 'deploy', name: 'Deploy', status: 'pending', description: 'Publishing and making available for download', progress: 0 },
  ];

  const projectTypes = [
    { value: 'website', label: 'Website/Web App', icon: Globe },
    { value: 'desktop-app', label: 'Desktop Application', icon: Monitor },
    { value: 'mobile-app', label: 'Mobile App', icon: Smartphone },
    { value: 'cli-tool', label: 'CLI Tool', icon: Terminal },
    { value: 'backend-service', label: 'Backend Service', icon: Database }
  ];

  const platformOptions = {
    website: [
      { value: 'web', label: 'Web (React/Next.js)' }
    ],
    'desktop-app': [
      { value: 'cross-platform', label: 'Cross-platform (Electron)' },
      { value: 'windows', label: 'Windows (.exe/.msi)' },
      { value: 'mac', label: 'macOS (.dmg/.pkg)' },
      { value: 'linux', label: 'Linux (.AppImage/.deb)' }
    ],
    'mobile-app': [
      { value: 'cross-platform', label: 'Cross-platform (React Native)' },
      { value: 'ios', label: 'iOS (Swift)' },
      { value: 'android', label: 'Android (Kotlin)' }
    ],
    'cli-tool': [
      { value: 'cross-platform', label: 'Cross-platform (Node.js/Python)' }
    ],
    'backend-service': [
      { value: 'web', label: 'Cloud Service (Node.js/Express)' }
    ]
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setPipelineSteps([...defaultPipelineSteps]);

    try {
      if (mode === 'chat') {
        await processChatMode(prompt);
      } else if (mode === 'manual') {
        await processManualMode(prompt);
      } else {
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
    const steps = [...pipelineSteps];
    
    steps[0].status = 'active';
    setPipelineSteps([...steps]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    steps[0].status = 'completed';
    steps[0].progress = 100;
    setPipelineSteps([...steps]);

    toast({
      title: "Meta-Analysis Complete",
      description: "Requirements analyzed. Switch to Build or Manual mode to create the project.",
    });
  };

  const processManualMode = async (userPrompt: string) => {
    const projectId = `project-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name: extractProjectName(userPrompt),
      description: userPrompt,
      type: selectedProjectType as Project['type'],
      platform: selectedPlatform as Project['platform'],
      status: 'planning',
      progress: 0,
      techStack: getTechStack(selectedProjectType, selectedPlatform),
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setCurrentProject(newProject);
    await executeManualPipeline(newProject, userPrompt);
  };

  const processBuildMode = async (userPrompt: string) => {
    const projectId = `project-${Date.now()}`;
    const detectedType = detectProjectType(userPrompt);
    const detectedPlatform = detectPlatform(userPrompt, detectedType);
    
    const newProject: Project = {
      id: projectId,
      name: extractProjectName(userPrompt),
      description: userPrompt,
      type: detectedType,
      platform: detectedPlatform,
      status: 'planning',
      progress: 0,
      techStack: getTechStack(detectedType, detectedPlatform),
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setCurrentProject(newProject);
    await executeFullPipeline(newProject, userPrompt);
  };

  const executeManualPipeline = async (project: Project, userPrompt: string) => {
    const steps = [...pipelineSteps];

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'active';
      setPipelineSteps([...steps]);
      
      await executeStep(steps[i], project, userPrompt);
      
      steps[i].status = 'completed';
      steps[i].progress = 100;
      project.progress = ((i + 1) / steps.length) * 100;
      setPipelineSteps([...steps]);
      setCurrentProject({...project});
    }

    await finalizeProject(project);
  };

  const executeFullPipeline = async (project: Project, userPrompt: string) => {
    const steps = [...pipelineSteps];

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'active';
      setPipelineSteps([...steps]);
      
      await executeStep(steps[i], project, userPrompt);
      
      steps[i].status = 'completed';
      steps[i].progress = 100;
      project.progress = ((i + 1) / steps.length) * 100;
      setPipelineSteps([...steps]);
      setCurrentProject({...project});
    }

    await finalizeProject(project);
  };

  const finalizeProject = async (project: Project) => {
    project.status = 'deployed';
    project.lastUpdated = new Date();
    
    // Generate URLs based on project type
    if (project.type === 'website') {
      project.url = `https://${project.id}.lovable.app`;
    }
    
    project.githubUrl = `https://github.com/user/${project.id}`;
    project.zipUrl = `https://downloads.lovable.app/${project.id}.zip`;
    
    if (project.type === 'desktop-app') {
      project.installerUrls = {
        windows: `https://downloads.lovable.app/${project.id}-setup.exe`,
        mac: `https://downloads.lovable.app/${project.id}.dmg`,
        linux: `https://downloads.lovable.app/${project.id}.AppImage`
      };
    }
    
    setProjects(prev => [...prev, project]);
    setCurrentProject(project);

    toast({
      title: "Project Ready!",
      description: `Your ${project.name} has been generated and is ready for download.`,
    });
  };

  const executeStep = async (step: PipelineStep, project: Project, userPrompt: string) => {
    switch (step.id) {
      case 'ideate':
        await simulateIdeation(userPrompt, project);
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
      case 'build':
        await simulateBuild(project);
        break;
      case 'version':
        await simulateVersioning(project);
        break;
      case 'deploy':
        await simulateDeployment(project);
        break;
    }
  };

  const simulateIdeation = async (prompt: string, project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const simulateScaffolding = async (project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const simulateIteration = async (project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 4000));
  };

  const simulateIntegration = async (project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 2500));
  };

  const simulateBuild = async (project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 3500));
  };

  const simulateVersioning = async (project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const simulateDeployment = async (project: Project) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const detectProjectType = (prompt: string): Project['type'] => {
    const lower = prompt.toLowerCase();
    if (lower.includes('desktop') || lower.includes('electron')) return 'desktop-app';
    if (lower.includes('mobile') || lower.includes('app store')) return 'mobile-app';
    if (lower.includes('cli') || lower.includes('command line')) return 'cli-tool';
    if (lower.includes('api') || lower.includes('backend') || lower.includes('service')) return 'backend-service';
    return 'website';
  };

  const detectPlatform = (prompt: string, type: Project['type']): Project['platform'] => {
    const lower = prompt.toLowerCase();
    if (type === 'desktop-app') {
      if (lower.includes('windows')) return 'windows';
      if (lower.includes('mac') || lower.includes('macos')) return 'mac';
      if (lower.includes('linux')) return 'linux';
      return 'cross-platform';
    }
    if (type === 'mobile-app') {
      if (lower.includes('ios') || lower.includes('iphone')) return 'ios';
      if (lower.includes('android')) return 'android';
      return 'cross-platform';
    }
    return 'web';
  };

  const getTechStack = (type: string, platform: string): string[] => {
    const baseStack = ['React', 'TypeScript', 'Tailwind CSS'];
    
    switch (type) {
      case 'website':
        return [...baseStack, 'Vite', 'Supabase'];
      case 'desktop-app':
        return platform === 'cross-platform' 
          ? [...baseStack, 'Electron', 'Node.js']
          : [...baseStack, platform === 'mac' ? 'Swift' : platform === 'windows' ? 'C#/.NET' : 'C++/Qt'];
      case 'mobile-app':
        return platform === 'cross-platform'
          ? ['React Native', 'TypeScript', 'Expo']
          : platform === 'ios' ? ['Swift', 'UIKit', 'SwiftUI'] : ['Kotlin', 'Jetpack Compose'];
      case 'cli-tool':
        return ['Node.js', 'TypeScript', 'Commander.js'];
      case 'backend-service':
        return ['Node.js', 'Express', 'TypeScript', 'Supabase'];
      default:
        return baseStack;
    }
  };

  const extractProjectName = (prompt: string): string => {
    const keywords = prompt.toLowerCase().match(/(?:build|create|make)\s+(?:a|an)?\s*([^,.!?]+)/);
    return keywords ? keywords[1].trim() : 'New Project';
  };

  const handleDownloadZip = (project: Project) => {
    if (project.zipUrl) {
      window.open(project.zipUrl, '_blank');
    }
  };

  const handleDownloadInstaller = (project: Project, platform: string) => {
    const url = project.installerUrls?.[platform as keyof typeof project.installerUrls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: "Project Deleted",
      description: "Project has been removed from your list.",
    });
  };

  const handleEditProject = (project: Project) => {
    // Navigate to studio page
    window.location.href = `/studio/${project.id}`;
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

  const renderProjectCard = (project: Project) => (
    <Card key={project.id} className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold">{project.name}</h4>
            <Badge variant="outline">{project.type}</Badge>
            <Badge variant="secondary">{project.platform}</Badge>
          </div>
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
          <div className="flex flex-wrap gap-1 mb-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => handleEditProject(project)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit in Studio
        </Button>
        {project.url && (
          <Button size="sm" variant="outline" onClick={() => window.open(project.url, '_blank')}>
            <Globe className="w-4 h-4 mr-1" />
            Live Site
          </Button>
        )}
        {project.githubUrl && (
          <Button size="sm" variant="outline" onClick={() => window.open(project.githubUrl, '_blank')}>
            <Github className="w-4 h-4 mr-1" />
            GitHub
          </Button>
        )}
        {project.zipUrl && (
          <Button size="sm" variant="outline" onClick={() => handleDownloadZip(project)}>
            <Download className="w-4 h-4 mr-1" />
            ZIP
          </Button>
        )}
        {project.installerUrls?.windows && (
          <Button size="sm" variant="outline" onClick={() => handleDownloadInstaller(project, 'windows')}>
            <Package className="w-4 h-4 mr-1" />
            Windows
          </Button>
        )}
        {project.installerUrls?.mac && (
          <Button size="sm" variant="outline" onClick={() => handleDownloadInstaller(project, 'mac')}>
            <Package className="w-4 h-4 mr-1" />
            macOS
          </Button>
        )}
        {project.installerUrls?.linux && (
          <Button size="sm" variant="outline" onClick={() => handleDownloadInstaller(project, 'linux')}>
            <Package className="w-4 h-4 mr-1" />
            Linux
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  const renderProjects = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Management</h3>
        <Badge variant="secondary">{projects.length} Projects</Badge>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No projects generated yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(renderProjectCard)}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Code className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Meta-Developer Agent</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform natural language into production-ready software projects. Create websites, desktop apps, mobile apps, CLI tools, and backend services with full export capabilities.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'chat' | 'build' | 'manual')} className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="build" className="flex items-center space-x-2">
              <Rocket className="w-4 h-4" />
              <span>Build</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Manual Mode Project Configuration */}
      {mode === 'manual' && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Project Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Type</label>
              <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions[selectedProjectType as keyof typeof platformOptions]?.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Prompt Input */}
      <Card className="p-4">
        <form onSubmit={handlePromptSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === 'chat' ? 'Describe your project idea' : 
               mode === 'manual' ? 'Project description and requirements' :
               'Build your project'}
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'chat' 
                  ? "e.g., I want to build a task management app with team collaboration..."
                  : mode === 'manual'
                  ? "e.g., A modern task manager with drag-and-drop, real-time sync, and team features"
                  : "e.g., Create a desktop music player with playlist management and audio visualization"
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
                Processing Pipeline...
              </>
            ) : (
              <>
                {mode === 'chat' ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Analyze Requirements
                  </>
                ) : mode === 'manual' ? (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Generate & Build
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

      {/* Projects Management */}
      <Card className="p-4">
        {renderProjects()}
      </Card>

      {/* Enhanced Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Cross-Platform Output
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• React websites & web apps</li>
            <li>• Electron desktop applications</li>
            <li>• React Native mobile apps</li>
            <li>• Node.js CLI tools & services</li>
            <li>• Native platform builds</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Export & Distribution
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ZIP source code downloads</li>
            <li>• Windows .exe/.msi installers</li>
            <li>• macOS .dmg/.pkg packages</li>
            <li>• Linux .AppImage/.deb files</li>
            <li>• GitHub repository sync</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Full-Stack Integration
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Supabase backend & auth</li>
            <li>• Real-time database sync</li>
            <li>• File storage & CDN</li>
            <li>• Edge functions & APIs</li>
            <li>• Custom domain deployment</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}