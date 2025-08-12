import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuthSub } from "@/context/AuthSubscriptionProvider";

const NavBar = () => {
  const { user, subscription, isAdmin } = useAuthSub();
  const tier = isAdmin ? "Enterprise" : (subscription.subscription_tier || "Free");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "btn-warm" : "btn-glass"}`;

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-3" aria-label="Main">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold text-foreground">AgentHub</Link>
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink>
            <NavLink to="/agents" className={linkClass}>My Agents</NavLink>
            <NavLink to="/builder" className={linkClass}>Builder</NavLink>
            <NavLink to="/workflows" className={linkClass}>Workflows</NavLink>
            <NavLink to="/earnings" className={linkClass}>Earnings</NavLink>
            <NavLink to="/referrals" className={linkClass}>Referrals</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-xs text-muted-foreground hidden sm:inline">{tier} plan</span>
          )}
          <Button variant="outline" className="btn-glass" asChild>
            <Link to="/auth">{user ? "Account" : "Sign in"}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
