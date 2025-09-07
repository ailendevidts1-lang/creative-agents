import { skillsIntegrator } from '@/services/SkillsIntegrator';

/**
 * Tool definitions for OpenAI Realtime API and other voice/chat systems
 * These tools map to the integrated skills system
 */

export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export const getSkillToolDefinitions = (): ToolDefinition[] => {
  return [
    // Timer Tools
    {
      type: 'function',
      name: 'create_timer',
      description: 'Create a timer with specified name and duration in seconds',
      parameters: {
        type: 'object',
        properties: {
          name: { 
            type: 'string', 
            description: 'Name of the timer (e.g., "Cooking timer", "Meeting reminder")' 
          },
          duration: { 
            type: 'number', 
            description: 'Duration in seconds (e.g., 300 for 5 minutes)' 
          }
        },
        required: ['name', 'duration']
      }
    },
    {
      type: 'function',
      name: 'list_timers',
      description: 'List all active and paused timers',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      type: 'function',
      name: 'pause_timer',
      description: 'Pause a running timer',
      parameters: {
        type: 'object',
        properties: {
          timerId: { type: 'string', description: 'ID of the timer to pause' }
        },
        required: ['timerId']
      }
    },
    {
      type: 'function',
      name: 'resume_timer',
      description: 'Resume a paused timer',
      parameters: {
        type: 'object',
        properties: {
          timerId: { type: 'string', description: 'ID of the timer to resume' }
        },
        required: ['timerId']
      }
    },
    {
      type: 'function',
      name: 'cancel_timer',
      description: 'Cancel/stop a timer',
      parameters: {
        type: 'object',
        properties: {
          timerId: { type: 'string', description: 'ID of the timer to cancel' }
        },
        required: ['timerId']
      }
    },

    // Notes Tools
    {
      type: 'function',
      name: 'create_note',
      description: 'Create a new note with title and optional content',
      parameters: {
        type: 'object',
        properties: {
          title: { 
            type: 'string', 
            description: 'Title of the note' 
          },
          content: { 
            type: 'string', 
            description: 'Content/body of the note (optional)' 
          },
          tags: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Tags to categorize the note (optional)' 
          }
        },
        required: ['title']
      }
    },
    {
      type: 'function',
      name: 'list_notes',
      description: 'List recent notes',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of notes to return (default: 10)' }
        },
        required: []
      }
    },
    {
      type: 'function',
      name: 'update_note',
      description: 'Update an existing note',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'ID of the note to update' },
          title: { type: 'string', description: 'New title (optional)' },
          content: { type: 'string', description: 'New content (optional)' },
          tags: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'New tags (optional)' 
          }
        },
        required: ['noteId']
      }
    },
    {
      type: 'function',
      name: 'delete_note',
      description: 'Delete a note',
      parameters: {
        type: 'object',
        properties: {
          noteId: { type: 'string', description: 'ID of the note to delete' }
        },
        required: ['noteId']
      }
    },

    // Weather Tools
    {
      type: 'function',
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { 
            type: 'string', 
            description: 'Location name (city, address) or "current" for user location' 
          }
        },
        required: ['location']
      }
    },

    // Search Tools
    {
      type: 'function',
      name: 'web_search',
      description: 'Search the web and get AI-powered answers to questions',
      parameters: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'Search query or question to answer' 
          }
        },
        required: ['query']
      }
    },

    // Voice Analysis Tools
    {
      type: 'function',
      name: 'analyze_voice',
      description: 'Analyze voice characteristics from audio',
      parameters: {
        type: 'object',
        properties: {
          audioUrl: { type: 'string', description: 'URL of the audio file to analyze' },
          name: { type: 'string', description: 'Name for the voice profile (optional)' }
        },
        required: ['audioUrl']
      }
    },
    {
      type: 'function',
      name: 'list_voice_profiles',
      description: 'List saved voice profiles',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    },

    // Code Generation Tools
    {
      type: 'function',
      name: 'generate_project',
      description: 'Generate a complete software project from description',
      parameters: {
        type: 'object',
        properties: {
          prompt: { 
            type: 'string', 
            description: 'Description of the project to generate' 
          },
          language: { 
            type: 'string', 
            description: 'Programming language (default: javascript)' 
          },
          framework: { 
            type: 'string', 
            description: 'Framework to use (optional)' 
          }
        },
        required: ['prompt']
      }
    },
    {
      type: 'function',
      name: 'generate_code',
      description: 'Generate code snippets for specific functionality',
      parameters: {
        type: 'object',
        properties: {
          description: { 
            type: 'string', 
            description: 'Description of the code to generate' 
          },
          language: { 
            type: 'string', 
            description: 'Programming language for the code' 
          }
        },
        required: ['description', 'language']
      }
    }
  ];
};

/**
 * Execute a skill tool function
 */
export const executeSkillTool = async (toolName: string, parameters: any): Promise<any> => {
  console.log(`Executing skill tool: ${toolName}`, parameters);
  
  try {
    const result = await skillsIntegrator.executeSkill(toolName, parameters);
    
    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: result.data
      };
    } else {
      throw new Error(result.error || 'Tool execution failed');
    }
  } catch (error) {
    console.error(`Skill tool execution failed for ${toolName}:`, error);
    throw error;
  }
};

/**
 * Get simplified tool definitions for the NLU planner
 */
export const getSkillCapabilities = (): string[] => {
  return [
    'create_timer - Create timers and alarms',
    'list_timers - View active timers',
    'pause_timer - Pause running timers',
    'resume_timer - Resume paused timers', 
    'cancel_timer - Cancel timers',
    'create_note - Create notes and reminders',
    'list_notes - View saved notes',
    'update_note - Edit existing notes',
    'delete_note - Delete notes',
    'get_weather - Get weather information',
    'web_search - Search the web and answer questions',
    'analyze_voice - Analyze voice characteristics',
    'list_voice_profiles - View voice profiles',
    'generate_project - Generate software projects',
    'generate_code - Generate code snippets'
  ];
};