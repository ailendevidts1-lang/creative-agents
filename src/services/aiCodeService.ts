import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://akdlvhfrslztmhsiurqo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZGx2aGZyc2x6dG1oc2l1cnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDgzMzgsImV4cCI6MjA3MDU4NDMzOH0.NYioI5M8CpvjXeBm3PROZRbivI-blG6aT-6hC-JPiZs';

export const supabase = createClient(supabaseUrl, supabaseKey);

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AICodeService {
  static async generateCode(projectPlan: any): Promise<ServiceResponse<{ codeStructure: any; zipUrl: string }>> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { projectPlan }
      });

      if (error) {
        console.error('Code generation error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          codeStructure: data.codeStructure,
          zipUrl: data.zipUrl || `https://fake-zip-storage.com/projects/${projectPlan.id}.zip`
        }
      };
    } catch (error) {
      console.error('Code generation service error:', error);
      return { success: false, error: 'Failed to generate code' };
    }
  }

  static async deployProject(projectPlan: any, deploymentTarget?: string): Promise<ServiceResponse<{ deploymentUrl: string; deploymentSteps: string[] }>> {
    try {
      const { data, error } = await supabase.functions.invoke('deploy-project', {
        body: { projectPlan, deploymentTarget }
      });

      if (error) {
        console.error('Deployment error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          deploymentUrl: data.deploymentUrl,
          deploymentSteps: data.deploymentSteps || []
        }
      };
    } catch (error) {
      console.error('Deployment service error:', error);
      return { success: false, error: 'Failed to deploy project' };
    }
  }

  static async editProject(projectId: string, changes: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('edit-project', {
        body: { projectId, changes }
      });

      if (error) {
        console.error('Edit project error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Edit project service error:', error);
      return { success: false, error: 'Failed to edit project' };
    }
  }

  static async autofixCode(projectId: string, errors: string[]): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('autofix-code', {
        body: { projectId, errors }
      });

      if (error) {
        console.error('Autofix code error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Autofix code service error:', error);
      return { success: false, error: 'Failed to autofix code' };
    }
  }

  static async runSandbox(projectId: string, command?: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('run-sandbox', {
        body: { projectId, command }
      });

      if (error) {
        console.error('Run sandbox error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Run sandbox service error:', error);
      return { success: false, error: 'Failed to run sandbox' };
    }
  }

  static async manageSecrets(projectId: string, secrets: any): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-secrets', {
        body: { projectId, secrets }
      });

      if (error) {
        console.error('Manage secrets error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Manage secrets service error:', error);
      return { success: false, error: 'Failed to manage secrets' };
    }
  }

  static async createRealtimeToken(): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase.functions.invoke('realtime-token', {
        body: {}
      });

      if (error) {
        console.error('Realtime token error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Realtime token service error:', error);
      return { success: false, error: 'Failed to create realtime token' };
    }
  }
}