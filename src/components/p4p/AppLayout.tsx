import { type ReactNode, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useUser } from "@/lib/p4p/user-context";
import { useP4P } from "@/lib/p4p/store";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/p4p/NotificationBell";
import { LogoutConfirmModal } from "@/components/p4p/LogoutConfirmModal";
import { SessionTimeoutWarning } from "@/components/p4p/SessionTimeoutWarning";
import { useSessionTimeout } from "@/lib/p4p/session-timeout";
import { pageTransition } from "@/lib/motion";
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
  showOnlyIfPending?: boolean;  // ⭐ NEW — hides the item when nothing's pending
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["employee", "hr", "admin"] },
  { label: "My Performance", to: "/employee", icon: Target, roles: ["employee", "hr", "admin"] },
  { label: "My Calculation", to: "/my-calculation", icon: Calculator, roles: ["employee", "hr", "admin"] },
  { label: "Appraisals", to: "/appraisals", icon: ClipboardCheck, roles: ["employee", "hr", "admin"] },
  // ⭐ NEW — only appears when there are pending KPI changes
  { label: "KPI Updates", to: "/kpi-updates", icon: RefreshCw, roles: ["employee", "hr", "admin"], showOnlyIfPending: true },
  { label: "Review Appraisals", to: "/appraisals-review", icon: ClipboardCheck, roles: ["employee", "hr", "admin"] },
  { label: "Employees", to: "/employees", icon: Users, roles: ["hr", "admin"] },
  { label: "KPI Framework", to: "/kpi-framework", icon: FileSpreadsheet, roles: ["hr", "admin"] },
  { label: "Monthly Performance", to: "/monthly", icon: TrendingUp, roles: ["hr", "admin"] },
  { label: "Calculation Trace", to: "/trace", icon: FileText, roles: ["hr", "admin"] },
  { label: "Audit Log", to: "/audit-log", icon: History, roles: ["hr", "admin"] },
  { label: "Supervisors", to: "/supervisors", icon: UserCheck, roles: ["hr", "admin"] },
  { label: "Change Password", to: "/change-password", icon: KeyRound, roles: ["employee", "hr", "admin"] },
  { label: "Grade Points", to: "/grades", icon: Target, roles: ["hr", "admin"] },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role: contextRole } = useUser();
  const { employees, kpiUpdateRequests } = useP4P();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const handleLogoutRef = useRef<() => void>(() => {});

  const sessionTimeout = useSessionTimeout(() => {
    handleLogoutRef.current?.();
  });

  // Auto-detect role + capture current auth user id
  useEffect(() => {
    const detectRole = async () => {
      if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
        setDetectedRole(contextRole);
      }
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          if (!contextRole) setDetectedRole("employee");
          return;
        }
        setAuthUserId(currentUser.id);

        if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
          return;
        }
        const emp = employees.find((e) => e.email === currentUser.email);
        if (emp) {
          setDetectedRole(emp.roleType || "employee");
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

  // ⭐ Compute pending KPI updates for the current user
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
      showToast.success("Logged Out", "You've been signed out safely.");
      navigate({ to: "/login" });
    } catch (err: any) {
      console.error("Logout error:", err);
      showToast.error("Logout Failed", err.message || "Something went wrong. Please try again.");
    }
  };

  handleLogoutRef.current = handleLogout;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // ⭐ Helper: render the nav link with optional badge
  const renderNavLink = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const showBadge = item.to === "/kpi-updates" && pendingKpiUpdates > 0;

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "text-primary-foreground"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        {active && (
          <motion.div
            layoutId="nav-active-bg"
            className="absolute inset-0 bg-primary rounded-md -z-0"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        <Icon className="h-4 w-4 shrink-0 relative z-10" />
        <span className="truncate relative z-10">{item.label}</span>
        {showBadge && (
          <span className="relative z-10 ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
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

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">P4P</span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />

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
            <aside className="fixed top-14 left-0 bottom-0 w-[min(16rem,calc(100vw-1rem))] border-r bg-background z-40 overflow-y-auto lg:hidden">
              <nav className="flex-1 p-3 space-y-1">
                {visibleItems.map((item) =>
                  renderNavLink(item, () => setMobileMenuOpen(false))
                )}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <motion.main
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="enter"
          exit="exit"
          className="flex-1 p-4 lg:p-6 min-w-0"
        >
          {children}
        </motion.main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
      <SessionTimeoutWarning
        open={sessionTimeout.showWarning}
        secondsLeft={sessionTimeout.secondsLeft}
        onStay={sessionTimeout.extend}
        onLogout={sessionTimeout.logoutNow}
      />
    </div>
  );
}