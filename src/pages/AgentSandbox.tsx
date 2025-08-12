import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { removeBackground, loadImage } from "@/utils/removeBackground";
import { FirecrawlService } from "@/utils/FirecrawlService";

export default function AgentSandbox() {
  const { state } = useLocation() as { state?: { agent?: any } };
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(state?.agent || null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const [processingBg, setProcessingBg] = useState(false);
  const [bgResultUrl, setBgResultUrl] = useState<string | null>(null);
  const [leadUrl, setLeadUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [firecrawlKey, setFirecrawlKey] = useState<string>(FirecrawlService.getApiKey() || "");

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

  async function handleBackgroundFile(file: File) {
    try {
      setProcessingBg(true);
      setBgResultUrl(null);
      const img = await loadImage(file);
      const blob = await removeBackground(img);
      const url = URL.createObjectURL(blob);
      setBgResultUrl(url);
      toast({ title: "Background removed", description: "PNG with transparency is ready." });
    } catch (e) {
      toast({ title: "Failed to remove background", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setProcessingBg(false);
    }
  }

  async function handleSaveFirecrawlKey() {
    try {
      if (!firecrawlKey.trim()) return;
      FirecrawlService.saveApiKey(firecrawlKey.trim());
      toast({ title: "API key saved", description: "Firecrawl key stored locally for this browser." });
    } catch (e) {
      toast({ title: "Failed to save key", description: String(e), variant: "destructive" });
    }
  }

  async function handleFindLeads() {
    if (!leadUrl.trim()) return;
    try {
      setIsCrawling(true);
      setEmails([]);
      const result = await FirecrawlService.crawlWebsite(leadUrl.trim());
      if (!result.success) throw new Error(result.error || 'Crawl failed');
      const payload = result.data;
      const pages: string[] = Array.isArray(payload?.data) ? payload.data.map((p: any) => JSON.stringify(p)) : [];
      const text = pages.join("\n\n");
      const found = Array.from(new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).slice(0, 100)));
      setEmails(found);
      toast({ title: `Leads found: ${found.length}`, description: found.length ? "Scroll to view emails." : "No emails detected. Try another URL." });
    } catch (e) {
      toast({ title: "Lead finding failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setIsCrawling(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO title="Agent Sandbox – Test Agent" description="Interact with your agent in a safe sandbox environment." canonical="/sandbox" />

      <header className="max-w-4xl mx-auto mb-4">
        <h1 className="text-3xl font-bold text-foreground">Agent Sandbox</h1>
        <p className="text-muted-foreground">Test your agent before publishing.</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-4">
        <section className="card-premium space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Agent Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-md border border-border/40 bg-card/60">
              <h3 className="font-medium text-foreground mb-2">Remove Image Background</h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && e.target.files[0] && handleBackgroundFile(e.target.files[0])}
                className="text-sm"
              />
              {processingBg && <p className="text-xs text-muted-foreground mt-2">Processing…</p>}
              {bgResultUrl && (
                <div className="mt-3 space-y-2">
                  <img src={bgResultUrl} alt="Processed" className="max-h-40 rounded-md border border-border/40 bg-background" />
                  <a href={bgResultUrl} download="background-removed.png" className="text-xs text-primary underline">Download PNG</a>
                </div>
              )}
            </div>

            <div className="p-3 rounded-md border border-border/40 bg-card/60">
              <h3 className="font-medium text-foreground mb-2">Find Leads (Firecrawl)</h3>
              <div className="space-y-2">
                <Input placeholder="https://company.com" value={leadUrl} onChange={(e) => setLeadUrl(e.target.value)} />
                <div className="flex gap-2">
                  <Input placeholder="Firecrawl API Key" value={firecrawlKey} onChange={(e) => setFirecrawlKey(e.target.value)} />
                  <Button variant="outline" className="btn-glass" onClick={handleSaveFirecrawlKey}>Save Key</Button>
                  <Button className="btn-warm" onClick={handleFindLeads} disabled={isCrawling}>{isCrawling ? 'Crawling…' : 'Find Leads'}</Button>
                </div>
                {!!emails.length && (
                  <div className="mt-2 text-xs">
                    <div className="text-muted-foreground mb-1">Emails found:</div>
                    <ul className="max-h-32 overflow-auto list-disc pl-4 space-y-1">
                      {emails.map((e, i) => (<li key={i} className="text-foreground">{e}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
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
