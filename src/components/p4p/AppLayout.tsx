import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useUser } from "@/lib/p4p/user-context";
import { useP4P } from "@/lib/p4p/store";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutConfirmModal } from "@/components/p4p/LogoutConfirmModal";
import { showToast } from "@/lib/toast";
import {
  LayoutDashboard,
  Users,
  Target,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  UserCheck,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
  icon: any;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["employee", "hr", "admin"] },
  { label: "My Performance", to: "/employee", icon: Target, roles: ["employee", "hr", "admin"] },
  { label: "My Calculation", to: "/my-calculation", icon: Calculator, roles: ["employee", "hr", "admin"] },
  { label: "Appraisals", to: "/appraisals", icon: ClipboardCheck, roles: ["employee", "hr", "admin"] },
  { label: "Review Appraisals", to: "/appraisals-review", icon: ClipboardCheck, roles: ["employee", "hr", "admin"] },
  { label: "Employees", to: "/employees", icon: Users, roles: ["hr", "admin"] },
  { label: "KPI Framework", to: "/kpi-framework", icon: FileSpreadsheet, roles: ["admin"] },
  { label: "Monthly Performance", to: "/monthly", icon: TrendingUp, roles: ["hr", "admin"] },
  { label: "Calculation Trace", to: "/trace", icon: FileText, roles: ["hr", "admin"] },
  { label: "Supervisors", to: "/supervisors", icon: UserCheck, roles: ["admin"] },
  { label: "Grade Points", to: "/grades", icon: Target, roles: ["hr", "admin"] },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role: contextRole, logout } = useUser();
  const { employees } = useP4P();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Auto-detect role
  useEffect(() => {
    const detectRole = async () => {
      if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
        setDetectedRole(contextRole);
        return;
      }
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) { setDetectedRole("employee"); return; }
        const emp = employees.find((e) => e.email === currentUser.email);
        if (emp) {
          setDetectedRole(emp.roleType || "employee");
        } else {
          setDetectedRole("employee");
        }
      } catch {
        setDetectedRole("employee");
      }
    };
    detectRole();
  }, [contextRole, employees]);

  const role = detectedRole || contextRole || "employee";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const requestLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      setLogoutModalOpen(false);
      await supabase.auth.signOut();
      logout?.();
      showToast.success("Logged Out", "You've been signed out safely.");
      navigate({ to: "/login" });
    } catch (err: any) {
      console.error("Logout error:", err);
      showToast.error("Logout Failed", err.message || "Something went wrong. Please try again.");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">P4P</span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {user.name || user.email}
                </span>
                {role && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {role}
                  </Badge>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={requestLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-background sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="flex-1 p-3 space-y-1">
            {visibleItems.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No navigation available for this role.
              </p>
            ) : (
              visibleItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })
            )}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-14 left-0 bottom-0 w-64 border-r bg-background z-40 overflow-y-auto lg:hidden">
              <nav className="flex-1 p-3 space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}