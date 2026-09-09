import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, User, FileText, Users, UserPlus, Settings2, Calendar, Menu, Calculator, X, LogOut } from "lucide-react";
import { useState } from "react";
import { a as logout } from "./auth-BFboBjA_.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { u as useUser, U as UserProvider } from "./user-context-D6z2rSW2.js";
import { P as P4PProvider } from "./store-Dy84gyCY.js";
import "./router-ykR6owpd.js";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "clsx";
import "tailwind-merge";
const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employee", label: "My KPI's", icon: User },
  { to: "/appraisals", label: "My Appraisals", icon: FileText },
  { to: "/appraisals-review", label: "Review Appraisals", icon: Users },
  { to: "/supervisors", label: "Supervisor Assignment", icon: UserPlus },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/grades", label: "Grade Points", icon: Settings2 },
  { to: "/trace", label: "Calculation Trace", icon: FileText },
  { to: "/monthly", label: "Monthly Performance", icon: Calendar },
  { to: "/kpi-framework", label: "KPI Framework", icon: FileText }
];
function AppLayout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  const { role, loading, employee } = useUser();
  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };
  const isAdmin = role === "admin" || role === "hr";
  const isManager = employee?.isManager === true;
  let allowedNav;
  if (isAdmin) {
    allowedNav = NAV;
  } else if (isManager) {
    allowedNav = NAV.filter(
      (item) => item.to === "/dashboard" || item.to === "/employee" || item.to === "/appraisals" || item.to === "/appraisals-review"
    );
  } else {
    allowedNav = NAV.filter(
      (item) => item.to === "/dashboard" || item.to === "/employee" || item.to === "/appraisals"
    );
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Loading..." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-muted/30 flex", children: [
    /* @__PURE__ */ jsx("aside", { className: "hidden md:flex w-64 shrink-0 flex-col border-r bg-card", children: /* @__PURE__ */ jsx(
      SidebarContent,
      {
        pathname: location.pathname,
        onNav: () => {
        },
        onLogout: handleLogout,
        navItems: allowedNav
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-card border-b flex items-center px-4 justify-between", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setOpen(true), className: "p-2 rounded-md hover:bg-accent", children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Calculator, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-sm tracking-tight", children: "P4P Calculator" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-8" })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          onClick: () => setOpen(false),
          className: "fixed inset-0 bg-black/50 z-40 md:hidden"
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.aside,
        {
          initial: { x: -280 },
          animate: { x: 0 },
          exit: { x: -280 },
          transition: { type: "tween", duration: 0.25 },
          className: "fixed left-0 top-0 bottom-0 w-64 bg-card z-50 md:hidden flex flex-col",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-end p-2", children: /* @__PURE__ */ jsx("button", { onClick: () => setOpen(false), className: "p-2 rounded-md hover:bg-accent", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) }) }),
            /* @__PURE__ */ jsx(
              SidebarContent,
              {
                pathname: location.pathname,
                onNav: () => setOpen(false),
                onLogout: () => {
                  setOpen(false);
                  handleLogout();
                },
                navItems: allowedNav
              }
            )
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0 pt-14 md:pt-0", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.2 },
        className: "p-3 sm:p-5 md:p-8 max-w-7xl mx-auto",
        children
      },
      location.pathname
    ) }) })
  ] });
}
function SidebarContent({
  pathname,
  onNav,
  onLogout,
  navItems
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Calculator, { className: "h-4.5 w-4.5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent", children: "P4P Calculator" }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Distribution Engine" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 p-3 space-y-1", children: navItems.map(({ to, label, icon: Icon }) => {
      const active = pathname.startsWith(to);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          to,
          onClick: onNav,
          className: cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground/80"
          ),
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
            label
          ]
        },
        to
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "p-3 border-t", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onLogout,
        className: "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-foreground/80",
        children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
          "Logout"
        ]
      }
    ) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(P4PProvider, { children: /* @__PURE__ */ jsx(UserProvider, { children: /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Outlet, {}) }) }) });
export {
  SplitComponent as component
};
