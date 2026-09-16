import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useP4P, b as useUser, f as fmtGHS, c as fmtNum, g as getCurrentUser, s as supabase } from "./_ssr/router-BPHF_myF.mjs";
import { C as Card } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { I as Input } from "./_ssr/input-BgWjUwUQ.mjs";
import { L as Label } from "./_ssr/label-zkAJpnXH.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-Bh6hTGzN.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { S as StatCard } from "./_ssr/stat-card-DPr76q1z.mjs";
import { S as SectionCard } from "./_ssr/section-card-Dur1lkFz.mjs";
import { E as EmptyState } from "./_ssr/empty-state-DzL3lmex.mjs";
import { s as staggerContainer, t as tabContent, c as cardHover, f as fadeUp } from "./_ssr/motion-DlChdgW6.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { B as BonusGate } from "./_ssr/BonusGate-DEXyFQhU.mjs";
import "./_libs/sonner.mjs";
import { R as RefreshCw, _ as Calendar, b as Sparkles, am as Eye, an as EyeOff, ab as Save, ao as Settings, w as DollarSign, W as Wallet, g as TrendingUp, f as Users, i as UserCheck, G as Activity, x as Award, p as TriangleAlert, a as CircleAlert, T as Target, a7 as ChartColumn, aj as ChartPie, Z as Zap, C as CircleCheckBig, I as Info, ap as ArrowRight, s as CircleCheck, aq as UserX, e as ClipboardCheck, B as Bell, ar as Trophy, a8 as TrendingDown, a9 as Minus, V as Crown, t as ChevronRight, ah as Star, a4 as Clock } from "./_libs/lucide-react.mjs";
import { m as motion } from "./_libs/framer-motion.mjs";
import { R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Area, B as BarChart, b as Bar, P as PieChart, c as Pie, d as Cell } from "./_libs/recharts.mjs";
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
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-tabs.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
import "./_libs/lodash.mjs";
import "./_libs/react-smooth.mjs";
import "./_libs/prop-types.mjs";
import "./_libs/fast-equals.mjs";
import "./_libs/tiny-invariant.mjs";
import "./_libs/react-is.mjs";
import "./_libs/d3-shape.mjs";
import "./_libs/d3-path.mjs";
import "./_libs/victory-vendor.mjs";
import "./_libs/d3-scale.mjs";
import "./_libs/internmap.mjs";
import "./_libs/d3-array.mjs";
import "./_libs/d3-time-format.mjs";
import "./_libs/d3-time.mjs";
import "./_libs/d3-interpolate.mjs";
import "./_libs/d3-color.mjs";
import "./_libs/d3-format.mjs";
import "./_libs/recharts-scale.mjs";
import "./_libs/decimal.js-light.mjs";
import "./_libs/eventemitter3.mjs";
function AnimatedNumber({
  value,
  decimals = 0,
  duration = 600,
  suffix = "",
  prefix = "",
  className
}) {
  const [display, setDisplay] = reactExports.useState(value);
  const startRef = reactExports.useRef(null);
  const startValueRef = reactExports.useRef(value);
  const rafRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    startValueRef.current = display;
    startRef.current = null;
    const animate = (timestamp) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (value - startValueRef.current) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className, children: [
    prefix,
    display.toFixed(decimals),
    suffix
  ] });
}
function KpiUpdatesBanner() {
  const navigate = useNavigate();
  const { employees, kpiUpdateRequests } = useP4P();
  const { user } = useUser();
  const [authUserId, setAuthUserId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthUserId(data.user?.id || null);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const me = employees.find(
    (e) => e.authUserId === authUserId || user?.email && e.email === user.email
  );
  const pending = me ? kpiUpdateRequests.filter(
    (r) => r.employeeId === me.id && r.status === "pending"
  ).length : 0;
  if (pending === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => navigate({ to: "/kpi-updates" }),
      className: "w-full mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-colors flex items-center gap-3 text-left",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: "KPI updates need your review" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "HR proposed ",
            pending,
            " change",
            pending > 1 ? "s" : "",
            " to your KPIs."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" })
      ]
    }
  );
}
function Widget({
  icon: Icon,
  label,
  count,
  description,
  ctaText,
  ctaTo,
  tone,
  priority = "normal"
}) {
  const navigate = useNavigate();
  const tones = {
    amber: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      count: "text-amber-600 dark:text-amber-400",
      hover: "hover:bg-amber-500/10"
    },
    blue: {
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
      icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      count: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-500/10"
    },
    rose: {
      bg: "bg-rose-500/5",
      border: "border-rose-500/20",
      icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      count: "text-rose-600 dark:text-rose-400",
      hover: "hover:bg-rose-500/10"
    },
    purple: {
      bg: "bg-purple-500/5",
      border: "border-purple-500/20",
      icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      count: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-500/10"
    }
  };
  const t = tones[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => navigate({ to: ctaTo }),
      className: `w-full text-left rounded-lg border ${t.border} ${t.bg} p-4 transition-all duration-200 ${t.hover} hover:-translate-y-0.5 active:scale-[0.99] group cursor-pointer`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-md flex items-center justify-center ${t.icon}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
          priority === "high" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400", children: "Priority" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold tabular-nums ${t.count}`, children: count }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-medium text-foreground mt-0.5", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1 leading-snug", children: description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors", children: [
          ctaText,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5" })
        ] })
      ]
    }
  );
}
function NeedsAttention() {
  const { employees, appraisals, kpiUpdateRequests } = useP4P();
  const activeEmployees = employees.filter(
    (e) => e.roleType === "employee" && !e.isAdjunct
  );
  const noSupervisor = activeEmployees.filter(
    (e) => !e.supervisorId || e.supervisorId === ""
  );
  const noKpis = activeEmployees.filter(
    (e) => !e.categories || e.categories.length === 0
  );
  const pendingAppraisals = appraisals.filter((a) => a.status === "pending");
  const unackedUpdates = kpiUpdateRequests.filter(
    (r) => r.status === "unacknowledged"
  );
  const totalIssues = noSupervisor.length + noKpis.length + pendingAppraisals.length + unackedUpdates.length;
  if (totalIssues === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 border-emerald-500/20 bg-emerald-500/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-medium", children: "Everything is under control" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: "No pending actions across the organization." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[13px] font-semibold text-foreground", children: "Needs your attention" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
        "— ",
        totalIssues,
        " pending ",
        totalIssues === 1 ? "action" : "actions"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
      noSupervisor.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Widget,
        {
          icon: UserX,
          label: "No supervisor assigned",
          count: noSupervisor.length,
          description: "Employees can't submit appraisals until a supervisor is set.",
          ctaText: "Assign supervisors",
          ctaTo: "/supervisors",
          tone: "rose",
          priority: "high"
        }
      ),
      noKpis.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Widget,
        {
          icon: Target,
          label: "No KPIs assigned",
          count: noKpis.length,
          description: "These employees have empty KPI structures. Push a template.",
          ctaText: "Open KPI Framework",
          ctaTo: "/kpi-framework",
          tone: "amber"
        }
      ),
      pendingAppraisals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Widget,
        {
          icon: ClipboardCheck,
          label: "Appraisals awaiting review",
          count: pendingAppraisals.length,
          description: "Submitted appraisals waiting for approval or feedback.",
          ctaText: "Review appraisals",
          ctaTo: "/appraisals-review",
          tone: "blue"
        }
      ),
      unackedUpdates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Widget,
        {
          icon: Bell,
          label: "KPI updates not acknowledged",
          count: unackedUpdates.length,
          description: "Employees haven't acknowledged recent KPI changes.",
          ctaText: "View audit log",
          ctaTo: "/audit-log",
          tone: "purple"
        }
      )
    ] })
  ] });
}
function DepartmentLeaderboard() {
  const { employees, getPerformanceTrend } = useP4P();
  const [myDept, setMyDept] = reactExports.useState(null);
  const [myId, setMyId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u || cancelled) return;
      const me = employees.find(
        (e) => e.authUserId === u.id || e.email === u.email
      );
      if (me) {
        setMyDept(me.department);
        setMyId(me.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employees]);
  if (!myDept) return null;
  const deptEmployees = employees.filter(
    (e) => e.department === myDept && !e.isAdjunct && e.roleType === "employee"
  );
  const ranked = deptEmployees.map((e) => {
    const trend = getPerformanceTrend(e.id);
    return {
      id: e.id,
      name: e.name,
      role: e.role,
      score: trend?.currentScore || 0,
      trend: trend?.trendDirection || "stable",
      months: trend?.months.length || 0
    };
  }).filter((x) => x.months > 0).sort((a, b) => b.score - a.score).slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Department Leaderboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] h-5 ml-auto", children: myDept })
    ] }),
    ranked.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "No performance data yet. Rankings appear once appraisals are submitted." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: staggerContainer, className: "space-y-1.5", children: ranked.map((entry, idx) => {
      const isMe = entry.id === myId;
      const rankColor = idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-slate-400 text-white" : idx === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground";
      const TrendIcon = entry.trend === "improving" ? TrendingUp : entry.trend === "declining" ? TrendingDown : Minus;
      const trendColor = entry.trend === "improving" ? "text-emerald-600" : entry.trend === "declining" ? "text-red-600" : "text-muted-foreground";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          variants: fadeUp,
          className: `flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-accent/30"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${rankColor}`,
                children: idx === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5" }) : idx + 1
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] font-medium truncate flex items-center gap-2", children: [
                entry.name,
                isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded", children: "You" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground truncate", children: entry.role })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendIcon, { className: `h-3.5 w-3.5 shrink-0 ${trendColor}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-bold tabular-nums shrink-0 w-12 text-right", children: entry.score.toFixed(2) })
          ]
        },
        entry.id
      );
    }) })
  ] }) });
}
const COLORS = {
  primary: "hsl(221 70% 50%)",
  success: "hsl(152 55% 42%)",
  warning: "hsl(38 75% 52%)",
  danger: "hsl(0 65% 55%)"
};
const CHART_COLORS = [COLORS.success, COLORS.primary, COLORS.warning, COLORS.danger];
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px"
};
function Dashboard() {
  const navigate = useNavigate();
  const {
    globals,
    setGlobals,
    calc,
    employees,
    monthlyData,
    getAllTrends,
    getMonthlyStats,
    getMonthlyHistory,
    bonusRevealed,
    setBonusRevealed
  } = useP4P();
  const {
    role: contextRole,
    user: contextUser
  } = useUser();
  const [detectedRole, setDetectedRole] = reactExports.useState("employee");
  reactExports.useEffect(() => {
    (async () => {
      if (contextUser?.email === "hr@aoholdings.net") {
        setDetectedRole("hr");
        return;
      }
      const emp = employees.find((e) => contextUser?.email && e.email === contextUser.email || contextUser?.id && e.authUserId === contextUser.id);
      if (emp?.roleType) {
        setDetectedRole(emp.roleType);
        return;
      }
      if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
        setDetectedRole(contextRole);
      }
    })();
  }, [contextUser, employees, contextRole]);
  const isAdmin = detectedRole === "admin" || detectedRole === "hr";
  const [employee, setEmployee] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [localGlobals, setLocalGlobals] = reactExports.useState({
    totalRevenue: globals.totalRevenue,
    p4pPercent: globals.p4pPercent,
    adjunctPercent: globals.adjunctPercent,
    floor: globals.floor,
    cap: globals.cap,
    prorationOn: globals.prorationOn,
    salesMultiplier: globals.salesMultiplier
  });
  const [saving, setSaving] = reactExports.useState(false);
  const trends = getAllTrends();
  const stats = getMonthlyStats();
  reactExports.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate({
            to: "/login"
          });
          return;
        }
        const emp = employees.find((e) => e.email === user.email);
        setEmployee(emp || null);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);
  const monthlyTrendData = reactExports.useMemo(() => {
    const months = monthlyData.filter((d) => !employees.find((e) => e.id === d.employeeId)?.isAdjunct).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    const grouped = {};
    for (const d of months) {
      const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
      const label = `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })} ${d.year}`;
      if (!grouped[key]) grouped[key] = {
        month: label,
        total: 0,
        count: 0
      };
      grouped[key].total += d.performanceMultiplier;
      grouped[key].count++;
    }
    return Object.values(grouped).map((g) => ({
      month: g.month,
      avgMultiplier: g.total / g.count
    }));
  }, [monthlyData, employees]);
  const handleSaveGlobals = () => {
    setSaving(true);
    setGlobals(localGlobals);
    setTimeout(() => setSaving(false), 500);
  };
  const disabled = globals.totalRevenue <= 0;
  const employeeHistory = reactExports.useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);
  const categoryScores = reactExports.useMemo(() => {
    if (!employee?.categories) return [];
    return employee.categories.map((cat) => {
      let weightedSum = 0;
      let totalKpiWeight = 0;
      let kpiCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const weight = kpi.weight || 0;
        weightedSum += ratio * weight;
        totalKpiWeight += weight;
        kpiCount++;
      }
      const score = totalKpiWeight > 0 ? weightedSum / totalKpiWeight * 100 : 0;
      return {
        name: cat.name,
        score,
        weight: cat.weight,
        kpiCount,
        kpis: cat.kpis.map((k) => ({
          description: k.description,
          weight: k.weight || 0,
          metric: k.metric,
          target: k.target,
          actual: k.actual
        }))
      };
    });
  }, [employee]);
  const currentMonthScore = reactExports.useMemo(() => {
    if (!employee?.categories) return 0;
    let totalWeightedScore = 0;
    let totalCategoryWeight = 0;
    for (const cat of employee.categories) {
      let weightedSum = 0;
      let totalKpiWeight = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const weight = kpi.weight || 0;
        weightedSum += ratio * weight;
        totalKpiWeight += weight;
      }
      const catScore = totalKpiWeight > 0 ? weightedSum / totalKpiWeight : 0;
      const categoryWeight = cat.weight / 100;
      totalWeightedScore += catScore * categoryWeight;
      totalCategoryWeight += categoryWeight;
    }
    return totalCategoryWeight > 0 ? totalWeightedScore / totalCategoryWeight * 100 : 0;
  }, [employee]);
  const estimatedBonus = reactExports.useMemo(() => {
    if (!employee) return 0;
    return calc.perEmployee[employee.id]?.bonus || 0;
  }, [employee, calc]);
  const monthOverMonthChange = reactExports.useMemo(() => {
    if (employeeHistory.length < 2) return null;
    const sorted = [...employeeHistory].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (!last || !prev || prev.performanceMultiplier === 0) return null;
    return (last.performanceMultiplier - prev.performanceMultiplier) / prev.performanceMultiplier * 100;
  }, [employeeHistory]);
  const ytdAverage = reactExports.useMemo(() => {
    if (employeeHistory.length === 0) return 0;
    return employeeHistory.reduce((s, d) => s + d.performanceMultiplier, 0) / employeeHistory.length * 100;
  }, [employeeHistory]);
  const timelineData = reactExports.useMemo(() => {
    if (employeeHistory.length === 0) return [];
    return [...employeeHistory].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month).slice(-12).map((d) => ({
      month: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })} ${d.year}`,
      score: d.performanceMultiplier * 100
    }));
  }, [employeeHistory]);
  const kpiAchievementData = reactExports.useMemo(() => {
    if (!employee?.categories) return [];
    const data = [];
    for (const cat of employee.categories) {
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const achievement = Math.min(100, ratio * 100);
        data.push({
          name: kpi.description,
          achievement,
          target: kpi.target,
          actual: kpi.actual,
          metric: kpi.metric,
          weight: kpi.weight || 0,
          category: cat.name,
          status: achievement >= 100 ? "Exceeded" : achievement >= 70 ? "On Track" : achievement >= 50 ? "At Risk" : "Missed"
        });
      }
    }
    return data;
  }, [employee]);
  const kpiStatusData = reactExports.useMemo(() => {
    const statuses = {
      Exceeded: 0,
      "On Track": 0,
      "At Risk": 0,
      Missed: 0
    };
    for (const k of kpiAchievementData) {
      if (k.status === "Exceeded") statuses.Exceeded++;
      else if (k.status === "On Track") statuses["On Track"]++;
      else if (k.status === "At Risk") statuses["At Risk"]++;
      else statuses.Missed++;
    }
    return Object.entries(statuses).filter(([_, v]) => v > 0).map(([name, value]) => ({
      name,
      value
    }));
  }, [kpiAchievementData]);
  const getBand = (score) => {
    if (score >= 120) return {
      label: "Exceptional",
      color: "text-purple-600 dark:text-purple-400",
      icon: Star
    };
    if (score >= 100) return {
      label: "Exceeds Expectations",
      color: "text-emerald-600 dark:text-emerald-400",
      icon: TrendingUp
    };
    if (score >= 80) return {
      label: "Meets Expectations",
      color: "text-blue-600 dark:text-blue-400",
      icon: Target
    };
    if (score >= 60) return {
      label: "Needs Improvement",
      color: "text-amber-600 dark:text-amber-400",
      icon: Clock
    };
    return {
      label: "Performance Improvement Plan",
      color: "text-red-600 dark:text-red-400",
      icon: CircleAlert
    };
  };
  const band = getBand(currentMonthScore);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiUpdatesBanner, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "P4P Dashboard", description: "Live overview of pools, payouts, performance signals, and monthly trends.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6" }), badge: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
        monthlyData.length,
        " data points"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeedsAttention, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bonusRevealed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`, children: bonusRevealed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] font-semibold", children: [
              "Bonus visibility: ",
              bonusRevealed ? "Revealed" : "Hidden"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: bonusRevealed ? "Employees can see their bonus amounts." : "Employees see a locked placeholder until you reveal." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: async () => {
          try {
            await setBonusRevealed(!bonusRevealed);
            showToast.success(!bonusRevealed ? "Bonuses revealed" : "Bonuses hidden", !bonusRevealed ? "All employees can now see their amounts." : "Employees see the locked placeholder again.");
          } catch (err) {
            showToast.error("Could not update", err.message);
          }
        }, className: `gap-2 ${bonusRevealed ? "bg-background border border-border text-foreground hover:bg-accent" : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white"}`, children: bonusRevealed ? "Hide bonuses" : "Reveal bonuses" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Global P4P Settings", description: "Controls revenue, pool allocation, and thresholds", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }), action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSaveGlobals, disabled: saving, className: "gap-1.5", children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
        "Save"
      ] }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: [{
          key: "totalRevenue",
          label: "Revenue (GHS)",
          step: void 0
        }, {
          key: "p4pPercent",
          label: "P4P %",
          step: void 0
        }, {
          key: "adjunctPercent",
          label: "Adjunct %",
          step: void 0
        }, {
          key: "floor",
          label: "Floor",
          step: "0.01"
        }, {
          key: "cap",
          label: "Cap",
          step: "0.01"
        }, {
          key: "salesMultiplier",
          label: "Sales Mult.",
          step: "0.01"
        }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: f.step, className: "mt-1 h-9", value: localGlobals[f.key], onChange: (e) => setLocalGlobals((prev) => ({
            ...prev,
            [f.key]: Number(e.target.value)
          })) })
        ] }, f.key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: localGlobals.prorationOn, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              prorationOn: e.target.checked
            })), className: "h-3.5 w-3.5 rounded accent-primary" }),
            "Proration On"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "P4P Pool: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: fmtGHS(calc.totalPool) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Employee Pool: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: fmtGHS(calc.employeePool) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }), label: "Revenue", value: fmtGHS(globals.totalRevenue), sub: `${globals.p4pPercent}% to P4P`, accent: "primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }), label: "Total Pool", value: fmtGHS(calc.totalPool), accent: "purple" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }), label: "Adjunct Pool", value: fmtGHS(calc.adjunctPool), sub: `${globals.adjunctPercent}% share`, accent: "warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }), label: "Employee Pool", value: fmtGHS(calc.employeePool), accent: "success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Headcount", value: calc.adjunctCount + calc.nonAdjunctCount, sub: `${calc.nonAdjunctCount} core · ${calc.adjunctCount} adjunct`, accent: "info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }), label: "Avg Bonus", value: fmtGHS(calc.avgBonus), accent: "default" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Monthly Performance Trend", description: `${monthlyTrendData.length} months tracked`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-72", children: monthlyTrendData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: monthlyTrendData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "trendFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.35 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", fontSize: 11, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, 2], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [fmtNum(v, 2), "Avg Multiplier"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "avgMultiplier", stroke: COLORS.primary, strokeWidth: 2.5, fill: "url(#trendFill)", dot: {
            r: 4,
            strokeWidth: 2,
            fill: "#fff"
          }, activeDot: {
            r: 6
          } })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-6 w-6" }), title: "No monthly data yet", description: "Upload monthly performance data to see trends." }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Tracked Employees", value: trends.length, accent: "primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(stats.avgMultiplier, 2), accent: "success" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Top Performers", description: "Highest current performance multipliers", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }), children: trends.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [...trends].sort((a, b) => b.currentScore - a.currentScore).slice(0, 5).map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        x: -8
      }, animate: {
        opacity: 1,
        x: 0
      }, transition: {
        delay: i * 0.05
      }, className: "flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm truncate", children: t.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            t.months.length,
            " months"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-blue-600 dark:text-blue-400", children: fmtNum(t.currentScore, 2) })
        ] })
      ] }, t.employeeId)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6" }), title: "No performers yet", description: "Performance data will appear here once employees submit." }) }),
      (stats.risingStars.length > 0 || stats.underachievers.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        stats.risingStars.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Rising Stars", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-emerald-600" }), action: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-emerald-600 border-emerald-500/30", children: stats.risingStars.length }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: stats.risingStars.slice(0, 8).map((name, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
          opacity: 0,
          scale: 0.9
        }, animate: {
          opacity: 1,
          scale: 1
        }, transition: {
          delay: i * 0.04
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", children: name }) }, i)) }) }),
        stats.underachievers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Underachievers", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-red-600" }), action: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-red-600 border-red-500/30", children: stats.underachievers.length }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: stats.underachievers.slice(0, 8).map((name, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
          opacity: 0,
          scale: 0.9
        }, animate: {
          opacity: 1,
          scale: 1
        }, transition: {
          delay: i * 0.04
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20", children: name }) }, i)) }) })
      ] }),
      calc.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 bg-amber-500/5 border-amber-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-amber-900 dark:text-amber-300", children: "Warnings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1.5 space-y-1 text-xs text-amber-800 dark:text-amber-400", children: calc.warnings.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "• ",
            w
          ] }, i)) })
        ] })
      ] }) }),
      disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 bg-red-500/5 border-red-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-red-900 dark:text-red-300", children: "Total revenue is 0 — set a revenue value to enable calculations." })
      ] }) })
    ] });
  }
  if (!employee) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6" }), title: "No Employee Record", description: "Your profile is not linked to an employee record. Please contact HR." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(KpiUpdatesBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "My Performance", description: `${employee.name} · ${employee.department} · ${employee.role}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide font-semibold text-muted-foreground", children: "Current Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${band.color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: currentMonthScore, decimals: 1, suffix: "%" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `px-3 py-1.5 ${band.color} border-current/30`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(band.icon, { className: "h-3.5 w-3.5 mr-1.5" }),
        band.label
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }), label: "Current Score", value: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: currentMonthScore, decimals: 1, suffix: "%" }), sub: monthOverMonthChange !== null ? `${Math.abs(monthOverMonthChange).toFixed(1)}% from last month` : "No previous data", trend: monthOverMonthChange ?? void 0, accent: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }), label: "YTD Average", value: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: ytdAverage, decimals: 1, suffix: "%" }), sub: `${employeeHistory.length} months tracked`, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }), label: "Est. Bonus", value: /* @__PURE__ */ jsxRuntimeExports.jsx(BonusGate, { value: estimatedBonus, compact: true }), sub: "Based on current performance", accent: "info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }), label: "Months Tracked", value: employeeHistory.length, sub: employeeHistory.length > 0 ? `${(/* @__PURE__ */ new Date()).getFullYear()}` : "Start your first submission", accent: "purple" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "overview", onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "overview", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4" }),
          " Overview"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "categories", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { className: "h-4 w-4" }),
          " Categories"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "insights", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
          " Insights"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: tabContent, initial: "hidden", animate: "show", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Performance Trend", description: "Last 12 months", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-72", children: timelineData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: timelineData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "empTrend", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.3 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", fontSize: 11, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, 150], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [`${fmtNum(v, 1)}%`, "Score"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "score", stroke: COLORS.primary, strokeWidth: 2.5, fill: "url(#empTrend)", dot: {
            r: 4,
            strokeWidth: 2,
            fill: "#fff"
          }, activeDot: {
            r: 6
          } })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-6 w-6" }), title: "No data yet", description: "Submit your first appraisal to see your performance trend." }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Category Performance", description: "Weighted scores", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-64", children: categoryScores.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: categoryScores, layout: "vertical", margin: {
            left: 8,
            right: 16
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, horizontal: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", domain: [0, 100], fontSize: 11, axisLine: false, tickLine: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", fontSize: 11, axisLine: false, tickLine: false, width: 90 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [`${fmtNum(v, 1)}%`, "Score"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "score", fill: COLORS.primary, radius: [0, 6, 6, 0] })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { className: "h-6 w-6" }), title: "No categories" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "KPI Status Breakdown", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 h-64", children: kpiStatusData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: kpiStatusData, cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 75, paddingAngle: 4, dataKey: "value", label: (entry) => `${entry.name} ${entry.value}`, labelLine: false, children: kpiStatusData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0 }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tooltipStyle })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-6 w-6" }), title: "No KPIs" }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DepartmentLeaderboard, {})
      ] }, "overview") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "categories", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: tabContent, initial: "hidden", animate: "show", children: categoryScores.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-4", children: categoryScores.map((cat, i) => {
        const status = cat.score >= 100 ? "Exceeded" : cat.score >= 70 ? "On Track" : cat.score >= 50 ? "At Risk" : "Missed";
        const color = status === "Exceeded" ? "emerald" : status === "On Track" ? "blue" : status === "At Risk" ? "amber" : "red";
        const totalKpiWeight = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, layout: true, ...cardHover, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-5 border-l-4 border-l-${color}-500`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm truncate", children: cat.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                cat.kpiCount,
                " KPIs · Category weight ",
                cat.weight,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-2xl font-bold text-${color}-600 dark:text-${color}-400`, children: [
                fmtNum(cat.score, 1),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-[10px] mt-1 text-${color}-600 border-${color}-500/30`, children: status })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 mt-3 pt-3 border-t border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "KPIs (weight within category)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: totalKpiWeight === 100 ? "text-emerald-600" : "text-amber-600", children: [
                totalKpiWeight,
                "% total"
              ] })
            ] }),
            cat.kpis.map((kpi, kIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: kpi.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold shrink-0 ml-2", children: [
                kpi.weight,
                "%"
              ] })
            ] }, kIdx))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-1.5 overflow-hidden mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
            width: 0
          }, animate: {
            width: `${Math.min(100, cat.score)}%`
          }, transition: {
            duration: 0.8,
            delay: i * 0.1
          }, className: `h-full rounded-full bg-${color}-500` }) })
        ] }) }, i);
      }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { className: "h-6 w-6" }), title: "No categories yet", description: "Categories will appear once you have KPIs assigned." }) }, "categories") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "insights", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: tabContent, initial: "hidden", animate: "show", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Strengths", description: "KPIs you've exceeded", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-emerald-600" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            kpiAchievementData.filter((k) => k.achievement >= 100).slice(0, 5).map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: k.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                  "Weight ",
                  k.weight,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-emerald-600 dark:text-emerald-400 shrink-0", children: [
                fmtNum(k.achievement, 0),
                "%"
              ] })
            ] }, i)),
            kpiAchievementData.filter((k) => k.achievement >= 100).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "No exceeded KPIs yet. Keep pushing!" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Areas for Improvement", description: "KPIs needing attention", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-red-600" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            kpiAchievementData.filter((k) => k.achievement < 70).sort((a, b) => a.achievement - b.achievement).slice(0, 5).map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: k.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                  "Weight ",
                  k.weight,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-red-600 dark:text-red-400 shrink-0", children: [
                fmtNum(k.achievement, 0),
                "%"
              ] })
            ] }, i)),
            kpiAchievementData.filter((k) => k.achievement < 70).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "All KPIs are on track! 🎉" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Performance Summary", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 bg-muted/30 border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Overall Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-bold ${band.color}`, children: band.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 bg-muted/30 border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "KPIs on Target" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-bold", children: [
              kpiAchievementData.filter((k) => k.achievement >= 70).length,
              " / ",
              kpiAchievementData.length
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              kpiAchievementData.length > 0 ? Math.round(kpiAchievementData.filter((k) => k.achievement >= 70).length / kpiAchievementData.length * 100) : 0,
              "% success rate"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 bg-muted/30 border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Est. Bonus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BonusGate, { value: estimatedBonus }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Based on current performance" })
          ] })
        ] }) })
      ] }, "insights") })
    ] })
  ] });
}
export {
  Dashboard as component
};
