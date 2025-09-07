import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  if (!openaiApiKey) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  // Store WebSocket for cleanup
  let openAISocket: WebSocket | null = null;
  let isConnected = false;

  // Skill tool definitions for OpenAI Realtime API
  const skillTools = [
    {
      type: "function",
      name: "create_timer",
      description: "Create a timer with specified name and duration in seconds",
      parameters: {
        type: "object",
        properties: {
          name: { 
            type: "string", 
            description: "Name of the timer (e.g., 'Cooking timer', 'Meeting reminder')" 
          },
          duration: { 
            type: "number", 
            description: "Duration in seconds (e.g., 300 for 5 minutes)" 
          }
        },
        required: ["name", "duration"]
      }
    },
    {
      type: "function",
      name: "list_timers",
      description: "List all active and paused timers",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      type: "function",
      name: "create_note",
      description: "Create a new note with title and optional content",
      parameters: {
        type: "object",
        properties: {
          title: { 
            type: "string", 
            description: "Title of the note" 
          },
          content: { 
            type: "string", 
            description: "Content/body of the note (optional)" 
          }
        },
        required: ["title"]
      }
    },
    {
      type: "function",
      name: "list_notes",
      description: "List recent notes",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum number of notes to return (default: 10)" }
        },
        required: []
      }
    },
    {
      type: "function",
      name: "get_weather",
      description: "Get current weather information for a location",
      parameters: {
        type: "object",
        properties: {
          location: { 
            type: "string", 
            description: "Location name (city, address) or 'current' for user location" 
          }
        },
        required: ["location"]
      }
    },
    {
      type: "function",
      name: "web_search",
      description: "Search the web and get AI-powered answers to questions",
      parameters: {
        type: "object",
        properties: {
          query: { 
            type: "string", 
            description: "Search query or question to answer" 
          }
        },
        required: ["query"]
      }
    }
  ];

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "realtime=v1"
        }
      }
    );

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
      isConnected = true;
      
      // Send session configuration
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: `You are a helpful AI assistant with access to various skills including timers, notes, weather, and web search. 

Core Skills Available:
- create_timer: Create timers and alarms
- list_timers: View active timers  
- create_note: Create notes and reminders
- list_notes: View saved notes
- get_weather: Get weather information
- web_search: Search the web and answer questions

When users ask for these functions, use the appropriate tools. Be conversational and helpful.

Examples:
- "Set a 5 minute timer for cooking" -> use create_timer with name="cooking" and duration=300
- "What's the weather like?" -> use get_weather with location="current"  
- "Create a note about the meeting" -> use create_note with title="Meeting" and relevant content
- "Search for restaurants nearby" -> use web_search with the query

Always confirm when you've successfully completed an action and provide helpful context.`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tools: skillTools,
          tool_choice: "auto",
          temperature: 0.8,
          max_response_output_tokens: "inf"
        }
      };

      openAISocket.send(JSON.stringify(sessionConfig));
    };

    openAISocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('OpenAI message type:', data.type);

        // Handle function calls
        if (data.type === 'response.function_call_arguments.done') {
          console.log('Function call completed:', data.name, data.arguments);
          
          try {
            const args = JSON.parse(data.arguments);
            let result;

            // Execute the skill function
            switch (data.name) {
              case 'create_timer':
                result = await executeSkill('create_timer', args);
                break;
              case 'list_timers':
                result = await executeSkill('list_timers', args);
                break;
              case 'create_note':
                result = await executeSkill('create_note', args);
                break;
              case 'list_notes':
                result = await executeSkill('list_notes', args);
                break;
              case 'get_weather':
                result = await executeSkill('get_weather', args);
                break;
              case 'web_search':
                result = await executeSkill('web_search', args);
                break;
              default:
                result = { success: false, error: `Unknown function: ${data.name}` };
            }

            // Send function result back to OpenAI
            const functionResponse = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: data.call_id,
                output: JSON.stringify(result)
              }
            };

            openAISocket.send(JSON.stringify(functionResponse));
            
            // Trigger response generation
            openAISocket.send(JSON.stringify({ type: "response.create" }));

          } catch (error) {
            console.error('Function execution error:', error);
            
            const errorResponse = {
              type: "conversation.item.create", 
              item: {
                type: "function_call_output",
                call_id: data.call_id,
                output: JSON.stringify({ 
                  success: false, 
                  error: error.message || 'Function execution failed' 
                })
              }
            };

            openAISocket.send(JSON.stringify(errorResponse));
            openAISocket.send(JSON.stringify({ type: "response.create" }));
          }
        } else {
          // Forward all other messages to client
          socket.send(event.data);
        }
      } catch (error) {
        console.error('Error processing OpenAI message:', error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Connection to AI service failed' 
      }));
    };

    openAISocket.onclose = () => {
      console.log('OpenAI WebSocket closed');
      isConnected = false;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    try {
      // Forward client messages to OpenAI
      if (openAISocket && isConnected) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error('Error forwarding message to OpenAI:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket closed');
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});

// Helper function to execute skills via Supabase edge functions
async function executeSkill(skillName: string, parameters: any) {
  console.log(`Executing skill: ${skillName}`, parameters);
  
  try {
    // Use Supabase client to call skill functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    let result;
    
    switch (skillName) {
      case 'create_timer':
        // Mock timer creation for now
        result = {
          success: true,
          data: {
            id: `timer_${Date.now()}`,
            name: parameters.name,
            duration: parameters.duration,
            created_at: new Date().toISOString()
          },
          message: `Created timer "${parameters.name}" for ${Math.round(parameters.duration / 60)} minutes`
        };
        break;
        
      case 'list_timers':
        // Mock timer listing
        result = {
          success: true,
          data: [],
          message: "No active timers found"
        };
        break;
        
      case 'create_note':
        // Mock note creation
        result = {
          success: true,
          data: {
            id: `note_${Date.now()}`,
            title: parameters.title,
            content: parameters.content || '',
            created_at: new Date().toISOString()
          },
          message: `Created note "${parameters.title}"`
        };
        break;
        
      case 'list_notes':
        // Mock note listing
        result = {
          success: true,
          data: [],
          message: "No notes found"
        };
        break;
        
      case 'get_weather':
        // Call actual weather function
        const weatherResponse = await fetch(`${supabaseUrl}/functions/v1/get-weather`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ location: parameters.location })
        });
        
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          result = {
            success: true,
            data: weatherData,
            message: `Weather for ${parameters.location}: ${weatherData.description}, ${Math.round(weatherData.temperature)}°C`
          };
        } else {
          throw new Error('Weather service unavailable');
        }
        break;
        
      case 'web_search':
        // Call actual search function
        const searchResponse = await fetch(`${supabaseUrl}/functions/v1/search-qa`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query: parameters.query,
            includeWeb: true,
            maxResults: 3
          })
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          result = {
            success: true,
            data: searchData,
            message: `Found search results for: ${parameters.query}`
          };
        } else {
          throw new Error('Search service unavailable');
        }
        break;
        
      default:
        throw new Error(`Unknown skill: ${skillName}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`Skill execution failed for ${skillName}:`, error);
    return {
      success: false,
      error: error.message || 'Skill execution failed'
    };
  }
}