import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    
    console.log(`Generating mock data for project ${projectId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Mock user ID for testing
    const userId = '00000000-0000-0000-0000-000000000000';
    
    // Mock project data
    const mockProject = {
      id: projectId,
      user_id: userId,
      name: 'Demo Studio Project',
      description: 'A sample project for testing Studio Agent capabilities',
      project_type: 'web-app',
      requirements: {
        description: 'Build a modern web application with React and TypeScript',
        type: 'web-app',
        features: ['authentication', 'dashboard', 'data-visualization']
      },
      tech_stack: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS'],
        backend: ['Supabase', 'Edge Functions'],
        database: ['PostgreSQL']
      },
      architecture: {
        pattern: 'serverless',
        modules: ['auth', 'dashboard', 'api'],
        apis: ['REST', 'GraphQL']
      },
      deployment_targets: ['Vercel', 'Netlify']
    };

    // Insert or update mock project
    const { data: project, error: projectError } = await supabase
      .from('ai_projects')
      .upsert(mockProject)
      .select()
      .single();

    if (projectError) {
      console.error('Error creating mock project:', projectError);
    }

    // Mock job data
    const mockJob = {
      project_id: projectId,
      user_id: userId,
      user_prompt: 'Add a dark mode toggle with localStorage persistence',
      status: 'completed',
      context_pack: {
        currentFiles: {
          'src/App.tsx': 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}',
          'src/main.tsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")!).render(<App />);'
        }
      }
    };

    const { data: job, error: jobError } = await supabase
      .from('studio_jobs')
      .insert(mockJob)
      .select()
      .single();

    if (jobError) {
      console.error('Error creating mock job:', jobError);
      throw new Error('Failed to create mock job');
    }

    // Mock tasks
    const mockTasks = [
      {
        job_id: job.id,
        title: 'Create Theme Context',
        batch_number: 1,
        status: 'completed',
        acceptance_criteria: 'Theme context should manage dark/light mode state with localStorage persistence',
        target_files: ['src/contexts/ThemeContext.tsx'],
        plan: {
          dependencies: [],
          complexity: 'medium'
        },
        diffs: {
          diffs: [{
            file: 'src/contexts/ThemeContext.tsx',
            action: 'create',
            content: 'Theme context implementation...',
            description: 'Create theme context for dark mode'
          }]
        }
      },
      {
        job_id: job.id,
        title: 'Add Theme Toggle Button',
        batch_number: 2,
        status: 'completed',
        acceptance_criteria: 'Toggle button should switch between themes and update localStorage',
        target_files: ['src/components/ThemeToggle.tsx'],
        plan: {
          dependencies: ['src/contexts/ThemeContext.tsx'],
          complexity: 'low'
        },
        diffs: {
          diffs: [{
            file: 'src/components/ThemeToggle.tsx',
            action: 'create',
            content: 'Theme toggle component...',
            description: 'Create theme toggle button component'
          }]
        }
      }
    ];

    const { data: tasks, error: tasksError } = await supabase
      .from('studio_tasks')
      .insert(mockTasks)
      .select();

    if (tasksError) {
      console.error('Error creating mock tasks:', tasksError);
    }

    // Mock artifacts
    const mockArtifacts = [
      {
        job_id: job.id,
        type: 'create',
        path: 'src/contexts/ThemeContext.tsx',
        content: `import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}`,
        metadata: {
          description: 'Theme context for dark mode functionality',
          taskId: tasks?.[0]?.id
        }
      },
      {
        job_id: job.id,
        type: 'create',
        path: 'src/components/ThemeToggle.tsx',
        content: `import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}`,
        metadata: {
          description: 'Theme toggle button component',
          taskId: tasks?.[1]?.id
        }
      }
    ];

    const { data: artifacts, error: artifactsError } = await supabase
      .from('studio_artifacts')
      .insert(mockArtifacts)
      .select();

    if (artifactsError) {
      console.error('Error creating mock artifacts:', artifactsError);
    }

    console.log('Mock data generated successfully');

    return new Response(JSON.stringify({
      success: true,
      project,
      job,
      tasks,
      artifacts,
      message: 'Mock data generated for Studio Agent testing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating mock data:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate mock data'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});