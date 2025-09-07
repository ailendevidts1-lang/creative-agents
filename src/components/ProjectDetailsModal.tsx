import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIProject } from "@/types/project";
import { X, Code, Zap, Settings, Clock, Target, Edit } from "lucide-react";

interface ProjectDetailsModalProps {
  project: AIProject | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: AIProject) => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose, onEdit }: ProjectDetailsModalProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{project.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{project.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="mt-1">{project.project_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className="mt-1">{project.metadata?.currentStage || 'Planning'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.requirements.features && project.requirements.features.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Features</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.requirements.features.map((feature, index) => (
                        <Badge key={index} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {project.requirements.platforms && project.requirements.platforms.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Platforms</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.requirements.platforms.map((platform, index) => (
                        <Badge key={index} variant="outline">{platform}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.tech_stack.map((tech, index) => (
                  <div key={index} className="p-3 border border-border/30 rounded-lg">
                    <div className="font-medium">{tech.area}</div>
                    <div className="text-sm text-muted-foreground mt-1">{tech.option}</div>
                    <div className="text-xs text-muted-foreground mt-1">{tech.reason}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Duration</label>
                  <p className="mt-1">{project.timeline.estimated}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phases</label>
                  <div className="space-y-3 mt-2">
                    {project.timeline.phases.map((phase, index) => (
                      <div key={index} className="p-3 border border-border/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{phase.name}</span>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {phase.tasks.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pattern</label>
                  <p className="mt-1 capitalize">{project.architecture.pattern}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Modules</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.architecture.modules.map((module, index) => (
                      <Badge key={index} variant="outline">{module}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">APIs</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.architecture.apis.map((api, index) => (
                      <Badge key={index} variant="outline">{api}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {onEdit && (
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => onEdit(project)}
                className="flex-1 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit in Studio
              </Button>
              <Button variant="outline" className="flex-1 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Generate Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}