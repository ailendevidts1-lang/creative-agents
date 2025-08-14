import { RequirementsAgent } from './requirementsAgent';
import { TechStackAgent } from './techStackAgent';
import { DesignAgent } from './designAgent';
import { ArchitectureAgent } from './architectureAgent';
import { GenerationSession, ProjectPlan, AgentResponse } from './types';

export class AgentOrchestrator {
  private requirementsAgent = new RequirementsAgent();
  private techStackAgent = new TechStackAgent();
  private designAgent = new DesignAgent();
  private architectureAgent = new ArchitectureAgent();

  async generateProject(prompt: string, onProgress?: (session: GenerationSession) => void): Promise<ProjectPlan> {
    const session: GenerationSession = {
      id: this.generateId(),
      prompt,
      status: 'analyzing',
      agentResponses: [],
      createdAt: new Date()
    };

    try {
      // Step 1: Requirements Analysis
      session.status = 'analyzing';
      session.currentAgent = 'Requirements & Spec Agent';
      onProgress?.(session);

      const requirementsResponse = await this.requirementsAgent.process(prompt);
      session.agentResponses.push(requirementsResponse);

      if (requirementsResponse.status === 'error') {
        throw new Error(requirementsResponse.error);
      }

      const requirements = requirementsResponse.output;

      // Step 2: Tech Stack Selection
      session.status = 'planning';
      session.currentAgent = 'Tech Inference Agent';
      onProgress?.(session);

      const techStackResponse = await this.techStackAgent.process(requirements);
      session.agentResponses.push(techStackResponse);

      if (techStackResponse.status === 'error') {
        throw new Error(techStackResponse.error);
      }

      const techStack = techStackResponse.output;

      // Step 3: Design System (for UI projects)
      const needsDesign = ['web-app', 'mobile-app', 'website'].includes(requirements.type);
      let designSystem;

      if (needsDesign) {
        session.currentAgent = 'Design System Agent';
        onProgress?.(session);

        const designResponse = await this.designAgent.process(requirements);
        session.agentResponses.push(designResponse);

        if (designResponse.status === 'error') {
          throw new Error(designResponse.error);
        }

        designSystem = designResponse.output;
      }

      // Step 4: Architecture Planning
      session.currentAgent = 'Architecture Agent';
      onProgress?.(session);

      const architectureResponse = await this.architectureAgent.process({ requirements, techStack });
      session.agentResponses.push(architectureResponse);

      if (architectureResponse.status === 'error') {
        throw new Error(architectureResponse.error);
      }

      const architecture = architectureResponse.output;

      // Step 5: Generate Project Plan
      session.status = 'generating';
      session.currentAgent = 'Project Planner';
      onProgress?.(session);

      const plan: ProjectPlan = {
        id: session.id,
        name: this.generateProjectName(requirements),
        requirements,
        techStack,
        designSystem,
        architecture,
        timeline: this.generateTimeline(requirements, architecture),
        deploymentTargets: this.getDeploymentTargets(requirements.type)
      };

      session.plan = plan;
      session.status = 'completed';
      session.completedAt = new Date();
      onProgress?.(session);

      return plan;

    } catch (error) {
      session.status = 'error';
      session.agentResponses.push({
        agentId: 'orchestrator',
        agentName: 'Agent Orchestrator',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      onProgress?.(session);
      throw error;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateProjectName(requirements: any): string {
    const { type, description } = requirements;
    
    // Extract potential project name from description
    const words = description.split(' ').filter(word => word.length > 3);
    const keyWords = words.slice(0, 3).join(' ');
    
    const typeNames = {
      'web-app': 'App',
      'mobile-app': 'Mobile App',
      'operating-system': 'OS',
      'ai-assistant': 'AI Assistant',
      'website': 'Website',
      'automation-tool': 'Automation Tool'
    };

    return `${keyWords} ${typeNames[type] || 'System'}`.trim();
  }

  private generateTimeline(requirements: any, architecture: any) {
    const baseWeeks = {
      'web-app': 4,
      'mobile-app': 6,
      'operating-system': 12,
      'ai-assistant': 8,
      'website': 2,
      'automation-tool': 6
    };

    const weeks = baseWeeks[requirements.type] || 4;
    const complexity = requirements.features?.length || 1;
    const totalWeeks = Math.ceil(weeks * (1 + complexity * 0.2));

    return {
      estimated: `${totalWeeks} weeks`,
      phases: [
        {
          name: 'Planning & Setup',
          duration: `${Math.ceil(totalWeeks * 0.2)} weeks`,
          tasks: ['Project setup', 'Development environment', 'Architecture review']
        },
        {
          name: 'Core Development',
          duration: `${Math.ceil(totalWeeks * 0.5)} weeks`,
          tasks: ['Core features', 'Database setup', 'API development']
        },
        {
          name: 'Integration & Testing',
          duration: `${Math.ceil(totalWeeks * 0.2)} weeks`,
          tasks: ['Feature integration', 'Testing', 'Bug fixes']
        },
        {
          name: 'Deployment & Launch',
          duration: `${Math.ceil(totalWeeks * 0.1)} weeks`,
          tasks: ['Production deployment', 'Monitoring setup', 'Launch']
        }
      ]
    };
  }

  private getDeploymentTargets(type: string): string[] {
    const targets = {
      'web-app': ['Vercel', 'Netlify', 'AWS'],
      'mobile-app': ['App Store', 'Google Play', 'TestFlight'],
      'operating-system': ['ISO Image', 'USB Boot', 'VM Image'],
      'ai-assistant': ['Docker Container', 'Cloud Function', 'Local Install'],
      'website': ['Static Hosting', 'CDN', 'GitHub Pages'],
      'automation-tool': ['Docker', 'Kubernetes', 'Cloud Service']
    };

    return targets[type] || ['Custom Deployment'];
  }
}