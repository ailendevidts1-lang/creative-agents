import { BaseAgent } from './baseAgent';
import { ProjectRequirements, DesignSystem, AgentResponse } from './types';

export class DesignAgent extends BaseAgent {
  constructor() {
    super('design', 'Design System Agent');
  }

  async process(requirements: ProjectRequirements): Promise<AgentResponse> {
    const response = this.createResponse('running');
    this.log('Generating design system...', response);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const designSystem = this.generateDesignSystem(requirements);
      this.log(`Created ${designSystem.theme} theme design system`, response);
      this.log(`Generated ${designSystem.colorPalette.length} color palette`, response);

      response.status = 'completed';
      response.output = designSystem;
      
      return response;
    } catch (error) {
      response.status = 'error';
      response.error = error instanceof Error ? error.message : 'Unknown error';
      return response;
    }
  }

  private generateDesignSystem(requirements: ProjectRequirements): DesignSystem {
    const { type, description } = requirements;
    const lowerDesc = description.toLowerCase();

    // Determine theme based on project type and description
    let theme: DesignSystem['theme'] = 'modern';
    
    if (lowerDesc.includes('dark') || lowerDesc.includes('gaming') || type === 'automation-tool') {
      theme = 'dark';
    } else if (lowerDesc.includes('minimal') || lowerDesc.includes('clean')) {
      theme = 'minimal';
    } else if (lowerDesc.includes('luxury') || lowerDesc.includes('premium')) {
      theme = 'luxury';
    } else if (lowerDesc.includes('corporate') || lowerDesc.includes('business')) {
      theme = 'classic';
    } else if (lowerDesc.includes('cyber') || lowerDesc.includes('tech') || lowerDesc.includes('ai')) {
      theme = 'cyberpunk';
    }

    // Generate color palette based on theme
    const colorPalettes = {
      modern: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
      dark: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#f9fafb'],
      minimal: ['#000000', '#374151', '#6b7280', '#d1d5db', '#ffffff'],
      luxury: ['#7c3aed', '#c026d3', '#ec4899', '#f59e0b', '#059669'],
      classic: ['#1e40af', '#dc2626', '#059669', '#d97706', '#7c2d12'],
      cyberpunk: ['#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff0080']
    };

    // Generate typography based on theme
    const typography = {
      modern: ['Inter', 'Roboto', 'Open Sans'],
      dark: ['Fira Code', 'Source Code Pro', 'JetBrains Mono'],
      minimal: ['Helvetica', 'Arial', 'System UI'],
      luxury: ['Playfair Display', 'Cormorant Garamond', 'Libre Baskerville'],
      classic: ['Times New Roman', 'Georgia', 'Serif'],
      cyberpunk: ['Orbitron', 'Exo 2', 'Rajdhani']
    };

    return {
      theme,
      colorPalette: colorPalettes[theme],
      typography: typography[theme],
      spacing: '8px grid system',
      accessibility: [
        'WCAG 2.1 AA compliance',
        'Keyboard navigation',
        'Screen reader support',
        'High contrast mode',
        'Focus indicators'
      ]
    };
  }
}