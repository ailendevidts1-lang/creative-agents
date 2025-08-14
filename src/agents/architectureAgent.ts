import { BaseAgent } from './baseAgent';
import { ProjectRequirements, TechStack, AgentResponse } from './types';

export class ArchitectureAgent extends BaseAgent {
  constructor() {
    super('architecture', 'Architecture & Repo Plan Agent');
  }

  async process(input: { requirements: ProjectRequirements; techStack: TechStack }): Promise<AgentResponse> {
    const response = this.createResponse('running');
    this.log('Planning system architecture...', response);

    try {
      await new Promise(resolve => setTimeout(resolve, 900));

      const architecture = this.planArchitecture(input.requirements, input.techStack);
      this.log(`Selected ${architecture.pattern} architecture pattern`, response);
      this.log(`Defined ${architecture.modules.length} system modules`, response);

      response.status = 'completed';
      response.output = architecture;
      
      return response;
    } catch (error) {
      response.status = 'error';
      response.error = error instanceof Error ? error.message : 'Unknown error';
      return response;
    }
  }

  private planArchitecture(requirements: ProjectRequirements, techStack: TechStack) {
    const { type, features, constraints } = requirements;

    // Determine architecture pattern
    let pattern: 'monolith' | 'microservices' | 'serverless' | 'modular' = 'monolith';
    
    if (constraints?.scalability?.includes('high-scalability') || features?.length > 10) {
      pattern = 'microservices';
    } else if (type === 'automation-tool' || features?.includes('real-time')) {
      pattern = 'serverless';
    } else if (type === 'operating-system' || type === 'ai-assistant') {
      pattern = 'modular';
    }

    // Define modules based on project type
    let modules: string[] = [];
    let apis: string[] = [];

    switch (type) {
      case 'web-app':
        modules = ['Frontend App', 'API Server', 'Database Layer', 'Authentication Service'];
        apis = ['/api/auth', '/api/users', '/api/data'];
        break;

      case 'mobile-app':
        modules = ['Mobile App', 'Backend API', 'Push Notifications', 'Data Sync'];
        apis = ['/api/mobile', '/api/sync', '/api/notifications'];
        break;

      case 'operating-system':
        modules = ['Kernel', 'Device Drivers', 'File System', 'Shell', 'Package Manager'];
        apis = ['System Calls', 'Driver Interface', 'IPC'];
        break;

      case 'ai-assistant':
        modules = ['Voice Interface', 'NLP Engine', 'Memory System', 'Tool Integration', 'Conversation Manager'];
        apis = ['/api/chat', '/api/voice', '/api/tools', '/api/memory'];
        break;

      case 'website':
        modules = ['Static Pages', 'Content Management', 'SEO Optimization'];
        apis = ['/api/content', '/sitemap.xml'];
        break;

      case 'automation-tool':
        modules = ['Scheduler', 'Task Engine', 'Monitoring', 'Alert System', 'Data Processors'];
        apis = ['/api/tasks', '/api/schedule', '/api/monitor'];
        break;

      default:
        modules = ['Core Application', 'Data Layer', 'User Interface'];
        apis = ['/api/core'];
    }

    // Add common modules based on features
    if (features?.includes('authentication')) {
      modules.push('Authentication Module');
      apis.push('/api/auth');
    }

    if (features?.includes('analytics')) {
      modules.push('Analytics Engine');
      apis.push('/api/analytics');
    }

    if (features?.includes('notifications')) {
      modules.push('Notification Service');
      apis.push('/api/notifications');
    }

    if (features?.includes('payments')) {
      modules.push('Payment Processing');
      apis.push('/api/payments');
    }

    return {
      pattern,
      modules: [...new Set(modules)], // Remove duplicates
      apis: [...new Set(apis)] // Remove duplicates
    };
  }
}