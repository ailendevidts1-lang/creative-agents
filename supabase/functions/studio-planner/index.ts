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
    const { jobId, projectId, userPrompt, currentFiles } = await req.json();
    
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    console.log(`Planning for job ${jobId}: ${userPrompt}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build context pack from current files
    const codebaseContext = currentFiles ? Object.entries(currentFiles).map(([path, content]) => 
      `File: ${path}\n${content}`
    ).join('\n\n') : 'No existing files';

    // Call Gemini 1.5 Pro for planning
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a senior software architect and code planner. Given a user request and current codebase, create a detailed task graph with batches of tasks.

Current codebase:
${codebaseContext}

User request: ${userPrompt}

Create a JSON response with this structure:
{
  "taskGraph": [
    {
      "title": "Task title",
      "batchNumber": 1,
      "acceptanceCriteria": "What needs to be achieved",
      "targetFiles": ["src/file1.tsx", "src/file2.ts"],
      "dependencies": [],
      "estimatedComplexity": "low|medium|high"
    }
  ]
}

Focus on:
- Breaking work into logical batches that can run sequentially
- Clear acceptance criteria for each task
- Identifying all files that need modification
- Considering dependencies between tasks
- Keeping tasks focused and actionable`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
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
    const planContent = data.candidates[0].content.parts[0].text;

    console.log('Generated plan:', planContent);

    // Parse the JSON response
    let taskGraph;
    try {
      const jsonMatch = planContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        taskGraph = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse plan JSON:', planContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Store tasks in database
    const tasks = taskGraph.taskGraph.map((task: any, index: number) => ({
      job_id: jobId,
      title: task.title,
      batch_number: task.batchNumber || index + 1,
      acceptance_criteria: task.acceptanceCriteria,
      target_files: task.targetFiles || [],
      plan: {
        dependencies: task.dependencies || [],
        complexity: task.estimatedComplexity || 'medium'
      },
      status: 'ready'
    }));

    const { data: createdTasks, error: tasksError } = await supabase
      .from('studio_tasks')
      .insert(tasks)
      .select();

    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
      throw new Error('Failed to create tasks');
    }

    console.log('Created', createdTasks.length, 'tasks for job', jobId);

    return new Response(JSON.stringify({ 
      taskGraph: createdTasks,
      planContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-planner:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Planning phase failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});