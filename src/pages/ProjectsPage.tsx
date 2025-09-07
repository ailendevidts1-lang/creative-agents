import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { AIProject } from "@/types/project";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, Settings, Play, Eye, Trash2, Loader2 } from "lucide-react";

interface ProjectsPageProps {
  onNavigateToStudio?: (projectId: string) => void;
}

export function ProjectsPage({ onNavigateToStudio }: ProjectsPageProps) {
  const navigate = useNavigate();
  const { projects, isLoading, deleteProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjectId(projectId);
    const success = await deleteProject(projectId);
    setDeletingProjectId(null);
  };

  const getStatusColor = (stage?: string) => {
    switch (stage) {
      case "Development": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Testing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Planning": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted/20 text-muted-foreground border-border/30";
    }
  };

  const getProjectTypeIcon = (type: string) => {
    return FolderOpen; // You can expand this with specific icons per type
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Projecten</h1>
          <p className="text-muted-foreground">
            Overzicht van al je actieve AI-gegenereerde projecten
          </p>
        </div>
        <Button className="glow">
          <Plus className="w-4 h-4 mr-2" />
          Nieuw Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const IconComponent = getProjectTypeIcon(project.project_type);
            const progress = project.metadata?.progress || 0;
            const currentStage = project.metadata?.currentStage || 'Planning';
            
            return (
              <Card key={project.id} className="ai-card group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:glow transition-all duration-300">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{project.project_type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(currentStage)}>
                      {currentStage}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  {/* Last Modified */}
                  <p className="text-xs text-muted-foreground">
                    Created: {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/studio/${project.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Open Studio
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deletingProjectId === project.id}
                    >
                      {deletingProjectId === project.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="ai-card">
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Geen projecten gevonden</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start je eerste project door een beschrijving te geven van wat je wilt bouwen.
            </p>
            <Button className="glow">
              <Plus className="w-4 h-4 mr-2" />
              Eerste Project Maken
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}