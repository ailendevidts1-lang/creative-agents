import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    console.log('Processing message:', message);

    // Build context from conversation history
    const contextMessages = [];
    if (context && Array.isArray(context)) {
      contextMessages.push(...context.slice(-5).map((c: any) => ({
        role: c.type === 'user' ? 'user' : 'assistant',
        content: c.content
      })));
    }

    // Add current user message
    contextMessages.push({
      role: 'user',
      content: message
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{
              text: `You are Jarvis, an advanced AI assistant integrated into a voice-first interface. You help users with:

- Creating timers and reminders
- Taking and managing notes
- Getting weather information
- Searching for information
- Answering questions
- General conversation and assistance

Keep responses conversational, helpful, and concise. When users ask to create timers, notes, get weather, or search for information, acknowledge their request and let them know you're processing it.

Current capabilities you have access to:
- Timer management (create, list, cancel)
- Note-taking (create, edit, search)
- Weather information
- Web search and Q&A
- General knowledge and conversation

Be friendly, efficient, and always aim to be helpful.

Conversation context:
${contextMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current user message: ${message}`
            }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    console.log('AI Response:', aiResponse);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat error:', error);
    
    // Return fallback response
    const fallbackResponse = "I'm having trouble processing your request right now. Let me try to help you in a simpler way. What would you like to do?";
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        success: false,
        error: error.message 
      }),
      { 
        status: 200, // Return 200 so the client gets the fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});