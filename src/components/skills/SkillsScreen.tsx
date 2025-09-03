import React, { useState } from "react";
import { ArrowLeft, Clock, StickyNote, Cloud, Search, Calculator, MessageSquare, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerSkill } from "./TimerSkill";
import { NotesSkill } from "./NotesSkill";
import { WeatherSkill } from "./WeatherSkill";
import { SearchSkill } from "./SearchSkill";

interface SkillsScreenProps {
  onBack: () => void;
}

export function SkillsScreen({ onBack }: SkillsScreenProps) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const coreSkills = [
    {
      id: "timers",
      icon: Clock,
      name: "Timers & Alarms",
      description: "Set cooking timers, reminders, and countdown timers",
      color: "text-primary",
      bgColor: "bg-primary/10",
      component: TimerSkill
    },
    {
      id: "notes",
      icon: StickyNote,
      name: "Notes",
      description: "Quick notes, reminders, and voice memos",
      color: "text-accent",
      bgColor: "bg-accent/10",
      component: NotesSkill
    },
    {
      id: "weather",
      icon: Cloud,
      name: "Weather",
      description: "Current conditions and forecasts",
      color: "text-primary",
      bgColor: "bg-primary/10",
      component: WeatherSkill
    },
    {
      id: "search",
      icon: Search,
      name: "Search & Q&A",
      description: "Web search and AI-powered answers",
      color: "text-accent",
      bgColor: "bg-accent/10",
      component: SearchSkill
    }
  ];

  const comingSoonSkills = [
    {
      icon: Calculator,
      name: "Conversions & Math",
      description: "Unit conversions, calculations, and quick math",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: MessageSquare,
      name: "Messages & Calls", 
      description: "Send texts and make calls hands-free",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Smartphone,
      name: "Smart Home",
      description: "Control HomeKit and Matter devices",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  if (activeSkill) {
    const skill = coreSkills.find(s => s.id === activeSkill);
    if (skill) {
      const SkillComponent = skill.component;
      return (
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="flex items-center p-6 glass-panel border-b border-border/50">
            <Button
              onClick={() => setActiveSkill(null)}
              variant="ghost"
              size="sm"
              className="mr-4 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Skills
            </Button>
          </div>

          {/* Skill Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <SkillComponent />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center p-6 glass-panel border-b border-border/50">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="mr-4 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Skills</h1>
          <p className="text-muted-foreground text-sm">
            Your AI assistant capabilities
          </p>
        </div>
      </div>

      {/* Skills Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-panel">
            <TabsTrigger value="core">Core Skills</TabsTrigger>
            <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {coreSkills.map((skill) => (
                <Card 
                  key={skill.id} 
                  className="glass-panel p-6 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                  onClick={() => setActiveSkill(skill.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-2xl ${skill.bgColor}`}>
                      <skill.icon className={`w-6 h-6 ${skill.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-2">{skill.name}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="coming-soon" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {comingSoonSkills.map((skill, index) => (
                <Card key={index} className="glass-panel p-6 opacity-60">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-2xl ${skill.bgColor}`}>
                      <skill.icon className={`w-6 h-6 ${skill.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-2">{skill.name}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/20 text-muted-foreground">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}