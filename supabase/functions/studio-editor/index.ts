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
    const { jobId, taskGraph, currentFiles } = await req.json();
    
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    console.log(`Editing for job ${jobId} with ${taskGraph.length} tasks`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const completedTasks = [];
    const artifacts = [];

    // Process tasks by batch
    const batches = taskGraph.reduce((acc: any, task: any) => {
      const batchNum = task.batch_number;
      if (!acc[batchNum]) acc[batchNum] = [];
      acc[batchNum].push(task);
      return acc;
    }, {});

    for (const batchNumber of Object.keys(batches).sort()) {
      console.log(`Processing batch ${batchNumber}`);
      const batchTasks = batches[batchNumber];

      for (const task of batchTasks) {
        console.log(`Processing task: ${task.title}`);
        
        // Update task status
        await supabase
          .from('studio_tasks')
          .update({ status: 'in_progress' })
          .eq('id', task.id);

        // Generate code changes using Gemini 1.5 Pro
        const codebaseContext = currentFiles ? Object.entries(currentFiles).map(([path, content]) => 
          `File: ${path}\n${content}`
        ).join('\n\n') : 'No existing files';

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a senior software engineer. Generate code changes for this task.

Current codebase:
${codebaseContext}

Task: ${task.title}
Acceptance Criteria: ${task.acceptance_criteria}
Target Files: ${task.target_files.join(', ')}

Generate a JSON response with this structure:
{
  "diffs": [
    {
      "file": "src/components/Example.tsx",
      "action": "create|update|delete",
      "content": "full file content for create/update",
      "description": "what this change does"
    }
  ],
  "buildInstructions": ["Any build steps needed"],
  "notes": "Summary of changes made"
}

Rules:
- For create: provide full file content
- For update: provide complete updated file content
- For delete: content should be null
- Follow React/TypeScript best practices
- Use proper imports and exports
- Ensure code is properly formatted`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            }
          }),
        });

        if (!response.ok) {
          console.error('Gemini API error for task:', task.id);
          await supabase
            .from('studio_tasks')
            .update({ status: 'error' })
            .eq('id', task.id);
          continue;
        }

        const data = await response.json();
        const editContent = data.candidates[0].content.parts[0].text;

        // Parse the JSON response
        let editResult;
        try {
          const jsonMatch = editContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            editResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse edit JSON:', editContent);
          await supabase
            .from('studio_tasks')
            .update({ status: 'error' })
            .eq('id', task.id);
          continue;
        }

        // Store diffs and artifacts
        await supabase
          .from('studio_tasks')
          .update({ 
            status: 'completed',
            diffs: editResult.diffs
          })
          .eq('id', task.id);

        // Create artifacts for each diff
        for (const diff of editResult.diffs) {
          const { data: artifact } = await supabase
            .from('studio_artifacts')
            .insert({
              job_id: jobId,
              type: diff.action,
              path: diff.file,
              content: diff.content,
              metadata: {
                description: diff.description,
                taskId: task.id
              }
            })
            .select()
            .single();

          if (artifact) {
            artifacts.push(artifact);
          }
        }

        completedTasks.push({
          ...task,
          diffs: editResult.diffs,
          buildInstructions: editResult.buildInstructions,
          notes: editResult.notes
        });

        console.log(`Completed task: ${task.title}`);
      }
    }

    console.log('Editing completed for job:', jobId);

    return new Response(JSON.stringify({ 
      tasks: completedTasks,
      artifacts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-editor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Editing phase failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});