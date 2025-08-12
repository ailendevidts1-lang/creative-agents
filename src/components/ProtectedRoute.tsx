
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";

interface ProtectedRouteProps {
  allowedTiers: Array<"Builder" | "Premium" | "Enterprise">;
  children: ReactNode;
}

const ProtectedRoute = ({ allowedTiers, children }: ProtectedRouteProps) => {
  const { user, isAdmin, subscription, subscriptionLoading } = useAuthSub();

  // Admin bypass - full access
  if (isAdmin) return <>{children}</>;
  
  // Not logged in
  if (!user) return <Navigate to="/auth" replace />;

  // Still loading subscription status
  if (subscriptionLoading) {
    return <div className="p-6 text-muted-foreground">Checking your access...</div>;
  }

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
