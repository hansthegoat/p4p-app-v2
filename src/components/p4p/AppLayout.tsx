import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useUser } from "@/lib/p4p/user-context";
import { useP4P } from "@/lib/p4p/store";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { LogoutConfirmModal } from "@/components/p4p/LogoutConfirmModal";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTour } from "@/hooks/usePageTour";
import { getPageTourForPath, isTourDone } from "@/lib/p4p/tours";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
  icon: any;
  roles: string[];
  showOnlyIfPending?: boolean;
  group?: "main" | "team" | "admin";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["employee", "hr", "admin"], group: "main" },
  { label: "My Performance", to: "/employee", icon: Target, roles: ["employee", "hr", "admin"], group: "main" },
  { label: "My Calculation", to: "/my-calculation", icon: Calculator, roles: ["employee", "hr", "admin"], group: "main" },
  { label: "Appraisals", to: "/appraisals", icon: ClipboardCheck, roles: ["employee", "hr", "admin"], group: "main" },
  { label: "KPI Updates", to: "/kpi-updates", icon: RefreshCw, roles: ["employee", "hr", "admin"], showOnlyIfPending: true, group: "main" },
  { label: "Review Appraisals", to: "/appraisals-review", icon: ClipboardCheck, roles: ["employee", "hr", "admin"], group: "main" },
  { label: "My Profile", to: "/profile", icon: User, roles: ["employee", "hr", "admin"], group: "main" },   // 👈 moved to bottom
  { label: "Employees", to: "/employees", icon: Users, roles: ["hr", "admin"], group: "team" },
  { label: "Supervisors", to: "/supervisors", icon: UserCheck, roles: ["hr", "admin"], group: "team" },
  { label: "KPI Framework", to: "/kpi-framework", icon: FileSpreadsheet, roles: ["hr", "admin"], group: "admin" },
  { label: "Grade Points", to: "/grades", icon: Target, roles: ["hr", "admin"], group: "admin" },
  { label: "Monthly Performance", to: "/monthly", icon: TrendingUp, roles: ["hr", "admin"], group: "admin" },
  { label: "Audit Log", to: "/audit-log", icon: History, roles: ["hr", "admin"], group: "admin" },
  { label: "Calculation Trace", to: "/trace", icon: FileText, roles: ["hr", "admin"], group: "admin" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Overview",
  team: "People",
  admin: "Administration",
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role: contextRole, logout } = useUser();
  const { employees, kpiUpdateRequests } = useP4P();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const pageTour = getPageTourForPath(location.pathname);
  const welcomeDone =
    isTourDone("employee_welcome") || isTourDone("hr_welcome");

  // 👈 Skip the dashboard page tour in AppLayout — the dashboard file
  // handles it directly so it can chain after the welcome tour.
  const isDashboard = location.pathname === "/dashboard";
  usePageTour(pageTour, welcomeDone && !isDashboard);

  useEffect(() => {
    const detectRole = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          if (!contextRole) setDetectedRole("employee");
          return;
        }
        setAuthUserId(currentUser.id);
        if (currentUser.email === "hr@aoholdings.net") {
          setDetectedRole("hr");
          return;
        }
        if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
          setDetectedRole(contextRole);
          return;
        }
        const emp =
          employees.find((e) => e.email === currentUser.email) ||
          employees.find((e) => e.authUserId === currentUser.id);
        if (emp?.roleType) setDetectedRole(emp.roleType);
        else setDetectedRole("employee");
      } catch {
        if (!contextRole) setDetectedRole("employee");
      }
    };
    detectRole();
  }, [contextRole, employees]);

  const role = detectedRole || contextRole || "employee";

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

  const groupedItems = visibleItems.reduce<Record<string, NavItem[]>>(
    (acc, item) => {
      const g = item.group || "main";
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    },
    {}
  );

  const requestLogout = () => setLogoutModalOpen(true);

  const handleLogout = async () => {
    try {
      setLogoutModalOpen(false);
      await supabase.auth.signOut();
      logout?.();
      showToast.success("Logged Out", "You've been signed out safely.");
      navigate({ to: "/login" });
    } catch (err: any) {
      console.error("Logout error:", err);
      showToast.error("Logout Failed", err.message || "Something went wrong.");
    }
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const tourAnchorMap: Record<string, string> = {
    "/employee": "nav-my-performance",
    "/profile": "nav-my-profile",
    "/kpi-framework": "nav-kpi-framework",
    "/employees": "nav-employees",
    "/audit-log": "nav-audit-log",
  };

  const renderNavLink = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const showBadge = item.to === "/kpi-updates" && pendingKpiUpdates > 0;

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        data-tour={tourAnchorMap[item.to] || undefined}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
          active
            ? "bg-blue-500/15 text-blue-100 dark:text-blue-50"
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]" />
        )}

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
            active
              ? "bg-blue-500/25 text-blue-100"
              : "bg-slate-800/60 text-slate-400 group-hover:text-slate-100 group-hover:bg-slate-700/60"
          }`}
        >
          <Icon className="h-[15px] w-[15px]" />
        </span>

        <span className="truncate">{item.label}</span>

        {showBadge && (
          <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shadow-sm">
            {pendingKpiUpdates}
          </span>
        )}
      </Link>
    );
  };

  /** Full sidebar body — reused for desktop and mobile */
  const sidebarContent = (onItemClick?: () => void) => (
    <div className="flex h-full flex-col bg-slate-900 dark:bg-slate-950">
      {/* 👈 Brand block — top of sidebar */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-800/60 px-4">
        <Link
          to="/dashboard"
          className="group flex items-center gap-2.5 min-w-0"
          onClick={onItemClick}
        >
          <div className="shrink-0 rounded-lg bg-white p-1 shadow-sm">
            <Logo
              size={28}
              variant="mark"
              theme="dark"
              className="transition-transform group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold leading-tight text-slate-100">
              P4P Platform
            </div>
            <div className="truncate text-[10.5px] font-medium leading-tight text-slate-500">
              Pay for Performance 
            </div>
          </div>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10.5px] font-semibold tracking-wide text-slate-500">
              {GROUP_LABELS[group] || group}
            </div>
            {items.map((item) => renderNavLink(item, onItemClick))}
          </div>
        ))}
      </nav>

      {/* 👈 Bottom rail — user card with logout beside email */}
      <div className="shrink-0 border-t border-slate-800/60 px-3 py-3">
        {user && (
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-800/40 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[12px] font-bold text-white shadow-sm">
              {(user.name || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-medium text-slate-200">
                {user.name || user.email?.split("@")[0] || "User"}
              </div>
              <div className="truncate text-[10.5px] capitalize text-slate-500">
                {role}
              </div>
            </div>
            {/* 👈 logout pinned to the far right of the card */}
            <button
              onClick={requestLogout}
              className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar (only visible on small screens) */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-slate-900 px-4 dark:bg-slate-950 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <Logo size={28} variant="mark" theme="dark" />
          </div>
          <span className="font-bold text-[15px] text-slate-100 tracking-tight whitespace-nowrap">
            P4P Platform
          </span>
        </Link>
      </header>

      {/* Body — sidebar is full height on desktop */}
      <div className="flex">
        {/* Desktop full-height sidebar */}
        <aside
          data-tour="sidebar"
          className="hidden lg:flex lg:flex-col w-64 border-r border-slate-800 sticky top-0 h-screen overflow-hidden"
        >
          {sidebarContent()}
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-14 left-0 bottom-0 w-64 border-r border-slate-800 z-50 lg:hidden">
              {sidebarContent(() => setMobileMenuOpen(false))}
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">{children}</main>
      </div>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}