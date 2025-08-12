import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { removeBackground, loadImage } from "@/utils/removeBackground";

interface Props {
  agent: any;
}

export default function GeneratedToolApp({ agent }: Props) {
  const { toast } = useToast();

  // Web Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Web Scraper
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeApiKey, setScrapeApiKey] = useState<string>(FirecrawlService.getApiKey() || "");
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  // Documents
  const [docText, setDocText] = useState("");
  const [docAnalysis, setDocAnalysis] = useState<string>("");
  const [docLoading, setDocLoading] = useState(false);

  // Image Editing
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageOutUrl, setImageOutUrl] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const personality = agent?.systemPrompt || `You are ${agent?.name || "an automation agent"}. Be precise and concise.`;

  async function runWebSearch() {
    if (!searchQuery.trim()) return toast({ title: "Enter a query" });
    try {
      setSearchLoading(true);
      setSearchResult("");
      const { data, error } = await supabase.functions.invoke("agent-run", {
        body: {
          tasks: [
            {
              id: "search-answer",
              type: "llm",
              model: "gpt-4o-mini",
              system: personality,
              promptTemplate: `Answer the user's question using your knowledge and any context from instructions. Question: {{q}}\n\nInstructions: ${agent?.instructions || "Be helpful."}`,
            },
          ],
          input: { q: searchQuery },
          system: personality,
        },
      });
      if (error) throw error;
      setSearchResult(typeof data === "string" ? data : JSON.stringify(data, null, 2));
      toast({ title: "Search complete" });
    } catch (e: any) {
      toast({ title: "Search failed", description: e?.message, variant: "destructive" });
    } finally {
      setSearchLoading(false);
    }
  }

  async function runScraper() {
    if (!scrapeUrl.trim()) return toast({ title: "Enter a URL" });
    try {
      setScrapeLoading(true);
      setScrapeResult(null);
      if (scrapeApiKey) FirecrawlService.saveApiKey(scrapeApiKey);
      const res = await FirecrawlService.crawlWebsite(scrapeUrl);
      if (!res.success) throw new Error(res.error || "Crawl failed");
      setScrapeResult(res.data);
      toast({ title: "Crawl complete" });
    } catch (e: any) {
      toast({ title: "Crawl failed", description: e?.message, variant: "destructive" });
    } finally {
      setScrapeLoading(false);
    }
  }

  async function analyzeDocument() {
    if (!docText.trim()) return toast({ title: "Paste some text" });
    try {
      setDocLoading(true);
      setDocAnalysis("");
      const { data, error } = await supabase.functions.invoke("agent-run", {
        body: {
          tasks: [
            {
              id: "doc-analyze",
              type: "llm",
              model: "gpt-4o-mini",
              system: personality,
              promptTemplate: `Analyze the following document and produce:\n- Key points\n- Action items\n- Risks and assumptions\n\nDocument:\n{{doc}}`,
            },
          ],
          input: { doc: docText },
          system: personality,
        },
      });
      if (error) throw error;
      setDocAnalysis(typeof data === "string" ? data : JSON.stringify(data, null, 2));
      toast({ title: "Analysis ready" });
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e?.message, variant: "destructive" });
    } finally {
      setDocLoading(false);
    }
  }

  async function onImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageOutUrl("");
    setImageLoading(true);
    try {
      const imgEl = await loadImage(file);
      setImagePreview(URL.createObjectURL(file));
      const blob = await removeBackground(imgEl);
      const url = URL.createObjectURL(blob);
      setImageOutUrl(url);
      toast({ title: "Background removed" });
    } catch (e: any) {
      toast({ title: "Image edit failed", description: e?.message, variant: "destructive" });
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <section className="card-premium p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Mini App (Generated Tools)</h2>

      {/* Web Search */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-foreground">Web Search Q&A</div>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Ask anything…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Button className="btn-warm" onClick={runWebSearch} disabled={searchLoading}>
            {searchLoading ? "Thinking…" : "Answer"}
          </Button>
        </div>
        <pre className="rounded-md border border-border/40 p-3 bg-background text-sm text-foreground whitespace-pre-wrap min-h-[80px]">
          {searchResult || "No answer yet."}
        </pre>
      </Card>

      {/* Web Scraper */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-foreground">Web Scraper</div>
        </div>
        <div className="grid md:grid-cols-5 gap-2">
          <div className="md:col-span-3">
            <Input placeholder="https://example.com" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Input placeholder="Firecrawl API Key (local only)" value={scrapeApiKey} onChange={(e) => setScrapeApiKey(e.target.value)} />
          </div>
        </div>
        <Button className="btn-warm" onClick={runScraper} disabled={scrapeLoading}>
          {scrapeLoading ? "Scraping…" : "Scrape"}
        </Button>
        <pre className="rounded-md border border-border/40 p-3 bg-background text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-auto">
          {scrapeResult ? JSON.stringify(scrapeResult, null, 2) : "No data yet."}
        </pre>
      </Card>

      {/* Document Analyzer */}
      <Card className="p-4 space-y-2">
        <div className="font-medium text-foreground">Document Analyzer</div>
        <Textarea rows={6} placeholder="Paste text to analyze…" value={docText} onChange={(e) => setDocText(e.target.value)} />
        <Button className="btn-warm" onClick={analyzeDocument} disabled={docLoading}>
          {docLoading ? "Analyzing…" : "Analyze"}
        </Button>
        <pre className="rounded-md border border-border/40 p-3 bg-background text-sm text-foreground whitespace-pre-wrap min-h-[80px]">
          {docAnalysis || "No analysis yet."}
        </pre>
      </Card>

      {/* Image Editing */}
      <Card className="p-4 space-y-2">
        <div className="font-medium text-foreground">Image Editing (Background Removal)</div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input ref={imageInputRef} type="file" accept="image/*" onChange={onImageFile} />
          {imageLoading && <span className="text-sm text-muted-foreground">Processing…</span>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {imagePreview && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Original</div>
              <img src={imagePreview} className="rounded-md border border-border/40 max-h-64 object-contain" alt="original" />
            </div>
          )}
          {imageOutUrl && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Result</div>
              <img src={imageOutUrl} className="rounded-md border border-border/40 max-h-64 object-contain bg-checker" alt="result" />
              <div className="mt-2">
                <a href={imageOutUrl} download="edited.png" className="text-sm underline">Download PNG</a>
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
