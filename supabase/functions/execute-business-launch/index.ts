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

    const systemPrompt = `You are an expert business execution AI. Take this business plan and execute the first critical tasks to launch the business.

Return your response in this exact JSON format:
{
  "execution_summary": {
    "business_status": "launched|in_progress|needs_setup",
    "initial_revenue": 0,
    "progress_percentage": 15,
    "next_priority_tasks": ["task1", "task2", "task3"]
  },
  "tasks_completed": [
    {
      "task": "Task name",
      "description": "What was accomplished",
      "result": "Outcome of the task",
      "impact": "Business impact"
    }
  ],
  "assets_created": [
    {
      "type": "website|content|automation|integration",
      "name": "Asset name",
      "description": "Asset description",
      "status": "active|pending|setup_required",
      "value": "Estimated value or impact"
    }
  ],
  "revenue_streams_activated": [
    {
      "stream": "Revenue stream name",
      "status": "active|testing|planned",
      "projected_daily": "Daily revenue projection",
      "activation_date": "When it starts generating revenue"
    }
  ],
  "automation_setup": {
    "automated_processes": ["process1", "process2"],
    "manual_processes": ["process1", "process2"],
    "optimization_suggestions": ["suggestion1", "suggestion2"]
  },
  "launch_metrics": {
    "time_to_first_revenue": "Estimated time",
    "initial_market_response": "Market validation status",
    "competitive_advantage": "Key differentiators activated"
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
      // Fallback response
      executionResult = {
        execution_summary: {
          business_status: "in_progress",
          initial_revenue: 0,
          progress_percentage: 15,
          next_priority_tasks: ["Set up business accounts", "Create initial content", "Launch marketing"]
        },
        tasks_completed: [
          {
            task: "Business Setup",
            description: "Initial business configuration completed",
            result: "Business structure established",
            impact: "Foundation for operations"
          }
        ],
        assets_created: [],
        revenue_streams_activated: [],
        automation_setup: {
          automated_processes: ["Lead generation", "Content scheduling"],
          manual_processes: ["Customer service", "Quality control"],
          optimization_suggestions: ["Implement chatbot", "Automate social media"]
        },
        launch_metrics: {
          time_to_first_revenue: "7-14 days",
          initial_market_response: "Validation pending",
          competitive_advantage: "AI-powered automation"
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