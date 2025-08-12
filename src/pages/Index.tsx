import React from "react";

const Index: React.FC = () => {
  return (
    <main className="max-w-6xl mx-auto p-8">
      <section className="text-center space-y-5">
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Creative Agents
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A modern luxury AI agents platform. Build, deploy, and scale agents with a premium experience.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/builder" className="btn-premium">Start Building</a>
          <a href="/marketplace" className="btn-glass">Explore Marketplace</a>
        </div>
      </section>
    </main>
  );
};

export default Index;
