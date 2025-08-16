import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, prompt, codeStructure } = await req.json();
    console.log('Editing project:', projectId, 'Prompt:', prompt);

    if (!projectId || !prompt || !codeStructure) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Project ID, prompt, and code structure are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare context for AI
    const editPrompt = `
You are a code editing assistant. The user wants to make changes to their project.

User's request: ${prompt}

Current code structure:
${JSON.stringify(codeStructure, null, 2)}

Please analyze the request and provide the necessary code changes. Focus on:
1. Understanding the user's intent
2. Making precise, targeted changes
3. Maintaining code quality and structure
4. Ensuring compatibility with existing code

Respond with a JSON object containing:
{
  "changes": [
    {
      "file": "filename",
      "description": "what was changed",
      "content": "updated file content",
      "action": "create|update|delete"
    }
  ],
  "summary": "brief summary of changes made",
  "reasoning": "explanation of why these changes were made"
}
`;

    // Call OpenAI to generate edits
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert software developer assistant. Provide precise, well-reasoned code edits based on user requests.' 
          },
          { role: 'user', content: editPrompt }
        ],
        max_completion_tokens: 4000
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to generate edits' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const editContent = aiResponse.choices[0].message.content;

    let edits;
    try {
      edits = JSON.parse(editContent);
    } catch (e) {
      console.error('Failed to parse AI response:', editContent);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to parse generated edits' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generated edits:', edits);

    return new Response(JSON.stringify({
      success: true,
      changes: edits.changes || [],
      summary: edits.summary || 'Changes applied successfully',
      reasoning: edits.reasoning || 'Applied requested modifications',
      updatedCodeStructure: applyChanges(codeStructure, edits.changes || [])
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edit project error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to edit project' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function applyChanges(codeStructure: any, changes: any[]) {
  const updated = { ...codeStructure };
  
  for (const change of changes) {
    if (change.action === 'create' || change.action === 'update') {
      if (!updated.files) updated.files = {};
      updated.files[change.file] = change.content;
    } else if (change.action === 'delete') {
      if (updated.files && updated.files[change.file]) {
        delete updated.files[change.file];
      }
    }
  }
  
  return updated;
}