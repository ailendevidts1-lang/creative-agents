import { NavLink } from "react-router-dom";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-2 rounded-md text-sm font-medium transition-colors story-link ${
    isActive
      ? "bg-secondary/50 text-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
  }`;

const NavBar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-3" aria-label="Main">
        <a href="/" className="font-heading text-lg font-semibold tracking-wide bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text hover-scale" aria-label="Creative Agents">
          Creative Agents
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <NavLink to="/" className={({ isActive }) => linkCls({ isActive })} end>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => linkCls({ isActive })}>
            Dashboard
          </NavLink>
          <NavLink to="/builder" className={({ isActive }) => linkCls({ isActive })}>
            Builder
          </NavLink>
          <NavLink to="/agents" className={({ isActive }) => linkCls({ isActive })}>
            My Agents
          </NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => linkCls({ isActive })}>
            Marketplace
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => linkCls({ isActive })}>
            Pricing
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => linkCls({ isActive })}>
            Settings
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => linkCls({ isActive })}>
            Admin
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
