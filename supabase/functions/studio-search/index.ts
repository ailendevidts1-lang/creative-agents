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
    const { projectId, query, limit = 10 } = await req.json();
    
    console.log(`Searching code in project ${projectId} for: "${query}"`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Search in repo index using full-text search and symbol matching
    const { data: results, error } = await supabase
      .from('repo_index')
      .select('*')
      .eq('project_id', projectId)
      .or(`content_summary.ilike.%${query}%, symbols.cs.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching code:', error);
      throw new Error('Failed to search code');
    }

    // Score and rank results
    const scoredResults = results.map(result => {
      let score = 0;
      const lowerQuery = query.toLowerCase();
      const summary = result.content_summary?.toLowerCase() || '';
      const symbols = JSON.stringify(result.symbols || {}).toLowerCase();
      
      // Scoring algorithm
      if (result.file_path.toLowerCase().includes(lowerQuery)) score += 10;
      if (summary.includes(lowerQuery)) score += 5;
      if (symbols.includes(lowerQuery)) score += 8;
      
      // Language preference (prioritize TS/JS for web projects)
      if (['typescript', 'javascript'].includes(result.language)) score += 2;
      
      return {
        ...result,
        score,
        relevantSymbols: extractRelevantSymbols(result.symbols, query)
      };
    }).sort((a, b) => b.score - a.score);

    console.log(`Found ${scoredResults.length} results for query: "${query}"`);

    return new Response(JSON.stringify({
      success: true,
      query,
      results: scoredResults,
      total: scoredResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-search:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Code search failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractRelevantSymbols(symbols: any, query: string): string[] {
  if (!symbols || typeof symbols !== 'object') return [];
  
  const relevant: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  Object.values(symbols).forEach(symbolList => {
    if (Array.isArray(symbolList)) {
      symbolList.forEach(symbol => {
        if (typeof symbol === 'string' && symbol.toLowerCase().includes(lowerQuery)) {
          relevant.push(symbol);
        }
      });
    }
  });
  
  return relevant;
}