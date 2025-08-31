import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  AIProject, 
  ProjectRequirements, 
  TechStack, 
  DesignSystem, 
  Architecture, 
  Timeline, 
  ProjectMetadata 
} from '@/types/project';
import { useToast } from '@/hooks/use-toast';

// Database types (Supabase uses Json type for JSON columns)
interface DatabaseProject {
  id: string;
  name: string;
  description: string;
  project_type: string;
  requirements: any; // JSON type from Supabase
  tech_stack: any; // JSON type from Supabase
  design_system?: any; // JSON type from Supabase
  architecture: any; // JSON type from Supabase
  timeline: any; // JSON type from Supabase
  deployment_targets: string[];
  metadata?: any; // JSON type from Supabase
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Load projects from database
  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database projects to AIProject type
      const transformedProjects: AIProject[] = (data || []).map(dbProject => ({
        ...dbProject,
        requirements: (dbProject.requirements as unknown) as ProjectRequirements,
        tech_stack: (dbProject.tech_stack as unknown) as TechStack[],
        design_system: (dbProject.design_system as unknown) as DesignSystem | undefined,
        architecture: (dbProject.architecture as unknown) as Architecture,
        timeline: (dbProject.timeline as unknown) as Timeline,
        metadata: (dbProject.metadata as unknown) as ProjectMetadata | undefined
      }));

      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error Loading Projects",
        description: "Failed to load your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new project
  const createProject = async (prompt: string): Promise<AIProject | null> => {
    setIsCreating(true);
    
    try {
      // Generate project data from prompt
      const projectData = await generateProjectFromPrompt(prompt);
      
      // Transform to database format - keep types simple for database
      const dbProjectData = {
        name: projectData.name,
        description: projectData.description,
        project_type: projectData.project_type,
        requirements: projectData.requirements,
        tech_stack: projectData.tech_stack,
        architecture: projectData.architecture,
        timeline: projectData.timeline,
        deployment_targets: projectData.deployment_targets,
        design_system: projectData.design_system,
        metadata: projectData.metadata
      };
      
      const { data, error } = await supabase
        .from('ai_projects')
        .insert([dbProjectData as any]) // Cast to any to bypass type issues
        .select()
        .single();

      if (error) throw error;

      // Transform back to AIProject type
      const transformedProject: AIProject = {
        ...data,
        requirements: (data.requirements as unknown) as ProjectRequirements,
        tech_stack: (data.tech_stack as unknown) as TechStack[],
        design_system: (data.design_system as unknown) as DesignSystem | undefined,
        architecture: (data.architecture as unknown) as Architecture,
        timeline: (data.timeline as unknown) as Timeline,
        metadata: (data.metadata as unknown) as ProjectMetadata | undefined
      };

      // Add to local state
      setProjects(prev => [transformedProject, ...prev]);
      
      toast({
        title: "Project Created Successfully!",
        description: `${transformedProject.name} has been created and saved.`,
      });

      return transformedProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error Creating Project",
        description: "Failed to create your project. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Update project
  const updateProject = async (id: string, updates: Partial<AIProject>): Promise<boolean> => {
    try {
      // Transform updates to database format - keep simple
      const dbUpdates = {
        name: updates.name,
        description: updates.description,
        project_type: updates.project_type,
        requirements: updates.requirements,
        tech_stack: updates.tech_stack,
        architecture: updates.architecture,
        timeline: updates.timeline,
        deployment_targets: updates.deployment_targets,
        design_system: updates.design_system,
        metadata: updates.metadata,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      const { error } = await supabase
        .from('ai_projects')
        .update(dbUpdates as any) // Cast to any to bypass type issues
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === id 
            ? { ...project, ...updates, updated_at: new Date().toISOString() }
            : project
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error Updating Project",
        description: "Failed to update the project. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete project
  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
      
      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error Deleting Project",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Generate project data from prompt
  const generateProjectFromPrompt = async (prompt: string): Promise<Omit<AIProject, 'id' | 'created_at' | 'updated_at'>> => {
    // Simulate AI analysis of the prompt
    const projectType = determineProjectType(prompt);
    const name = generateProjectName(prompt);
    const requirements = extractRequirements(prompt);
    const techStack = generateTechStack(projectType, requirements);
    const architecture = generateArchitecture(projectType, requirements);
    const timeline = generateTimeline(requirements);

    return {
      name,
      description: prompt,
      project_type: projectType,
      requirements,
      tech_stack: techStack,
      architecture,
      timeline,
      deployment_targets: getDeploymentTargets(projectType),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        currentStage: 'Planning',
        progress: 25
      }
    };
  };

  // Helper functions
  const determineProjectType = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('mobile app') || lower.includes('ios') || lower.includes('android')) {
      return 'mobile-app';
    }
    if (lower.includes('website') || lower.includes('landing page')) {
      return 'website';
    }
    if (lower.includes('operating system') || lower.includes('linux') || lower.includes('os')) {
      return 'operating-system';
    }
    if (lower.includes('ai assistant') || lower.includes('chatbot') || lower.includes('voice')) {
      return 'ai-assistant';
    }
    if (lower.includes('bot') || lower.includes('automation') || lower.includes('trading')) {
      return 'automation-tool';
    }
    return 'web-app';
  };

  const generateProjectName = (prompt: string): string => {
    const words = prompt.split(' ').slice(0, 3);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const extractRequirements = (prompt: string): ProjectRequirements => ({
    description: prompt,
    type: determineProjectType(prompt),
    features: extractFeatures(prompt),
    platforms: extractPlatforms(prompt),
    constraints: {
      performance: ['Fast response times', 'Scalable architecture'],
      security: ['Secure authentication', 'Data encryption'],
      scalability: ['Cloud-ready', 'Microservices architecture']
    }
  });

  const extractFeatures = (prompt: string): string[] => {
    const features = [];
    const lower = prompt.toLowerCase();
    
    if (lower.includes('authentication') || lower.includes('login')) features.push('User Authentication');
    if (lower.includes('dashboard')) features.push('Dashboard');
    if (lower.includes('payment') || lower.includes('billing')) features.push('Payment Processing');
    if (lower.includes('notification')) features.push('Real-time Notifications');
    if (lower.includes('api')) features.push('REST API');
    if (lower.includes('database')) features.push('Database Integration');
    
    return features.length > 0 ? features : ['Core Functionality', 'User Interface', 'Data Management'];
  };

  const extractPlatforms = (prompt: string): string[] => {
    const platforms = [];
    const lower = prompt.toLowerCase();
    
    if (lower.includes('web')) platforms.push('Web');
    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
      platforms.push('Mobile');
    }
    if (lower.includes('desktop')) platforms.push('Desktop');
    if (lower.includes('cloud')) platforms.push('Cloud');
    
    return platforms.length > 0 ? platforms : ['Web'];
  };

  const generateTechStack = (projectType: string, requirements: ProjectRequirements): TechStack[] => {
    const baseStack: TechStack[] = [
      { area: 'Frontend', option: 'React + TypeScript', reason: 'Modern, type-safe development' },
      { area: 'Backend', option: 'Supabase Edge Functions', reason: 'Serverless, scalable backend' },
      { area: 'Database', option: 'PostgreSQL', reason: 'Reliable, feature-rich database' },
      { area: 'Deployment', option: 'Vercel', reason: 'Fast, reliable hosting' }
    ];

    if (projectType === 'ai-assistant') {
      baseStack.push({ area: 'AI', option: 'OpenAI GPT', reason: 'Advanced language processing' });
    }
    if (projectType === 'mobile-app') {
      baseStack[0] = { area: 'Frontend', option: 'React Native', reason: 'Cross-platform mobile development' };
    }

    return baseStack;
  };

  const generateArchitecture = (projectType: string, requirements: ProjectRequirements) => ({
    pattern: projectType === 'operating-system' ? 'modular' : 'microservices',
    modules: [
      'Authentication Module',
      'Core Logic Module',
      'Data Access Layer',
      'API Gateway',
      'User Interface'
    ],
    apis: [
      '/api/auth',
      '/api/users',
      '/api/data',
      '/api/health'
    ]
  });

  const generateTimeline = (requirements: ProjectRequirements) => ({
    estimated: '4-6 weeks',
    phases: [
      {
        name: 'Planning & Design',
        duration: '1 week',
        tasks: ['Requirements analysis', 'UI/UX design', 'Architecture planning']
      },
      {
        name: 'Development',
        duration: '3 weeks',
        tasks: ['Core functionality', 'API development', 'Frontend implementation']
      },
      {
        name: 'Testing & Deployment',
        duration: '1 week',
        tasks: ['Quality assurance', 'Performance optimization', 'Production deployment']
      }
    ]
  });

  const getDeploymentTargets = (projectType: string): string[] => {
    switch (projectType) {
      case 'web-app':
      case 'website':
        return ['Vercel', 'Netlify'];
      case 'mobile-app':
        return ['App Store', 'Google Play'];
      case 'operating-system':
        return ['Docker', 'Custom Hardware'];
      default:
        return ['Cloud Platform'];
    }
  };

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('ai_projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_projects'
        },
        () => {
          loadProjects(); // Refresh projects when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    projects,
    isLoading,
    isCreating,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects
  };
}