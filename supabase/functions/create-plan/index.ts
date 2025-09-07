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
    const { query, intent, entities, context, availableSkills } = await req.json();

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a comprehensive prompt for plan generation
    const systemPrompt = `You are a task planning AI that creates executable plans based on user requests.

Available Skills:
${availableSkills?.join('\n') || 'No skills available'}

You must respond with a JSON object containing:
{
  "steps": [
    {
      "id": "unique_id",
      "type": "skill|api|search|computation",
      "action": "action_name",
      "parameters": {...},
      "dependencies": []
    }
  ],
  "summary": "Brief description of what this plan accomplishes",
  "estimatedDuration": 5000
}

Choose appropriate action types:
- "skill" for core skills like create_timer, create_note, get_weather, web_search
- "api" for external API calls  
- "search" for information retrieval
- "computation" for general processing

Map common intents:
- timer requests → create_timer skill
- note requests → create_note skill  
- weather requests → get_weather skill
- search requests → web_search skill
- list requests → list_timers or list_notes skills

Keep plans simple and focused on the user's actual request.`;

    const userPrompt = `Intent: ${intent}
Query: "${query}"
Entities: ${JSON.stringify(entities)}
Context: ${JSON.stringify(context?.slice(-3) || [])}

Create an execution plan for this request.`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const completion = await response.json();
    const planContent = completion.choices[0].message.content;

    let planData;
    try {
      planData = JSON.parse(planContent);
    } catch (error) {
      console.error('Failed to parse plan JSON:', planContent);
      // Fallback plan
      planData = {
        steps: [{
          id: `step_${Date.now()}`,
          type: 'computation',
          action: 'process_general_query',
          parameters: { query, intent },
          dependencies: []
        }],
        summary: `Process ${intent} request: ${query}`,
        estimatedDuration: 3000
      };
    }

    // Ensure all steps have required fields
    planData.steps = planData.steps.map((step: any, index: number) => ({
      id: step.id || `step_${Date.now()}_${index}`,
      type: step.type || 'computation',
      action: step.action || 'process_general_query',
      parameters: step.parameters || { query, intent },
      dependencies: step.dependencies || []
    }));

    return new Response(JSON.stringify(planData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-plan function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create plan',
      details: 'Plan creation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});