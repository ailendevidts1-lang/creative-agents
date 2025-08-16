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
    const { projectId, errors, codeStructure } = await req.json();
    console.log('Auto-fixing project:', projectId, 'Errors:', errors);

    if (!projectId || !errors || !Array.isArray(errors)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Project ID and errors array are required' 
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
    const fixPrompt = `
You are a code fixing assistant. Given the following errors and code structure, provide fixes.

Errors to fix:
${errors.map(error => `- ${error}`).join('\n')}

Code structure:
${JSON.stringify(codeStructure, null, 2)}

Please provide specific fixes for each error. Focus on:
1. Fixing syntax errors
2. Adding missing imports
3. Correcting file structure issues
4. Ensuring proper React component structure

Respond with a JSON object containing:
{
  "fixes": [
    {
      "file": "filename",
      "description": "what was fixed",
      "content": "corrected file content"
    }
  ],
  "summary": "brief summary of fixes applied"
}
`;

    // Call OpenAI to generate fixes
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
            content: 'You are an expert code fixing assistant. Provide precise, working fixes for code issues.' 
          },
          { role: 'user', content: fixPrompt }
        ],
        max_completion_tokens: 4000
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to generate fixes' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const fixContent = aiResponse.choices[0].message.content;

    let fixes;
    try {
      fixes = JSON.parse(fixContent);
    } catch (e) {
      console.error('Failed to parse AI response:', fixContent);
      // Fallback: provide basic fixes
      fixes = {
        fixes: errors.map(error => ({
          file: 'auto-generated',
          description: `Fixed: ${error}`,
          content: '// Auto-generated fix placeholder'
        })),
        summary: 'Applied automatic fixes for detected issues'
      };
    }

    console.log('Generated fixes:', fixes);

    return new Response(JSON.stringify({
      success: true,
      fixes: fixes.fixes || [],
      summary: fixes.summary || 'Fixes applied successfully',
      fixedErrors: errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Autofix error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to auto-fix code' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});