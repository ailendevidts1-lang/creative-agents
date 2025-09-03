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
    const { text, model = 'gpt-4o-mini' } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for classification');
    }

    const prompt = `Classify the following user input into one of these categories and extract relevant entities:

Categories:
- timer: Setting timers, alarms, reminders
- notes: Creating, editing, or managing notes
- weather: Getting weather information
- search: Searching for information or asking questions
- development: Coding, debugging, project-related questions
- general: Everything else

Text to classify: "${text}"

Respond with JSON in this format:
{
  "intent": "category_name",
  "entities": {
    "duration": "5 minutes" (for timers),
    "location": "New York" (for weather),
    "content": "note content" (for notes),
    "query": "search terms" (for search)
  },
  "confidence": 0.95,
  "needsPlanning": true/false,
  "isQuestion": true/false
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are an intent classification system. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      
      // Fallback classification
      const fallback = {
        intent: 'general',
        entities: {},
        confidence: 0.5,
        needsPlanning: false,
        isQuestion: text.includes('?') || text.toLowerCase().startsWith('what') || 
                   text.toLowerCase().startsWith('how') || text.toLowerCase().startsWith('when')
      };
      
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Intent classification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});