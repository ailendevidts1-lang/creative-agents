import { supabase } from '@/integrations/supabase/client';

interface SkillAction {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

interface SkillResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export class SkillsIntegrator {
  private skills: Map<string, SkillAction> = new Map();

  constructor() {
    this.registerCoreSkills();
  }

  private registerCoreSkills() {
    // Timer Skills
    this.registerSkill({
      name: 'create_timer',
      description: 'Create a new timer with specified name and duration',
      parameters: { name: 'string', duration: 'number' },
      execute: this.createTimer.bind(this)
    });

    this.registerSkill({
      name: 'list_timers',
      description: 'List all active timers',
      parameters: {},
      execute: this.listTimers.bind(this)
    });

    this.registerSkill({
      name: 'pause_timer',
      description: 'Pause a running timer by ID',
      parameters: { timerId: 'string' },
      execute: this.pauseTimer.bind(this)
    });

    this.registerSkill({
      name: 'resume_timer',
      description: 'Resume a paused timer by ID',
      parameters: { timerId: 'string' },
      execute: this.resumeTimer.bind(this)
    });

    this.registerSkill({
      name: 'cancel_timer',
      description: 'Cancel a timer by ID',
      parameters: { timerId: 'string' },
      execute: this.cancelTimer.bind(this)
    });

    // Notes Skills
    this.registerSkill({
      name: 'create_note',
      description: 'Create a new note with title and optional content',
      parameters: { title: 'string', content: 'string?', tags: 'string[]?' },
      execute: this.createNote.bind(this)
    });

    this.registerSkill({
      name: 'list_notes',
      description: 'List recent notes',
      parameters: { limit: 'number?' },
      execute: this.listNotes.bind(this)
    });

    this.registerSkill({
      name: 'update_note',
      description: 'Update an existing note',
      parameters: { noteId: 'string', title: 'string?', content: 'string?', tags: 'string[]?' },
      execute: this.updateNote.bind(this)
    });

    this.registerSkill({
      name: 'delete_note',
      description: 'Delete a note by ID',
      parameters: { noteId: 'string' },
      execute: this.deleteNote.bind(this)
    });

    // Weather Skills
    this.registerSkill({
      name: 'get_weather',
      description: 'Get current weather for a location',
      parameters: { location: 'string' },
      execute: this.getWeather.bind(this)
    });

    // Search Skills
    this.registerSkill({
      name: 'web_search',
      description: 'Search the web and get AI-powered answers',
      parameters: { query: 'string' },
      execute: this.performSearch.bind(this)
    });

    // Voice Cloning Skills
    this.registerSkill({
      name: 'analyze_voice',
      description: 'Analyze voice characteristics from audio',
      parameters: { audioUrl: 'string', name: 'string?' },
      execute: this.analyzeVoice.bind(this)
    });

    this.registerSkill({
      name: 'list_voice_profiles',
      description: 'List saved voice profiles',
      parameters: {},
      execute: this.listVoiceProfiles.bind(this)
    });

    // Prompt to Code Skills
    this.registerSkill({
      name: 'generate_project',
      description: 'Generate a software project from natural language description',
      parameters: { prompt: 'string', language: 'string?', framework: 'string?' },
      execute: this.generateProject.bind(this)
    });

    this.registerSkill({
      name: 'generate_code',
      description: 'Generate code snippets for specific functionality',
      parameters: { description: 'string', language: 'string' },
      execute: this.generateCode.bind(this)
    });
  }

  registerSkill(skill: SkillAction) {
    this.skills.set(skill.name, skill);
  }

  getAvailableSkills(): string[] {
    return Array.from(this.skills.keys());
  }

  getSkillDefinitions(): SkillAction[] {
    return Array.from(this.skills.values());
  }

  async executeSkill(skillName: string, parameters: any): Promise<SkillResult> {
    const skill = this.skills.get(skillName);
    if (!skill) {
      return {
        success: false,
        error: `Unknown skill: ${skillName}`
      };
    }

    try {
      const result = await skill.execute(parameters);
      return {
        success: true,
        data: result.data || result,
        message: result.message || `Successfully executed ${skillName}`
      };
    } catch (error) {
      console.error(`Skill execution failed for ${skillName}:`, error);
      return {
        success: false,
        error: (error as Error).message || `Failed to execute ${skillName}`
      };
    }
  }

