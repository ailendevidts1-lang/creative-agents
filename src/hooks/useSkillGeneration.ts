import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ComingSoonSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  prompt?: string;
}

export interface GeneratedSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  component: string;
  code: string;
  created_at: string;
}

export function useSkillGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    step: string;
    progress: number;
  } | null>(null);

  const generateSkillFromPrompt = async (skill: ComingSoonSkill): Promise<boolean> => {
    setIsGenerating(true);
    setGenerationProgress({ step: 'Initializing skill generation...', progress: 10 });

    try {
      // Step 1: Create the skill prompt
      const skillPrompt = createSkillPrompt(skill);
      setGenerationProgress({ step: 'Planning skill architecture...', progress: 25 });

      // Step 2: Generate the skill code using AI
      const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-code', {
        body: {
          prompt: skillPrompt,
          type: 'skill',
          framework: 'react-typescript'
        }
      });

      if (codeError) throw codeError;
      setGenerationProgress({ step: 'Generating skill components...', progress: 50 });

      // Step 3: Create the skill component file
      const componentCode = generateSkillComponent(skill, codeData);
      setGenerationProgress({ step: 'Integrating with skills registry...', progress: 75 });

      // Step 4: Save to skills registry
      await saveGeneratedSkill({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        icon: skill.icon,
        color: skill.color,
        bgColor: skill.bgColor,
        component: `${skill.id}Skill`,
        code: componentCode,
        created_at: new Date().toISOString()
      });

      setGenerationProgress({ step: 'Skill generated successfully!', progress: 100 });
      
      // Show success message
      toast.success(`${skill.name} has been generated and added to Core Skills!`);
      
      // Reset progress after a delay
      setTimeout(() => {
        setGenerationProgress(null);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Error generating skill:', error);
      toast.error(`Failed to generate ${skill.name}. Please try again.`);
      setGenerationProgress(null);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const createSkillPrompt = (skill: ComingSoonSkill): string => {
    return `Create a React TypeScript skill component for "${skill.name}".

Description: ${skill.description}

Requirements:
1. Create a functional React component that implements the skill functionality
2. Use modern React hooks (useState, useEffect, etc.)
3. Integrate with Supabase for data persistence if needed
4. Use the existing UI components from @/components/ui/*
5. Follow the same patterns as other skills in the system
6. Include proper error handling and loading states
7. Use the useSkills hook for data operations if applicable
8. Make it responsive and accessible

The component should export as: export function ${skill.id.charAt(0).toUpperCase() + skill.id.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Skill()

Return only the component code without any explanations or markdown formatting.`;
  };

  const generateSkillComponent = (skill: ComingSoonSkill, aiCode: any): string => {
    const componentName = skill.id.charAt(0).toUpperCase() + skill.id.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    // If AI returned code, use it; otherwise create a basic template
    if (aiCode?.code) {
      return aiCode.code;
    }

    // Fallback template
    return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function ${componentName}Skill() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      // Implement skill functionality here
      toast.success('${skill.name} action completed!');
    } catch (error) {
      toast.error('Failed to perform action');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">${skill.name}</h2>
        <p className="text-muted-foreground">${skill.description}</p>
      </div>

      <Card className="glass-panel p-6">
        <div className="text-center space-y-4">
          <p>This skill has been auto-generated and is ready for use!</p>
          <Button 
            onClick={handleAction}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Use ${skill.name}'}
          </Button>
        </div>
      </Card>
    </div>
  );
}`;
  };

  const saveGeneratedSkill = async (skill: GeneratedSkill): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save to a generated_skills table (we'll need to create this)
      const { error } = await supabase
        .from('generated_skills')
        .upsert({
          id: skill.id,
          user_id: user.id,
          name: skill.name,
          description: skill.description,
          icon: skill.icon,
          color: skill.color,
          bg_color: skill.bgColor,
          component_name: skill.component,
          component_code: skill.code,
          created_at: skill.created_at
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving generated skill:', error);
      throw error;
    }
  };

  const getDefaultComingSoonSkills = (): ComingSoonSkill[] => [
    {
      id: 'conversions-math',
      name: 'Conversions & Math',
      description: 'Unit conversions, calculations, and quick math',
      icon: 'Calculator',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      prompt: 'Create a conversion and math tool with unit conversions, currency exchange, and calculator functionality'
    },
    {
      id: 'messages-calls',
      name: 'Messages & Calls',
      description: 'Send texts and make calls hands-free',
      icon: 'MessageSquare',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      prompt: 'Create a messaging and calling interface that can send SMS and initiate phone calls'
    },
    {
      id: 'smart-home',
      name: 'Smart Home',
      description: 'Control HomeKit and Matter devices',
      icon: 'Smartphone',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      prompt: 'Create a smart home control panel for HomeKit and Matter devices'
    },
    {
      id: 'calendar-events',
      name: 'Calendar & Events',
      description: 'Manage your schedule and create events',
      icon: 'Calendar',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      prompt: 'Create a calendar management system with event creation, scheduling, and reminders'
    },
    {
      id: 'file-manager',
      name: 'File Manager',
      description: 'Organize and manage your files',
      icon: 'FolderOpen',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      prompt: 'Create a file management system with upload, organization, and sharing capabilities'
    }
  ];

  return {
    isGenerating,
    generationProgress,
    generateSkillFromPrompt,
    getDefaultComingSoonSkills
  };
}