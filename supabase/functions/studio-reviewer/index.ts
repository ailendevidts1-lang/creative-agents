import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleApiKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, tasks, artifacts } = await req.json();
    
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    console.log(`Reviewing job ${jobId} with ${tasks?.length || 0} tasks and ${artifacts?.length || 0} artifacts`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare code changes for review
    const codeChanges = artifacts?.map(artifact => ({
      file: artifact.path,
      action: artifact.type,
      content: artifact.content,
      description: artifact.metadata?.description
    })) || [];

    // Call Gemini 1.5 Flash for code review
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a senior code reviewer. Review these code changes for quality, security, and best practices.

Code Changes:
${codeChanges.map(change => `
File: ${change.file}
Action: ${change.action}
Description: ${change.description}
Content:
${change.content}
`).join('\n---\n')}

Provide a JSON response with this structure:
{
  "overall": {
    "score": 85,
    "status": "approved|needs_changes|rejected",
    "summary": "Overall assessment summary"
  },
  "issues": [
    {
      "file": "src/components/Example.tsx",
      "line": 15,
      "type": "warning|error|suggestion",
      "category": "security|performance|style|logic",
      "message": "Issue description",
      "suggestion": "How to fix it"
    }
  ],
  "positives": [
    "Good use of TypeScript types",
    "Proper error handling"
  ],
  "recommendations": [
    "Consider adding unit tests",
    "Extract magic numbers to constants"
  ]
}

Focus on:
- Security vulnerabilities
- Performance implications
- Code consistency and style
- Best practices adherence
- Maintainability concerns
- Missing error handling
- Accessibility issues`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reviewContent = data.candidates[0].content.parts[0].text;

    console.log('Generated review:', reviewContent);

    // Parse the JSON response
    let reviewResult;
    try {
      const jsonMatch = reviewContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse review JSON:', reviewContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Store review as artifact
    const reviewArtifact = {
      job_id: jobId,
      type: 'review',
      path: 'code_review.json',
      content: JSON.stringify(reviewResult, null, 2),
      metadata: {
        reviewer: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        score: reviewResult.overall?.score,
        status: reviewResult.overall?.status
      }
    };

    const { data: artifact, error: artifactError } = await supabase
      .from('studio_artifacts')
      .insert(reviewArtifact)
      .select()
      .single();

    if (artifactError) {
      console.error('Error creating review artifact:', artifactError);
    }

    console.log('Code review completed successfully');

    return new Response(JSON.stringify({
      success: true,
      review: reviewResult,
      artifact
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-reviewer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Code review failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});