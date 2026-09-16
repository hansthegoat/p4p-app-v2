import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useUser } from "@/lib/p4p/user-context";
import { useP4P } from "@/lib/p4p/store";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutConfirmModal } from "@/components/p4p/LogoutConfirmModal";
import { NotificationBell } from "@/components/p4p/NotificationBell";
import { Logo } from "@/components/p4p/Logo";
import { showToast } from "@/lib/toast";
import {
  LayoutDashboard,
  Users,
  Target,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  UserCheck,
  User,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  Calculator,
  RefreshCw,
  History,
  KeyRound,
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
  showOnlyIfPending?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["employee", "hr", "admin"] },
  { label: "My Performance", to: "/employee", icon: Target, roles: ["employee", "hr", "admin"] },
  { label: "My Calculation", to: "/my-calculation", icon: Calculator, roles: ["employee", "hr", "admin"] },
  { label: "My Profile", to: "/profile", icon: User, roles: ["employee", "hr", "admin"] },
  { label: "Appraisals", to: "/appraisals", icon: ClipboardCheck, roles: ["employee", "hr", "admin"] },
  { label: "KPI Updates", to: "/kpi-updates", icon: RefreshCw, roles: ["employee", "hr", "admin"], showOnlyIfPending: true },
  { label: "Review Appraisals", to: "/appraisals-review", icon: ClipboardCheck, roles: ["employee", "hr", "admin"] },
  { label: "Employees", to: "/employees", icon: Users, roles: ["hr", "admin"] },
  { label: "KPI Framework", to: "/kpi-framework", icon: FileSpreadsheet, roles: ["hr", "admin"] },
  { label: "Monthly Performance", to: "/monthly", icon: TrendingUp, roles: ["hr", "admin"] },
  { label: "Audit Log", to: "/audit-log", icon: History, roles: ["hr", "admin"] },
  { label: "Calculation Trace", to: "/trace", icon: FileText, roles: ["hr", "admin"] },
  { label: "Supervisors", to: "/supervisors", icon: UserCheck, roles: ["hr", "admin"] },
  { label: "Grade Points", to: "/grades", icon: Target, roles: ["hr", "admin"] },
  { label: "Change Password", to: "/change-password", icon: KeyRound, roles: ["employee", "hr", "admin"] },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role: contextRole, logout } = useUser();
  const { employees, kpiUpdateRequests } = useP4P();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Auto-detect role
  useEffect(() => {
    const detectRole = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          if (!contextRole) setDetectedRole("employee");
          return;
        }
        setAuthUserId(currentUser.id);

        // Shared HR email — always HR
        if (currentUser.email === "hr@aoholdings.net") {
          setDetectedRole("hr");
          return;
        }

        // Context role takes priority
        if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
          setDetectedRole(contextRole);
          return;
        }

        // Look up by email or auth id
        const emp =
          employees.find((e) => e.email === currentUser.email) ||
          employees.find((e) => e.authUserId === currentUser.id);
        if (emp?.roleType) {
          setDetectedRole(emp.roleType);
        } else {
          setDetectedRole("employee");
        }
      } catch {
        if (!contextRole) setDetectedRole("employee");
      }
    };
    detectRole();
  }, [contextRole, employees]);

  const role = detectedRole || contextRole || "employee";

  // Pending KPI updates for the current user
  const me = employees.find(
    (e) => e.authUserId === authUserId || (user?.email && e.email === user.email)
  );
  const pendingKpiUpdates = me
    ? kpiUpdateRequests.filter(
        (r) => r.employeeId === me.id && r.status === "unacknowledged"
      ).length
    : 0;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(role)) return false;
    if (item.showOnlyIfPending && pendingKpiUpdates === 0) return false;
    return true;
  });

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

  const renderNavLink = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const showBadge = item.to === "/kpi-updates" && pendingKpiUpdates > 0;

    const tourAnchorMap: Record<string, string> = {
      "/employee": "nav-my-performance",
      "/profile": "nav-my-profile",
      "/kpi-framework": "nav-kpi-framework",
      "/employees": "nav-employees",
      "/audit-log": "nav-audit-log",
    };

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        data-tour={tourAnchorMap[item.to] || undefined}
        className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        {showBadge && (
          <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
            {pendingKpiUpdates}
          </span>
        )}
      </Link>
    );
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

          {/* Logo — white card so it's visible in dark mode */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <Logo
                size={32}
                variant="mark"
                theme="dark"
                className="transition-transform group-hover:scale-105"
              />
            </div>
            <span className="font-bold text-base hidden sm:inline-block tracking-tight whitespace-nowrap">
              P4P Platform
            </span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div data-tour="notifications">
              <NotificationBell />
            </div>

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
<aside data-tour="sidebar" className="hidden lg:flex lg:flex-col w-64 border-r bg-background sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="flex-1 p-3 space-y-1">
            {visibleItems.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No navigation available for this role.
              </p>
            ) : (
              visibleItems.map((item) => renderNavLink(item))
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
                {visibleItems.map((item) =>
                  renderNavLink(item, () => setMobileMenuOpen(false))
                )}
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