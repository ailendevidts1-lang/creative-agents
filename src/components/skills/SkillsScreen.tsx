import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, StickyNote, Cloud, Search, Calculator, MessageSquare, Smartphone, Code, Calendar, FolderOpen, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TimerSkill } from "./TimerSkill";
import { NotesSkill } from "./NotesSkill";
import { WeatherSkill } from "./WeatherSkill";
import { SearchSkill } from "./SearchSkill";
import { PromptToCodeSkill } from "./PromptToCodeSkill";
import { useSkillGeneration, ComingSoonSkill } from "@/hooks/useSkillGeneration";
import { toast } from "sonner";

interface SkillsScreenProps {
  onBack: () => void;
}

export function SkillsScreen({ onBack }: SkillsScreenProps) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [comingSoonSkills, setComingSoonSkills] = useState<ComingSoonSkill[]>([]);
  const { 
    isGenerating, 
    generationProgress, 
    generateSkillFromPrompt, 
    getDefaultComingSoonSkills 
  } = useSkillGeneration();

  useEffect(() => {
    // Initialize coming soon skills
    setComingSoonSkills(getDefaultComingSoonSkills());
  }, []);

  const coreSkills = [
    {
      id: "prompt-to-code",
      icon: Code,
      name: "⚙️ Prompt-to-Code System",
      description: "Transform natural language into production-ready software projects",
      color: "text-primary",
      bgColor: "bg-gradient-to-br from-primary/20 to-accent/20",
      component: PromptToCodeSkill
    },
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

  const iconMap = {
    Calculator,
    MessageSquare,
    Smartphone,
    Calendar,
    FolderOpen,
    Code,
    Clock,
    StickyNote,
    Cloud,
    Search
  };

  const handleGenerateSkill = async (skill: ComingSoonSkill) => {
    if (isGenerating) {
      toast.error('Already generating a skill. Please wait...');
      return;
    }

    const success = await generateSkillFromPrompt(skill);
    if (success) {
      // Remove the skill from coming soon and add to core skills
      setComingSoonSkills(prev => prev.filter(s => s.id !== skill.id));
      
      // Add new placeholder skills
      const newSkills = generateNewComingSoonSkills();
      setTimeout(() => {
        setComingSoonSkills(prev => [...prev, ...newSkills]);
      }, 2000);
    }
  };

  const generateNewComingSoonSkills = (): ComingSoonSkill[] => {
    const additionalSkills = [
      {
        id: 'email-manager',
        name: 'Email Manager',
        description: 'Compose, send, and organize emails',
        icon: 'Mail',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        id: 'password-manager',
        name: 'Password Manager',
        description: 'Secure password generation and storage',
        icon: 'Key',
        color: 'text-accent',
        bgColor: 'bg-accent/10'
      }
    ];
    
    return additionalSkills.slice(0, 1); // Add one new skill at a time
  };

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
            {/* Generation Progress */}
            {isGenerating && generationProgress && (
              <Card className="glass-panel p-6 border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="font-medium">Generating Skill...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{generationProgress.step}</span>
                      <span className="text-primary">{generationProgress.progress}%</span>
                    </div>
                    <Progress value={generationProgress.progress} className="h-2" />
                  </div>
                </div>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {comingSoonSkills.map((skill, index) => {
                const IconComponent = iconMap[skill.icon as keyof typeof iconMap] || Code;
                return (
                  <Card 
                    key={skill.id} 
                    className={`glass-panel p-6 transition-all duration-200 cursor-pointer group ${
                      isGenerating 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-primary/30 hover:bg-primary/5'
                    }`}
                    onClick={() => !isGenerating && handleGenerateSkill(skill)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-2xl ${skill.bgColor} transition-all duration-200 ${
                        !isGenerating && 'group-hover:scale-105'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${skill.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          {skill.name}
                          {!isGenerating && (
                            <Zap className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {isGenerating ? 'Generating...' : 'Generate Now'}
                          </span>
                          {!isGenerating && (
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to generate
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {comingSoonSkills.length === 0 && !isGenerating && (
              <Card className="glass-panel p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">All Skills Generated!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've generated all available skills. New skills will be added over time.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}