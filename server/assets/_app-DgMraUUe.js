import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, useLocation, Link, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { a as useTheme, b as useUser, u as useP4P, g as getCurrentUser, s as supabase } from "./router-CQTT2apA.js";
import { ChevronRight, Check, Circle, Sun, Moon, Monitor, LayoutDashboard, Target, Calculator, ClipboardCheck, Users, FileSpreadsheet, TrendingUp, FileText, UserCheck, X, Menu, Sparkles, LogOut } from "lucide-react";
import { B as Button } from "./button-BC9oXVxV.js";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { c as cn } from "./utils-H80jjgLf.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
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
const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["employee", "hr", "admin"]
  },
  {
    label: "My Performance",
    to: "/employee",
    icon: Target,
    roles: ["employee", "hr", "admin"]
  },
  {
    label: "My Calculation",
    to: "/my-calculation",
    icon: Calculator,
    roles: ["employee", "hr", "admin"]
  },
  {
    label: "Appraisals",
    to: "/appraisals",
    icon: ClipboardCheck,
    roles: ["employee", "hr", "admin"]
  },
  {
    label: "Review Appraisals",
    to: "/appraisals-review",
    icon: ClipboardCheck,
    roles: ["employee", "hr", "admin"]
  },
  {
    label: "Employees",
    to: "/employees",
    icon: Users,
    roles: ["hr", "admin"]
  },
  {
    label: "KPI Framework",
    to: "/kpi-framework",
    icon: FileSpreadsheet,
    roles: ["admin"]
  },
  {
    label: "Monthly Performance",
    to: "/monthly",
    icon: TrendingUp,
    roles: ["hr", "admin"]
  },
  {
    label: "Calculation Trace",
    to: "/trace",
    icon: FileText,
    roles: ["hr", "admin"]
  },
  {
    label: "Supervisors",
    to: "/supervisors",
    icon: UserCheck,
    roles: ["admin"]
  },
  {
    label: "Grade Points",
    to: "/grades",
    icon: Target,
    roles: ["hr", "admin"]
  }
];
function AppLayout({ children }) {
  const { user, role: contextRole, logout } = useUser();
  const { employees } = useP4P();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null);
  useEffect(() => {
    const detectRole = async () => {
      if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
        setDetectedRole(contextRole);
        return;
      }
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setDetectedRole("employee");
          return;
        }
        const emp = employees.find((e) => e.email === currentUser.email);
        if (emp) {
          const r = emp.roleType || (emp.isManager ? "employee" : "employee");
          setDetectedRole(r);
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
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout?.();
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
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
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary-foreground" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-lg hidden sm:inline-block", children: "P4P" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(ThemeToggle, {}),
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
            onClick: handleLogout,
            title: "Logout",
            children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex lg:flex-col w-64 border-r bg-background sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto", children: /* @__PURE__ */ jsx("nav", { className: "flex-1 p-3 space-y-1", children: visibleItems.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground px-3 py-2", children: "No navigation available for this role." }) : visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.to,
            className: `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label })
            ]
          },
          item.to
        );
      }) }) }),
      mobileMenuOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "fixed inset-0 bg-black/50 z-30 lg:hidden",
            onClick: () => setMobileMenuOpen(false)
          }
        ),
        /* @__PURE__ */ jsx("aside", { className: "fixed top-14 left-0 bottom-0 w-64 border-r bg-background z-40 overflow-y-auto lg:hidden", children: /* @__PURE__ */ jsx("nav", { className: "flex-1 p-3 space-y-1", children: visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return /* @__PURE__ */ jsxs(
            Link,
            {
              to: item.to,
              onClick: () => setMobileMenuOpen(false),
              className: `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label })
              ]
            },
            item.to
          );
        }) }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 lg:p-6 min-w-0", children })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Outlet, {}) });
export {
  SplitComponent as component
};
