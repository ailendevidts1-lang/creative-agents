import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, evidence, context } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    // Prepare evidence context
    let evidenceText = '';
    if (evidence && evidence.length > 0) {
      evidenceText = evidence.map((item: any, index: number) => 
        `Source ${index + 1} (${item.source}): ${item.content}`
      ).join('\n\n');
    }

    // Prepare conversation context
    let contextText = '';
    if (context && context.length > 0) {
      contextText = context.map((item: any) => 
        `${item.role}: ${item.content}`
      ).join('\n');
    }

    const prompt = `Based on the provided evidence and context, answer the user's query comprehensively and accurately.

User Query: "${query}"

Available Evidence:
${evidenceText || 'No specific evidence available.'}

Recent Context:
${contextText || 'No recent conversation context.'}

Instructions:
1. Provide a comprehensive answer based on the evidence
2. If evidence is limited, clearly state what you know and what you don't know
3. Include relevant source information when referencing specific facts
4. Keep the response conversational and helpful
5. If the evidence contradicts itself, acknowledge the discrepancy
6. Stay focused on answering the specific query

Response:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful AI assistant that provides accurate, well-sourced answers based on available evidence. Be honest about limitations in your knowledge.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 800,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        summary,
        evidenceUsed: evidence?.length || 0,
        hasContext: (context?.length || 0) > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG response generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});