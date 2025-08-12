import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";
import { useState } from "react";
import { Check, Lock, LogIn, UserPlus, Crown } from "lucide-react";

const Auth = () => {
  const { user, login, signUp, logout, subscription, startCheckout, openCustomerPortal } = useAuthSub();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    const fn = mode === "login" ? login : signUp;
    const { error } = await fn(email, password);
    if (error) setError(error);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="Sign in or Create Account – AgentHub"
        description="Securely access AgentHub. Choose Free, Builder, Premium or Enterprise plans."
        canonical="/auth"
      />

      <header className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
        <p className="text-muted-foreground mt-1">Sign in or create an account. Pick a plan when you're ready.</p>
      </header>

      <main className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "login" ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!user ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <div className="flex items-center gap-2">
                  <Button className="btn-premium" onClick={handleAuth}>
                    {mode === "login" ? "Sign in" : "Create account"}
                  </Button>
                  <Button variant="outline" className="btn-glass" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                    {mode === "login" ? "Need an account?" : "Have an account?"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">You'll be redirected back here after email confirmation.</div>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">Signed in as</div>
                <div className="font-medium">{user.email}</div>
                <div className="mt-3 p-3 rounded-lg border border-border/50">
                  <div className="text-sm">Current plan</div>
                  <div className="text-lg font-semibold">{subscription.subscription_tier || "Free"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="btn-glass" onClick={openCustomerPortal}>Manage subscription</Button>
                  <Button variant="outline" className="btn-glass" onClick={logout}>Sign out</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Plans</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Free</div>
                    <div className="text-sm text-muted-foreground">Marketplace Agents, My Agents</div>
                  </div>
                  <Button variant="outline" className="btn-glass" asChild>
                    <a href="/">Continue free</a>
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Builder – €20/mo</div>
                    <div className="text-sm text-muted-foreground">Build agents, Earnings, Sell</div>
                  </div>
                  <Button className="btn-warm" onClick={() => startCheckout("Builder")}>Choose</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Premium – €50/mo</div>
                    <div className="text-sm text-muted-foreground">Everything in Builder + Workflows</div>
                  </div>
                  <Button className="btn-warm" onClick={() => startCheckout("Premium")}>Choose</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold flex items-center gap-2">Enterprise – €100/mo <Crown className="w-4 h-4 text-accent" /></div>
                    <div className="text-sm text-muted-foreground">All features + local agent execution</div>
                  </div>
                  <Button className="btn-warm" onClick={() => startCheckout("Enterprise")}>Choose</Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Check className="w-3 h-3" /> Cancel anytime. Test mode with Stripe.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
