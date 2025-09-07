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
    
    // Get user from JWT - handle both cases with and without auth
    let userId;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
      
      if (userError || !user) {
        console.log('Invalid or missing user token, using demo mode');
        userId = '00000000-0000-0000-0000-000000000000'; // Demo user ID
      } else {
        userId = user.id;
      }
    } else {
      console.log('No auth header, using demo mode');
      userId = '00000000-0000-0000-0000-000000000000'; // Demo user ID
    }

    // Create a new job
    const { data: job, error: jobError } = await supabase
      .from('studio_jobs')
      .insert({
        project_id: projectId,
        user_id: userId,
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

    // Step 0: Index repository for semantic search
    console.log('Step 0: Indexing repository...');
    await supabase.functions.invoke('studio-indexer', {
      body: {
        projectId,
        files: currentFiles || {}
      }
    });

    // Step 1: Context Building & Planning
    console.log('Step 1: Planning...');
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
    console.log('Step 2: Editing...');
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

    // Step 3: Validation
    console.log('Step 3: Validation...');
    await supabase
      .from('studio_jobs')
      .update({ status: 'validating' })
      .eq('id', job.id);

    const validationResponse = await supabase.functions.invoke('studio-validator', {
      body: {
        jobId: job.id,
        files: editingResponse.data.artifacts
      }
    });

    // Step 4: Code Review
    console.log('Step 4: Code Review...');
    const reviewResponse = await supabase.functions.invoke('studio-reviewer', {
      body: {
        jobId: job.id,
        tasks: editingResponse.data.tasks,
        artifacts: editingResponse.data.artifacts
      }
    });

    // Step 5: Preview Generation
    console.log('Step 5: Creating Preview...');
    const previewResponse = await supabase.functions.invoke('studio-preview', {
      body: {
        jobId: job.id,
        artifacts: editingResponse.data.artifacts
      }
    });

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
      artifacts: editingResponse.data.artifacts,
      validation: validationResponse.data,
      review: reviewResponse.data,
      preview: previewResponse.data
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