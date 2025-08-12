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
    const { nodes = [], edges = [], title = "", description = "", question = "" } = await req.json();

    const system = `You are a senior workflow architect helping improve AI automation graphs.
Return concise, actionable suggestions. Keep it under 120 words.
If the user asks a question, answer directly. Otherwise, propose upgrades.
Examples: add a timer, split agents, add a condition with threshold, add alert channels, suggest tags or names.`;

    const userContext = `Current workflow context:\nTitle: ${title}\nDescription: ${description}\nNodes: ${JSON.stringify(nodes)}\nEdges: ${JSON.stringify(edges)}\n${question ? `User question: ${question}` : ""}`;

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
          { role: "user", content: userContext },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    if (question) {
      return new Response(JSON.stringify({ answer: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ suggestion: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("workflow-advisor error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
