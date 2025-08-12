import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AgentRunner from "@/components/AgentRunner";

export default function AgentSandbox() {
  const { state } = useLocation() as { state?: { agent?: any } };
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(state?.agent || null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  

  useEffect(() => {
    if (!agent) {
      try {
        const stored = JSON.parse(localStorage.getItem("agents") || "[]");
        setAgent(stored[0] || null);
      } catch (_) {}
    }
  }, [agent]);

  const send = () => {
    if (!input.trim()) return;
    const user = { role: "user" as const, content: input.trim() };
    const reply = {
      role: "assistant" as const,
      content: `(${agent?.name || "Agent"}) ${agent?.personality || "Helpful and concise"}: I received your message and would act using actions [${(agent?.actions||"")}] and integrations [${(agent?.integrations||agent?.selectedIntegrations||[]).join(", ")}].`,
    };
    setMessages((m) => [...m, user, reply]);
    setInput("");
  };


  return (
    <div className="min-h-screen bg-background p-6">
      <SEO title="Agent Sandbox – Test Agent" description="Interact with your agent in a safe sandbox environment." canonical="/sandbox" />

      <header className="max-w-4xl mx-auto mb-4">
        <h1 className="text-3xl font-bold text-foreground">Agent Sandbox</h1>
        <p className="text-muted-foreground">Test your agent before publishing.</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-4">
        <section className="card-premium space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Interactive UI</h2>
          <AgentRunner agent={agent} onAgentUpdate={setAgent} />
        </section>
        {agent ? (
          <section className="card-premium space-y-3">
            <div className="flex items-center gap-3">
              <img src={agent.avatarUrl} alt={`${agent.name} avatar`} className="w-12 h-12 rounded-md border border-border/40 bg-card" loading="lazy" />
              <div>
                <div className="text-foreground font-medium">{agent.name}</div>
                <div className="text-xs text-muted-foreground">{agent.description}</div>
              </div>
            </div>
            <div className="h-64 overflow-auto rounded-md border border-border/40 p-3 bg-background text-sm">
              {messages.length === 0 ? (
                <div className="text-xs text-muted-foreground">No messages yet. Say hello!</div>
              ) : (
                <ul className="space-y-2">
                  {messages.map((m, i) => (
                    <li key={i} className={m.role === 'assistant' ? 'text-foreground' : 'text-muted-foreground'}>
                      <span className="font-medium">{m.role === 'assistant' ? 'Agent: ' : 'You: '}</span>{m.content}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" />
              <Button className="btn-warm" onClick={send}>Send</Button>
            </div>
          </section>
        ) : (
          <section className="card-premium">
            <p className="text-sm text-muted-foreground">No agent found. Go back to Builder.</p>
            <div className="pt-2"><Button variant="outline" className="btn-glass" onClick={() => navigate('/builder')}>Back to Builder</Button></div>
          </section>
        )}
      </main>
    </div>
  );
}
