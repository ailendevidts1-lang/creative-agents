import { NavLink } from "react-router-dom";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/30"}`;

const NavBar = () => {
  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-3" aria-label="Main">
        <div className="flex items-center gap-3">
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
            Agents
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
