import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/MainLayout";
import { StudioPage } from "@/pages/StudioPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/studio/:projectId" element={<StudioPage />} />
          <Route path="*" element={<MainLayout />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;