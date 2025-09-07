import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/MainLayout";
import { StudioPage } from "@/pages/StudioPage";

function App() {
  // Check if we're on the studio route
  const isStudioRoute = window.location.pathname.startsWith('/studio/');
  
  if (isStudioRoute) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/studio/:projectId" element={<StudioPage />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainLayout />
      <Toaster />
    </div>
  );
}

export default App;