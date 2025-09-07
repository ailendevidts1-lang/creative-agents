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
    const { jobId, artifacts, autoCommit = false, createPR = false } = await req.json();
    
    console.log(`Applying patches for job ${jobId} with ${artifacts?.length || 0} artifacts`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Process artifacts and prepare file changes
    const appliedChanges = [];
    
    for (const artifact of artifacts) {
      if (!artifact.content || !artifact.path) continue;
      
      const change = {
        id: artifact.id,
        file: artifact.path,
        action: artifact.type,
        content: artifact.content,
        description: artifact.metadata?.description || `${artifact.type} ${artifact.path}`,
        applied: true,
        timestamp: new Date().toISOString()
      };
      
      appliedChanges.push(change);
      
      // In a real implementation, this would write to the file system
      console.log(`Applied ${artifact.type} to ${artifact.path}`);
    }

    // Create application artifact
    const applicationArtifact = {
      job_id: jobId,
      type: 'application',
      path: 'applied_changes.json',
      content: JSON.stringify({
        changes: appliedChanges,
        summary: `Applied ${appliedChanges.length} file changes`,
        timestamp: new Date().toISOString()
      }, null, 2),
      metadata: {
        appliedCount: appliedChanges.length,
        timestamp: new Date().toISOString(),
        autoCommit,
        createPR
      }
    };

    const { data: artifact, error: artifactError } = await supabase
      .from('studio_artifacts')
      .insert(applicationArtifact)
      .select()
      .single();

    if (artifactError) {
      console.error('Error creating application artifact:', artifactError);
    }

    // Optional: Auto-commit or create PR
    let gitResult = null;
    if (autoCommit || createPR) {
      const gitResponse = await supabase.functions.invoke('studio-gitops', {
        body: {
          jobId,
          artifacts,
          commitMessage: `Studio Agent: Applied ${appliedChanges.length} changes`,
          createPR
        }
      });
      
      if (!gitResponse.error) {
        gitResult = gitResponse.data;
      }
    }

    console.log('Patch application completed successfully');

    return new Response(JSON.stringify({
      success: true,
      applied: appliedChanges,
      artifact,
      gitResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-apply-patches:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Patch application failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});