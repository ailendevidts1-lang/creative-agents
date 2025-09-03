import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  expires_at: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  query: string;
  response?: string;
  sources?: any;
  created_at: string;
}

export interface UserPreferences {
  weather_location?: string;
  default_timer_sound?: string;
  voice_response_enabled?: boolean;
}

export function useSkills() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillsData();
    setupRealtimeSubscriptions();
  }, []);

  const loadSkillsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load timers
      const { data: timersData } = await supabase
        .from('timers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Load search history
      const { data: searchData } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setTimers((timersData || []) as Timer[]);
      setNotes((notesData || []) as Note[]);
      setSearchHistory((searchData || []) as SearchResult[]);
      setPreferences(prefsData || {});
    } catch (error) {
      console.error('Error loading skills data:', error);
      toast.error('Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const timersChannel = supabase
      .channel('timers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timers'
      }, () => {
        loadSkillsData();
      })
      .subscribe();

    const notesChannel = supabase
      .channel('notes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notes'
      }, () => {
        loadSkillsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(timersChannel);
      supabase.removeChannel(notesChannel);
    };
  };

  // Timer functions
  const createTimer = async (name: string, duration: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const expiresAt = new Date(Date.now() + duration * 1000).toISOString();

      const { error } = await supabase
        .from('timers')
        .insert({
          user_id: user.id,
          name,
          duration,
          remaining: duration,
          expires_at: expiresAt
        });

      if (error) throw error;
      toast.success(`Timer "${name}" created for ${duration} seconds`);
    } catch (error) {
      console.error('Error creating timer:', error);
      toast.error('Failed to create timer');
    }
  };

  const pauseTimer = async (timerId: string) => {
    try {
      const timer = timers.find(t => t.id === timerId);
      if (!timer) return;

      const remainingTime = Math.max(0, Math.floor((new Date(timer.expires_at).getTime() - Date.now()) / 1000));

      const { error } = await supabase
        .from('timers')
        .update({ 
          status: 'paused',
          remaining: remainingTime
        })
        .eq('id', timerId);

      if (error) throw error;
      toast.success('Timer paused');
    } catch (error) {
      console.error('Error pausing timer:', error);
      toast.error('Failed to pause timer');
    }
  };

  const resumeTimer = async (timerId: string) => {
    try {
      const timer = timers.find(t => t.id === timerId);
      if (!timer) return;

      const newExpiresAt = new Date(Date.now() + timer.remaining * 1000).toISOString();

      const { error } = await supabase
        .from('timers')
        .update({ 
          status: 'active',
          expires_at: newExpiresAt
        })
        .eq('id', timerId);

      if (error) throw error;
      toast.success('Timer resumed');
    } catch (error) {
      console.error('Error resuming timer:', error);
      toast.error('Failed to resume timer');
    }
  };

  const cancelTimer = async (timerId: string) => {
    try {
      const { error } = await supabase
        .from('timers')
        .update({ status: 'cancelled' })
        .eq('id', timerId);

      if (error) throw error;
      toast.success('Timer cancelled');
    } catch (error) {
      console.error('Error cancelling timer:', error);
      toast.error('Failed to cancel timer');
    }
  };

  // Notes functions
  const createNote = async (title: string, content?: string, tags?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content,
          tags
        });

      if (error) throw error;
      toast.success('Note created');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId);

      if (error) throw error;
      toast.success('Note updated');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Search function
  const performSearch = async (query: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call search edge function
      const { data, error } = await supabase.functions.invoke('search-qa', {
        body: { query }
      });

      if (error) throw error;

      // Save to search history
      await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query,
          response: data.response,
          sources: data.sources
        });

      return data;
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Search failed');
      return null;
    }
  };

  // Weather function
  const getWeather = async (location?: string) => {
    try {
      const weatherLocation = location || preferences.weather_location || 'current';
      
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location: weatherLocation }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting weather:', error);
      toast.error('Failed to get weather');
      return null;
    }
  };

  // Preferences functions
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...newPrefs
        });

      if (error) throw error;
      setPreferences({ ...preferences, ...newPrefs });
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  return {
    // State
    timers,
    notes,
    searchHistory,
    preferences,
    loading,
    
    // Timer functions
    createTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    
    // Notes functions
    createNote,
    updateNote,
    deleteNote,
    
    // Search functions
    performSearch,
    
    // Weather functions
    getWeather,
    
    // Preferences functions
    updatePreferences
  };
}