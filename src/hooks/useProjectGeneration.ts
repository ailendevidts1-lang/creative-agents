import { useState, useCallback } from 'react';
import { AgentOrchestrator } from '@/agents/orchestrator';
import { GenerationSession, ProjectPlan } from '@/agents/types';

export const useProjectGeneration = () => {
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const orchestrator = new AgentOrchestrator();

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

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    session,
    projects,
    isGenerating,
    generateProject,
    getProjectById,
    deleteProject
  };
};