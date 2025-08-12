import React from "react";

const Health: React.FC = () => {
  React.useEffect(() => {
    document.title = "Health | Creative Agents";
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="sr-only">Health</h1>
      <pre className="bg-secondary/40 border border-border/40 rounded-lg p-4 text-sm text-foreground">
{`{ "ok": true }`}
      </pre>
    </main>
  );
};

export default Health;
