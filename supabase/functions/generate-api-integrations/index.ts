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
    const { integrationTypes, businessId, userId, customRequirements } = await req.json();
    
    if (!integrationTypes || !businessId || !userId) {
      throw new Error('Integration types, business ID, and user ID are required');
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

    const systemPrompt = `You are an expert API integration specialist. Generate comprehensive API integration configurations and code.

Return your response in this exact JSON format:
{
  "integrations": [
    {
      "service": "Service name",
      "purpose": "Integration purpose",
      "api_config": {
        "base_url": "API base URL",
        "authentication": "Auth method",
        "endpoints": [
          {
            "method": "GET|POST|PUT|DELETE",
            "path": "/api/path",
            "purpose": "Endpoint purpose",
            "parameters": ["param1", "param2"]
          }
        ],
        "rate_limits": "Rate limit info",
        "pricing": "Cost structure"
      },
      "implementation": {
        "edge_function_code": "Complete edge function implementation",
        "frontend_integration": "Frontend integration code",
        "error_handling": "Error handling approach",
        "testing_strategy": "How to test the integration"
      },
      "security": {
        "api_key_management": "How to manage API keys",
        "data_privacy": "Privacy considerations",
        "compliance": "Compliance requirements"
      },
      "monitoring": {
        "health_checks": "Health monitoring approach",
        "logging": "Logging strategy",
        "alerts": "Alert configuration"
      }
    }
  ],
  "workflow_automations": [
    {
      "trigger": "What triggers this automation",
      "actions": [
        {
          "service": "Service to call",
          "action": "Action to perform",
          "data_mapping": "How data is mapped",
          "error_handling": "Error handling for this step"
        }
      ],
      "expected_outcome": "What this automation achieves"
    }
  ],
  "deployment_instructions": {
    "environment_setup": "Environment configuration",
    "secrets_configuration": "Required secrets and how to set them",
    "testing_checklist": ["Test 1", "Test 2", "Test 3"],
    "go_live_steps": ["Step 1", "Step 2", "Step 3"]
  },
  "maintenance": {
    "monitoring_dashboard": "Dashboard setup",
    "backup_strategies": "Backup approach",
    "update_procedures": "How to update integrations"
  }
}`;

    const integrationInfo = `
Business Name: ${businessData.name}
Business Type: ${businessData.type}
Integration Types: ${integrationTypes.join(', ')}
Custom Requirements: ${customRequirements || 'None specified'}
Current Status: ${businessData.status}
Channels: ${businessData.channels?.join(', ') || 'None'}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nBusiness and Integration Information:\n${integrationInfo}`
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
    let integrationPlan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        integrationPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse integration plan response');
    }

    // Store integration plan as business asset
    await supabase
      .from('business_assets')
      .insert({
        business_id: businessId,
        name: 'API Integration Plan',
        type: 'integration_plan',
        content: JSON.stringify(integrationPlan, null, 2),
        metadata: {
          integration_types: integrationTypes,
          created_at: new Date().toISOString(),
          format: 'json'
        }
      });

    // Create tasks for each integration
    if (integrationPlan.integrations) {
      for (const integration of integrationPlan.integrations) {
        await supabase
          .from('business_tasks')
          .insert({
            business_id: businessId,
            title: `Implement ${integration.service} Integration`,
            description: integration.purpose,
            type: 'integration',
            priority: 'high',
            status: 'pending',
            assignee: 'ai',
            metadata: {
              integration_service: integration.service,
              api_config: integration.api_config,
              implementation_ready: true
            }
          });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      integrationPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-api-integrations function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});