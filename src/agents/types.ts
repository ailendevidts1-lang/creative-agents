export interface ProjectRequirements {
  description: string;
  type: ProjectType;
  targetAudience?: string;
  platforms?: string[];
  features?: string[];
  constraints?: {
    performance?: string[];
    security?: string[];
    scalability?: string[];
  };
}

export type ProjectType = 
  | 'web-app' 
  | 'mobile-app' 
  | 'operating-system' 
  | 'ai-assistant' 
  | 'website' 
  | 'automation-tool'
  | 'embedded-system'
  | 'game'
  | 'blockchain-app';

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  deployment?: string[];
  ai?: string[];
  system?: string[];
}

export interface DesignSystem {
  theme: 'modern' | 'classic' | 'minimal' | 'luxury' | 'dark' | 'cyberpunk';
  colorPalette: string[];
  typography: string[];
  spacing: string;
  accessibility: string[];
}

export interface ProjectPlan {
  id: string;
  name: string;
  requirements: ProjectRequirements;
  techStack: TechStack;
  designSystem?: DesignSystem;
  architecture: {
    pattern: 'monolith' | 'microservices' | 'serverless' | 'modular';
    modules: string[];
    apis: string[];
  };
  timeline: {
    estimated: string;
    phases: Array<{
      name: string;
      duration: string;
      tasks: string[];
    }>;
  };
  deploymentTargets: string[];
  metadata?: {
    aiConfig?: any;
    codeStructure?: any;
    qaStrategy?: any;
    deploymentConfig?: any;
    generatedAt?: Date;
    version?: string;
    codeGenerated?: boolean;
    deploymentUrl?: string;
    deployedAt?: Date;
    deploymentLogs?: string[];
    zipUrl?: string;
  };
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: any;
  logs?: string[];
  error?: string;
}

export interface GenerationSession {
  id: string;
  prompt: string;
  status: 'analyzing' | 'planning' | 'generating' | 'testing' | 'deploying' | 'completed' | 'error';
  currentAgent?: string;
  plan?: ProjectPlan;
  agentResponses: AgentResponse[];
  createdAt: Date;
  completedAt?: Date;
}