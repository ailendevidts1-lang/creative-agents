import React from "react";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Home />
      <Toaster />
    </div>
  );
}

export default App;
