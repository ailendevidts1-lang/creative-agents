import React, { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Wand2, Save, Play, UploadCloud, Undo2, Plus, Trash2 } from "lucide-react";

// Types for a simple agent plan
type FieldType = "text" | "textarea" | "email" | "number";

interface Plan {
  name: string;
  intent: string;
  tools: string[];
  inputs: { name: string; type: FieldType }[];
  outputs: string[];
  personality: string;
  runModes: { onDemand: boolean; schedule: boolean; webhook: boolean };
}

const SAMPLE_PROMPTS = [
  "Summarize daily tech news and email it to my subscribers at 8am.",
  "Research top 10 trending startups weekly and export a CSV.",
  "Write an SEO blog post about a given topic and publish to my CMS.",
  "Monitor a subreddit and send Slack alerts for high-signal posts.",
];

const AVAILABLE_TOOLS = ["email", "spreadsheets", "web-scraper", "http", "social-posting"];
const AVAILABLE_SCOPES = [
  { key: "email_send", label: "Email sending" },
  { key: "sheets_read", label: "Read spreadsheets" },
  { key: "social_post", label: "Post to social" },
  { key: "http_external", label: "External HTTP" },
];

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [published, setPublished] = useState(false);
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({});
  const [scopes, setScopes] = useState<Record<string, boolean>>({});

  const canPublish = useMemo(() => {
    if (!plan) return false;
    return plan.name.trim().length > 0 && plan.inputs.length > 0;
  }, [plan]);

  const generatePlan = () => {
    if (!prompt.trim()) {
      toast({ title: "Add a description", description: "Describe what your agent should do." });
      return;
    }
    // Minimal heuristic to derive plan
    const tools: string[] = [];
    if (/email/i.test(prompt)) tools.push("email");
    if (/scrape|web|research/i.test(prompt)) tools.push("web-scraper");
    if (/csv|sheet|spreadsheet/i.test(prompt)) tools.push("spreadsheets");
    if (/post|twitter|linkedin|social/i.test(prompt)) tools.push("social-posting");

    const inferredInputs: Plan["inputs"] = [];
    if (/topic|about/i.test(prompt)) inferredInputs.push({ name: "topic", type: "text" });
    if (/email/i.test(prompt)) inferredInputs.push({ name: "recipient_email", type: "email" });

    const p: Plan = {
      name: prompt.split(".")[0].slice(0, 40) || "New Agent",
      intent: prompt,
      tools: Array.from(new Set(tools)),
      inputs: inferredInputs.length ? inferredInputs : [{ name: "input", type: "text" }],
      outputs: ["summary", "status"],
      personality: "Friendly, concise, professional",
      runModes: { onDemand: true, schedule: /daily|weekly|every/i.test(prompt), webhook: false },
    };
    setPlan(p);
    toast({ title: "Plan generated", description: "You can edit any part of the plan below." });
  };

  const addInputField = () => {
    if (!plan) return;
    setPlan({ ...plan, inputs: [...plan.inputs, { name: "field" + (plan.inputs.length + 1), type: "text" }] });
  };

  const removeInputField = (idx: number) => {
    if (!plan) return;
    const next = [...plan.inputs];
    next.splice(idx, 1);
    setPlan({ ...plan, inputs: next });
  };

  const onSaveDraft = () => toast({ title: "Draft saved", description: "Your agent draft has been saved." });
  const onTest = () => toast({ title: "Test started", description: "Running a test with sample inputs..." });
  const onPublish = () => {
    if (!canPublish) return;
    setPublished(true);
    toast({ title: "Agent published", description: "Your agent is now live." });
  };
  const onUnpublish = () => {
    setPublished(false);
    toast({ title: "Agent unpublished", description: "Your agent is now offline." });
  };

  return (
    <>
      <SEO
        title="AgentHub Builder — No‑code Agent Creator"
        description="Build or edit an agent without code. Describe your agent, review the generated plan, and preview the UI."
        canonical={window.location.origin + "/builder"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AgentHub Builder",
          applicationCategory: "DeveloperApplication",
          description: "Build or edit an agent without code.",
          url: window.location.origin + "/builder",
        }}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="sr-only">Agent Builder</h1>

        {/* Top helper */}
        <header className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Purpose</p>
          <p className="text-2xl md:text-3xl font-heading font-semibold">
            Build or edit an agent without code.
          </p>
          <p className="text-muted-foreground mt-1">Describe your agent, refine the plan, and interact with its generated UI.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-6 lg:col-span-2">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Step 1: Prompt Input</CardTitle>
                <CardDescription>Describe what your agent should do. Or pick an example.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Agent description</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what your agent should do."
                    rows={5}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PROMPTS.map((p) => (
                    <Button key={p} type="button" variant="secondary" size="sm" onClick={() => setPrompt(p)}>
                      Use example
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={generatePlan}>
                    <Wand2 className="mr-2 size-4" /> Generate Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Step 2: AI‑Generated Plan</CardTitle>
                <CardDescription>Summary and editable fields.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!plan ? (
                  <p className="text-sm text-muted-foreground">No plan yet. Generate a plan to continue.</p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="personality">Personality</Label>
                        <Input
                          id="personality"
                          value={plan.personality}
                          onChange={(e) => setPlan({ ...plan, personality: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="intent">Intent</Label>
                        <Textarea id="intent" rows={3} value={plan.intent} onChange={(e) => setPlan({ ...plan, intent: e.target.value })} />
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="space-y-2">
                      <Label>Tools</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {AVAILABLE_TOOLS.map((t) => {
                          const checked = plan.tools.includes(t);
                          return (
                            <label key={t} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const on = Boolean(v);
                                  setPlan({
                                    ...plan,
                                    tools: on ? Array.from(new Set([...plan.tools, t])) : plan.tools.filter((x) => x !== t),
                                  });
                                }}
                              />
                              <span className="capitalize">{t.replace("-", " ")}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Inputs</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addInputField}>
                          <Plus className="mr-1 size-4" /> Add input
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {plan.inputs.map((f, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <Input
                              className="col-span-6"
                              value={f.name}
                              onChange={(e) => {
                                const next = [...plan.inputs];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setPlan({ ...plan, inputs: next });
                              }}
                            />
                            <select
                              className="col-span-4 h-10 rounded-md border bg-background"
                              value={f.type}
                              onChange={(e) => {
                                const next = [...plan.inputs];
                                next[idx] = { ...next[idx], type: e.target.value as FieldType };
                                setPlan({ ...plan, inputs: next });
                              }}
                            >
                              {(["text", "textarea", "email", "number"] as FieldType[]).map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <Button type="button" variant="ghost" size="icon" className="col-span-2" onClick={() => removeInputField(idx)} aria-label="Remove input">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outputs */}
                    <div className="space-y-2">
                      <Label htmlFor="outputs">Outputs</Label>
                      <Textarea
                        id="outputs"
                        rows={2}
                        value={plan.outputs.join(", ")}
                        onChange={(e) => setPlan({ ...plan, outputs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      />
                    </div>

                    {/* Run Modes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {([
                        { key: "onDemand", label: "On‑demand" },
                        { key: "schedule", label: "Schedule" },
                        { key: "webhook", label: "Webhook" },
                      ] as const).map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={plan.runModes[key]}
                            onCheckedChange={(v) => setPlan({ ...plan, runModes: { ...plan.runModes, [key]: Boolean(v) } })}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Step 3: Generated UI Preview</CardTitle>
                <CardDescription>Interactive mini‑app interface based on the plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!plan ? (
                  <p className="text-sm text-muted-foreground">Generate a plan to preview the UI.</p>
                ) : (
                  <PreviewForm plan={plan} />
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={onSaveDraft}>
                    <Save className="mr-2 size-4" /> Save Draft
                  </Button>
                  <Button type="button" onClick={onTest}>
                    <Play className="mr-2 size-4" /> Test Agent
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setPlan(null)}>
                    <Undo2 className="mr-2 size-4" /> Reset Plan
                  </Button>
                  {!published ? (
                    <Button type="button" variant="default" onClick={onPublish} disabled={!canPublish}>
                      <UploadCloud className="mr-2 size-4" /> Publish
                    </Button>
                  ) : (
                    <Button type="button" variant="destructive" onClick={onUnpublish}>
                      Unpublish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <aside className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integrations</CardTitle>
                <CardDescription>Connect tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {AVAILABLE_TOOLS.map((t) => (
                  <label key={t} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{t.replace("-", " ")}</span>
                    <Checkbox
                      checked={Boolean(integrations[t])}
                      onCheckedChange={(v) => setIntegrations({ ...integrations, [t]: Boolean(v) })}
                      aria-label={`Toggle ${t}`}
                    />
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Permissions & scopes</CardTitle>
                <CardDescription>Control access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {AVAILABLE_SCOPES.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(scopes[s.key])}
                      onCheckedChange={(v) => setScopes({ ...scopes, [s.key]: Boolean(v) })}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </>
  );
}

function PreviewForm({ plan }: { plan: Plan }) {
  const [values, setValues] = useState<Record<string, any>>({});
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ title: "Preview submitted", description: "This would run the agent with these inputs." });
      }}
    >
      {plan.inputs.map((f) => (
        <div className="space-y-1" key={f.name}>
          <Label htmlFor={`pf-${f.name}`}>{f.name}</Label>
          {f.type === "textarea" ? (
            <Textarea id={`pf-${f.name}`} rows={3} value={values[f.name] || ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
          ) : (
            <Input id={`pf-${f.name}`} type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"} value={values[f.name] || ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
          )}
        </div>
      ))}
      <div className="pt-2">
        <Button type="submit">
          <Play className="mr-2 size-4" /> Run Preview
        </Button>
      </div>
    </form>
  );
}
