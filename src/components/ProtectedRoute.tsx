import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";

interface ProtectedRouteProps {
  allowedTiers: Array<"Builder" | "Premium" | "Enterprise">;
  children: ReactNode;
}

const ProtectedRoute = ({ allowedTiers, children }: ProtectedRouteProps) => {
  const { user, isAdmin, subscription } = useAuthSub();

  if (isAdmin) return <>{children}</>;
  if (!user) return <Navigate to="/auth" replace />;

  const tier = subscription.subscription_tier;
  const isAllowed = tier && allowedTiers.includes(tier as any);

  if (!isAllowed) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
