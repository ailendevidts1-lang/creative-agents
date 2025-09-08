import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  if (!googleApiKey) {
    return new Response("Google AI API key not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  let sessionId: string | null = null;
  let userId: string | null = null;

  socket.onopen = () => {
    console.log('Agent voice WebSocket connected');
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Voice message type:', data.type);

      switch (data.type) {
        case 'session.create':
          const { sessionId: newSessionId, userId: newUserId } = data;
          sessionId = newSessionId;
          userId = newUserId;
          
          // Create or get agent session
          const { data: session, error } = await supabase
            .from('agent_sessions')
            .upsert({
              session_id: sessionId,
              user_id: userId,
              mode: 'voice',
              status: 'active'
            })
            .select()
            .single();

          if (error) {
            console.error('Session creation error:', error);
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to create session'
            }));
            return;
          }

          socket.send(JSON.stringify({
            type: 'session.created',
            sessionId: session.session_id,
            capabilities: [
              'web.search', 'notes.create', 'timers.create', 
              'weather.get', 'mail.draft', 'calendar.create'
            ]
          }));
          break;

        case 'voice.input':
          if (!sessionId || !userId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'No active session'
            }));
            return;
          }

          const { transcript, partial } = data;
          
          if (!partial && transcript) {
            // Process complete transcript with agent orchestrator
            await processVoiceInput(transcript, sessionId, userId, socket, supabase);
          }
          break;

        case 'voice.interrupt':
          // Handle barge-in/interruption
          socket.send(JSON.stringify({
            type: 'voice.interrupted'
          }));
          break;

        default:
          console.log('Unknown message type:', data.type);
      }

    } catch (error) {
      console.error('Error processing voice message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Processing failed'
      }));
    }
  };

  socket.onclose = () => {
    console.log('Agent voice WebSocket closed');
  };

  socket.onerror = (error) => {
    console.error('Agent voice WebSocket error:', error);
  };

  return response;
});

async function processVoiceInput(
  transcript: string, 
  sessionId: string, 
  userId: string, 
  socket: WebSocket, 
  supabase: any
) {
  try {
    console.log('Processing voice input:', transcript);

    // Send thinking indicator
    socket.send(JSON.stringify({
      type: 'agent.thinking',
      message: 'Processing your request...'
    }));

    // Call agent orchestrator
    const response = await fetch(`${supabaseUrl}/functions/v1/agent-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        message: transcript,
        mode: 'voice',
        persona: 'voice_assistant'
      })
    });

    if (!response.ok) {
      throw new Error('Agent orchestrator failed');
    }

    // Stream response back to client
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const eventData = line.slice(6);
          if (eventData.trim()) {
            try {
              const parsed = JSON.parse(eventData);
              
              // Transform agent events to voice events
              switch (parsed.type) {
                case 'log':
                  socket.send(JSON.stringify({
                    type: 'agent.status',
                    message: parsed.message
                  }));
                  break;
                  
                case 'plan':
                  socket.send(JSON.stringify({
                    type: 'agent.plan',
                    steps: parsed.steps
                  }));
                  break;
                  
                case 'tool_call':
                  socket.send(JSON.stringify({
                    type: 'agent.executing',
                    tool: parsed.tool,
                    args: parsed.args
                  }));
                  break;
                  
                case 'tool_result':
                  socket.send(JSON.stringify({
                    type: 'agent.result',
                    stepId: parsed.stepId,
                    result: parsed.result
                  }));
                  break;
                  
                case 'approval_request':
                  socket.send(JSON.stringify({
                    type: 'agent.approval_needed',
                    summary: parsed.summary,
                    riskLevel: parsed.riskLevel
                  }));
                  break;
                  
                case 'done':
                  // Generate voice response
                  const summary = await generateVoiceResponse(transcript, sessionId, supabase);
                  socket.send(JSON.stringify({
                    type: 'agent.response',
                    text: summary,
                    final: true
                  }));
                  break;
                  
                case 'error':
                  socket.send(JSON.stringify({
                    type: 'agent.error',
                    message: parsed.message
                  }));
                  break;
              }
            } catch (parseError) {
              console.error('Failed to parse event data:', parseError);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('Voice processing error:', error);
    socket.send(JSON.stringify({
      type: 'agent.error',
      message: 'I encountered an error processing your request. Please try again.'
    }));
  }
}

async function generateVoiceResponse(query: string, sessionId: string, supabase: any) {
  try {
    // Get recent execution results for this session
    const { data: executions } = await supabase
      .from('agent_executions')
      .select(`
        *,
        agent_plans!inner(session_id)
      `)
      .eq('agent_plans.session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(5);

    const results = executions?.map(e => ({
      tool: e.tool_name,
      result: e.result,
      status: e.status
    })) || [];

    const prompt = `You are a voice assistant. Generate a natural, conversational response to summarize what you accomplished for the user.

User asked: "${query}"

Actions taken: ${JSON.stringify(results, null, 2)}

Provide a friendly, concise response (2-3 sentences max) that:
1. Acknowledges what the user asked for
2. Summarizes what was completed successfully  
3. Mentions any next steps or additional help needed

Speak in first person and be conversational.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GOOGLE_AI_API_KEY')!
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Failed to generate voice response:', error);
    return "I've completed your request. Is there anything else I can help you with?";
  }
}