import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/use-toast";
import { List, Grid3X3, Play, Pencil, UploadCloud, PauseCircle, BarChart3, Trash2, Star } from "lucide-react";

 type Status = "draft" | "published";

 type Agent = {
  id: string;
  name: string;
  status: Status;
  lastRun: string; // ISO
  totalRuns: number;
  rating: number; // 0-5
};

 const initialAgents: Agent[] = [
  { id: "a1", name: "Newsletter Summarizer", status: "published", lastRun: new Date(Date.now() - 2 * 3600_000).toISOString(), totalRuns: 342, rating: 4.6 },
  { id: "a2", name: "SEO Blog Writer", status: "draft", lastRun: new Date(Date.now() - 26 * 3600_000).toISOString(), totalRuns: 121, rating: 4.2 },
  { id: "a3", name: "Twitter Auto‑Poster", status: "published", lastRun: new Date(Date.now() - 5 * 3600_000).toISOString(), totalRuns: 890, rating: 4.8 },
  { id: "a4", name: "Sales Lead Researcher", status: "published", lastRun: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(), totalRuns: 67, rating: 4.0 },
];

 export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sortBy, setSortBy] = useState<"lastRun" | "popularity" | "name">("lastRun");
  const [view, setView] = useState<"table" | "grid">("table");

  const rows = useMemo(() => {
    let list = [...agents];
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (sortBy === "lastRun") {
      list.sort((a, b) => +new Date(b.lastRun) - +new Date(a.lastRun));
    } else if (sortBy === "popularity") {
      list.sort((a, b) => b.rating - a.rating || b.totalRuns - a.totalRuns);
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [agents, statusFilter, sortBy]);

  const publishToggle = (id: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: a.status === "published" ? "draft" : "published" } : a)));
    const a = agents.find((x) => x.id === id);
    const next = a?.status === "published" ? "unpublished" : "published";
    toast({ title: `Agent ${next}`, description: `${a?.name} has been ${next}.` });
  };

  const runNow = (id: string) => {
    const a = agents.find((x) => x.id === id);
    if (!a) return;
    setAgents((prev) => prev.map((x) => (x.id === id ? { ...x, lastRun: new Date().toISOString(), totalRuns: x.totalRuns + 1 } : x)));
    toast({ title: "Run started", description: `Running ${a.name}...` });
  };

  const remove = (id: string) => {
    const a = agents.find((x) => x.id === id);
    setAgents((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Agent removed", description: `${a?.name} was deleted.` });
  };

  return (
    <>
      <SEO
        title="Agents — Manage your AI workers | AgentHub"
        description="Manage all agents you own: run, edit, publish, analyze, and organize."
        canonical={window.location.origin + "/agents"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AgentHub Agents",
          description: "Manage all agents you own.",
          url: window.location.origin + "/agents",
        }}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold">Agents</h1>
          <p className="text-muted-foreground">Purpose: Manage all agents you own.</p>
        </header>

        {/* Controls */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lastRun">Last run (newest)</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3X3 className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        {/* Content */}
        {view === "table" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Agents</CardTitle>
              <CardDescription>Run, edit, publish, and analyze.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last run</TableHead>
                    <TableHead>Total runs</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <Link to={`/agents/${a.id}`} className="story-link">{a.name}</Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.status === "published" ? "default" : "secondary"}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(a.lastRun).toLocaleString()}</TableCell>
                      <TableCell>{a.totalRuns.toLocaleString()}</TableCell>
                      <TableCell>
                        <Stars rating={a.rating} />
                      </TableCell>
                      <TableCell className="text-right">
                        <RowActions
                          agent={a}
                          onRun={() => runNow(a.id)}
                          onPublishToggle={() => publishToggle(a.id)}
                          onDelete={() => remove(a.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((a) => (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{a.name}</CardTitle>
                      <CardDescription className="capitalize flex items-center gap-2 mt-1">
                        <Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status}</Badge>
                        <span className="text-xs">Last run {new Date(a.lastRun).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Stars rating={a.rating} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total runs</span>
                    <span className="text-muted-foreground">{a.totalRuns.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 flex justify-end">
                    <RowActions
                      agent={a}
                      onRun={() => runNow(a.id)}
                      onPublishToggle={() => publishToggle(a.id)}
                      onDelete={() => remove(a.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>
    </>
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

 function RowActions({ agent, onRun, onPublishToggle, onDelete }: { agent: Agent; onRun: () => void; onPublishToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRun}>
            <Play className="mr-2 size-4" /> Run Now
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/builder" className="flex items-center">
              <Pencil className="mr-2 size-4" /> Edit in Builder
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPublishToggle}>
            {agent.status === "published" ? (
              <>
                <PauseCircle className="mr-2 size-4" /> Unpublish
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 size-4" /> Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/agents/${agent.id}`} className="flex items-center">
              <BarChart3 className="mr-2 size-4" /> View Analytics
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 size-4" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{agent.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The agent will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
