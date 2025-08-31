import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Brain, 
  Zap, 
  Shield, 
  Monitor, 
  Bell,
  Palette,
  Globe
} from "lucide-react";

export function SettingsPage() {
  const aiAgents = [
    { name: "Requirements Agent", status: "Active", efficiency: 98 },
    { name: "Architecture Agent", status: "Active", efficiency: 95 },
    { name: "Code Generation Agent", status: "Active", efficiency: 97 },
    { name: "QA Agent", status: "Active", efficiency: 92 },
    { name: "Deployment Agent", status: "Active", efficiency: 89 },
    { name: "Monitoring Agent", status: "Standby", efficiency: 85 }
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Instellingen</h1>
        <p className="text-muted-foreground">
          Configureer je AI Hyper-Engine en beheer systeem voorkeuren
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Agent Status */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-primary" />
              AI Agent Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.status === "Active" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                  }`} />
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Efficiency: {agent.efficiency}%
                    </p>
                  </div>
                </div>
                <Badge variant={agent.status === "Active" ? "default" : "secondary"}>
                  {agent.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              Systeem Voorkeuren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Auto-optimization</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically optimize generated code
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Security Scanning</p>
                    <p className="text-sm text-muted-foreground">
                      Enable automated security checks
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Real-time Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about project updates
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Performance Monitoring</p>
                    <p className="text-sm text-muted-foreground">
                      Monitor system performance
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-primary" />
              Interface Instellingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    Dark Mode
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    Light Mode
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <select className="bg-background border border-border rounded-md px-3 py-1 text-sm">
                    <option>Nederlands</option>
                    <option>English</option>
                    <option>Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-primary" />
              Systeem Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">v2.1.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="font-medium">2 days ago</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="font-medium">3</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="font-medium">2.4 GB</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/30">
              <Button variant="outline" size="sm" className="w-full">
                Check for Updates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}