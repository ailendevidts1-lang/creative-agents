import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptInterface } from "@/components/PromptInterface";
import { FileUpload } from "@/components/FileUpload";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { useProjects } from "@/hooks/useProjects";
import { 
  Brain, 
  Zap, 
  Smartphone, 
  Globe, 
  Bot, 
  Wrench, 
  Monitor,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { createProject, isCreating } = useProjects();

  const capabilities = [
    { icon: Globe, title: "Web Applications", desc: "SaaS platforms, e-commerce, social networks" },
    { icon: Smartphone, title: "Mobile Apps", desc: "Native iOS/Android, cross-platform solutions" },
    { icon: Monitor, title: "Operating Systems", desc: "Custom Linux distros, embedded systems" },
    { icon: Bot, title: "AI Assistants", desc: "Voice/text AI with memory and reasoning" },
    { icon: Wrench, title: "Automation Tools", desc: "Trading bots, IoT controllers, workflows" },
    { icon: Brain, title: "AI Swarms", desc: "Multi-agent systems, distributed intelligence" },
  ];

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setCurrentStep("Analysis");
    setGenerationProgress(0);
    
    // Simulate pipeline stages with real project creation
    const stages = [
      "Infinite Interpretation", 
      "Autonomous Architecture", 
      "Batch Evolution", 
      "Sandbox Intelligence", 
      "Self-Repair", 
      "Final Assembly"
    ];
    
    try {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setCurrentStep(stage);
        setGenerationProgress(((i + 1) / stages.length) * 100);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Create the actual project in the database
      const project = await createProject(prompt);
      
      if (project) {
        setCurrentStep("Completed");
        // Reset after showing completion
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep(null);
          setGenerationProgress(0);
        }, 2000);
      } else {
        throw new Error("Failed to create project");
      }
      
    } catch (error) {
      console.error("Generation failed:", error);
      setIsGenerating(false);
      setCurrentStep(null);
      setGenerationProgress(0);
    }
  };

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // Handle file processing
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="relative">
          <h1 className="text-6xl font-bold gradient-text mb-4 animate-float">
            AI Hyper-Engine
          </h1>
          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/30 animate-pulse-glow"></div>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Transform pure human imagination into complete digital realities. 
          From simple utilities to planet-scale ecosystems and entire operating systems — 
          your ideas become production-ready systems through autonomous AI engineering.
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Self-Optimizing
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Batch Evolution
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            Autonomous Testing
          </Badge>
        </div>
      </div>

      {/* Capabilities Grid */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            What Can We Build?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <div key={index} className="ai-card group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:glow transition-all duration-300">
                    <capability.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{capability.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {capability.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prompt Interface */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" />
              Describe Your Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PromptInterface 
              onSubmit={handlePromptSubmit}
              isGenerating={isGenerating || isCreating}
            />
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-primary" />
              Upload Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload 
              onUpload={handleFileUpload}
              acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.png', '.py', '.js', '.ts']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      {(isGenerating || isCreating) && (
        <Card className="ai-card glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
              AI Engineering Pipeline Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineVisualization 
              currentStep={currentStep}
              isActive={isGenerating || isCreating}
              progress={generationProgress}
            />
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            How the Magic Happens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Infinite Interpretation", desc: "Deep semantic analysis maps your idea to optimal system design" },
              { title: "Autonomous Architecture", desc: "AI acts like a full engineering department designing scalable systems" },
              { title: "Batch Evolution", desc: "Code evolves through iterative swarms of specialized AI engineers" },
              { title: "Self-Repair & Delivery", desc: "Autonomous testing, debugging, and production-ready delivery" }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="pipeline-stage">
                  <h4 className="font-semibold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute -right-8 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary/60" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}