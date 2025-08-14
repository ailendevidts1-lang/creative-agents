import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectPlan } from '@/agents/types';
import { ExternalLink, Code, Trash2, Calendar, Cpu } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectPlan;
  onView: (project: ProjectPlan) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onView, onDelete }) => {
  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'web-app': return '🌐';
      case 'mobile-app': return '📱';
      case 'operating-system': return '💻';
      case 'ai-assistant': return '🤖';
      case 'website': return '🔗';
      case 'automation-tool': return '⚙️';
      default: return '📦';
    }
  };

  const getTechStackSummary = () => {
    const allTech = [
      ...(project.techStack.frontend || []),
      ...(project.techStack.backend || []),
      ...(project.techStack.ai || []),
      ...(project.techStack.system || [])
    ];
    return allTech.slice(0, 3);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getProjectTypeIcon(project.requirements.type)}</span>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {project.requirements.type.replace('-', ' ')}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.requirements.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {getTechStackSummary().map((tech, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {getTechStackSummary().length < [
            ...(project.techStack.frontend || []),
            ...(project.techStack.backend || []),
            ...(project.techStack.ai || []),
            ...(project.techStack.system || [])
          ].length && (
            <Badge variant="secondary" className="text-xs">
              +{[
                ...(project.techStack.frontend || []),
                ...(project.techStack.backend || []),
                ...(project.techStack.ai || []),
                ...(project.techStack.system || [])
              ].length - getTechStackSummary().length} more
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {project.timeline.estimated}
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="h-4 w-4" />
            {project.architecture.pattern}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onView(project)} className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" className="flex-1">
            <Code className="h-4 w-4 mr-2" />
            Generate Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};