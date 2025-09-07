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
    const { planId, plan, currentFiles } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating code patches for plan ${planId}`);

    // Build context about existing files
    const codebaseContext = currentFiles ? Object.entries(currentFiles).map(([path, content]) => 
      `=== ${path} ===\n${content}\n`
    ).join('\n') : 'No existing files';

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
            content: `You are a senior full-stack developer. Generate code patches to implement the given plan.

Your response must be valid JSON with this exact structure:
{
  "patches": [
    {
      "file": "src/components/Component.tsx",
      "action": "create" | "update" | "delete",
      "content": "full file content for create/update",
      "diff": "unified diff format showing changes",
      "description": "What this patch does"
    }
  ],
  "buildInstructions": ["npm install new-package", "npm run build"],
  "notes": "Any important notes about the implementation"
}

Guidelines:
- For "create": provide complete file content
- For "update": provide the complete updated file content AND a unified diff
- For "delete": only provide the file path
- Use proper TypeScript/React patterns
- Include proper imports and exports
- Follow existing code style and patterns
- Add error handling where appropriate
- Include proper TypeScript types`
          },
          {
            role: 'user',
            content: `Current codebase:\n${codebaseContext}\n\nImplementation Plan:\nTitle: ${plan.title}\nDescription: ${plan.description}\nTasks: ${plan.tasks.join(', ')}\nFiles to modify: ${plan.files.join(', ')}\n\nGenerate the code patches to implement this plan.`
          }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const patchesContent = data.choices[0].message.content;

    console.log('Generated patches:', patchesContent);

    // Parse the JSON response
    let patches;
    try {
      patches = JSON.parse(patchesContent);
    } catch (parseError) {
      console.error('Failed to parse patches JSON:', patchesContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Add metadata to each patch
    const enrichedPatches = {
      ...patches,
      patches: patches.patches.map((patch: any, index: number) => ({
        ...patch,
        id: `patch_${planId}_${index}`,
        planId,
        status: 'ready',
        createdAt: new Date().toISOString()
      }))
    };

    return new Response(JSON.stringify(enrichedPatches), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in studio-ai-generate function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate code patches'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});