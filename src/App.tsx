import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/MainLayout";

function App() {
  return (
    <div className="min-h-screen bg-background neural-grid">
      <MainLayout />
      <Toaster />
    </div>
  );
}

export default App;