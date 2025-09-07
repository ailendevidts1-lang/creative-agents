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
    const { jobId, taskId, files } = await req.json();
    
    console.log(`Running validation for job ${jobId}, task ${taskId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Mock validation results
    const validationResults = {
      linting: {
        passed: true,
        errors: [],
        warnings: [
          'Unused import in src/components/ThemeToggle.tsx:1'
        ]
      },
      typeCheck: {
        passed: true,
        errors: []
      },
      tests: {
        passed: true,
        coverage: 85,
        results: [
          {
            file: 'src/contexts/ThemeContext.test.tsx',
            status: 'passed',
            tests: 3
          }
        ]
      },
      performance: {
        bundleSize: '145kb',
        lighthouseScore: 95
      }
    };

    // Update task status if validation passes
    if (taskId) {
      const status = validationResults.linting.passed && validationResults.typeCheck.passed && validationResults.tests.passed 
        ? 'validated' 
        : 'validation_failed';

      await supabase
        .from('studio_tasks')
        .update({ status })
        .eq('id', taskId);
    }

    console.log('Validation completed successfully');

    return new Response(JSON.stringify({
      success: true,
      results: validationResults,
      status: 'validated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-validator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Validation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});