import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Settings2, FileText, LogOut, Menu, X, Calculator } from "lucide-react";
import { useState, type ReactNode } from "react";
import { logout } from "@/lib/p4p/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/grades", label: "Grade Points", icon: Settings2 },
  { to: "/trace", label: "Calculation Trace", icon: FileText },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
        <SidebarContent pathname={location.pathname} onNav={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-card border-b flex items-center px-4 justify-between">
        <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm tracking-tight">P4P Calculator</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card z-50 md:hidden flex flex-col"
            >
              <div className="flex justify-end p-2">
                <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-accent">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent
                pathname={location.pathname}
                onNav={() => setOpen(false)}
                onLogout={() => { setOpen(false); handleLogout(); }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-8 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarContent({ pathname, onNav, onLogout }: { pathname: string; onNav: () => void; onLogout: () => void }) {
  return (
    <>
      <div className="px-6 py-5 border-b flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Calculator className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">P4P Calculator</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Distribution Engine</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to} to={to} onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground/80"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );
}
