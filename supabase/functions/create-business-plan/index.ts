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
    const { businessIdeaId, userId, customRequirements } = await req.json();
    
    if (!businessIdeaId && !userId) {
      throw new Error('Business idea ID or user ID is required');
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

    // Get business idea details
    let businessIdea = null;
    if (businessIdeaId) {
      const { data: ideaData, error: ideaError } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('id', businessIdeaId)
        .single();

      if (ideaError) {
        throw new Error('Failed to fetch business idea');
      }
      businessIdea = ideaData;
    }

    const systemPrompt = `You are an expert business plan writer. Create a comprehensive business plan based on the provided business idea.

Return your response in this exact JSON format:
{
  "executive_summary": "Brief overview of the business",
  "company_description": "Detailed company description",
  "market_analysis": {
    "market_size": "Total addressable market",
    "target_segments": ["segment1", "segment2"],
    "competition_analysis": "Analysis of competitors"
  },
  "organization_management": {
    "company_structure": "Legal structure and organization",
    "key_personnel": ["role1", "role2", "role3"]
  },
  "products_services": {
    "offerings": ["product1", "product2"],
    "pricing_strategy": "Pricing model and strategy"
  },
  "marketing_sales": {
    "marketing_strategy": "Customer acquisition strategy",
    "sales_projections": "Expected sales figures"
  },
  "financial_projections": {
    "startup_costs": "Initial investment needed",
    "revenue_projections": "5-year revenue forecast",
    "break_even_analysis": "Time to profitability"
  },
  "funding_request": {
    "funding_needed": "Amount of funding required",
    "use_of_funds": "How funds will be used"
  },
  "milestones": [
    {"milestone": "First milestone", "timeline": "Month 1-3"},
    {"milestone": "Second milestone", "timeline": "Month 4-6"}
  ]
}`;

    const prompt = businessIdea 
      ? `Business Idea: ${businessIdea.title}\nDescription: ${businessIdea.description}\nIndustry: ${businessIdea.industry}\nAdditional Data: ${JSON.stringify(businessIdea.data)}`
      : `Custom Requirements: ${customRequirements}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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
    let businessPlan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        businessPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse business plan response');
    }

    // Store in database
    const { data: planData, error: dbError } = await supabase
      .from('business_plans')
      .insert({
        user_id: userId,
        business_idea_id: businessIdeaId,
        title: businessIdea?.title || 'Custom Business Plan',
        content: businessPlan,
        status: 'draft'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save business plan');
    }

    return new Response(JSON.stringify({ 
      success: true,
      businessPlan: planData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-business-plan function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});