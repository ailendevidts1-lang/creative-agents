import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akdlvhfrslztmhsiurqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZGx2aGZyc2x6dG1oc2l1cnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1ODIyOTEsImV4cCI6MjA0NzE1ODI5MX0.PVZhsAgMiUhQr9M-w3SPVI-d7A3W7eC7k3LR1kRAFek';

export const supabase = createClient(supabaseUrl, supabaseKey);

export class AICodeService {
  static async generateCode(projectPlan: any): Promise<{ success: boolean; codeStructure?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { projectPlan }
      });

      if (error) {
        console.error('Code generation error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Code generation service error:', error);
      return { success: false, error: 'Failed to generate code' };
    }
  }

  static async deployProject(projectPlan: any, deploymentTarget?: string): Promise<{ success: boolean; deploymentUrl?: string; deploymentSteps?: string[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('deploy-project', {
        body: { projectPlan, deploymentTarget }
      });

      if (error) {
        console.error('Deployment error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Deployment service error:', error);
      return { success: false, error: 'Failed to deploy project' };
    }
  }

  static async createRealtimeToken(): Promise<{ success: boolean; token?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('realtime-token', {
        body: {}
      });

      if (error) {
        console.error('Realtime token error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, token: data };
    } catch (error) {
      console.error('Realtime token service error:', error);
      return { success: false, error: 'Failed to create realtime token' };
    }
  }
}