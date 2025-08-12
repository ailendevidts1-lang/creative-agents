import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-heading font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, billing, and referrals.</p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <section className="card-premium">
            <h2 className="text-xl font-heading mb-2">Profile</h2>
            <p className="text-muted-foreground">Update your personal details. (placeholder)</p>
          </section>
        </TabsContent>
        <TabsContent value="billing">
          <section className="card-premium">
            <h2 className="text-xl font-heading mb-2">Billing</h2>
            <p className="text-muted-foreground">Manage subscriptions and payment methods. (placeholder)</p>
          </section>
        </TabsContent>
        <TabsContent value="referrals">
          <section className="card-premium">
            <h2 className="text-xl font-heading mb-2">Referrals</h2>
            <p className="text-muted-foreground">Track your referral rewards. (placeholder)</p>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}