  // Timer Skills Implementation
  private async createTimer(params: { name: string; duration: number }): Promise<any> {
    const { data, error } = await supabase
      .from('timers')
      .insert([{
        name: params.name,
        duration: params.duration * 1000, // Convert seconds to milliseconds
        remaining: params.duration * 1000,
        expires_at: new Date(Date.now() + (params.duration * 1000)).toISOString(),
        status: 'active',
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Created timer "${params.name}" for ${params.duration} seconds` };
  }

  private async listTimers(): Promise<any> {
    const { data, error } = await supabase
      .from('timers')
      .select('*')
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, message: `Found ${data.length} timer${data.length !== 1 ? 's' : ''}` };
  }

  private async pauseTimer(params: { timerId: string }): Promise<any> {
    // Calculate remaining time
    const { data: timer, error: fetchError } = await supabase
      .from('timers')
      .select('*')
      .eq('id', params.timerId)
      .single();

    if (fetchError) throw fetchError;
    if (!timer) throw new Error('Timer not found');

    const remaining = Math.max(0, Math.floor((new Date(timer.expires_at).getTime() - Date.now())));

    const { data, error } = await supabase
      .from('timers')
      .update({
        status: 'paused',
        remaining: remaining
      })
      .eq('id', params.timerId)
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Paused timer "${timer.name}"` };
  }

  private async resumeTimer(params: { timerId: string }): Promise<any> {
    const { data: timer, error: fetchError } = await supabase
      .from('timers')
      .select('*')
      .eq('id', params.timerId)
      .single();

    if (fetchError) throw fetchError;
    if (!timer) throw new Error('Timer not found');

    const { data, error } = await supabase
      .from('timers')
      .update({
        status: 'active',
        expires_at: new Date(Date.now() + timer.remaining).toISOString()
      })
      .eq('id', params.timerId)
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Resumed timer "${timer.name}"` };
  }

  private async cancelTimer(params: { timerId: string }): Promise<any> {
    const { data, error } = await supabase
      .from('timers')
      .update({ status: 'cancelled' })
      .eq('id', params.timerId)
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Cancelled timer` };
  }

  // Notes Skills Implementation
  private async createNote(params: { title: string; content?: string; tags?: string[] }): Promise<any> {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        title: params.title,
        content: params.content || '',
        tags: params.tags || [],
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Created note "${params.title}"` };
  }

  private async listNotes(params: { limit?: number } = {}): Promise<any> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(params.limit || 10);

    if (error) throw error;
    return { data, message: `Found ${data.length} note${data.length !== 1 ? 's' : ''}` };
  }

  private async updateNote(params: { noteId: string; title?: string; content?: string; tags?: string[] }): Promise<any> {
    const updates: any = { updated_at: new Date().toISOString() };
    if (params.title !== undefined) updates.title = params.title;
    if (params.content !== undefined) updates.content = params.content;
    if (params.tags !== undefined) updates.tags = params.tags;

    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', params.noteId)
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Updated note` };
  }

  private async deleteNote(params: { noteId: string }): Promise<any> {
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', params.noteId)
      .select()
      .single();

    if (error) throw error;
    return { data, message: `Deleted note` };
  }

  // Weather Skills Implementation
  private async getWeather(params: { location: string }): Promise<any> {
    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { location: params.location }
    });

    if (error) throw error;
    return { 
      data, 
      message: `Weather for ${params.location}: ${data.description}, ${Math.round(data.temperature)}°C` 
    };
  }

  // Search Skills Implementation
  private async performSearch(params: { query: string }): Promise<any> {
    const { data, error } = await supabase.functions.invoke('search-qa', {
      body: { 
        query: params.query,
        includeWeb: true,
        maxResults: 5
      }
    });

    if (error) throw error;
    return { 
      data,
      message: `Found search results for: ${params.query}`
    };
  }

  // Voice Cloning Skills Implementation  
  private async analyzeVoice(params: { audioUrl: string; name?: string }): Promise<any> {
    // Mock implementation - would integrate with actual voice analysis service
    return {
      data: {
        profile: {
          id: `voice_${Date.now()}`,
          name: params.name || 'Unnamed Voice',
          characteristics: {
            pitch: 'medium',
            tone: 'neutral',
            accent: 'general'
          },
          audioUrl: params.audioUrl
        }
      },
      message: `Analyzed voice profile: ${params.name || 'Unnamed Voice'}`
    };
  }

  private async listVoiceProfiles(): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      data: [],
      message: 'No voice profiles found'
    };
  }

  // Code Generation Skills Implementation
  private async generateProject(params: { prompt: string; language?: string; framework?: string }): Promise<any> {
    const { data, error } = await supabase.functions.invoke('generate-code', {
      body: {
        prompt: params.prompt,
        type: 'project',
        language: params.language || 'javascript',
        framework: params.framework
      }
    });

    if (error) throw error;
    return {
      data,
      message: `Generated ${params.language || 'JavaScript'} project: ${params.prompt}`
    };
  }

  private async generateCode(params: { description: string; language: string }): Promise<any> {
    const { data, error } = await supabase.functions.invoke('generate-code', {
      body: {
        prompt: params.description,
        type: 'snippet',
        language: params.language
      }
    });

    if (error) throw error;
    return {
      data,
      message: `Generated ${params.language} code: ${params.description}`
    };
  }
}

// Singleton instance
export const skillsIntegrator = new SkillsIntegrator();