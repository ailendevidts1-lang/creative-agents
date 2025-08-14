import React from "react";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center">Welcome</h1>
        <p className="text-center text-muted-foreground mt-4">
          Your app is ready to be built
        </p>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
