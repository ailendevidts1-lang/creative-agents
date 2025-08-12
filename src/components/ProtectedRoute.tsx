
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";

interface ProtectedRouteProps {
  allowedTiers: Array<"Builder" | "Premium" | "Enterprise">;
  children: ReactNode;
}

const ProtectedRoute = ({ allowedTiers, children }: ProtectedRouteProps) => {
  const { user, isAdmin, subscription, subscriptionLoading, authLoading } = useAuthSub();

  // Still loading auth or subscription status
  if (authLoading || subscriptionLoading) {
    return <div className="p-6 text-muted-foreground">Checking your access...</div>;
  }

  // Admin bypass - full access
  if (isAdmin) return <>{children}</>;
  
  // Not logged in
  if (!user) return <Navigate to="/auth" replace />;

  const tier = subscription.subscription_tier;
  
  // Enterprise users get access to everything
  if (tier === "Enterprise") {
    return <>{children}</>;
  }
  
  // Check if current tier is in allowed tiers
  const isAllowed = tier && allowedTiers.includes(tier as any);

  if (!isAllowed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
