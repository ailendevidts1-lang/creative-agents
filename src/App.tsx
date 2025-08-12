import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgentBuilder from "./pages/AgentBuilder";
import Marketplace from "./pages/Marketplace";
import MyAgents from "./pages/MyAgents";
import Earnings from "./pages/Earnings";
import Referrals from "./pages/Referrals";
import Workflows from "./pages/Workflows";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthSubscriptionProvider } from "./context/AuthSubscriptionProvider";
import NavBar from "./components/NavBar";
import AgentSandbox from "./pages/AgentSandbox";
import PublishAgent from "./pages/PublishAgent";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthSubscriptionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/builder"
              element={
                <ProtectedRoute allowedTiers={["Builder", "Premium", "Enterprise"]}>
                  <AgentBuilder />
                </ProtectedRoute>
              }
            />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/my-agents" element={<MyAgents />} />
            <Route
              path="/earnings"
              element={
                <ProtectedRoute allowedTiers={["Builder", "Premium", "Enterprise"]}>
                  <Earnings />
                </ProtectedRoute>
              }
            />
            <Route path="/referrals" element={<Referrals />} />
            <Route
              path="/workflows"
              element={
                <ProtectedRoute allowedTiers={["Premium", "Enterprise"]}>
                  <Workflows />
                </ProtectedRoute>
              }
            />
            <Route path="/sandbox" element={<AgentSandbox />} />
            <Route path="/publish-agent" element={<PublishAgent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthSubscriptionProvider>
  </QueryClientProvider>
);

export default App;
