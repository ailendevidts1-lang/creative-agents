import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId, industry, budget } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create the supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const systemPrompt = `You are an AI business consultant that generates innovative business ideas. Provide a comprehensive business idea based on the user's prompt.

Return your response in this exact JSON format:
{
  "title": "Business Name",
  "description": "Detailed description of the business idea",
  "industry": "Primary industry category",
  "target_market": "Description of target customers",
  "value_proposition": "Unique value proposition",
  "revenue_model": "How the business makes money",
  "startup_costs": "Estimated startup costs in USD",
  "competitive_advantages": ["advantage1", "advantage2", "advantage3"],
  "key_challenges": ["challenge1", "challenge2"],
  "next_steps": ["step1", "step2", "step3"]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser request: ${prompt}\nIndustry preference: ${industry || 'Any'}\nBudget range: ${budget || 'Not specified'}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    let businessIdea;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        businessIdea = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      // Fallback response
      businessIdea = {
        title: "Generated Business Idea",
        description: content,
        industry: industry || "Technology",
        target_market: "General consumers",
        value_proposition: "Innovative solution",
        revenue_model: "Subscription",
        startup_costs: "$10,000 - $50,000",
        competitive_advantages: ["Innovation", "First-mover advantage"],
        key_challenges: ["Market competition", "Funding"],
        next_steps: ["Market research", "MVP development", "Customer validation"]
      };
    }

    // Store in database if userId provided
    if (userId) {
      const { error: dbError } = await supabase
        .from('business_ideas')
        .insert({
          user_id: userId,
          title: businessIdea.title,
          description: businessIdea.description,
          industry: businessIdea.industry,
          data: businessIdea,
          status: 'generated'
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      businessIdea 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-business-idea function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});