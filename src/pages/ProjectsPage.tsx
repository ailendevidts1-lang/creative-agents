import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Settings, Play, Eye } from "lucide-react";

export function ProjectsPage() {
  const projects = [
    {
      id: "1",
      name: "AI Voice Assistant",
      type: "AI Assistant",
      status: "In Development",
      progress: 75,
      lastModified: "2 hours ago"
    },
    {
      id: "2", 
      name: "Trading Bot Platform",
      type: "Automation Tool",
      status: "Testing",
      progress: 90,
      lastModified: "1 day ago"
    },
    {
      id: "3",
      name: "Custom Linux OS",
      type: "Operating System", 
      status: "Planning",
      progress: 25,
      lastModified: "3 days ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Testing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Planning": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted/20 text-muted-foreground border-border/30";
    }
  };

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
          {projects.map((project) => (
            <Card key={project.id} className="ai-card group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:glow transition-all duration-300">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{project.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Last Modified */}
                <p className="text-xs text-muted-foreground">
                  Last modified: {project.lastModified}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
    </div>
  );
}