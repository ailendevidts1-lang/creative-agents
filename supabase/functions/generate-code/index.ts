import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectPlan } = await req.json();
    
    if (!projectPlan) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Project plan is required',
        message: 'Code generation failed'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Starting code generation for project:', projectPlan.name);

    // Generate comprehensive code based on project plan
    const codePrompt = `Generate a complete, production-ready ${projectPlan.requirements.type} application based on these specifications:

Project: ${projectPlan.name}
Description: ${projectPlan.requirements.description}
Type: ${projectPlan.requirements.type}
Features: ${projectPlan.requirements.features?.join(', ') || 'basic functionality'}

Tech Stack:
- Frontend: ${projectPlan.techStack.frontend?.join(', ') || 'None'}
- Backend: ${projectPlan.techStack.backend?.join(', ') || 'None'}
- Database: ${projectPlan.techStack.database?.join(', ') || 'None'}
- AI: ${projectPlan.techStack.ai?.join(', ') || 'None'}

Architecture: ${projectPlan.architecture.pattern}
Modules: ${projectPlan.architecture.modules.join(', ')}

Requirements:
1. Generate complete file structure with all necessary files
2. Include package.json with all dependencies
3. Add proper TypeScript types and interfaces
4. Include error handling and validation
5. Add responsive design (if UI project)
6. Include proper documentation
7. Add testing setup
8. Configure build and deployment scripts

Please provide a detailed file-by-file breakdown with actual code content.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert full-stack developer and AI engineer. Generate complete, production-ready code with best practices, proper error handling, and comprehensive documentation. Focus on clean architecture and scalable solutions.'
          },
          {
            role: 'user',
            content: codePrompt
          }
        ],
        max_completion_tokens: 4000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    console.log('Code generation completed successfully');

    // Parse and structure the generated code
    const codeStructure = {
      generatedCode,
      files: extractFileList(generatedCode),
      complexity: projectPlan.requirements.features?.length > 5 ? 'high' : 'medium',
      estimatedLines: Math.max(1000, (projectPlan.requirements.features?.length || 1) * 200),
      techStack: projectPlan.techStack,
      buildInstructions: generateBuildInstructions(projectPlan),
      deploymentInstructions: generateDeploymentInstructions(projectPlan)
    };

    return new Response(JSON.stringify({
      success: true,
      codeStructure,
      zipUrl: `https://fake-zip-storage.com/projects/${projectPlan.name?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.zip`,
      message: 'Code generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Code generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Code generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractFileList(generatedCode: string): string[] {
  // Extract file names from the generated code
  const fileMatches = generatedCode.match(/(?:```[\w]*\n)?(?:\/\/\s*)?([\w\-\.\/]+\.(ts|tsx|js|jsx|json|css|html|md|py|c|cpp|h|yml|yaml|toml|Dockerfile))/gi);
  return fileMatches ? [...new Set(fileMatches.map(match => match.replace(/```[\w]*\n?|\/\/\s*/g, '')))] : [];
}

function generateBuildInstructions(projectPlan: any): string[] {
  const type = projectPlan.requirements.type;
  
  switch (type) {
    case 'web-app':
      return [
        'npm install',
        'npm run build',
        'npm run test',
        'npm run preview'
      ];
    case 'mobile-app':
      return [
        'npm install',
        'npx expo install',
        'npx expo build',
        'npx expo publish'
      ];
    case 'ai-assistant':
      return [
        'pip install -r requirements.txt',
        'python -m pytest',
        'python main.py'
      ];
    case 'automation-tool':
      return [
        'npm install',
        'npm run build',
        'docker build -t automation-tool .',
        'docker run automation-tool'
      ];
    default:
      return ['npm install', 'npm run build'];
  }
}

function generateDeploymentInstructions(projectPlan: any): string[] {
  const targets = projectPlan.deploymentTargets;
  
  if (targets.includes('Vercel')) {
    return [
      'npm install -g vercel',
      'vercel login',
      'vercel --prod'
    ];
  } else if (targets.includes('Docker')) {
    return [
      'docker build -t app .',
      'docker tag app:latest your-registry/app:latest',
      'docker push your-registry/app:latest'
    ];
  } else {
    return ['Follow platform-specific deployment guide'];
  }
}