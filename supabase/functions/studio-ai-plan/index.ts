import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, prompt, currentFiles } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating plan for project ${projectId} with prompt: ${prompt}`);

    // Analyze current codebase structure
    const codebaseContext = currentFiles ? Object.entries(currentFiles).map(([path, content]) => 
      `File: ${path}\n${content}`
    ).join('\n\n') : 'No existing files';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a senior software architect and code planner. Given a user request and current codebase, create a detailed implementation plan.

Your response must be valid JSON with this exact structure:
{
  "title": "Brief plan title",
  "description": "Detailed description of what will be implemented",
  "tasks": ["Step 1: Task description", "Step 2: Task description", ...],
  "files": ["src/components/NewComponent.tsx", "src/hooks/useNewHook.ts", ...],
  "dependencies": ["package-name", "another-package"],
  "estimatedTime": "2-4 hours",
  "complexity": "medium"
}

Focus on:
- Breaking down the work into clear, actionable tasks
- Identifying all files that need to be created or modified
- Listing any new dependencies required
- Providing realistic time estimates
- Considering the existing codebase structure`
          },
          {
            role: 'user',
            content: `Current codebase:\n${codebaseContext}\n\nUser request: ${prompt}\n\nCreate a detailed implementation plan for this request.`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const planContent = data.choices[0].message.content;

    console.log('Generated plan:', planContent);

    // Parse the JSON response
    let plan;
    try {
      plan = JSON.parse(planContent);
    } catch (parseError) {
      console.error('Failed to parse plan JSON:', planContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Add metadata
    const fullPlan = {
      id: `plan_${Date.now()}`,
      projectId,
      prompt,
      status: 'ready',
      createdAt: new Date().toISOString(),
      ...plan
    };

    return new Response(JSON.stringify({ plan: fullPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in studio-ai-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate AI plan'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});