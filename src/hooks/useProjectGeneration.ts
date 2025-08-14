import { useState, useCallback } from 'react';
import { EnhancedOrchestrator } from '@/agents/enhancedOrchestrator';
import { AICodeService } from '@/services/aiCodeService';
import { GenerationSession, ProjectPlan } from '@/agents/types';

export const useProjectGeneration = () => {
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const orchestrator = new EnhancedOrchestrator();

  const generateProject = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setSession(null);

    try {
      const plan = await orchestrator.generateProject(prompt, (sessionUpdate) => {
        setSession({ ...sessionUpdate });
      });

      setProjects(prev => [plan, ...prev]);
      return plan;
    } catch (error) {
      console.error('Project generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const deployProject = useCallback(async (projectId: string, deploymentTarget?: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    setIsDeploying(true);
    
    try {
      const result = await AICodeService.deployProject(project, deploymentTarget);
      
      if (result.success && result.deploymentUrl) {
        // Update project with deployment info
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { 
                ...p, 
                metadata: { 
                  ...p.metadata,
                  deploymentUrl: result.deploymentUrl,
                  deployedAt: new Date(),
                  deploymentLogs: result.deploymentSteps || []
                }
              }
            : p
        ));
        
        return result;
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      throw error;
    } finally {
      setIsDeploying(false);
    }
  }, [projects]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const generateCode = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    try {
      const result = await AICodeService.generateCode(project);
      
      if (result.success && result.codeStructure) {
        // Update project with code generation info
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { 
                ...p, 
                metadata: { 
                  ...p.metadata,
                  codeGenerated: true,
                  codeStructure: result.codeStructure,
                  generatedAt: new Date()
                }
              }
            : p
        ));
        
        return result;
      } else {
        throw new Error(result.error || 'Code generation failed');
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      throw error;
    }
  }, [projects]);

  return {
    session,
    projects,
    isGenerating,
    isDeploying,
    generateProject,
    deployProject,
    generateCode,
    getProjectById,
    deleteProject
  };
};