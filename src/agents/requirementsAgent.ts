import { BaseAgent } from './baseAgent';
import { ProjectRequirements, ProjectType, AgentResponse } from './types';

export class RequirementsAgent extends BaseAgent {
  constructor() {
    super('requirements', 'Requirements & Spec Agent');
  }

  async process(prompt: string): Promise<AgentResponse> {
    const response = this.createResponse('running');
    this.log('Analyzing project requirements...', response);

    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const requirements = this.extractRequirements(prompt);
      this.log(`Identified project type: ${requirements.type}`, response);
      this.log(`Extracted ${requirements.features?.length || 0} core features`, response);

      response.status = 'completed';
      response.output = requirements;
      
      return response;
    } catch (error) {
      response.status = 'error';
      response.error = error instanceof Error ? error.message : 'Unknown error';
      return response;
    }
  }

  private extractRequirements(prompt: string): ProjectRequirements {
    const lowerPrompt = prompt.toLowerCase();

    // Determine project type
    let type: ProjectType = 'web-app';
    if (lowerPrompt.includes('os') || lowerPrompt.includes('operating system') || lowerPrompt.includes('linux')) {
      type = 'operating-system';
    } else if (lowerPrompt.includes('ai assistant') || lowerPrompt.includes('voice assistant') || lowerPrompt.includes('chatbot')) {
      type = 'ai-assistant';
    } else if (lowerPrompt.includes('mobile') || lowerPrompt.includes('ios') || lowerPrompt.includes('android')) {
      type = 'mobile-app';
    } else if (lowerPrompt.includes('website') || lowerPrompt.includes('landing page') || lowerPrompt.includes('portfolio')) {
      type = 'website';
    } else if (lowerPrompt.includes('bot') || lowerPrompt.includes('automation') || lowerPrompt.includes('trading')) {
      type = 'automation-tool';
    }

    // Extract features
    const features: string[] = [];
    const featureKeywords = [
      'login', 'authentication', 'dashboard', 'analytics', 'payments', 'notifications',
      'real-time', 'chat', 'voice', 'calendar', 'email', 'api', 'database',
      'search', 'filter', 'export', 'import', 'admin', 'user management'
    ];

    featureKeywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        features.push(keyword);
      }
    });

    // Extract platforms
    const platforms: string[] = [];
    if (lowerPrompt.includes('web')) platforms.push('web');
    if (lowerPrompt.includes('mobile') || lowerPrompt.includes('ios') || lowerPrompt.includes('android')) {
      platforms.push('mobile');
    }
    if (lowerPrompt.includes('desktop')) platforms.push('desktop');
    if (lowerPrompt.includes('cloud')) platforms.push('cloud');

    return {
      description: prompt,
      type,
      features,
      platforms: platforms.length > 0 ? platforms : ['web'],
      constraints: {
        performance: lowerPrompt.includes('fast') || lowerPrompt.includes('performance') ? ['high-performance'] : [],
        security: lowerPrompt.includes('secure') || lowerPrompt.includes('privacy') ? ['high-security'] : [],
        scalability: lowerPrompt.includes('scale') || lowerPrompt.includes('enterprise') ? ['high-scalability'] : []
      }
    };
  }
}