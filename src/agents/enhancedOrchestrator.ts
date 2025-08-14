import { RequirementsAgent } from './requirementsAgent';
import { TechStackAgent } from './techStackAgent';
import { DesignAgent } from './designAgent';
import { ArchitectureAgent } from './architectureAgent';
import { CodeGenerationAgent } from './codeGenerationAgent';
import { QAAgent } from './qaAgent';
import { DeploymentAgent } from './deploymentAgent';
import { AIIntegrationAgent } from './aiIntegrationAgent';
import { GenerationSession, ProjectPlan, AgentResponse } from './types';

export class EnhancedOrchestrator {
  private requirementsAgent = new RequirementsAgent();
  private techStackAgent = new TechStackAgent();
  private designAgent = new DesignAgent();
  private architectureAgent = new ArchitectureAgent();
  private codeGenerationAgent = new CodeGenerationAgent();
  private qaAgent = new QAAgent();
  private deploymentAgent = new DeploymentAgent();
  private aiIntegrationAgent = new AIIntegrationAgent();

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
      if (requirementsResponse.status === 'error') throw new Error(requirementsResponse.error);
      const requirements = requirementsResponse.output;

      // Step 2: Tech Stack Selection
      session.status = 'planning';
      session.currentAgent = 'Tech Inference Agent';
      onProgress?.(session);

      const techStackResponse = await this.techStackAgent.process(requirements);
      session.agentResponses.push(techStackResponse);
      if (techStackResponse.status === 'error') throw new Error(techStackResponse.error);
      const techStack = techStackResponse.output;

      // Step 3: Design System (for UI projects)
      const needsDesign = ['web-app', 'mobile-app', 'website'].includes(requirements.type);
      let designSystem;

      if (needsDesign) {
        session.currentAgent = 'Design System Agent';
        onProgress?.(session);

        const designResponse = await this.designAgent.process(requirements);
        session.agentResponses.push(designResponse);
        if (designResponse.status === 'error') throw new Error(designResponse.error);
        designSystem = designResponse.output;
      }

      // Step 4: Architecture Planning
      session.currentAgent = 'Architecture Agent';
      onProgress?.(session);

      const architectureResponse = await this.architectureAgent.process({ requirements, techStack });
      session.agentResponses.push(architectureResponse);
      if (architectureResponse.status === 'error') throw new Error(architectureResponse.error);
      const architecture = architectureResponse.output;

      // Step 5: AI Integration Setup
      session.currentAgent = 'AI Integration Agent';
      onProgress?.(session);

      const aiResponse = await this.aiIntegrationAgent.process({
        id: session.id,
        name: 'temp',
        requirements,
        techStack,
        designSystem,
        architecture,
        timeline: { estimated: '', phases: [] },
        deploymentTargets: []
      });
      session.agentResponses.push(aiResponse);
      if (aiResponse.status === 'error') throw new Error(aiResponse.error);
      const aiConfig = aiResponse.output;

      // Step 6: Code Generation
      session.status = 'generating';
      session.currentAgent = 'Code Generation Agent';
      onProgress?.(session);

      const projectPlan: ProjectPlan = {
        id: session.id,
        name: this.generateProjectName(requirements),
        requirements,
        techStack,
        designSystem,
        architecture,
        timeline: this.generateTimeline(requirements, architecture),
        deploymentTargets: this.getDeploymentTargets(requirements.type)
      };

      const codeResponse = await this.codeGenerationAgent.process(projectPlan);
      session.agentResponses.push(codeResponse);
      if (codeResponse.status === 'error') throw new Error(codeResponse.error);
      const codeStructure = codeResponse.output;

      // Step 7: QA & Testing
      session.status = 'testing';
      session.currentAgent = 'QA & Testing Agent';
      onProgress?.(session);

      const qaResponse = await this.qaAgent.process({ projectPlan, codeStructure });
      session.agentResponses.push(qaResponse);
      if (qaResponse.status === 'error') throw new Error(qaResponse.error);
      const qaStrategy = qaResponse.output;

      // Step 8: Deployment Configuration
      session.status = 'deploying';
      session.currentAgent = 'Deployment Agent';
      onProgress?.(session);

