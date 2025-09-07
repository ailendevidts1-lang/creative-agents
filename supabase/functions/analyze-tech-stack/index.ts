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
    const { businessType, budget, timeline, requirements, teamSize } = await req.json();
    
    if (!businessType) {
      throw new Error('Business type is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = `You are an expert technology consultant and software architect. Analyze the business requirements and provide a comprehensive tech stack recommendation.

Return your response in this exact JSON format:
{
  "recommended_stack": {
    "frontend": {
      "framework": "Primary frontend framework",
      "styling": "CSS framework/solution",
      "state_management": "State management solution",
      "testing": "Testing framework"
    },
    "backend": {
      "runtime": "Backend runtime/language",
      "framework": "Backend framework",
      "database": "Database solution",
      "authentication": "Auth solution",
      "api": "API architecture"
    },
    "infrastructure": {
      "hosting": "Hosting platform",
      "cdn": "CDN solution",
      "monitoring": "Monitoring tools",
      "ci_cd": "CI/CD pipeline"
    },
    "third_party": {
      "payment": "Payment processing",
      "analytics": "Analytics platform",
      "email": "Email service",
      "storage": "File storage"
    }
  },
  "architecture_diagram": {
    "components": ["Component1", "Component2", "Component3"],
    "data_flow": "Description of data flow",
    "security_layers": ["Security1", "Security2"]
  },
  "implementation_phases": [
    {
      "phase": "Phase 1",
      "duration": "Timeline",
      "deliverables": ["Deliverable1", "Deliverable2"],
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "cost_analysis": {
    "development_cost": "Estimated development cost",
    "monthly_operational": "Monthly operational cost",
    "scaling_considerations": "Cost scaling factors"
  },
  "alternatives": [
    {
      "option": "Alternative option name",
      "pros": ["Pro1", "Pro2"],
      "cons": ["Con1", "Con2"],
      "cost_difference": "Cost comparison"
    }
  ],
  "migration_strategy": {
    "from_existing": "Migration approach if applicable",
    "data_migration": "Data migration strategy",
    "downtime_estimate": "Expected downtime"
  }
}`;

    const prompt = `
Business Type: ${businessType}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Team Size: ${teamSize || 'Not specified'}
Requirements: ${requirements || 'Standard business requirements'}

Please provide a comprehensive tech stack analysis and recommendation.`;

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
    let techStackAnalysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        techStackAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      // Fallback response
      techStackAnalysis = {
        recommended_stack: {
          frontend: {
            framework: "React",
            styling: "Tailwind CSS",
            state_management: "Zustand",
            testing: "Jest"
          },
          backend: {
            runtime: "Node.js",
            framework: "Express",
            database: "PostgreSQL",
            authentication: "JWT",
            api: "REST"
          },
          infrastructure: {
            hosting: "Vercel",
            cdn: "Cloudflare",
            monitoring: "Sentry",
            ci_cd: "GitHub Actions"
          },
          third_party: {
            payment: "Stripe",
            analytics: "Google Analytics",
            email: "SendGrid",
            storage: "AWS S3"
          }
        },
        cost_analysis: {
          development_cost: "$10,000 - $50,000",
          monthly_operational: "$100 - $500",
          scaling_considerations: "Linear scaling with user growth"
        }
      };
    }

    return new Response(JSON.stringify({ 
      success: true,
      techStackAnalysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-tech-stack function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});