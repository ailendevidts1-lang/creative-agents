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
    const { projectId, userPrompt, currentFiles } = await req.json();
    
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    console.log(`Starting Studio Agent orchestration for project ${projectId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Create a new job
    const { data: job, error: jobError } = await supabase
      .from('studio_jobs')
      .insert({
        project_id: projectId,
        user_id: user.id,
        user_prompt: userPrompt,
        status: 'planning',
        context_pack: { currentFiles }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw new Error('Failed to create job');
    }

    console.log('Created job:', job.id);

    // Step 1: Context Building & Planning
    const planningResponse = await supabase.functions.invoke('studio-planner', {
      body: {
        jobId: job.id,
        projectId,
        userPrompt,
        currentFiles
      }
    });

    if (planningResponse.error) {
      console.error('Planning failed:', planningResponse.error);
      throw new Error('Planning phase failed');
    }

    const { taskGraph } = planningResponse.data;
    console.log('Planning completed, created task graph with', taskGraph.length, 'tasks');

    // Update job status
    await supabase
      .from('studio_jobs')
      .update({ status: 'editing' })
      .eq('id', job.id);

    // Step 2: Start editing process
    const editingResponse = await supabase.functions.invoke('studio-editor', {
      body: {
        jobId: job.id,
        taskGraph,
        currentFiles
      }
    });

    if (editingResponse.error) {
      console.error('Editing failed:', editingResponse.error);
      throw new Error('Editing phase failed');
    }

    // Update job status to completed
    await supabase
      .from('studio_jobs')
      .update({ status: 'completed' })
      .eq('id', job.id);

    console.log('Studio Agent orchestration completed for job:', job.id);

    return new Response(JSON.stringify({
      jobId: job.id,
      status: 'completed',
      tasks: editingResponse.data.tasks,
      artifacts: editingResponse.data.artifacts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-orchestrator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Studio Agent orchestration failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});