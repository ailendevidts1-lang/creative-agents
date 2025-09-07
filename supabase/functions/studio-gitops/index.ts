import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, projectId, artifacts, commitMessage, createPR = false } = await req.json();
    
    console.log(`GitOps operation for job ${jobId}: ${createPR ? 'Creating PR' : 'Committing changes'}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Simulate Git operations
    const branchName = `studio-agent-${jobId}`;
    const commitHash = `commit_${Date.now()}`;
    
    // Mock Git operations
    const gitOperations = [
      'Creating feature branch...',
      'Staging file changes...',
      'Committing changes...',
      createPR ? 'Creating pull request...' : 'Pushing to main...'
    ];

    let prUrl = null;
    if (createPR) {
      prUrl = `https://github.com/user/repo/pull/${Math.floor(Math.random() * 1000)}`;
    }

    // Simulate operation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create GitOps artifact
    const gitopsArtifact = {
      job_id: jobId,
      type: 'gitops',
      path: createPR ? 'pull_request.json' : 'commit.json',
      content: JSON.stringify({
        branch: branchName,
        commit: commitHash,
        message: commitMessage,
        prUrl,
        files: artifacts?.map(a => a.path) || [],
        operations: gitOperations
      }, null, 2),
      metadata: {
        branch: branchName,
        commit: commitHash,
        prUrl,
        timestamp: new Date().toISOString(),
        operations: gitOperations
      }
    };

    const { data: artifact, error: artifactError } = await supabase
      .from('studio_artifacts')
      .insert(gitopsArtifact)
      .select()
      .single();

    if (artifactError) {
      console.error('Error creating GitOps artifact:', artifactError);
    }

    console.log('GitOps operation completed successfully');

    return new Response(JSON.stringify({
      success: true,
      branch: branchName,
      commit: commitHash,
      prUrl,
      operations: gitOperations,
      artifact
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-gitops:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'GitOps operation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});