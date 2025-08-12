import React, { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { GripVertical, Check, X, Search, Megaphone, Users as UsersIcon, Save } from "lucide-react";

// Types
 type AgentListing = { id: string; name: string; category: string; submittedBy: string; submittedAt: string };
 type FeaturedAgent = { id: string; name: string; category: string };
 type AdminUser = { id: string; name: string; email: string; role: "admin" | "moderator" | "user"; active: boolean };

// Sample Data
 const initialQueue: AgentListing[] = [
  { id: "q1", name: "SEO Blog Writer", category: "Writing", submittedBy: "sarah@example.com", submittedAt: new Date(Date.now() - 3 * 3600_000).toISOString() },
  { id: "q2", name: "Newsletter Summarizer", category: "Research", submittedBy: "liam@example.com", submittedAt: new Date(Date.now() - 8 * 3600_000).toISOString() },
  { id: "q3", name: "Twitter Auto‑Poster", category: "Social", submittedBy: "mila@example.com", submittedAt: new Date(Date.now() - 28 * 3600_000).toISOString() },
];

 const initialFeatured: FeaturedAgent[] = [
  { id: "f1", name: "Sales Lead Researcher", category: "Sales" },
  { id: "f2", name: "Analytics Explainer", category: "Analytics" },
  { id: "f3", name: "Image Captioner", category: "Analytics" },
];

 const initialUsers: AdminUser[] = [
  { id: "u1", name: "Alex Rider", email: "alex@example.com", role: "admin", active: true },
  { id: "u2", name: "Sam King", email: "sam@example.com", role: "moderator", active: true },
  { id: "u3", name: "Jamie Lee", email: "jamie@example.com", role: "user", active: true },
  { id: "u4", name: "Taylor Ray", email: "taylor@example.com", role: "user", active: false },
];

export default function Admin() {
  // Moderation Queue
  const [queue, setQueue] = useState<AgentListing[]>(initialQueue);

  // Featured Agents DnD
  const [featured, setFeatured] = useState<FeaturedAgent[]>(initialFeatured);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addId, setAddId] = useState("");

  // Announcement Editor
  const [bannerText, setBannerText] = useState("Big launch this week: New Builder upgrades ✨");
  const [bannerOn, setBannerOn] = useState(true);

  // Users
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  // Moderation actions
  const approveListing = (id: string) => {
    const item = queue.find((q) => q.id === id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
    toast({ title: "Approved", description: `Listing “${item?.name}” approved.` });
  };
  const rejectListing = (id: string) => {
    const item = queue.find((q) => q.id === id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
    toast({ title: "Rejected", description: `Listing “${item?.name}” rejected.` });
  };

  // Featured DnD handlers
  const onDragStart = (index: number) => setDragIndex(index);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...featured];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setFeatured(next);
    setDragIndex(null);
  };

  const saveFeaturedOrder = () => toast({ title: "Featured updated", description: "Order saved." });
  const addFeatured = () => {
    if (!addId.trim()) return;
    const exists = featured.some((f) => f.id === addId.trim());
    if (exists) {
      toast({ title: "Already added", description: "This agent is already featured." });
      return;
    }
    setFeatured((prev) => [...prev, { id: addId.trim(), name: `Agent ${addId.trim()}`, category: "General" }]);
    setAddId("");
  };

  // Announcement actions
  const saveAnnouncement = () => toast({ title: "Announcement saved", description: bannerOn ? "Banner is live." : "Banner is hidden." });

  // User Management actions
  const setRole = (id: string, role: AdminUser["role"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    const u = users.find((x) => x.id === id);
    toast({ title: "Role updated", description: `${u?.name} is now ${role}.` });
  };
  const setActive = (id: string, active: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)));
    const u = users.find((x) => x.id === id);
    toast({ title: active ? "Account activated" : "Account deactivated", description: `${u?.name}` });
  };

  return (
    <>
      <SEO
        title="Admin — Approve listings, curate marketplace | AgentHub"
        description="Moderate agent listings, curate featured order, post announcements, and manage users."
        canonical={window.location.origin + "/admin"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AgentHub Admin",
          description: "Approve listings, curate marketplace, manage users",
          url: window.location.origin + "/admin",
        }}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold">Admin</h1>
          <p className="text-muted-foreground">Purpose: Approve listings, curate marketplace, manage users.</p>
        </header>

        {/* Top: Moderation Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Moderation Queue</CardTitle>
            <CardDescription>Approve or reject new agent listings awaiting review.</CardDescription>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending listings.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted by</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{item.category}</Badge></TableCell>
                      <TableCell>{item.submittedBy}</TableCell>
                      <TableCell>{new Date(item.submittedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => approveListing(item.id)}>
                            <Check className="mr-1 size-4" /> Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <X className="mr-1 size-4" /> Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject “{item.name}”?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the listing from the queue. You can request changes from the creator separately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => rejectListing(item.id)}>Reject</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Middle: Featured + Announcement */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Featured Agents Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Featured Agents Selector</CardTitle>
              <CardDescription>Drag to reorder the featured agents as they appear in the marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <div className="flex-1">
                  <Label htmlFor="add-featured">Add by ID</Label>
                  <Input id="add-featured" value={addId} onChange={(e) => setAddId(e.target.value)} placeholder="e.g., agent-id" />
                </div>
                <Button type="button" onClick={addFeatured}>Add</Button>
                <Button type="button" variant="secondary" onClick={saveFeaturedOrder}>
                  <Save className="mr-1 size-4" /> Save order
                </Button>
              </div>

              <div className="space-y-2" onDragOver={onDragOver}>
                {featured.map((f, i) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDrop={() => onDrop(i)}
                    className="flex items-center justify-between rounded-md border p-3 bg-card"
                    aria-grabbed={dragIndex === i}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripVertical className="size-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{f.category}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{i + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcement Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Announcement Editor</CardTitle>
              <CardDescription>Set a global banner message for all users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-3 bg-secondary/30 flex items-start gap-3">
                <Megaphone className="size-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Preview</p>
                  <p className="text-sm text-muted-foreground truncate">{bannerText || "Your banner will appear here"}</p>
                </div>
                <Badge variant={bannerOn ? "default" : "secondary"}>{bannerOn ? "Live" : "Hidden"}</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-text">Banner message</Label>
                <Textarea id="banner-text" rows={4} value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="Enter announcement text..." />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <UsersIcon className="size-4" />
                  <span>Visible to all users</span>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant={bannerOn ? "secondary" : "default"} onClick={() => setBannerOn((v) => !v)}>
                    {bannerOn ? "Hide banner" : "Show banner"}
                  </Button>
                  <Button type="button" onClick={saveAnnouncement}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bottom: User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">User Management</CardTitle>
            <CardDescription>Search users, change roles, and deactivate accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(v: any) => setRole(u.id, v)}>
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {u.active ? <Badge>Active</Badge> : <Badge variant="secondary">Deactivated</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.active ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Deactivate</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate {u.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                They will lose access to the platform until reactivated.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => setActive(u.id, false)}>Deactivate</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setActive(u.id, true)}>Activate</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
