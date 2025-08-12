import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Simple node components
function NodeBox({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/80 p-3 shadow-sm">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
    </div>
  );
}

const AgentNode = ({ data }: any) => (
  <NodeBox title={`🤖 ${data?.label ?? "Agent"}`} subtitle={data?.agentName} />
);
const StartNode = () => <NodeBox title="▶ Start" subtitle="Entry" />;
const TimerNode = ({ data }: any) => (
  <NodeBox title="⏱ Timer" subtitle={data?.cron ?? "On schedule"} />
);
const ConditionNode = ({ data }: any) => (
  <NodeBox title="🔀 Condition" subtitle={data?.expr ?? "if/else"} />
);
const AlertNode = ({ data }: any) => (
  <NodeBox title="📣 Alert" subtitle={data?.channel ?? "Notify"} />
);

const nodeTypes = {
  agent: AgentNode,
  start: StartNode,
  timer: TimerNode,
  condition: ConditionNode,
  alert: AlertNode,
};

const initialNodes = [
  {
    id: "start",
    type: "start",
    position: { x: 100, y: 100 },
    data: {},
  },
];

const initialEdges: Edge[] = [];

const sampleAgents = [
  { id: "a1", name: "Research Assistant Pro" },
  { id: "a2", name: "Email Campaign Manager" },
  { id: "a3", name: "Lead Generator" },
];

