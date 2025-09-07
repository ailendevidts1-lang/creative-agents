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
    const { businessId, userId, optimizationType = 'performance' } = await req.json();
    
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

    // Get comprehensive business data
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select(`
        *,
        business_tasks(*),
        business_assets(*),
        business_analytics(*)
      `)
      .eq('id', businessId)
      .eq('user_id', userId)
      .single();

    if (businessError) {
      throw new Error('Failed to fetch business data');
    }

    const systemPrompt = `You are an expert business process optimization consultant. Analyze the business data and provide comprehensive optimization recommendations.

Return your response in this exact JSON format:
{
  "optimization_analysis": {
    "current_state": {
      "efficiency_score": 75,
      "bottlenecks": ["Bottleneck1", "Bottleneck2"],
      "resource_utilization": "Current resource usage analysis",
      "cost_breakdown": {
        "operations": "50%",
        "technology": "30%",
        "personnel": "20%"
      }
    },
    "optimization_opportunities": [
      {
        "category": "automation|process|technology|cost",
        "opportunity": "Specific optimization opportunity",
        "current_state": "Current inefficiency",
        "proposed_solution": "Detailed solution",
        "expected_improvement": "Quantified improvement",
        "implementation_effort": "Low|Medium|High",
        "roi_estimate": "ROI percentage or value"
      }
    ]
  },
  "performance_improvements": {
    "speed_optimizations": [
      {
        "area": "Process area",
        "current_time": "Current processing time",
        "optimized_time": "Expected time after optimization",
        "method": "Optimization method"
      }
    ],
    "quality_improvements": [
      {
        "metric": "Quality metric",
        "current_score": 70,
        "target_score": 90,
        "improvement_strategy": "How to improve"
      }
    ],
    "cost_reductions": [
      {
        "cost_center": "Area of cost",
        "current_cost": "Current cost",
        "projected_savings": "Expected savings",
        "method": "Cost reduction method"
      }
    ]
  },
  "automation_recommendations": [
    {
      "process": "Process to automate",
      "automation_level": "Partial|Full",
      "tools_required": ["Tool1", "Tool2"],
      "implementation_steps": ["Step1", "Step2"],
      "time_savings": "Hours saved per week/month",
      "cost_impact": "Cost impact of automation"
    }
  ],
  "technology_upgrades": [
    {
      "component": "Technology component",
      "current_solution": "Current technology",
      "recommended_upgrade": "Recommended technology",
      "benefits": ["Benefit1", "Benefit2"],
      "migration_plan": "How to migrate",
      "cost_estimate": "Upgrade cost"
    }
  ],
  "implementation_roadmap": {
    "quick_wins": [
      {
        "action": "Quick win action",
        "timeline": "1-2 weeks",
        "impact": "Expected impact",
        "resources_needed": "Resources required"
      }
    ],
    "medium_term": [
      {
        "action": "Medium-term improvement",
        "timeline": "1-3 months",
        "impact": "Expected impact",
        "dependencies": ["Dependency1", "Dependency2"]
      }
    ],
    "long_term": [
      {
        "action": "Long-term strategic change",
        "timeline": "3-12 months",
        "impact": "Expected impact",
        "investment_required": "Investment needed"
      }
    ]
  },
  "monitoring_framework": {
    "kpis": [
      {
        "metric": "KPI name",
        "current_value": "Current value",
        "target_value": "Target value",
        "measurement_method": "How to measure"
      }
    ],
    "dashboards": ["Dashboard1", "Dashboard2"],
    "reporting_schedule": "How often to report",
    "review_cycle": "When to review and adjust"
  }
}`;

    const businessInfo = `
Business Name: ${businessData.name}
Business Type: ${businessData.type}
Current Status: ${businessData.status}
Progress: ${businessData.progress}%
Revenue: Daily: $${businessData.daily_revenue}, Total: $${businessData.total_revenue}
ROI: ${businessData.roi}%
Active Tasks: ${businessData.business_tasks?.length || 0}
Completed Tasks: ${businessData.business_tasks?.filter(t => t.status === 'completed').length || 0}
Assets: ${businessData.business_assets?.length || 0}
Analytics Points: ${businessData.business_analytics?.length || 0}
Optimization Type: ${optimizationType}
Channels: ${businessData.channels?.join(', ') || 'None'}
Current Next Tasks: ${businessData.next_tasks?.join(', ') || 'None'}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nBusiness Information:\n${businessInfo}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
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
    let optimizationPlan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizationPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse optimization plan response');
    }

    // Store optimization plan as business asset
    await supabase
      .from('business_assets')
      .insert({
        business_id: businessId,
        name: 'Business Optimization Plan',
        type: 'optimization_plan',
        content: JSON.stringify(optimizationPlan, null, 2),
        metadata: {
          optimization_type: optimizationType,
          created_at: new Date().toISOString(),
          format: 'json'
        }
      });

    // Create tasks for quick wins
    if (optimizationPlan.implementation_roadmap?.quick_wins) {
      for (const quickWin of optimizationPlan.implementation_roadmap.quick_wins) {
        await supabase
          .from('business_tasks')
          .insert({
            business_id: businessId,
            title: `Quick Win: ${quickWin.action}`,
            description: `Expected impact: ${quickWin.impact}`,
            type: 'optimization',
            priority: 'high',
            status: 'pending',
            assignee: 'ai',
            metadata: {
              optimization_category: 'quick_win',
              timeline: quickWin.timeline,
              resources_needed: quickWin.resources_needed
            }
          });
      }
    }

    // Store optimization metrics in analytics
    if (optimizationPlan.optimization_analysis?.current_state?.efficiency_score) {
      await supabase
        .from('business_analytics')
        .insert({
          business_id: businessId,
          metric: 'efficiency_score',
          value: optimizationPlan.optimization_analysis.current_state.efficiency_score,
          period: new Date().toISOString().split('T')[0],
          metadata: {
            optimization_analysis: true,
            generated_at: new Date().toISOString()
          }
        });
    }

    return new Response(JSON.stringify({ 
      success: true,
      optimizationPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-business-processes function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});