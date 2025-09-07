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
    const { projectId, files } = await req.json();
    
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    console.log(`Indexing repository for project ${projectId} with ${Object.keys(files).length} files`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const indexedFiles = [];

    // Process each file for indexing
    for (const [filePath, content] of Object.entries(files)) {
      if (typeof content !== 'string') continue;

      // Generate file hash
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Detect language
      const language = detectLanguage(filePath);

      // Extract symbols and generate summary using Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this ${language} code file and extract symbols and create a summary.

File: ${filePath}
Content:
${content}

Provide a JSON response with this structure:
{
  "symbols": {
    "functions": ["functionName1", "functionName2"],
    "classes": ["ClassName1"],
    "interfaces": ["InterfaceName1"],
    "types": ["TypeName1"],
    "constants": ["CONSTANT_NAME"],
    "imports": ["@/components/ui/button", "react"],
    "exports": ["default", "namedExport"]
  },
  "summary": "Brief description of what this file does and its main purpose",
  "complexity": "low|medium|high",
  "dependencies": ["dependency1", "dependency2"]
}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      let symbols = {};
      let contentSummary = `${language} file: ${filePath}`;

      if (response.ok) {
        try {
          const data = await response.json();
          const analysisContent = data.candidates[0].content.parts[0].text;
          const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            symbols = analysis.symbols || {};
            contentSummary = analysis.summary || contentSummary;
          }
        } catch (parseError) {
          console.warn('Failed to parse file analysis for', filePath);
        }
      }

      // Upsert to repo_index
      const { data: indexEntry, error: indexError } = await supabase
        .from('repo_index')
        .upsert({
          project_id: projectId,
          file_path: filePath,
          file_hash: fileHash,
          language,
          symbols,
          content_summary: contentSummary
        }, {
          onConflict: 'project_id,file_path'
        })
        .select()
        .single();

      if (indexError) {
        console.error('Error indexing file:', filePath, indexError);
      } else {
        indexedFiles.push(indexEntry);
      }
    }

    console.log(`Successfully indexed ${indexedFiles.length} files for project ${projectId}`);

    return new Response(JSON.stringify({
      success: true,
      indexed: indexedFiles.length,
      files: indexedFiles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-indexer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Repository indexing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript', 
    'jsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'vue': 'vue',
    'svelte': 'svelte',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'md': 'markdown',
    'sql': 'sql'
  };
  
  return languageMap[ext || ''] || 'unknown';
}