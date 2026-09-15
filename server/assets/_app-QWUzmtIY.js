import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, useLocation, Link, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { u as useTheme, a as useP4P, b as useUser, s as supabase, g as getCurrentUser } from "./router-D7LNLANq.js";
import { ChevronRight, Check, Circle, Sun, Moon, Monitor, LogOut, X, Bell, Loader2, CheckCheck, AlertOctagon, AlertTriangle, MessageSquare, RefreshCw, XCircle, CheckCircle2, ClipboardCheck, LayoutDashboard, Target, Calculator, User, Users, FileSpreadsheet, TrendingUp, History, FileText, UserCheck, KeyRound, Menu } from "lucide-react";
import { B as Button } from "./button-D-QX7IMW.js";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { c as cn, C as Card } from "./card-DJtmP4ah.js";
import { AnimatePresence, motion } from "framer-motion";
import { d as dropdown } from "./motion-DlChdgW6.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "icon", className: "h-8 w-8", children: [
      /* @__PURE__ */ jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }),
      /* @__PURE__ */ jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle theme" })
    ] }) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setTheme("light"), children: [
        /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4 mr-2" }),
        "Light",
        theme === "light" && /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs", children: "✓" })
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setTheme("dark"), children: [
        /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4 mr-2" }),
        "Dark",
        theme === "dark" && /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs", children: "✓" })
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setTheme("system"), children: [
        /* @__PURE__ */ jsx(Monitor, { className: "h-4 w-4 mr-2" }),
        "System",
        theme === "system" && /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs", children: "✓" })
      ] })
    ] })
  ] });
}
function LogoutConfirmModal({ open, onClose, onConfirm }) {
  return /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { scale: 0.95, opacity: 0, y: 10 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.95, opacity: 0, y: 10 },
        transition: { type: "spring", stiffness: 300, damping: 25 },
        className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm px-4",
        children: /* @__PURE__ */ jsxs(Card, { className: "p-6 shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold", children: "Log out?" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/70 mt-0.5", children: "You'll need to sign in again." })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-1 rounded-md hover:bg-accent transition-colors text-foreground/60 hover:text-foreground",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-muted/40 border border-border/60 p-3 mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/80 leading-relaxed", children: "Any unsaved changes will be lost. Make sure you've saved your work before logging out." }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, className: "flex-1", children: "Cancel" }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: onConfirm,
                className: "flex-1 gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-500/20",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                  "Log Out"
                ]
              }
            )
          ] })
        ] })
      }
    )
  ] }) });
}
function NotificationBell() {
  const navigate = useNavigate();
  const { employees, notifications, markNotificationRead } = useP4P();
  const { user } = useUser();
  const [authUserId, setAuthUserId] = useState(null);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const wrapperRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthUserId(data?.user?.id || null);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const me = employees.find(
    (e) => e.authUserId === authUserId || user?.email && e.email === user.email
  );
  const mine = me ? notifications.filter((n) => n.userId === me.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) : [];
  const unread = mine.filter((n) => !n.read);
  const handleClick = (n) => {
    if (!n.read) markNotificationRead(n.id);
    setOpen(false);
    if (n.link) navigate({ to: n.link });
  };
  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      for (const n of unread) markNotificationRead(n.id);
    } finally {
      setMarkingAll(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { ref: wrapperRef, className: "relative", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        whileHover: { scale: 1.06 },
        whileTap: { scale: 0.94 },
        transition: { type: "spring", stiffness: 400, damping: 25 },
        children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8 relative",
            onClick: () => setOpen((v) => !v),
            title: "Notifications",
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx(AnimatePresence, { children: unread.length > 0 && /* @__PURE__ */ jsx(
                motion.span,
                {
                  initial: { scale: 0 },
                  animate: { scale: 1 },
                  exit: { scale: 0 },
                  transition: { type: "spring", stiffness: 500, damping: 20 },
                  className: "absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1",
                  children: unread.length > 9 ? "9+" : unread.length
                },
                unread.length
              ) })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(
      motion.div,
      {
        variants: dropdown,
        initial: "hidden",
        animate: "show",
        exit: "exit",
        className: "absolute right-0 top-10 w-80 max-h-[440px] flex flex-col rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-50 origin-top-right",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 border-b border-border/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[13px] font-semibold", children: "Notifications" }),
            unread.length > 0 && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: markAllRead,
                disabled: markingAll,
                className: "text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50",
                children: [
                  markingAll ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(CheckCheck, { className: "h-3 w-3" }),
                  "Mark all read"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: mine.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
            /* @__PURE__ */ jsx(Bell, { className: "h-6 w-6 text-muted-foreground/30 mx-auto mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-[12px] text-muted-foreground", children: "No notifications" })
          ] }) : mine.slice(0, 25).map((n) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleClick(n),
              className: `w-full text-left px-3 py-2.5 border-b border-border/30 hover:bg-accent/40 transition-colors flex items-start gap-2.5 ${!n.read ? "bg-primary/5" : ""}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "mt-0.5 shrink-0", children: /* @__PURE__ */ jsx(NotifIcon, { type: n.type }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[12px] leading-snug", children: n.message }),
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: formatRelative(n.createdAt) })
                ] }),
                !n.read && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" })
              ]
            },
            n.id
          )) }),
          mine.length > 0 && /* @__PURE__ */ jsx("div", { className: "p-2 border-t border-border/50", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setOpen(false);
                navigate({ to: "/kpi-updates" });
              },
              className: "w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-1",
              children: "View all KPI updates"
            }
          ) })
        ]
      }
    ) })
  ] });
}
function NotifIcon({ type }) {
  const map = {
    appraisal_submitted: {
      Icon: ClipboardCheck,
      tone: "text-blue-600 dark:text-blue-400"
    },
    appraisal_approved: {
      Icon: CheckCircle2,
      tone: "text-emerald-600 dark:text-emerald-400"
    },
    appraisal_rejected: {
      Icon: XCircle,
      tone: "text-red-600 dark:text-red-400"
    },
    appraisal_needs_revision: {
      Icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400"
    },
    new_comment: {
      Icon: MessageSquare,
      tone: "text-blue-600 dark:text-blue-400"
    },
    trigger_pip: { Icon: AlertTriangle, tone: "text-amber-600 dark:text-amber-400" },
    trigger_probation: { Icon: AlertTriangle, tone: "text-red-600 dark:text-red-400" },
    trigger_management_action: {
      Icon: AlertOctagon,
      tone: "text-red-700 dark:text-red-400"
    }
  };
  const m = map[type] || { Icon: Bell, tone: "text-muted-foreground" };
  const I = m.Icon;
  return /* @__PURE__ */ jsx(I, { className: `h-4 w-4 ${m.tone}` });
}
function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric"
  });
}
function Logo({
  size = 32,
  variant = "mark",
  theme = "auto",
  className = ""
}) {
  const base = "/p4p-app-v2/";
  const src = `${base}${variant === "mark" ? "logo-mark.png" : "logo.png"}`;
  const invertClass = theme === "light" ? "brightness-0 invert" : theme === "dark" ? "" : "dark:brightness-0 dark:invert";
  return /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt: "P4P Platform",
      className: `object-contain shrink-0 ${invertClass} ${className}`,
      style: { width: size, height: size },
      draggable: false
    }
  );
}
const NAV_ITEMS = [
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
  { label: "Change Password", to: "/change-password", icon: KeyRound, roles: ["employee", "hr", "admin"] }
];
function AppLayout({ children }) {
  const { user, role: contextRole, logout } = useUser();
  const { employees, kpiUpdateRequests } = useP4P();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState(null);
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
        const emp = employees.find((e) => e.email === currentUser.email) || employees.find((e) => e.authUserId === currentUser.id);
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
  const me = employees.find(
    (e) => e.authUserId === authUserId || user?.email && e.email === user.email
  );
  const pendingKpiUpdates = me ? kpiUpdateRequests.filter(
    (r) => r.employeeId === me.id && r.status === "unacknowledged"
  ).length : 0;
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
    } catch (err) {
      console.error("Logout error:", err);
      showToast.error("Logout Failed", err.message || "Something went wrong. Please try again.");
    }
  };
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  const renderNavLink = (item, onClick) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const showBadge = item.to === "/kpi-updates" && pendingKpiUpdates > 0;
    return /* @__PURE__ */ jsxs(
      Link,
      {
        to: item.to,
        onClick,
        className: `relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label }),
          showBadge && /* @__PURE__ */ jsx("span", { className: "ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5", children: pendingKpiUpdates })
        ]
      },
      item.to
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxs("div", { className: "flex h-14 items-center gap-4 px-4 lg:px-6", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "lg:hidden h-8 w-8",
          onClick: () => setMobileMenuOpen(!mobileMenuOpen),
          children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Menu, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2.5 group shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg p-1 shadow-sm", children: /* @__PURE__ */ jsx(
          Logo,
          {
            size: 32,
            variant: "mark",
            theme: "dark",
            className: "transition-transform group-hover:scale-105"
          }
        ) }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-base hidden sm:inline-block tracking-tight whitespace-nowrap", children: "P4P Platform" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsx(NotificationBell, {}),
        user && /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium truncate max-w-[150px]", children: user.name || user.email }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] capitalize", children: role })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: requestLogout,
            title: "Logout",
            children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex lg:flex-col w-64 border-r bg-background sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto", children: /* @__PURE__ */ jsx("nav", { className: "flex-1 p-3 space-y-1", children: visibleItems.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground px-3 py-2", children: "No navigation available for this role." }) : visibleItems.map((item) => renderNavLink(item)) }) }),
      mobileMenuOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "fixed inset-0 bg-black/50 z-30 lg:hidden",
            onClick: () => setMobileMenuOpen(false)
          }
        ),
        /* @__PURE__ */ jsx("aside", { className: "fixed top-14 left-0 bottom-0 w-64 border-r bg-background z-40 overflow-y-auto lg:hidden", children: /* @__PURE__ */ jsx("nav", { className: "flex-1 p-3 space-y-1", children: visibleItems.map(
          (item) => renderNavLink(item, () => setMobileMenuOpen(false))
        ) }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 lg:p-6 min-w-0", children })
    ] }),
    /* @__PURE__ */ jsx(
      LogoutConfirmModal,
      {
        open: logoutModalOpen,
        onClose: () => setLogoutModalOpen(false),
        onConfirm: handleLogout
      }
    )
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Outlet, {}) });
export {
  SplitComponent as component
};
