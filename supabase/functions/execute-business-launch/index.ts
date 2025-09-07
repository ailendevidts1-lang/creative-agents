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
    const { businessPlan, userId } = await req.json();
    
    if (!businessPlan || !userId) {
      throw new Error('Business plan and user ID are required');
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

    const systemPrompt = `You are an expert business execution AI. Take this business plan and execute the first critical steps to launch the business. Provide specific, actionable accounts and automations to create.

Return your response in this exact JSON format:
{
  "execution_summary": {
    "business_status": "launched|in_progress|needs_setup",
    "initial_revenue": 0,
    "progress_percentage": 25,
    "next_priority_tasks": ["task1", "task2", "task3"]
  },
  "accounts_to_create": [
    {
      "platform": "Platform name (e.g., Instagram, LinkedIn, Shopify)",
      "purpose": "Why this account is needed",
      "setup_instructions": "Step-by-step setup guide",
      "estimated_setup_time": "Time to complete",
      "priority": "high|medium|low"
    }
  ],
  "content_strategy": {
    "content_types": ["type1", "type2"],
    "posting_schedule": "Daily/Weekly schedule",
    "target_audience": "Primary audience description",
    "key_messages": ["message1", "message2"]
  },
  "automation_workflows": [
    {
      "workflow_name": "Workflow name",
      "description": "What this workflow does",
      "platforms_involved": ["platform1", "platform2"],
      "trigger": "What starts this workflow",
      "actions": ["action1", "action2"],
      "expected_outcome": "Expected result"
    }
  ],
  "revenue_generation": {
    "primary_revenue_stream": "Main way to make money",
    "pricing_strategy": "How to price products/services",
    "sales_funnel": ["step1", "step2", "step3"],
    "projected_first_month_revenue": "Revenue estimate"
  },
  "marketing_campaigns": [
    {
      "campaign_name": "Campaign name",
      "channel": "Marketing channel",
      "budget": "Suggested budget",
      "duration": "Campaign length",
      "target_metrics": "What to measure",
      "launch_steps": ["step1", "step2"]
    }
  ],
  "success_metrics": {
    "daily_kpis": ["KPI1", "KPI2"],
    "weekly_goals": ["Goal1", "Goal2"],
    "monthly_targets": ["Target1", "Target2"]
  }
}`;

    const businessInfo = `
Business Plan: ${JSON.stringify(businessPlan, null, 2)}
User ID: ${userId}
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
    let executionResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        executionResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      // Fallback response with more comprehensive business execution
      executionResult = {
        execution_summary: {
          business_status: "launched",
          initial_revenue: 0,
          progress_percentage: 25,
          next_priority_tasks: ["Set up social media accounts", "Create first content batch", "Launch initial marketing campaign"]
        },
        accounts_to_create: [
          {
            platform: "Instagram",
            purpose: "Primary social media presence and content distribution",
            setup_instructions: "1. Create business account, 2. Set up bio with value proposition, 3. Upload brand assets, 4. Connect to Facebook Business Manager",
            estimated_setup_time: "30 minutes",
            priority: "high"
          },
          {
            platform: "LinkedIn",
            purpose: "Professional networking and B2B content sharing",
            setup_instructions: "1. Create company page, 2. Add company details and logo, 3. Start following industry leaders, 4. Set up posting schedule",
            estimated_setup_time: "20 minutes", 
            priority: "medium"
          }
        ],
        content_strategy: {
          content_types: ["Educational posts", "Behind-the-scenes content", "User testimonials"],
          posting_schedule: "Daily on Instagram, 3x per week on LinkedIn",
          target_audience: "Tech-savvy professionals aged 25-45",
          key_messages: ["Innovation", "Efficiency", "Results-driven"]
        },
        automation_workflows: [
          {
            workflow_name: "Content Creation & Distribution",
            description: "Automated content generation and cross-platform posting",
            platforms_involved: ["Instagram", "LinkedIn", "TikTok"],
            trigger: "Daily at 9 AM",
            actions: ["Generate content ideas", "Create visuals", "Schedule posts", "Monitor engagement"],
            expected_outcome: "Consistent daily presence with 15% monthly growth"
          }
        ],
        revenue_generation: {
          primary_revenue_stream: "Digital product sales and consulting services",
          pricing_strategy: "Premium pricing with value-based positioning",
          sales_funnel: ["Social media awareness", "Free value content", "Email capture", "Product purchase"],
          projected_first_month_revenue: "$1,200 - $3,500"
        },
        marketing_campaigns: [
          {
            campaign_name: "Launch Week Awareness",
            channel: "Social Media + Email",
            budget: "$200-500",
            duration: "7 days",
            target_metrics: "1000 new followers, 100 email subscribers",
            launch_steps: ["Create launch content", "Set up email sequence", "Schedule social posts", "Monitor and engage"]
          }
        ],
        success_metrics: {
          daily_kpis: ["Post engagement rate", "Website traffic", "Lead generation"],
          weekly_goals: ["50 new followers", "10 qualified leads", "5 customer conversations"],
          monthly_targets: ["1000 followers", "100 email subscribers", "First revenue milestone"]
        }
      };
    }

    return new Response(JSON.stringify({ 
      success: true,
      execution: executionResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in execute-business-launch function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});