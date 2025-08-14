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
    const { projectId, codeStructure } = await req.json();
    console.log('Running sandbox for project:', projectId);

    if (!projectId || !codeStructure) {
      return new Response(JSON.stringify({ 
        success: false, 
        errors: ['Project ID and code structure are required'] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simulate sandbox environment creation
    const sandboxId = `sandbox_${projectId}_${Date.now()}`;
    const previewUrl = `https://sandbox.example.com/${sandboxId}`;

    // Simulate code analysis and testing
    const testResults = await analyzeCode(codeStructure);

    // Create response based on test results
    const response = {
      success: testResults.errors.length === 0,
      errors: testResults.errors,
      warnings: testResults.warnings,
      previewUrl: testResults.errors.length === 0 ? previewUrl : undefined,
      sandboxId,
      output: testResults.output
    };

    console.log('Sandbox results:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sandbox error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      errors: ['Failed to run sandbox environment'] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeCode(codeStructure: any) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let output = '';

  try {
    // Simulate code analysis
    if (!codeStructure.files || Object.keys(codeStructure.files).length === 0) {
      errors.push('No code files found');
    }

    // Check for common issues
    const files = codeStructure.files || {};
    
    if (!files['package.json']) {
      errors.push('Missing package.json file');
    }

    if (!files['src/App.tsx'] && !files['src/App.js'] && !files['src/index.tsx'] && !files['src/index.js']) {
      errors.push('Missing main application entry point');
    }

    // Check for syntax issues (simplified)
    for (const [filename, content] of Object.entries(files)) {
      if (typeof content === 'string') {
        // Basic syntax checks
        if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
          if (!content.includes('import React') && content.includes('<')) {
            warnings.push(`${filename}: Missing React import`);
          }
        }

        if (filename.endsWith('.json')) {
          try {
            JSON.parse(content);
          } catch (e) {
            errors.push(`${filename}: Invalid JSON syntax`);
          }
        }
      }
    }

    // Simulate successful build if no errors
    if (errors.length === 0) {
      output = 'Build completed successfully\nApplication ready to run\nAll tests passed';
    } else {
      output = `Build failed with ${errors.length} error(s)`;
    }

  } catch (error) {
    console.error('Code analysis error:', error);
    errors.push('Failed to analyze code structure');
  }

  return { errors, warnings, output };
}