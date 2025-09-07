import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceState } = await req.json();

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced intent classification with skill-aware prompting
    const systemPrompt = `You are an intent classification AI that analyzes user input and determines the appropriate action.

Available Skills:
- create_timer: For setting timers/alarms (e.g., "set 5 minute timer", "timer for cooking")
- list_timers: For viewing active timers (e.g., "show my timers", "what timers are running")
- create_note: For creating notes/reminders (e.g., "take a note", "remind me about meeting")
- list_notes: For viewing notes (e.g., "show my notes", "what notes do I have")
- get_weather: For weather information (e.g., "what's the weather", "temperature outside")
- web_search: For searching information (e.g., "search for restaurants", "look up AI news")
- generate_code: For code generation (e.g., "write a function", "create code for")
- generate_project: For project generation (e.g., "create an app", "build a website")

Voice States Context:
- listening: User is speaking
- thinking: Processing user input
- speaking: AI is responding
- idle: Ready for input

Respond with JSON:
{
  "intent": "skill_name_or_general",
  "entities": {
    "duration": number_in_seconds,
    "name": "extracted_name",
    "location": "extracted_location",
    "query": "search_query",
    "content": "note_content"
  },
  "confidence": 0.0-1.0,
  "needsPlanning": boolean,
  "isQuestion": boolean
}

Examples:
- "Set a 5 minute timer for cooking" → intent: "create_timer", entities: {duration: 300, name: "cooking"}
- "What's the weather in Paris" → intent: "get_weather", entities: {location: "Paris"}
- "Search for pizza places" → intent: "web_search", entities: {query: "pizza places"}
- "Take a note about tomorrow's meeting" → intent: "create_note", entities: {content: "tomorrow's meeting"}

For ambiguous or general conversation, use intent: "general"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Classify this input: "${text}"` }
        ],
        temperature: 0.1,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const completion = await response.json();
    const result = completion.choices[0].message.content;

    let nluResult;
    try {
      nluResult = JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse NLU result:', result);
      // Fallback classification
      nluResult = {
        intent: 'general',
        entities: {},
        confidence: 0.5,
        needsPlanning: false,
        isQuestion: true
      };
    }

    // Ensure required fields
    nluResult.intent = nluResult.intent || 'general';
    nluResult.entities = nluResult.entities || {};
    nluResult.confidence = nluResult.confidence || 0.5;
    nluResult.needsPlanning = nluResult.needsPlanning !== false;
    nluResult.isQuestion = nluResult.isQuestion !== false;

    return new Response(JSON.stringify(nluResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in classify-intent function:', error);
    
    // Return safe fallback
    return new Response(JSON.stringify({
      intent: 'general',
      entities: {},
      confidence: 0.3,
      needsPlanning: false,
      isQuestion: true,
      error: error.message
    }), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});