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
    const { query, intent, entities, context } = await req.json();
    
    if (!query || !intent) {
      throw new Error('Query and intent are required');
    }

    const contextStr = context?.map((c: any) => `${c.type}: ${c.content}`).join('\n') || '';

    const prompt = `Create an execution plan for this user request:

Query: "${query}"
Intent: ${intent}
Entities: ${JSON.stringify(entities)}

Recent Context:
${contextStr}

Generate a step-by-step plan with this JSON format:
{
  "steps": [
    {
      "id": "unique_id",
      "type": "skill|api|search|computation", 
      "action": "specific_action_name",
      "parameters": {
        "param1": "value1"
      },
      "dependencies": []
    }
  ],
  "summary": "Brief description of the plan",
  "estimatedDuration": 5000
}

Available actions by type:
- skill: create_timer, create_note, list_notes, list_timers
- api: get_weather, get_location
- search: web_search, knowledge_search
- computation: calculate, analyze, summarize

Make the plan specific and actionable.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{
              text: `You are a task planning AI. Always respond with valid JSON.\n\n${prompt}`
            }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.2
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    try {
      const plan = JSON.parse(content);
      
      // Validate plan structure
      if (!plan.steps || !Array.isArray(plan.steps)) {
        throw new Error('Invalid plan format');
      }

      // Add unique IDs if missing
      plan.steps = plan.steps.map((step: any, index: number) => ({
        ...step,
        id: step.id || `step_${index}_${Date.now()}`
      }));

      return new Response(
        JSON.stringify(plan),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse planning response:', content);
      
      // Create fallback plan
      const fallbackPlan = {
        steps: [
          {
            id: `fallback_${Date.now()}`,
            type: 'computation',
            action: 'process_request',
            parameters: { query, intent },
            dependencies: []
          }
        ],
        summary: `Execute ${intent} request: ${query}`,
        estimatedDuration: 3000
      };
      
      return new Response(
        JSON.stringify(fallbackPlan),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Planning error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});