      const deploymentResponse = await this.deploymentAgent.process({ projectPlan, codeStructure });
      session.agentResponses.push(deploymentResponse);
      if (deploymentResponse.status === 'error') throw new Error(deploymentResponse.error);
      const deploymentConfig = deploymentResponse.output;

      // Step 9: Final Project Assembly
      session.status = 'completed';
      session.currentAgent = 'Project Assembly';
      onProgress?.(session);

      const finalPlan: ProjectPlan = {
        ...projectPlan,
        metadata: {
          aiConfig,
          codeStructure,
          qaStrategy,
          deploymentConfig,
          generatedAt: new Date(),
          version: '1.0.0'
        }
      };

      session.plan = finalPlan;
      session.completedAt = new Date();
      onProgress?.(session);

      return finalPlan;

    } catch (error) {
      session.status = 'error';
      session.agentResponses.push({
        agentId: 'orchestrator',
        agentName: 'Enhanced Orchestrator',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      onProgress?.(session);
      throw error;
    }
  }

  async deployProject(projectPlan: ProjectPlan): Promise<{ success: boolean; deploymentUrl?: string; logs: string[] }> {
    const logs: string[] = [];
    
    try {
      logs.push('Starting deployment pipeline...');
      
      // Simulate deployment steps
      await this.simulateDeploymentStep('Setting up infrastructure...', logs);
      await this.simulateDeploymentStep('Building application...', logs);
      await this.simulateDeploymentStep('Running tests...', logs);
      await this.simulateDeploymentStep('Deploying to production...', logs);
      await this.simulateDeploymentStep('Configuring monitoring...', logs);
      
      const deploymentUrl = this.generateDeploymentUrl(projectPlan);
      logs.push(`Deployment successful! Available at: ${deploymentUrl}`);
      
      return { success: true, deploymentUrl, logs };
    } catch (error) {
      logs.push(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, logs };
    }
  }

  private async simulateDeploymentStep(step: string, logs: string[]): Promise<void> {
    logs.push(step);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateDeploymentUrl(plan: ProjectPlan): string {
    const subdomain = plan.name.toLowerCase().replace(/\s+/g, '-');
    
    switch (plan.requirements.type) {
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

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateProjectName(requirements: any): string {
    const { type, description } = requirements;
    
    const words = description.split(' ').filter(word => word.length > 3);
    const keyWords = words.slice(0, 2).join(' ');
    
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
    const totalWeeks = Math.ceil(weeks * (1 + complexity * 0.15));

    return {
      estimated: `${totalWeeks} weeks`,
      phases: [
        {
          name: 'Planning & Setup',
          duration: `${Math.ceil(totalWeeks * 0.15)} weeks`,
          tasks: ['Project setup', 'Development environment', 'Architecture review']
        },
        {
          name: 'Core Development',
          duration: `${Math.ceil(totalWeeks * 0.5)} weeks`,
          tasks: ['Core features', 'Database setup', 'API development', 'AI integration']
        },
        {
          name: 'Integration & Testing',
          duration: `${Math.ceil(totalWeeks * 0.25)} weeks`,
          tasks: ['Feature integration', 'Testing', 'Bug fixes', 'Performance optimization']
        },
        {
          name: 'Deployment & Launch',
          duration: `${Math.ceil(totalWeeks * 0.1)} weeks`,
          tasks: ['Production deployment', 'Monitoring setup', 'Launch', 'Documentation']
        }
      ]
    };
  }

  private getDeploymentTargets(type: string): string[] {
    const targets = {
      'web-app': ['Vercel', 'Netlify', 'AWS', 'Supabase'],
      'mobile-app': ['App Store', 'Google Play', 'TestFlight', 'Firebase'],
      'operating-system': ['ISO Image', 'USB Boot', 'VM Image', 'Container'],
      'ai-assistant': ['Docker Container', 'Supabase Functions', 'AWS Lambda', 'Local Install'],
      'website': ['Static Hosting', 'CDN', 'GitHub Pages', 'Vercel'],
      'automation-tool': ['Docker', 'Kubernetes', 'Cloud Run', 'VPS']
    };

    return targets[type] || ['Custom Deployment'];
  }
}