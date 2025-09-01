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

interface HomePageProps {
  onNavigateToStudio?: (projectId: string) => void;
}

export function HomePage({ onNavigateToStudio }: HomePageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { createProject, isCreating } = useProjects();


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
        // Navigate to studio after a brief delay
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep(null);
          setGenerationProgress(0);
          onNavigateToStudio?.(project.id);
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

    </div>
  );
}