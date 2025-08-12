import React from "react";
import heroImage from "@/assets/hero-marketplace.jpg";
import SEO from "@/components/SEO";
import { Sparkles, Wand2, ShieldCheck, Store, Settings, Play, LineChart, CheckCircle2 } from "lucide-react";

const Index: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AgentHub",
    description:
      "AgentHub is the luxury platform to find, build, and run autonomous AI agents — the App Store for AI workers.",
    url: typeof window !== "undefined" ? window.location.origin : "",
  };

  return (
    <>
      <SEO
        title="AgentHub — The App Store for AI Workers"
        description="Find, build, and run autonomous AI agents on a luxury-grade platform — the App Store for AI workers."
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-background/60 to-background/20">
        <img
          src={heroImage}
          alt="AgentHub marketplace hero background"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="eager"
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl card-glow bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-8 sm:p-10 animate-enter">
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AgentHub — The App Store for AI Workers
            </h1>
            <p className="mt-4 text-muted-foreground">
              AgentHub is a modern, luxury-grade platform where people can find, build, and run AI-powered workers — called agents — that perform real tasks on their own.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="/builder" className="btn-premium">Start Building</a>
              <a href="/marketplace" className="btn-glass">Explore Marketplace</a>
            </div>
          </div>
        </div>
      </section>

      {/* What are Agents */}
      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <article className="card-glow rounded-xl border border-border/50 bg-card/40 backdrop-blur p-6 animate-fade-in">
            <h2 className="font-playfair text-2xl sm:text-3xl">What Are Agents?</h2>
            <p className="mt-2 text-muted-foreground">An agent is a tiny, self-contained specialist app.</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Skills: research, copywriting, analytics and more.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Tools: email sender, spreadsheet editor, web scraper, database connector.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Personality: friendly, formal, concise, persuasive.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Runs: manually, on a schedule, or triggered by events.</span>
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Pick an agent from the Marketplace — or build your own in minutes without code.
            </p>
          </article>

          <article className="card-glow rounded-xl border border-border/50 bg-card/40 backdrop-blur p-6 animate-fade-in">
            <h2 className="font-playfair text-2xl sm:text-3xl">Why it matters</h2>
            <p className="mt-2 text-muted-foreground">
              Each agent is autonomous: once you set it up, it knows what to do, how to do it, and when to act — no constant prompting required.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/40 bg-background/40 p-4 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Autonomous</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/40 p-4 text-center">
                <Wand2 className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">No-Code</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/40 p-4 text-center">
                <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Secure</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Three Core Layers */}
      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <h2 className="font-playfair text-3xl sm:text-4xl text-center">The Foundation — Three Core Layers</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <article className="card-premium rounded-xl p-6 animate-fade-in">
            <h3 className="font-playfair text-xl">1. Agent Builder</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A no-code editor to design new AI workers — define tasks, tone, tools, and when to run.
            </p>
          </article>
          <article className="card-premium rounded-xl p-6 animate-fade-in">
            <h3 className="font-playfair text-xl">2. Agent Runtime (AgentVM)</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Memory, step-by-step thinking, tool execution, and a safety sandbox — secure by design.
            </p>
          </article>
          <article className="card-premium rounded-xl p-6 animate-fade-in">
            <h3 className="font-playfair text-xl">3. Marketplace & Dashboard</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse and install agents. Track runs, outputs, performance, and earnings.
            </p>
          </article>
        </div>
      </section>

      {/* User Journey */}
      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <h2 className="font-playfair text-3xl sm:text-4xl text-center">How It Works — User Journey</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border/50 bg-card/40 backdrop-blur p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6 text-primary" />
              <h3 className="font-playfair text-xl">1. Find or Create</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse the Marketplace and install an AI worker, or use the Builder to create your own.
            </p>
          </article>

          <article className="rounded-xl border border-border/50 bg-card/40 backdrop-blur p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h3 className="font-playfair text-xl">2. Configure</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Describe what it should do, connect integrations, and choose schedule or triggers.
            </p>
          </article>

          <article className="rounded-xl border border-border/50 bg-card/40 backdrop-blur p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Play className="h-6 w-6 text-primary" />
              <h3 className="font-playfair text-xl">3. Run & Automate</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Run on demand or automatically based on your rules.
            </p>
          </article>

          <article className="rounded-xl border border-border/50 bg-card/40 backdrop-blur p-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <LineChart className="h-6 w-6 text-primary" />
              <h3 className="font-playfair text-xl">4. Track & Improve</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Review logs, outputs, and performance — tweak instructions or tools to improve results.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/builder" className="btn-premium">Build an Agent</a>
          <a href="/marketplace" className="btn-glass">Browse Marketplace</a>
        </div>
      </section>
    </>
  );
};

export default Index;

