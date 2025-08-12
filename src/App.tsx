import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Builder from "@/pages/Builder";
import Agents from "@/pages/Agents";
import Marketplace from "@/pages/Marketplace";
import AgentDetail from "@/pages/AgentDetail";
import RunDetail from "@/pages/RunDetail";
import Pricing from "@/pages/Pricing";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Health from "@/pages/Health";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="theme-luxury min-h-screen bg-background text-foreground flex flex-col">
        <NavBar />
        <main className="container mx-auto flex-1 p-6 animate-fade-in">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/runs/:id" element={<RunDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/health" element={<Health />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toaster />
        <footer className="border-t border-border/40 bg-secondary/30 backdrop-blur supports-[backdrop-filter]:bg-secondary/30">
          <div className="container mx-auto p-6 text-sm text-muted-foreground flex items-center justify-between">
            <span>© {new Date().getFullYear()} AgentHub</span>
            <a href="/health" className="story-link">Health</a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
