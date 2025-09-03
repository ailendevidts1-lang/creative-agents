import React from "react";
import { ArrowLeft, Timer, Cloud, Calculator, Calendar, MessageSquare, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SkillsScreenProps {
  onBack: () => void;
}

export function SkillsScreen({ onBack }: SkillsScreenProps) {
  const coreSkills = [
    { id: "timers", name: "Timers & Alarms", icon: Timer, description: "Set timers and alarms with voice commands" },
    { id: "weather", name: "Weather", icon: Cloud, description: "Get current weather and forecasts" },
    { id: "calculations", name: "Calculations", icon: Calculator, description: "Perform math calculations and conversions" },
    { id: "calendar", name: "Calendar", icon: Calendar, description: "Manage your calendar and events" },
    { id: "messaging", name: "Messaging", icon: MessageSquare, description: "Send messages and communicate" },
    { id: "homekit", name: "Smart Home", icon: Home, description: "Control HomeKit and Matter devices" },
  ];

  const superSkill = {
    id: "social-manager",
    name: "Social Manager + Viral Factory",
    icon: Zap,
    description: "Advanced social media management with AI-powered content creation",
    features: [
      "Account management (up to 500 accounts)",
      "Trend analysis and monitoring",
      "AI content ideation and scripting",
      "Video assembly and preview",
      "Approval workbench",
      "Automated scheduling and posting",
      "Performance analytics"
    ]
  };

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
          <h1 className="text-2xl font-bold">Skills & Capabilities</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Core Skills */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Core Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coreSkills.map((skill) => {
                const Icon = skill.icon;
                return (
                  <Card key={skill.id} className="glass-panel border-border/30 hover:neon-glow luxury-transition cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{skill.name}</h3>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Super Skill */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Super Skill</h2>
            <Card className="glass-panel border-primary/30 hover:neon-glow luxury-transition">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{superSkill.name}</h3>
                    <p className="text-muted-foreground mb-4">{superSkill.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Key Features:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {superSkill.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}