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
    const { businessId, userId, automationType = 'comprehensive' } = await req.json();
    
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

    // Get business details
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('user_id', userId)
      .single();

    if (businessError) {
      throw new Error('Failed to fetch business data');
    }

    const systemPrompt = `You are an expert business automation consultant. Create a comprehensive automation pipeline for the business.

Return your response in this exact JSON format:
{
  "pipeline_stages": [
    {
      "stage": "Stage Name",
      "description": "Stage description",
      "automated_tasks": ["Task1", "Task2"],
      "tools_required": ["Tool1", "Tool2"],
      "duration": "Expected duration",
      "success_metrics": ["Metric1", "Metric2"]
    }
  ],
  "automation_workflows": [
    {
      "workflow_name": "Workflow Name",
      "trigger": "What triggers this workflow",
      "steps": [
        {
          "step": "Step name",
          "action": "What action is performed",
          "automation_level": "Manual/Semi/Full",
          "tools": ["Tool1", "Tool2"]
        }
      ],
      "expected_roi": "ROI estimate",
      "implementation_time": "Time to implement"
    }
  ],
  "integration_apis": [
    {
      "service": "Service name",
      "purpose": "Why this integration",
      "api_endpoints": ["endpoint1", "endpoint2"],
      "authentication": "Auth method",
      "cost": "Cost estimate"
    }
  ],
  "monitoring_dashboard": {
    "key_metrics": ["Metric1", "Metric2"],
    "alerts": ["Alert1", "Alert2"],
    "reporting": ["Report1", "Report2"]
  },
  "scaling_strategy": {
    "automation_triggers": ["Trigger1", "Trigger2"],
    "resource_scaling": "How resources scale",
    "cost_optimization": "Cost optimization approach"
  },
  "implementation_roadmap": [
    {
      "milestone": "Milestone name",
      "timeline": "Timeline",
      "deliverables": ["Deliverable1", "Deliverable2"],
      "resources_needed": ["Resource1", "Resource2"]
    }
  ]
}`;

    const businessInfo = `
Business Name: ${businessData.name}
Business Type: ${businessData.type}
Industry: ${businessData.industry || 'Not specified'}
Status: ${businessData.status}
Description: ${businessData.description}
Current Progress: ${businessData.progress}%
Automation Type: ${automationType}
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
    let pipelineData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pipelineData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse pipeline response');
    }

    // Create automated tasks in the database
    if (pipelineData.automation_workflows) {
      for (const workflow of pipelineData.automation_workflows) {
        for (const step of workflow.steps || []) {
          await supabase
            .from('business_tasks')
            .insert({
              business_id: businessId,
              title: `${workflow.workflow_name}: ${step.step}`,
              description: step.action,
              type: 'automation',
              priority: 'medium',
              status: 'pending',
              assignee: step.automation_level === 'Full' ? 'ai' : 'human',
              metadata: {
                workflow: workflow.workflow_name,
                automation_level: step.automation_level,
                tools: step.tools
              }
            });
        }
      }
    }

    // Store pipeline in business metadata
    await supabase
      .from('businesses')
      .update({
        metadata: {
          ...businessData.metadata,
          automation_pipeline: pipelineData,
          pipeline_created_at: new Date().toISOString()
        }
      })
      .eq('id', businessId);

    return new Response(JSON.stringify({ 
      success: true,
      pipeline: pipelineData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-automation-pipeline function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});