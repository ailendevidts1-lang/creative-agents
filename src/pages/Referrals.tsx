import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

const Referrals = () => {
  const link = useMemo(() => `${window.location.origin}/?ref=your-id`, []);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO
        title="Invite & Earn – Referral Program"
        description="Invite friends to the AI marketplace and earn rewards for each signup and milestone."
        canonical="/referrals"
      />

      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-foreground">Invite & Earn</h1>
        <p className="text-muted-foreground mt-1">Share your unique link and track your rewards.</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        <section className="card-premium space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your referral link</h2>
          <div className="flex gap-2">
            <Input readOnly value={link} />
            <Button onClick={copy} className="btn-warm">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="btn-glass" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Build and monetize AI agents with me! ' + link)}`)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share on Twitter
            </Button>
            <Button variant="outline" className="btn-glass" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Share on LinkedIn
            </Button>
          </div>
        </section>

        <section className="card-premium">
          <h2 className="text-lg font-semibold text-foreground mb-3">Rewards</h2>
          <div className="text-sm text-muted-foreground">Earn $5 per referral + milestone bonuses. Progress tracking coming soon.</div>
        </section>
      </main>
    </div>
  );
};

export default Referrals;
