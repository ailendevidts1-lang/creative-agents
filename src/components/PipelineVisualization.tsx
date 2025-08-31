import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Zap, 
  Layers, 
  Code, 
  TestTube, 
  Wrench, 
  CheckCircle,
  Loader2
} from "lucide-react";

interface PipelineVisualizationProps {
  currentStep: string | null;
  isActive: boolean;
}

export function PipelineVisualization({ currentStep, isActive }: PipelineVisualizationProps) {
  const stages = [
    { 
      id: "Analysis", 
      name: "Infinite Interpretation", 
      icon: Eye,
      description: "Deep semantic analysis and requirements extraction"
    },
    { 
      id: "Architecture", 
      name: "Autonomous Architecture", 
      icon: Layers,
      description: "System design and architectural planning"
    },
    { 
      id: "Generation", 
      name: "Batch Evolution", 
      icon: Code,
      description: "Iterative code generation by AI swarms"
    },
    { 
      id: "Testing", 
      name: "Sandbox Intelligence", 
      icon: TestTube,
      description: "Automated testing and quality assurance"
    },
    { 
      id: "Fixing", 
      name: "Self-Repair", 
      icon: Wrench,
      description: "Autonomous bug detection and fixing"
    },
    { 
      id: "Delivery", 
      name: "Final Assembly", 
      icon: Zap,
      description: "Production-ready system delivery"
    }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.id === currentStep);
  };

  const getProgress = () => {
    if (!currentStep) return 0;
    const currentIndex = getCurrentStageIndex();
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Pipeline Progress</span>
          <span className="text-muted-foreground">{Math.round(getProgress())}%</span>
        </div>
        <Progress value={getProgress()} className="h-3 glow" />
      </div>

      {/* Stage Visualization */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isCompleted = getCurrentStageIndex() > index;
          const isActive = stage.id === currentStep;
          const IconComponent = stage.icon;

          return (
            <div 
              key={stage.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isCompleted 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : isActive 
                    ? 'bg-primary/10 border border-primary/20 glow' 
                    : 'bg-muted/10 border border-border/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-500/20 text-green-400'
                  : isActive 
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted/20 text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`font-semibold ${
                    isCompleted ? 'text-green-400' : isActive ? 'text-primary' : 'text-foreground'
                  }`}>
                    {stage.name}
                  </h4>
                  {isActive && (
                    <Badge variant="secondary" className="animate-pulse">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Running
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </div>

              {/* Progress indicator for active stage */}
              {isActive && (
                <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse-glow rounded-full w-3/4"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status */}
      {isActive && currentStep && (
        <div className="ai-card p-4 glow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-medium">Currently executing: {currentStep}</p>
              <p className="text-sm text-muted-foreground">
                AI agents are working on your project...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}