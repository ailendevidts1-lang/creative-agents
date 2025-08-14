import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useProjectGeneration } from "@/hooks/useProjectGeneration";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDetails } from "@/components/ProjectDetails";
import VoiceInterface from "@/components/VoiceInterface";
import SystemShowcase from "@/components/SystemShowcase";
import { ProjectPlan } from "@/agents/types";
import { Zap, Cpu, Smartphone, Globe, Bot, Wrench, Shield, Eye, CheckCircle } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectPlan | null>(null);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const { session, projects, isGenerating, generateProject, deleteProject } = useProjectGeneration();

  const projectTypes = [
    { icon: Globe, name: "Web Apps", desc: "SaaS dashboards, e-commerce, social networks" },
    { icon: Smartphone, name: "Mobile Apps", desc: "iOS/Android native or cross-platform" },
    { icon: Cpu, name: "Operating Systems", desc: "Custom Linux distros, embedded OS" },
    { icon: Bot, name: "AI Assistants", desc: "Voice/text AI with memory and tools" },
    { icon: Globe, name: "Websites", desc: "Corporate sites, portfolios, landing pages" },
    { icon: Wrench, name: "Automation Tools", desc: "Trading bots, IoT controllers, workflows" },
  ];

  const pipeline = [
    { name: "Requirements Analysis", agent: "Spec Agent", icon: Eye },
    { name: "Tech Stack Selection", agent: "Tech Inference Agent", icon: Zap },
    { name: "Design System", agent: "Design Agent", icon: Shield },
    { name: "Architecture Planning", agent: "Architecture Agent", icon: Cpu },
    { name: "Code Generation", agent: "Code Agents", icon: Bot },
    { name: "QA & Testing", agent: "QA Agent", icon: Shield },
    { name: "Deployment", agent: "DevOps Agent", icon: Wrench },
    { name: "Monitoring", agent: "Observability Agent", icon: Eye },
  ];

  const handleGenerate = async () => {
    try {
      await generateProject(prompt);
      setPrompt("");
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  const getCurrentStepIndex = () => {
    if (!session) return -1;
    
    switch (session.status) {
      case 'analyzing': return 0;
      case 'planning': return session.currentAgent?.includes('Tech') ? 1 : 
                              session.currentAgent?.includes('Design') ? 2 : 3;
      case 'generating': return 4;
      case 'testing': return 5;
      case 'deploying': return 6;
      case 'completed': return 7;
      default: return -1;
    }
  };

  const getProgressPercentage = () => {
    const currentStep = getCurrentStepIndex();
    return currentStep >= 0 ? ((currentStep + 1) / pipeline.length) * 100 : 0;
  };

  if (selectedProject) {
    return (
      <div className="container mx-auto p-6">
        <ProjectDetails 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Private AI Development System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Turn natural language into production-ready software. Apps, OS, AI Assistants, Websites, Automation Tools — Fully Automatic Pipeline.
          </p>
        </div>

        {/* Project Types */}
        <Card>
          <CardHeader>
            <CardTitle>What Can We Build?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTypes.map((type, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <type.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{type.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="showcase">System Demo</TabsTrigger>
            <TabsTrigger value="generate">Generate Project</TabsTrigger>
            <TabsTrigger value="voice-assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="pipeline">View Pipeline</TabsTrigger>
            <TabsTrigger value="projects">
              Active Projects {projects.length > 0 && `(${projects.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="showcase" className="space-y-6">
            <SystemShowcase />
          </TabsContent>

          <TabsContent value="voice-assistant" className="space-y-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-2 max-w-2xl">
                <h2 className="text-2xl font-bold">AI Development Assistant</h2>
                <p className="text-muted-foreground">
                  Talk to your AI assistant about your projects, get coding help, 
                  architecture advice, and deployment guidance - all through natural conversation.
                </p>
              </div>
              <VoiceInterface onSpeakingChange={setShowVoiceInterface} />
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Examples:&#10;• 'Build me an AI voice assistant that can manage my email, calendar, and control my smart home devices'&#10;• 'Create a trading bot that monitors crypto arbitrage opportunities across multiple exchanges'&#10;• 'Make a custom Linux OS optimized for Raspberry Pi retail kiosks'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="text-base"
                />
                <Button 
                  onClick={handleGenerate} 
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full text-lg py-6"
                >
                  {isGenerating ? "Generating Project..." : "Generate Project"}
                </Button>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {session && isGenerating && (
              <Card>
                <CardHeader>
                  <CardTitle>Generation Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={getProgressPercentage()} className="h-3" />
                  <div className="space-y-3">
                    {pipeline.map((step, index) => {
                      const currentStep = getCurrentStepIndex();
                      const isCompleted = index < currentStep;
                      const isActive = index === currentStep;
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isCompleted ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                            isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                          <div className="flex-1">
                            <span className="font-medium">{step.name}</span>
                            <span className="ml-2 text-sm">({step.agent})</span>
                          </div>
                          {isActive && (
                            <Badge variant="secondary" className="ml-auto">Running</Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="default" className="ml-auto">Complete</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {session.currentAgent && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm font-medium">Current Agent: {session.currentAgent}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Status: {session.status}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {session && session.status === 'completed' && session.plan && (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Project Generated Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600 dark:text-green-400">
                    Your {session.plan.name} has been generated and added to your projects.
                    Check the "Active Projects" tab to view details and start development.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Agent Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pipeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{step.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Handled by {step.agent}
                        </p>
                        <p className="text-sm mt-2">
                          {step.name === "Requirements Analysis" && "Extracts detailed requirements, user flows, performance targets"}
                          {step.name === "Tech Stack Selection" && "Chooses optimal technologies based on project requirements"}
                          {step.name === "Design System" && "Creates style tokens, typography, accessibility rules"}
                          {step.name === "Architecture Planning" && "Defines system structure, API design, database schemas"}
                          {step.name === "Code Generation" && "Produces production-ready code modules"}
                          {step.name === "QA & Testing" && "Tests for functionality, performance, security vulnerabilities"}
                          {step.name === "Deployment" && "Handles CI/CD, packaging, and deployment to target platforms"}
                          {step.name === "Monitoring" && "Sets up logging, metrics, and observability"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onView={setSelectedProject}
                    onDelete={deleteProject}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first project to get started with the AI development system.
                  </p>
                  <Button onClick={() => (document.querySelector('[value="generate"]') as HTMLElement)?.click()}>
                    Create First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}