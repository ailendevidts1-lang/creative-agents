import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudioJob {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  user_prompt: string;
  context_pack: any;
  created_at: string;
  updated_at: string;
}

interface StudioTask {
  id: string;
  job_id: string;
  title: string;
  batch_number: number;
  status: string;
  plan: any;
  target_files: string[];
  diffs: any;
  acceptance_criteria: string;
  created_at: string;
  updated_at: string;
}

interface StudioArtifact {
  id: string;
  job_id: string;
  type: string;
  path: string;
  content: string;
  metadata: any;
  created_at: string;
}

export function useStudioAgent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<StudioJob | null>(null);
  const [tasks, setTasks] = useState<StudioTask[]>([]);
  const [artifacts, setArtifacts] = useState<StudioArtifact[]>([]);

  const startStudioAgent = useCallback(async (
    projectId: string, 
    userPrompt: string, 
    currentFiles?: Record<string, string>
  ) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting Studio Agent for:', userPrompt);
      
      const { data, error } = await supabase.functions.invoke('studio-orchestrator', {
        body: {
          projectId,
          userPrompt,
          currentFiles
        }
      });

      if (error) {
        console.error('Error starting Studio Agent:', error);
        throw new Error(error.message || 'Failed to start Studio Agent');
      }

      console.log('Studio Agent completed:', data);
      
      // Fetch the complete job details
      const { data: jobData, error: jobError } = await supabase
        .from('studio_jobs')
        .select('*')
        .eq('id', data.jobId)
        .single();

      if (!jobError && jobData) {
        setCurrentJob(jobData);
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('studio_tasks')
        .select('*')
        .eq('job_id', data.jobId)
        .order('batch_number', { ascending: true });

      if (!tasksError && tasksData) {
        setTasks(tasksData);
      }

      // Fetch artifacts
      const { data: artifactsData, error: artifactsError } = await supabase
        .from('studio_artifacts')
        .select('*')
        .eq('job_id', data.jobId);

      if (!artifactsError && artifactsData) {
        setArtifacts(artifactsData);
      }

      return {
        jobId: data.jobId,
        tasks: data.tasks,
        artifacts: data.artifacts
      };
    } catch (error) {
      console.error('Failed to start Studio Agent:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getJobHistory = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('studio_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch job history:', error);
      return [];
    }
  }, []);

  const getTasksForJob = useCallback(async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('studio_tasks')
        .select('*')
        .eq('job_id', jobId)
        .order('batch_number', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }, []);

  const getArtifactsForJob = useCallback(async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('studio_artifacts')
        .select('*')
        .eq('job_id', jobId);

      if (error) {
        console.error('Error fetching artifacts:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch artifacts:', error);
      return [];
    }
  }, []);

  const initializeMockData = useCallback(async (projectId: string) => {
    try {
      console.log('Initializing mock data for project:', projectId);
      
      const { data, error } = await supabase.functions.invoke('studio-mock-data', {
        body: { projectId }
      });

      if (error) {
        console.error('Error initializing mock data:', error);
        throw new Error(error.message || 'Failed to initialize mock data');
      }

      console.log('Mock data initialized:', data);
      
      // Update state with mock data
      if (data.job) {
        setCurrentJob(data.job);
      }
      if (data.tasks) {
        setTasks(data.tasks);
      }
      if (data.artifacts) {
        setArtifacts(data.artifacts);
      }

      return data;
    } catch (error) {
      console.error('Failed to initialize mock data:', error);
      throw error;
    }
  }, []);

  const clearCurrentSession = useCallback(() => {
    setCurrentJob(null);
    setTasks([]);
    setArtifacts([]);
  }, []);

  const applyPatches = useCallback(async (jobId: string, artifacts: any[]) => {
    try {
      console.log('Applying patches for job:', jobId);
      
      const { data, error } = await supabase.functions.invoke('studio-apply-patches', {
        body: {
          jobId,
          artifacts,
          autoCommit: false,
          createPR: false
        }
      });

      if (error) {
        console.error('Error applying patches:', error);
        throw new Error(error.message || 'Failed to apply patches');
      }

      console.log('Patches applied successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to apply patches:', error);
      throw error;
    }
  }, []);

  const searchCode = useCallback(async (projectId: string, query: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('studio-search', {
        body: { projectId, query, limit: 10 }
      });

      if (error) {
        console.error('Error searching code:', error);
        return [];
      }

      return data.results || [];
    } catch (error) {
      console.error('Failed to search code:', error);
      return [];
    }
  }, []);

  return {
    isProcessing,
    currentJob,
    tasks,
    artifacts,
    startStudioAgent,
    getJobHistory,
    getTasksForJob,
    getArtifactsForJob,
    initializeMockData,
    applyPatches,
    searchCode,
    clearCurrentSession
  };
}