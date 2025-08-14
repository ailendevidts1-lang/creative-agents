import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectPlan } from '@/agents/types';
import { 
  ArrowLeft, 
  Palette, 
  Code, 
  Database, 
  Layers, 
  Clock, 
  Target,
  Rocket
} from 'lucide-react';

interface ProjectDetailsProps {
  project: ProjectPlan;
  onBack: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Badge variant="outline" className="mt-1">
            {project.requirements.type.replace('-', ' ')}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tech">Tech Stack</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{project.requirements.description}</p>
              </div>

              {project.requirements.features && project.requirements.features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Core Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.requirements.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.requirements.platforms && (
                <div>
                  <h4 className="font-semibold mb-2">Target Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.requirements.platforms.map((platform, index) => (
                      <Badge key={index} variant="outline">{platform}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Deployment Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.deploymentTargets.map((target, index) => (
                  <Badge key={index} variant="default">{target}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.techStack.frontend && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Frontend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.techStack.frontend.map((tech, index) => (
                      <Badge key={index} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.techStack.backend && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.techStack.backend.map((tech, index) => (
                      <Badge key={index} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.techStack.database && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.techStack.database.map((tech, index) => (
                      <Badge key={index} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.techStack.ai && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    AI & ML
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.techStack.ai.map((tech, index) => (
                      <Badge key={index} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          {project.designSystem ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme & Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Theme</h4>
                    <Badge variant="outline">{project.designSystem.theme}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Color Palette</h4>
                    <div className="flex gap-2">
                      {project.designSystem.colorPalette.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Typography & Accessibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Font Stack</h4>
                    <div className="space-y-1">
                      {project.designSystem.typography.map((font, index) => (
                        <Badge key={index} variant="secondary">{font}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Accessibility Features</h4>
                    <div className="space-y-1">
                      {project.designSystem.accessibility.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No design system required for this project type.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                System Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Architecture Pattern</h4>
                <Badge variant="default">{project.architecture.pattern}</Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">System Modules</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.architecture.modules.map((module, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <span className="font-medium">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">API Endpoints</h4>
                <div className="space-y-2">
                  {project.architecture.apis.map((api, index) => (
                    <code key={index} className="block p-2 bg-secondary rounded text-sm">
                      {api}
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Development Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Total Estimated Time</h4>
                <Badge variant="default" className="text-lg">{project.timeline.estimated}</Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Development Phases</h4>
                <div className="space-y-4">
                  {project.timeline.phases.map((phase, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold">{phase.name}</h5>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                      <div className="space-y-1">
                        {phase.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="text-sm text-muted-foreground">
                            • {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button className="flex-1">
          <Code className="h-4 w-4 mr-2" />
          Generate Code
        </Button>
        <Button variant="outline" className="flex-1">
          <Rocket className="h-4 w-4 mr-2" />
          Deploy Project
        </Button>
      </div>
    </div>
  );
};