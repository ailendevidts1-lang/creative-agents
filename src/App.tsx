import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto p-4">
          <a href="/" className="text-xl font-semibold" aria-label="Home">
            New App Starter
          </a>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6 flex-1">
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">
            Project reset complete. This is a clean React + Tailwind shell. Add your components and pages next.
          </p>
        </section>
      </main>
      <footer className="border-t border-border/40">
        <div className="max-w-5xl mx-auto p-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Your App
        </div>
      </footer>
    </div>
  );
};

export default App;
