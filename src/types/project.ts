export interface ProjectRequirements {
  description: string;
  type: string;
  targetAudience?: string;
  platforms?: string[];
  features?: string[];
  constraints?: {
    performance?: string[];
    security?: string[];
    scalability?: string[];
  };
}

export interface TechStack {
  area: string;
  option: string;
  reason: string;
}

export interface DesignSystem {
  theme: string;
  colorPalette: string[];
  typography: string[];
  spacing: string;
  accessibility: string[];
}

export interface Architecture {
  pattern: string;
  modules: string[];
  apis: string[];
}

export interface Timeline {
  estimated: string;
  phases: Array<{
    name: string;
    duration: string;
    tasks: string[];
  }>;
}

export interface ProjectMetadata {
  aiConfig?: any;
  codeStructure?: any;
  qaStrategy?: any;
  deploymentConfig?: any;
  generatedAt?: string;
  version?: string;
  codeGenerated?: boolean;
  deploymentUrl?: string;
  deployedAt?: string;
  deploymentLogs?: string[];
  zipUrl?: string;
  currentStage?: string;
  progress?: number;
}

export interface AIProject {
  id: string;
  name: string;
  description: string;
  project_type: string;
  requirements: ProjectRequirements;
  tech_stack: TechStack[];
  design_system?: DesignSystem;
  architecture: Architecture;
  timeline: Timeline;
  deployment_targets: string[];
  metadata?: ProjectMetadata;
  user_id?: string;
  created_at: string;
  updated_at: string;
}