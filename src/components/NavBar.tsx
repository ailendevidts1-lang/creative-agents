import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-2 rounded-md text-sm font-medium transition-colors story-link ${
    isActive
      ? "bg-secondary/50 text-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
  }`;

const NavBar = () => {
  const items = [
    { to: "/", label: "Home", end: true },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/builder", label: "Builder" },
    { to: "/agents", label: "My Agents" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/pricing", label: "Pricing" },
    { to: "/settings", label: "Settings" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-3" aria-label="Main">
        <a href="/" className="font-heading text-lg font-semibold tracking-wide bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text hover-scale" aria-label="AgentHub">
          AgentHub
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end as any} className={({ isActive }) => linkCls({ isActive })}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger aria-label="Open menu" className="btn-glass p-2 rounded-md">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-2">
                {items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end as any} className={({ isActive }) => linkCls({ isActive })}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
