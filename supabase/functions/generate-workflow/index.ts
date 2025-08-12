import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY secret" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You design very small directed workflows consisting of nodes and edges for an AI automation canvas. 
Return STRICT JSON only with this schema:
{
  "workflow": {
    "nodes": [{ "id": string, "type": "agent"|"timer"|"condition"|"alert", "data"?: object }],
    "edges": [{ "source": string, "target": string }]
  }
}
Rules:
- Do NOT include markdown or code fences.
- Keep the graph tiny (2-4 nodes).
- Omit positions; the UI will layout.
- Use types: agent, timer, condition, alert.
- IDs must be unique and short.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Create a workflow for: ${prompt}` },
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    let workflow;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      workflow = match ? JSON.parse(match[0]).workflow : null;
    } catch (_) {
      workflow = null;
    }

    if (!workflow) {
      // Minimal fallback
      workflow = {
        nodes: [
          { id: "agent1", type: "agent", data: { label: "Agent A" } },
          { id: "agent2", type: "agent", data: { label: "Agent B" } },
          { id: "alert1", type: "alert", data: { channel: "Email" } },
        ],
        edges: [
          { source: "agent1", target: "agent2" },
          { source: "agent2", target: "alert1" },
        ],
      };
    }

    return new Response(JSON.stringify({ workflow }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-workflow error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
