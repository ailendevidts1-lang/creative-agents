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
    const { jobId, artifacts } = await req.json();
    
    console.log(`Creating preview for job ${jobId} with ${artifacts?.length || 0} artifacts`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Simulate preview deployment
    const previewId = `preview_${Date.now()}`;
    const previewUrl = `https://${previewId}.studio-preview.lovable.dev`;
    
    // Mock deployment process
    const deploymentSteps = [
      'Building project...',
      'Installing dependencies...',
      'Running tests...',
      'Optimizing build...',
      'Deploying to sandbox...',
      'Preview ready!'
    ];

    // Simulate deployment time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create preview artifact
    const previewArtifact = {
      job_id: jobId,
      type: 'preview',
      path: 'preview_url',
      content: previewUrl,
      metadata: {
        previewId,
        deploymentSteps,
        timestamp: new Date().toISOString()
      }
    };

    const { data: artifact, error: artifactError } = await supabase
      .from('studio_artifacts')
      .insert(previewArtifact)
      .select()
      .single();

    if (artifactError) {
      console.error('Error creating preview artifact:', artifactError);
    }

    console.log('Preview created successfully:', previewUrl);

    return new Response(JSON.stringify({
      success: true,
      previewUrl,
      previewId,
      deploymentSteps,
      artifact
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-preview:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Preview creation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});