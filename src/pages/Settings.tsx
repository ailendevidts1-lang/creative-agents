import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

export default function Settings() {
  const [name, setName] = useState("Alex Rider");
  const [email, setEmail] = useState("alex@example.com");
  const [refLink] = useState(window.location.origin + "/r/agenthub-123");
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    email: true,
    spreadsheets: false,
    "web-scraper": false,
    http: true,
    "social-posting": false,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      toast({ title: "Copied", description: "Your referral link was copied." });
    } catch (e) {
      toast({ title: "Copy failed", description: "Please try again.", variant: "destructive" as any });
    }
  };

  return (
    <>
      <SEO
        title="Settings — Profile, Billing, Referrals, Integrations | AgentHub"
        description="Manage your profile, billing, referrals, and integrations."
        canonical={window.location.origin + "/settings"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AgentHub Settings",
          description: "Manage account settings",
          url: window.location.origin + "/settings",
        }}
      />

      <main className="max-w-6xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-heading font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, billing, referrals, and integrations.</p>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Profile</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" alt="User avatar" />
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => toast({ title: "Upload avatar", description: "Avatar upload coming soon." })}
                  >
                    Upload Avatar
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => toast({ title: "Saved", description: "Profile updated." })}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => toast({ title: "Password reset sent", description: "Check your inbox to reset your password." })}
                  >
                    Send Password Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Current Plan</CardTitle>
                  <CardDescription>Your subscription details and actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-heading font-semibold">Pro</p>
                      <p className="text-sm text-muted-foreground">$19 / month, billed monthly</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => toast({ title: "Upgrade", description: "Redirecting to upgrade..." })}>
                        Upgrade
                      </Button>
                      <Button type="button" variant="outline" onClick={() => toast({ title: "Downgrade", description: "Redirecting to downgrade..." })}>
                        Downgrade
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <UsageMeter label="Monthly Runs" used={1850} limit={5000} />
                    <UsageMeter label="Active Agents" used={12} limit={20} />
                    <UsagePercent label="Plan Usage" percent={37} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Invoices</CardTitle>
                  <CardDescription>Your recent invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { date: "2025-08-01", amount: "$19.00", status: "Paid" },
                        { date: "2025-07-01", amount: "$19.00", status: "Paid" },
                      ].map((inv, i) => (
                        <TableRow key={i}>
                          <TableCell>{inv.date}</TableCell>
                          <TableCell>{inv.amount}</TableCell>
                          <TableCell>{inv.status}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast({ title: "Downloading", description: `Invoice ${inv.date}` })}
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Referrals */}
          <TabsContent value="referrals">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Invite & Earn</CardTitle>
                  <CardDescription>Share your unique link and earn rewards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="md:col-span-3">
                      <Label htmlFor="reflink">Your referral link</Label>
                      <Input id="reflink" value={refLink} readOnly />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button className="w-full" type="button" onClick={handleCopy}>
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <Stat label="Clicks" value="1,204" />
                    <Stat label="Signups" value="128" />
                    <Stat label="Conversions" value="43" />
                    <Stat label="Earnings" value="$512" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Leaderboard</CardTitle>
                  <CardDescription>Top referrers this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { user: "Alex R.", earn: "$220" },
                        { user: "Sam K.", earn: "$160" },
                        { user: "Jamie L.", earn: "$132" },
                      ].map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{r.user}</TableCell>
                          <TableCell className="text-right">{r.earn}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Integrations</CardTitle>
                <CardDescription>Connect and manage tool credentials.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(["email", "spreadsheets", "web-scraper", "http", "social-posting"]).map((key) => (
                  <IntegrationRow
                    key={key}
                    name={key.replace("-", " ")}
                    connected={Boolean(integrations[key])}
                    onToggle={() => setIntegrations({ ...integrations, [key]: !integrations[key] })}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{used.toLocaleString()}/{limit.toLocaleString()}</span>
      </div>
      <Progress value={pct} aria-label={`${label} usage`} />
    </div>
  );
}

function UsagePercent({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <Progress value={percent} aria-label={`${label} percent`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-heading font-semibold">{value}</p>
    </div>
  );
}

function IntegrationRow({ name, connected, onToggle }: { name: string; connected: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="font-medium capitalize">{name}</p>
        <p className="text-xs text-muted-foreground">{connected ? "Connected" : "Not connected"}</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={connected} onCheckedChange={onToggle} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast({ title: connected ? "Manage" : "Connect", description: `${connected ? "Manage" : "Connect"} ${name}` })}
        >
          {connected ? "Manage" : "Connect"}
        </Button>
      </div>
    </div>
  );
}
