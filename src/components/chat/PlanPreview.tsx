import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Settings, Search, Code, AlertTriangle } from "lucide-react";
import { Plan, PlanStep } from "@/services/pipeline/types";

interface PlanPreviewProps {
  plan: Plan;
  onApprove: () => void;
  onReject: () => void;
  isExecuting?: boolean;
}

export function PlanPreview({ plan, onApprove, onReject, isExecuting = false }: PlanPreviewProps) {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'skill':
        return Settings;
      case 'api':
        return Code;
      case 'search':
        return Search;
      case 'computation':
        return Code;
      default:
        return Settings;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'skill':
        return 'blue';
      case 'api':
        return 'green';
      case 'search':
        return 'purple';
      case 'computation':
        return 'amber';
      default:
        return 'gray';
    }
  };

  return (
    <Card className="glass-panel border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Execution Plan Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">{plan.summary}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            ~{Math.round(plan.estimatedDuration / 1000)}s
          </Badge>
          <Badge variant="outline" className="text-xs">
            {plan.steps.length} step{plan.steps.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Plan Steps */}
        <div className="space-y-3">
          {plan.steps.map((step, index) => {
            const Icon = getStepIcon(step.type);
            const color = getStepColor(step.type);
            
            return (
              <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={`w-8 h-8 rounded-full bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 text-${color}-500`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Step {index + 1}: {step.action.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {step.type}
                    </Badge>
                  </div>
                  
                  {Object.keys(step.parameters).length > 0 && (
                    <div className="mt-2">
                      <details className="cursor-pointer">
                        <summary className="text-xs text-muted-foreground hover:text-foreground">
                          Parameters ({Object.keys(step.parameters).length})
                        </summary>
                        <div className="mt-2 text-xs bg-background/50 rounded p-2">
                          <pre className="overflow-x-auto">
                            {JSON.stringify(step.parameters, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                  
                  {step.dependencies.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">
                        Depends on: {step.dependencies.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        {!isExecuting && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onReject}
              size="sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={onApprove}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Execute Plan
            </Button>
          </div>
        )}
        
        {isExecuting && (
          <div className="flex items-center justify-center gap-2 py-4 border-t">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Executing plan...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}