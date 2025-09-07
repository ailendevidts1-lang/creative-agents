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
    const { businessId, userId, analysisType = 'comprehensive' } = await req.json();
    
    if (!businessId || !userId) {
      throw new Error('Business ID and user ID are required');
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

    // Get business details with related data
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select(`
        *,
        business_plans(*),
        business_tasks(*),
        business_assets(*)
      `)
      .eq('id', businessId)
      .eq('user_id', userId)
      .single();

    if (businessError) {
      throw new Error('Failed to fetch business data');
    }

    // Get recent analytics
    const { data: analyticsData } = await supabase
      .from('business_analytics')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(10);

    const systemPrompt = `You are an expert business analyst. Analyze the provided business data and provide insights.

Return your response in this exact JSON format:
{
  "overall_score": 85,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "threats": ["threat1", "threat2"],
  "financial_health": {
    "score": 75,
    "analysis": "Financial health assessment"
  },
  "market_position": {
    "score": 80,
    "analysis": "Market position analysis"
  },
  "operational_efficiency": {
    "score": 70,
    "analysis": "Operational efficiency assessment"
  },
  "recommendations": [
    {
      "category": "Marketing",
      "priority": "High",
      "action": "Specific recommendation",
      "expected_impact": "Expected outcome"
    }
  ],
  "key_metrics": {
    "performance_indicators": ["KPI1", "KPI2"],
    "improvement_areas": ["area1", "area2"]
  },
  "next_steps": ["step1", "step2", "step3"]
}`;

    const businessInfo = `
Business Name: ${businessData.name}
Industry: ${businessData.industry}
Status: ${businessData.status}
Description: ${businessData.description}
Plans: ${businessData.business_plans?.length || 0} plans
Tasks: ${businessData.business_tasks?.length || 0} tasks
Assets: ${businessData.business_assets?.length || 0} assets
Recent Analytics: ${analyticsData?.length || 0} data points
Analysis Type: ${analysisType}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nBusiness Data:\n${businessInfo}`
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
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse analysis response');
    }

    // Store analysis result in analytics table
    const { error: analyticsError } = await supabase
      .from('business_analytics')
      .insert({
        business_id: businessId,
        user_id: userId,
        metric_name: 'comprehensive_analysis',
        metric_value: analysisResult.overall_score,
        data: analysisResult,
        period: 'current'
      });

    if (analyticsError) {
      console.error('Analytics storage error:', analyticsError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-business function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});