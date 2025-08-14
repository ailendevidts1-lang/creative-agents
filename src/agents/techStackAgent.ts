import { BaseAgent } from './baseAgent';
import { ProjectRequirements, TechStack, AgentResponse } from './types';

export class TechStackAgent extends BaseAgent {
  constructor() {
    super('tech-stack', 'Tech Inference Agent');
  }

  async process(requirements: ProjectRequirements): Promise<AgentResponse> {
    const response = this.createResponse('running');
    this.log('Selecting optimal tech stack...', response);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const techStack = this.selectTechStack(requirements);
      this.log(`Selected ${techStack.frontend?.length || 0} frontend technologies`, response);
      this.log(`Selected ${techStack.backend?.length || 0} backend technologies`, response);

      response.status = 'completed';
      response.output = techStack;
      
      return response;
    } catch (error) {
      response.status = 'error';
      response.error = error instanceof Error ? error.message : 'Unknown error';
      return response;
    }
  }

  private selectTechStack(requirements: ProjectRequirements): TechStack {
    const { type, platforms, features, constraints } = requirements;

    let techStack: TechStack = {};

    switch (type) {
      case 'web-app':
        techStack = {
          frontend: ['React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'PostgreSQL'],
          deployment: ['Vercel', 'Supabase'],
        };
        break;

      case 'mobile-app':
        techStack = {
          frontend: ['React Native', 'TypeScript'],
          backend: ['Node.js', 'Express', 'PostgreSQL'],
          deployment: ['Expo', 'App Store', 'Google Play'],
        };
        break;

      case 'operating-system':
        techStack = {
          system: ['Linux Kernel', 'C', 'Assembly', 'Shell Scripts'],
          frontend: ['Wayland', 'GTK', 'Qt'],
          deployment: ['ISO Image', 'USB Boot'],
        };
        break;

      case 'ai-assistant':
        techStack = {
          backend: ['Python', 'FastAPI', 'LangChain'],
          ai: ['OpenAI GPT', 'Whisper', 'Text-to-Speech'],
          database: ['Vector DB', 'PostgreSQL'],
          deployment: ['Docker', 'AWS Lambda'],
        };
        break;

      case 'website':
        techStack = {
          frontend: ['Next.js', 'TypeScript', 'Tailwind CSS'],
          deployment: ['Vercel', 'Netlify'],
        };
        break;

      case 'automation-tool':
        techStack = {
          backend: ['Python', 'Node.js', 'Redis'],
          database: ['PostgreSQL', 'InfluxDB'],
          deployment: ['Docker', 'Kubernetes'],
        };
        break;

      default:
        techStack = {
          frontend: ['React', 'TypeScript'],
          backend: ['Node.js', 'Express'],
          database: ['PostgreSQL'],
        };
    }

    // Enhance based on features
    if (features?.includes('real-time')) {
      techStack.backend = [...(techStack.backend || []), 'WebSocket', 'Socket.io'];
    }

    if (features?.includes('payments')) {
      techStack.backend = [...(techStack.backend || []), 'Stripe API'];
    }

    if (features?.includes('voice')) {
      techStack.ai = [...(techStack.ai || []), 'Speech Recognition', 'Voice Synthesis'];
    }

    // Adjust for constraints
    if (constraints?.performance?.includes('high-performance')) {
      if (type === 'web-app') {
        techStack.frontend = ['Svelte', 'TypeScript', 'Tailwind CSS'];
        techStack.backend = ['Rust', 'Actix-web', 'PostgreSQL'];
      }
    }

    if (constraints?.scalability?.includes('high-scalability')) {
      techStack.backend = [...(techStack.backend || []), 'Microservices', 'Kubernetes'];
      techStack.database = [...(techStack.database || []), 'Redis Cache'];
    }

    return techStack;
  }
}