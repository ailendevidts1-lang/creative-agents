import React from "react";
import { ArrowLeft, User, Shield, Settings, Link2, Smartphone, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const connectedAccounts = [
    { platform: "Instagram", username: "@yourhandle", status: "connected", accounts: 3 },
    { platform: "TikTok", username: "@yourhandle", status: "connected", accounts: 2 },
    { platform: "Twitter", username: "@yourhandle", status: "connected", accounts: 5 },
    { platform: "YouTube", username: "Your Channel", status: "connected", accounts: 1 },
    { platform: "LinkedIn", username: "Your Name", status: "disconnected", accounts: 0 },
  ];

  const privacySettings = [
    { 
      id: "local-processing",
      title: "Local Processing Only",
      description: "Process voice and text locally when possible",
      enabled: true
    },
    {
      id: "data-retention",
      title: "7-Day Data Retention",
      description: "Automatically delete conversation data after 7 days",
      enabled: true
    },
    {
      id: "web-search",
      title: "Web Search Citations",
      description: "Show sources when using web search results",
      enabled: true
    },
    {
      id: "analytics-tracking",
      title: "Anonymous Analytics",
      description: "Help improve the assistant with anonymous usage data",
      enabled: false
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel border-b border-border/30 p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="metal-highlight rounded-xl hover:neon-glow luxury-transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your accounts, privacy, and preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Profile */}
          <section>
            <Card className="glass-panel border-border/30">
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Your AI Assistant</h2>
                    <p className="text-muted-foreground mb-4">
                      Personal AI assistant with social media management capabilities
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-500/20 text-green-500">Online</Badge>
                      <Badge variant="outline">Premium Features Enabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Connected Accounts */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
            <div className="space-y-3">
              {connectedAccounts.map((account, index) => (
                <Card key={index} className="glass-panel border-border/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Link2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.platform}</h3>
                          <p className="text-sm text-muted-foreground">{account.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {account.accounts > 0 && (
                          <Badge variant="outline">
                            {account.accounts} accounts
                          </Badge>
                        )}
                        <Badge className={
                          account.status === "connected" 
                            ? "bg-green-500/20 text-green-500" 
                            : "bg-yellow-500/20 text-yellow-500"
                        }>
                          {account.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {account.status === "connected" ? "Manage" : "Connect"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <Card className="glass-panel border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Privacy & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {privacySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium">{setting.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                    </div>
                    <Switch checked={setting.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Device Settings */}
          <section>
            <Card className="glass-panel border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>Device & Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium">Microphone Access</h4>
                    <p className="text-sm text-muted-foreground">Required for voice features</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">Granted</Badge>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium">Background Processing</h4>
                    <p className="text-sm text-muted-foreground">Limited by iOS system policies</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500">Restricted</Badge>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium">HomeKit Integration</h4>
                    <p className="text-sm text-muted-foreground">Control smart home devices</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <Key className="w-5 h-5" />
                <span>API Keys</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <Settings className="w-5 h-5" />
                <span>Advanced Settings</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <Eye className="w-5 h-5" />
                <span>Privacy Center</span>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}