export default function Workflows() {
  const [title, setTitle] = useState("New Workflow");
  const [price, setPrice] = useState<number>(0);
  const [tags, setTags] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [advisorMessages, setAdvisorMessages] = useState<Array<{role: "assistant" | "user"; content: string}>>([]);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorInput, setAdvisorInput] = useState("");

  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Drag and drop support
  const onDragStart = (event: React.DragEvent, nodeType: string, data?: any) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType, data }));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    const payload = event.dataTransfer.getData("application/reactflow");
    if (!payload || !bounds) return;
    const { nodeType, data } = JSON.parse(payload);

    const position = { x: event.clientX - bounds.left - 100, y: event.clientY - bounds.top - 20 };
    const id = `${nodeType}-${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: nodeType, position, data: data || {} }));
  }, [setNodes]);

  const handleSave = () => {
    const bundle = { title, price, tags: tags.split(",").map(t => t.trim()).filter(Boolean), description, nodes, edges };
    localStorage.setItem("workflow.current", JSON.stringify(bundle));
    toast({ title: "Workflow saved", description: "Your workflow draft is saved locally." });
  };

  const handleRun = () => {
    const count = edges.length;
    toast({ title: "Run started", description: `Simulated execution with ${count} connections.` });
  };

  const handlePublish = () => {
    toast({ title: "Publish queued", description: "In a full build, this would create a marketplace listing." });
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke("generate-workflow", {
        body: { prompt },
      });
      if (error) throw new Error(error.message || "Failed to generate workflow");
      const result = (data as any)?.workflow || data;

      const base = 120;
      const newNodes = (result.nodes || []).map((n: any, i: number) => ({
        id: n.id || `${n.type || "agent"}-${Date.now()}-${i}`,
        type: n.type || "agent",
        position: n.position || { x: base + i * 180, y: base + i * 60 },
        data: n.data || {},
      }));
      const newEdges = (result.edges || []).map((e: any, i: number) => ({
        id: `e-${Date.now()}-${i}`,
        source: e.source,
        target: e.target,
      }));

      setNodes((nds) => nds.concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
      toast({ title: "AI plan added", description: "Generated nodes and links from your prompt." });
    } catch (_) {
      const baseX = 200 + Math.random() * 100;
      const id1 = `agent-${Date.now()}`;
      const id2 = `agent-${Date.now() + 1}`;
      setNodes((nds) => nds.concat(
        { id: id1, type: "agent", position: { x: baseX, y: 140 }, data: { label: "Agent A", agentName: sampleAgents[0].name } },
        { id: id2, type: "agent", position: { x: baseX + 220, y: 240 }, data: { label: "Agent B", agentName: sampleAgents[1].name } },
        { id: `alert-${Date.now() + 2}`, type: "alert", position: { x: baseX + 440, y: 320 }, data: { channel: "Email" } },
      ));
      setEdges((eds) => eds.concat(
        { id: `e-${Date.now()}-1`, source: "start", target: id1 },
        { id: `e-${Date.now()}-2`, source: id1, target: id2 },
        { id: `e-${Date.now()}-3`, source: id2, target: `alert-${Date.now() + 2}` },
      ));
      toast({ title: "AI failed", description: "Using local stub instead." });
    }
  };

  const sendAdvisorPrompt = async () => {
    if (!advisorInput.trim()) return;
    const userMsg = advisorInput.trim();
    setAdvisorInput("");
    setAdvisorMessages((msgs) => [...msgs, { role: "user", content: userMsg }]);
    try {
      setAdvisorLoading(true);
      const { data, error } = await supabase.functions.invoke("workflow-advisor", {
        body: { nodes, edges, title, description, question: userMsg },
      });
      if (error) throw new Error(error.message || "Advisor failed");
      const answer = (data as any)?.answer || (data as any)?.suggestion || (data as any)?.message || "";
      if (answer) setAdvisorMessages((msgs) => [...msgs, { role: "assistant", content: answer }]);
    } catch (e) {
      toast({ title: "Advisor error", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setAdvisorLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (nodes.length + edges.length < 2) return;
        setAdvisorLoading(true);
        const { data, error } = await supabase.functions.invoke("workflow-advisor", {
          body: { nodes, edges, title, description },
        });
        if (error) throw new Error(error.message || "Advisor failed");
        const suggestion = (data as any)?.suggestion || (data as any)?.message || "";
        if (suggestion) setAdvisorMessages((msgs) => [...msgs, { role: "assistant", content: suggestion }]);
      } catch (_) {
        // ignore
      } finally {
        setAdvisorLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [nodes, edges, title, description]);

  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="Workflows – Visual Editor for AI Agents"
        description="Design, run, and publish AI agent workflows. Connect agents, timers, conditions, and alerts in a drag-and-drop canvas."
        canonical="/workflows"
      />

      <header className="max-w-7xl mx-auto mb-4">
        <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
        <p className="text-muted-foreground mt-1">Build multi-agent automations. Drag agents, connect nodes, set timers & conditions, and publish as bundles.</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <section className="card-premium space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Bundle Details</h2>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Workflow title" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" />
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price (USD)" />
            <div className="flex gap-2">
              {tags.split(',').filter(Boolean).slice(0,4).map((t) => (
                <Badge key={t.trim()} variant="secondary" className="text-xs">{t.trim()}</Badge>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} className="btn-warm">Save Draft</Button>
              <Button variant="outline" className="btn-glass" onClick={handlePublish}>Publish</Button>
            </div>
          </section>

          <section className="card-premium space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Nodes</h2>
            <div className="grid grid-cols-2 gap-2">
              <div draggable onDragStart={(e) => onDragStart(e, 'agent', { label: 'Agent', agentName: sampleAgents[0].name })} className="cursor-grab rounded-lg border p-3 text-sm">🤖 Agent</div>
              <div draggable onDragStart={(e) => onDragStart(e, 'timer', { cron: '0 * * * *' })} className="cursor-grab rounded-lg border p-3 text-sm">⏱ Timer</div>
              <div draggable onDragStart={(e) => onDragStart(e, 'condition', { expr: 'if score > 0.8' })} className="cursor-grab rounded-lg border p-3 text-sm">🔀 Condition</div>
              <div draggable onDragStart={(e) => onDragStart(e, 'alert', { channel: 'Slack' })} className="cursor-grab rounded-lg border p-3 text-sm">📣 Alert</div>
            </div>
          </section>

          <section className="card-premium space-y-2">
            <h2 className="text-lg font-semibold text-foreground">AI Builder</h2>
            <p className="text-xs text-muted-foreground">Describe your workflow and let AI draft it. For production, store your API key in Supabase Edge Function secrets.</p>
            
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Every hour: research topic, summarize, and email me the digest." className="w-full h-28 rounded-md border border-border/40 bg-background p-2 text-sm" />
            <Button onClick={generateFromPrompt} className="btn-premium">Generate from Prompt</Button>
          </section>

          <section className="card-premium space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Workflow Advisor</h2>
            <div className="h-36 overflow-auto rounded-md border border-border/40 p-2 bg-background text-sm">
              {advisorMessages.length === 0 ? (
                <p className="text-muted-foreground text-xs">Suggestions will appear as you build your flow.</p>
              ) : (
                <ul className="space-y-2">
                  {advisorMessages.slice(-6).map((m, i) => (
                    <li key={i} className={m.role === 'assistant' ? 'text-foreground' : 'text-muted-foreground'}>
                      <span className="font-medium">{m.role === 'assistant' ? 'Advisor: ' : 'You: '}</span>{m.content}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <Input value={advisorInput} onChange={(e) => setAdvisorInput(e.target.value)} placeholder="Ask how to improve this workflow…" />
              <Button className="btn-warm" onClick={sendAdvisorPrompt} disabled={advisorLoading}>{advisorLoading ? '...' : 'Ask'}</Button>
            </div>
          </section>

          <section className="card-premium">
            <div className="flex gap-2">
              <Button onClick={handleRun} className="flex-1">Run Workflow</Button>
              <Button variant="outline" className="btn-glass flex-1" onClick={() => toast({ title: 'Scheduled', description: 'Timer setup coming soon.' })}>Set Timer</Button>
            </div>
          </section>
        </aside>

        {/* Canvas */}
        <section className="lg:col-span-9 card-premium p-0 overflow-hidden">
          <div className="border-b border-border/30 p-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Drag nodes from the left and connect them</div>
          </div>
          <div ref={reactFlowWrapper} className="h-[600px] bg-background">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypesMemo}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </section>
      </main>
    </div>
  );
}
