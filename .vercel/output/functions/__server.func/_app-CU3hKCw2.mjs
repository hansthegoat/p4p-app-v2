import { j as jsxRuntimeExports, r as reactExports } from "./_libs/react.mjs";
import { O as Outlet, d as useNavigate, f as useLocation, L as Link } from "./_libs/tanstack__react-router.mjs";
import { b as useUser, a as useP4P, g as getCurrentUser, u as useTheme, s as supabase } from "./_ssr/router-BPHF_myF.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, I as Item2, S as SubTrigger2, a as SubContent2, b as CheckboxItem2, c as ItemIndicator2, d as RadioItem2, L as Label2, e as Separator2 } from "./_libs/radix-ui__react-dropdown-menu.mjs";
import { C as Card, c as cn } from "./_ssr/card-DJtmP4ah.mjs";
import { d as dropdown } from "./_ssr/motion-DlChdgW6.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import "./_libs/sonner.mjs";
import { c as LayoutDashboard, T as Target, d as Calculator, U as User, e as ClipboardCheck, R as RefreshCw, f as Users, F as FileSpreadsheet, g as TrendingUp, H as History, h as FileText, i as UserCheck, K as KeyRound, X, j as Menu, k as LogOut, l as Sun, m as Moon, n as Monitor, B as Bell, L as LoaderCircle, o as CheckCheck, O as OctagonAlert, p as TriangleAlert, q as MessageSquare, r as CircleX, s as CircleCheck, t as ChevronRight, u as Check, v as Circle } from "./_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "./_libs/framer-motion.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/zod.mjs";
import "./_libs/sentry__react.mjs";
import "./_libs/sentry__core.mjs";
import "./_libs/sentry__browser.mjs";
import "./_libs/sentry__browser-utils.mjs";
import "./_libs/sentry__conventions.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/clsx.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-menu.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
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
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
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
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "icon", className: "h-8 w-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle theme" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setTheme("light"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4 mr-2" }),
        "Light",
        theme === "light" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs", children: "✓" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setTheme("dark"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4 mr-2" }),
        "Dark",
        theme === "dark" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs", children: "✓" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setTheme("system"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-4 w-4 mr-2" }),
        "System",
        theme === "system" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs", children: "✓" })
      ] })
    ] })
  ] });
}
function LogoutConfirmModal({ open, onClose, onConfirm }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { scale: 0.95, opacity: 0, y: 10 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.95, opacity: 0, y: 10 },
        transition: { type: "spring", stiffness: 300, damping: 25 },
        className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm px-4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 shadow-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold", children: "Log out?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/70 mt-0.5", children: "You'll need to sign in again." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "p-1 rounded-md hover:bg-accent transition-colors text-foreground/60 hover:text-foreground",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-muted/40 border border-border/60 p-3 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/80 leading-relaxed", children: "Any unsaved changes will be lost. Make sure you've saved your work before logging out." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, className: "flex-1", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: onConfirm,
                className: "flex-1 gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-500/20",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
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
  const [authUserId, setAuthUserId] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(false);
  const [markingAll, setMarkingAll] = reactExports.useState(false);
  const wrapperRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthUserId(data?.user?.id || null);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  reactExports.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: wrapperRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        whileHover: { scale: 1.06 },
        whileTap: { scale: 0.94 },
        transition: { type: "spring", stiffness: 400, damping: 25 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8 relative",
            onClick: () => setOpen((v) => !v),
            title: "Notifications",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: unread.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        variants: dropdown,
        initial: "hidden",
        animate: "show",
        exit: "exit",
        className: "absolute right-0 top-10 w-80 max-h-[440px] flex flex-col rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-50 origin-top-right",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2.5 border-b border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-semibold", children: "Notifications" }),
            unread.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: markAllRead,
                disabled: markingAll,
                className: "text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50",
                children: [
                  markingAll ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3 w-3" }),
                  "Mark all read"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: mine.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6 text-muted-foreground/30 mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-muted-foreground", children: "No notifications" })
          ] }) : mine.slice(0, 25).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleClick(n),
              className: `w-full text-left px-3 py-2.5 border-b border-border/30 hover:bg-accent/40 transition-colors flex items-start gap-2.5 ${!n.read ? "bg-primary/5" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotifIcon, { type: n.type }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] leading-snug", children: n.message }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: formatRelative(n.createdAt) })
                ] }),
                !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" })
              ]
            },
            n.id
          )) }),
          mine.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
      Icon: CircleCheck,
      tone: "text-emerald-600 dark:text-emerald-400"
    },
    appraisal_rejected: {
      Icon: CircleX,
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
    trigger_pip: { Icon: TriangleAlert, tone: "text-amber-600 dark:text-amber-400" },
    trigger_probation: { Icon: TriangleAlert, tone: "text-red-600 dark:text-red-400" },
    trigger_management_action: {
      Icon: OctagonAlert,
      tone: "text-red-700 dark:text-red-400"
    }
  };
  const m = map[type] || { Icon: Bell, tone: "text-muted-foreground" };
  const I = m.Icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: `h-4 w-4 ${m.tone}` });
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
  const base = "/";
  const src = `${base}${variant === "mark" ? "logo-mark.png" : "logo.png"}`;
  const invertClass = theme === "light" ? "brightness-0 invert" : theme === "dark" ? "" : "dark:brightness-0 dark:invert";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
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
  const [mobileMenuOpen, setMobileMenuOpen] = reactExports.useState(false);
  const [detectedRole, setDetectedRole] = reactExports.useState(null);
  const [logoutModalOpen, setLogoutModalOpen] = reactExports.useState(false);
  const [authUserId, setAuthUserId] = reactExports.useState(null);
  reactExports.useEffect(() => {
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: item.to,
        onClick,
        className: `relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.label }),
          showBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5", children: pendingKpiUpdates })
        ]
      },
      item.to
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-14 items-center gap-4 px-4 lg:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "lg:hidden h-8 w-8",
          onClick: () => setMobileMenuOpen(!mobileMenuOpen),
          children: mobileMenuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2.5 group shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-1 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Logo,
          {
            size: 32,
            variant: "mark",
            theme: "dark",
            className: "transition-transform group-hover:scale-105"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-base hidden sm:inline-block tracking-tight whitespace-nowrap", children: "P4P Platform" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, {}),
        user && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate max-w-[150px]", children: user.name || user.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] capitalize", children: role })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: requestLogout,
            title: "Logout",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:flex lg:flex-col w-64 border-r bg-background sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1", children: visibleItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground px-3 py-2", children: "No navigation available for this role." }) : visibleItems.map((item) => renderNavLink(item)) }) }),
      mobileMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 bg-black/50 z-30 lg:hidden",
            onClick: () => setMobileMenuOpen(false)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "fixed top-14 left-0 bottom-0 w-64 border-r bg-background z-40 overflow-y-auto lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1", children: visibleItems.map(
          (item) => renderNavLink(item, () => setMobileMenuOpen(false))
        ) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-4 lg:p-6 min-w-0", children })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LogoutConfirmModal,
      {
        open: logoutModalOpen,
        onClose: () => setLogoutModalOpen(false),
        onConfirm: handleLogout
      }
    )
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
export {
  SplitComponent as component
};
