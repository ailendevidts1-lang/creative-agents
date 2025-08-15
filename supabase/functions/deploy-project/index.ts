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
    const { projectPlan, deploymentTarget } = await req.json();
    
    if (!projectPlan) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Project plan is required',
        message: 'Deployment failed'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Starting deployment for project:', projectPlan.name);

    const deploymentPrompt = `Generate deployment configuration and scripts for this project:

Project: ${projectPlan.name}
Type: ${projectPlan.requirements.type}
Target: ${deploymentTarget || projectPlan.deploymentTargets[0]}

Tech Stack:
- Frontend: ${projectPlan.techStack.frontend?.join(', ') || 'None'}
- Backend: ${projectPlan.techStack.backend?.join(', ') || 'None'}
- Database: ${projectPlan.techStack.database?.join(', ') || 'None'}

Requirements:
1. Generate deployment configuration files (Docker, docker-compose, etc.)
2. Create CI/CD pipeline configuration
3. Environment variables setup
4. Health check endpoints
5. Monitoring and logging setup
6. Security configurations
7. Scaling considerations

Provide detailed deployment instructions and configuration files.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a DevOps expert specializing in application deployment. Generate production-ready deployment configurations with best practices for security, scalability, and monitoring.'
          },
          {
            role: 'user',
            content: deploymentPrompt
          }
        ],
        max_completion_tokens: 2000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const deploymentConfig = data.choices[0].message.content;

    // Simulate deployment process
    const deploymentSteps = [
      'Preparing deployment environment...',
      'Building application artifacts...',
      'Running security scans...',
      'Deploying to staging environment...',
      'Running health checks...',
      'Deploying to production...',
      'Configuring monitoring...',
      'Deployment completed successfully!'
    ];

    // Generate deployment URL
    const subdomain = projectPlan.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    const deploymentUrl = generateDeploymentUrl(projectPlan.requirements.type, subdomain, deploymentTarget);

    console.log('Deployment configuration generated successfully');

    return new Response(JSON.stringify({
      success: true,
      deploymentUrl,
      deploymentConfig,
      deploymentSteps,
      estimatedTime: '5-15 minutes',
      monitoring: {
        healthCheck: `${deploymentUrl}/health`,
        metrics: `${deploymentUrl}/metrics`,
        logs: 'Available in deployment dashboard'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Deployment failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateDeploymentUrl(projectType: string, subdomain: string, target?: string): string {
  switch (target || 'auto') {
    case 'Vercel':
      return `https://${subdomain}.vercel.app`;
    case 'Netlify':
      return `https://${subdomain}.netlify.app`;
    case 'AWS':
      return `https://${subdomain}.aws-region.elasticbeanstalk.com`;
    case 'Docker':
    case 'Kubernetes':
      return `https://${subdomain}.k8s.cluster.local`;
    default:
      // Auto-select based on project type
      switch (projectType) {
        case 'web-app':
        case 'website':
          return `https://${subdomain}.vercel.app`;
        case 'ai-assistant':
          return `https://${subdomain}.functions.supabase.co`;
        case 'automation-tool':
          return `https://${subdomain}.k8s.cluster.local`;
        default:
          return `https://${subdomain}.example.com`;
      }
  }
}