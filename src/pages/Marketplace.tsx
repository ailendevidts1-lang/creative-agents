import React, { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";

 type Agent = {
  id: string;
  name: string;
  desc: string;
  category: string;
  price: number; // 0 = free
  rating: number; // 0-5
  popularity: number; // installs
  createdAt: string; // ISO
  featured?: boolean;
  image?: string;
};

 const ALL_AGENTS: Agent[] = [
  { id: "1", name: "SEO Blog Writer", desc: "Long‑form SEO posts with keywords.", category: "Writing", price: 9, rating: 4.7, popularity: 2100, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), featured: true, image: "/placeholder.svg" },
  { id: "2", name: "Newsletter Summarizer", desc: "Summarizes tech news and emails daily.", category: "Research", price: 0, rating: 4.6, popularity: 3400, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), featured: true, image: "/placeholder.svg" },
  { id: "3", name: "Twitter Auto‑Poster", desc: "Schedules and posts threads.", category: "Social", price: 5, rating: 4.4, popularity: 3000, createdAt: new Date(Date.now() - 9 * 86400000).toISOString(), image: "/placeholder.svg" },
  { id: "4", name: "Sales Lead Researcher", desc: "Finds leads and enriches data.", category: "Sales", price: 12, rating: 4.3, popularity: 1200, createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), featured: true, image: "/placeholder.svg" },
  { id: "5", name: "Analytics Explainer", desc: "Explains GA4 spikes & drops.", category: "Analytics", price: 0, rating: 4.1, popularity: 800, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), image: "/placeholder.svg" },
  { id: "6", name: "Product Reviewer", desc: "Aggregates reviews and pros/cons.", category: "Research", price: 3, rating: 4.0, popularity: 500, createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), image: "/placeholder.svg" },
  { id: "7", name: "LinkedIn Outreach", desc: "Generates tailored outreach.", category: "Sales", price: 7, rating: 4.2, popularity: 2300, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), image: "/placeholder.svg" },
  { id: "8", name: "Data Scraper", desc: "Scrapes sites to CSV.", category: "Research", price: 0, rating: 3.9, popularity: 4100, createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), image: "/placeholder.svg" },
  { id: "9", name: "Image Captioner", desc: "Captions and tags images.", category: "Analytics", price: 0, rating: 4.5, popularity: 1800, createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), image: "/placeholder.svg" },
];

 const CATEGORIES = ["All", "Writing", "Research", "Social", "Sales", "Analytics"];

 export default function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState<"all" | "free" | "paid">("all");
  const [minRating, setMinRating] = useState<string>("0");
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "newest">("popularity");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const featured = useMemo(() => ALL_AGENTS.filter((a) => a.featured), []);

  const list = useMemo(() => {
    let items = ALL_AGENTS.filter((a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase())
    );
    if (category !== "All") items = items.filter((a) => a.category === category);
    if (price !== "all") items = items.filter((a) => (price === "free" ? a.price === 0 : a.price > 0));
    const min = parseFloat(minRating) || 0;
    items = items.filter((a) => a.rating >= min);

    if (sortBy === "popularity") items.sort((a, b) => b.popularity - a.popularity);
    if (sortBy === "rating") items.sort((a, b) => b.rating - a.rating);
    if (sortBy === "newest") items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return items;
  }, [query, category, price, minRating, sortBy]);

  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const paged = list.slice((page - 1) * pageSize, page * pageSize);

  const onInstall = (agent: Agent) => {
    toast({ title: "Installed", description: `${agent.name} added to your agents.` });
  };

  return (
    <>
      <SEO
        title="Marketplace — Discover and install agents | AgentHub"
        description="Discover featured AI agents, filter by category and price, and install with one click."
        canonical={window.location.origin + "/marketplace"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AgentHub Marketplace",
          description: "Discover and install agents",
          url: window.location.origin + "/marketplace",
        }}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold">Marketplace</h1>
          <p className="text-muted-foreground">Purpose: Discover and install agents.</p>
        </header>

        {/* Featured Carousel */}
        {featured.length > 0 && (
          <section aria-label="Featured agents" className="relative">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-heading">Featured Agents</h2>
            </div>
            <Carousel className="px-10">
              <CarouselContent>
                {featured.map((a) => (
                  <CarouselItem key={a.id} className="md:basis-1/2 lg:basis-1/3">
                    <AgentCard agent={a} onInstall={() => onInstall(a)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Search & Filters */}
        <section className="rounded-xl border p-4 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              placeholder="Search agents..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="md:col-span-2"
            />

            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={price} onValueChange={(v: any) => { setPrice(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={minRating} onValueChange={(v) => { setMinRating(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Min rating" /></SelectTrigger>
              <SelectContent>
                {["0","3","4","4.5"].map((r) => (
                  <SelectItem key={r} value={r}>{r}+</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{list.length} results</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort</span>
              <Select value={sortBy} onValueChange={(v: any) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((a) => (
            <AgentCard key={a.id} agent={a} onInstall={() => onInstall(a)} />
          ))}
        </section>

        {/* Pagination */}
        {pageCount > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(pageCount, page + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </>
  );
}

 function AgentCard({ agent, onInstall }: { agent: Agent; onInstall: () => void }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <img
            src={agent.image || "/placeholder.svg"}
            alt={`${agent.name} agent card`}
            loading="lazy"
            className="h-12 w-12 rounded-md border object-cover"
            width={48}
            height={48}
          />
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">{agent.category}</Badge>
              {agent.price === 0 ? (
                <Badge>Free</Badge>
              ) : (
                <Badge>${agent.price}/mo</Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{agent.desc}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-muted-foreground">{agent.popularity.toLocaleString()} installs</span>
          <Stars rating={agent.rating} />
        </div>
        <div className="pt-1">
          <Button onClick={onInstall} className="w-full">Install</Button>
        </div>
      </CardContent>
    </Card>
  );
}

 function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-4 ${i < full ? "text-primary" : "text-muted-foreground"}`} fill={i < full ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

