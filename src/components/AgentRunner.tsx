import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { AgentDefinition, AgentUI } from "@/agent/types";

type Props = {
  agent: AgentDefinition | any;
  onAgentUpdate?: (updated: any) => void;
};

export default function AgentRunner({ agent, onAgentUpdate }: Props) {
  const [ui, setUi] = useState<AgentUI | undefined>(agent?.ui);
  const [runtime, setRuntime] = useState(agent?.runtime as any);
  const [form, setForm] = useState<Record<string, any>>({});
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const hasRuntime = !!(ui && runtime && runtime.plan?.length);

  const handleChange = (id: string, value: any) => {
    setForm((f) => ({ ...f, [id]: value }));
  };

  const defaultUI = useMemo<AgentUI>(() => ({
    fields: [
      {
        id: "prompt",
        label: "Task",
        type: "textarea",
        placeholder: `Describe what ${agent?.name || "the agent"} should do right now...`,
        required: true,
      },
    ],
  }), [agent?.name]);

  function saveToLocalStorage(updated: any) {
    try {
      const agents = JSON.parse(localStorage.getItem("agents") || "[]");
      const idx = agents.findIndex((a: any) => a.id === updated.id);
      if (idx >= 0) agents[idx] = updated; else agents.unshift(updated);
      localStorage.setItem("agents", JSON.stringify(agents));
    } catch (_) {}
  }

  function autoGenerateUI() {
    const generated = {
      ...agent,
      ui: defaultUI,
      runtime: {
        plan: [
          {
            id: "step1",
            type: "llm",
            model: "gpt-4o-mini",
            system: agent?.personality || `You are an expert assistant specialized in ${agent?.category || "automation"}. Be concise, actionable, and accurate.`,
            promptTemplate: `Task from user: {{prompt}}\n\nContext about the agent: ${agent?.description || "No extra context"}`,
          },
        ],
      },
    };
    setUi(generated.ui);
    setRuntime(generated.runtime);
    onAgentUpdate?.(generated);
    saveToLocalStorage(generated);
  }

  async function runPlan() {
    if (!hasRuntime) return;
    try {
      setRunning(true);
      setLogs([]);
      setOutput(null);
      const { data, error } = await supabase.functions.invoke("agent-run", {
        body: {
          tasks: runtime.plan,
          input: form,
          system: agent?.personality || agent?.description || "",
        },
      });
      if (error) throw error;
      setOutput(data?.result ?? data);
      if (Array.isArray(data?.logs)) setLogs(data.logs);
    } catch (e: any) {
      setLogs((l) => [...l, `Error: ${e?.message || String(e)}`]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="card-premium space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Agent UI</h2>
        {!hasRuntime && (
          <Button className="btn-warm" onClick={autoGenerateUI}>
            Auto-generate UI
          </Button>
        )}
      </div>

      {hasRuntime ? (
        <div className="space-y-3">
          {/* Fields */}
          <div className="grid gap-3">
            {(ui?.fields || []).map((f) => (
              <div key={f.id} className="space-y-1">
                <label className="text-sm text-foreground">{f.label}</label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={form[f.id] || ""}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                    placeholder={f.placeholder}
                  />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : f.type}
                    value={form[f.id] || ""}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button className="btn-warm" onClick={runPlan} disabled={running}>
              {running ? "Running…" : "Run"}
            </Button>
          </div>

          {/* Output */}
          <div className="rounded-md border border-border/40 p-3 bg-background">
            <div className="text-xs text-muted-foreground mb-1">Output</div>
            <pre className="text-sm text-foreground whitespace-pre-wrap">{output ? JSON.stringify(output, null, 2) : "No output yet."}</pre>
          </div>

          {/* Logs */}
          {!!logs.length && (
            <div className="rounded-md border border-border/40 p-3 bg-background">
              <div className="text-xs text-muted-foreground mb-1">Logs</div>
              <ul className="text-xs list-disc pl-4 space-y-1">
                {logs.map((l, i) => (
                  <li key={i} className="text-foreground">{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No runtime configured. Click Auto-generate UI to create a starter interface and plan.</p>
      )}
    </section>
  );
}
