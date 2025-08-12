import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal JSON schema for an agent
interface AgentSpec {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  personality?: string;
  actions?: string[];
  knowledge?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  // We still create a Supabase client to authenticate the user (optional, but good practice)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate user (optional)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Call OpenAI to turn the prompt into an AgentSpec
    const systemPrompt = `You are an expert product engineer. Convert user requests into a JSON agent specification.
Return ONLY JSON with keys: name, description, category, tags, personality, actions, knowledge.
- name: short, product-ready
- description: 1-2 sentences
- category: one or two words
- tags: 3-6 useful tags
- personality: concise description of voice & tone
- actions: 3-6 concrete actions the agent can perform
- knowledge: list of knowledge sources or types (URLs or descriptions)`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: "OpenAI request failed", details: errText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Try to parse JSON content; if wrapped in code fences, strip them
    const jsonStr = String(content).replace(/^```json\n?|\n?```$/g, "");
    let spec: AgentSpec;
    try {
      spec = JSON.parse(jsonStr);
    } catch (_e) {
      // Fallback: wrap into minimal spec
      spec = {
        name: "Generated Agent",
        description: content.slice(0, 200),
        category: "General",
        tags: ["ai", "agent"],
        personality: "Helpful and concise",
        actions: ["answer questions"],
        knowledge: [],
      };
    }

    return new Response(JSON.stringify({ spec }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
