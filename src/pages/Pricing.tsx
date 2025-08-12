import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    popular: false,
    description: "Get started with core features.",
    cta: "Get started",
    to: "/dashboard",
    features: [
      "Up to 500 runs/mo",
      "2 active agents",
      "Basic templates",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/mo",
    popular: true,
    description: "For power users and creators.",
    cta: "Upgrade now",
    to: "/settings",
    features: [
      "Up to 5,000 runs/mo",
      "20 active agents",
      "Priority execution",
      "Publish to Marketplace",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$49",
    period: "/mo",
    popular: false,
    description: "Teams and advanced automation.",
    cta: "Contact sales",
    to: "/settings",
    features: [
      "Unlimited runs (fair use)",
      "Unlimited active agents",
      "Role‑based permissions",
      "SLA & priority support",
      "Advanced integrations",
    ],
  },
];

export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing — Upgrade to Pro | AgentHub"
        description="Simple pricing to scale your AI workers. Free, Pro, and Business plans with gold highlights."
        canonical={window.location.origin + "/pricing"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "AgentHub Plans",
          description: "Pricing plans for AgentHub",
          offers: tiers.map((t) => ({
            "@type": "Offer",
            name: t.name,
            price: t.price.replace(/[^0-9.]/g, ""),
            priceCurrency: "USD",
            url: window.location.origin + "/pricing",
            availability: "https://schema.org/InStock",
            category: "Service",
          })),
        }}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold">Pricing</h1>
          <p className="text-muted-foreground">Purpose: Convert free users to paid.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.id} className={tier.popular ? "ring-1 ring-accent shadow-md" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {tier.name}
                      {tier.popular && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Most Popular</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">{tier.description}</CardDescription>
                  </div>
                </div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-3xl font-heading font-semibold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary"><Check className="size-4" /></span>
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link to={tier.to} aria-label={`${tier.cta} - ${tier.name}`}>{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="text-center text-sm text-muted-foreground">
          <p>Need a custom plan or annual billing? Contact us via Settings → Billing.</p>
        </section>
      </main>
    </>
  );
}

