import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function renderTemplate(str: string, context: Record<string, any>) {
  return (str || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const parts = String(key).split(".");
    let cur: any = context;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p]; else return "";
    }
    return String(cur ?? "");
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const tasks: any[] = Array.isArray(body?.tasks) ? body.tasks : [];
    const input = body?.input || {};
    const system = body?.system || "";

    const memory: Record<string, any> = { input, steps: {} };
    const logs: string[] = [];

    for (const task of tasks) {
      if (!task?.type) continue;
      if (task.type === "llm") {
        if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set in Supabase Edge Function secrets");
        const prompt = renderTemplate(task.promptTemplate || "", { ...input, memory });
        const systemPrompt = task.system || system || "You are a helpful assistant.";

        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: task.model || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
          }),
        });
        const data = await resp.json();
        const text = data?.choices?.[0]?.message?.content ?? "";
        memory.steps[task.id] = { type: "llm", content: text };
        logs.push(`llm(${task.id}) ok`);
      } else if (task.type === "http") {
        const url = renderTemplate(task.url || "", { ...input, memory });
        const method = task.method || "GET";
        const headers = task.headers || {};
        const bodyT = task.bodyTemplate ? renderTemplate(task.bodyTemplate, { ...input, memory }) : undefined;
        const resp = await fetch(url, {
          method,
          headers,
          body: bodyT,
        });
        const contentType = resp.headers.get("content-type") || "";
        const payload = contentType.includes("application/json") ? await resp.json() : await resp.text();
        memory.steps[task.id] = { type: "http", status: resp.status, payload };
        logs.push(`http(${task.id}) ${resp.status}`);
      }
    }

    const lastKey = tasks.length ? tasks[tasks.length - 1].id : undefined;
    const result = lastKey ? memory.steps[lastKey] : { ok: true };

    return new Response(JSON.stringify({ result, logs, memory }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
