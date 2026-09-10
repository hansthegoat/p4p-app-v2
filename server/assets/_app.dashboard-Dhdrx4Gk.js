import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { u as useP4P, b as useUser, f as fmtGHS, c as fmtNum, g as getCurrentUser } from "./router-CQTT2apA.js";
import { C as Card } from "./card-RGlIzTYo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { s as staggerContainer, P as PageHeader, E as EmptyState, f as fadeUp } from "./empty-state-BKzet6q0.js";
import { S as StatCard } from "./stat-card-CEuC_AAE.js";
import { S as SectionCard } from "./section-card-CU3fEC1l.js";
import { RefreshCw, Calendar, Sparkles, Save, Settings, DollarSign, Wallet, TrendingUp, Users, UserCheck, Activity, Award, AlertTriangle, AlertCircle, Target, BarChart3, PieChart, Zap, CheckCircle, Info, Star, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, PieChart as PieChart$1, Pie, Cell } from "recharts";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
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
    getMonthlyHistory
  } = useP4P();
  const {
    role
  } = useUser();
  const isAdmin = role === "admin" || role === "hr";
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [localGlobals, setLocalGlobals] = useState({
    totalRevenue: globals.totalRevenue,
    p4pPercent: globals.p4pPercent,
    adjunctPercent: globals.adjunctPercent,
    floor: globals.floor,
    cap: globals.cap,
    prorationOn: globals.prorationOn,
    salesMultiplier: globals.salesMultiplier
  });
  const [saving, setSaving] = useState(false);
  const trends = getAllTrends();
  const stats = getMonthlyStats();
  useEffect(() => {
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
      } catch (err) {
        console.error("Error fetching user:", err);
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);
  const monthlyTrendData = useMemo(() => {
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
  const employeeHistory = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);
  const categoryScores = useMemo(() => {
    if (!employee?.categories) return [];
    return employee.categories.map((cat) => {
      let sum = 0, count = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        sum += target > 0 ? actual / target : 0;
        count++;
      }
      return {
        name: cat.name,
        score: count > 0 ? sum / count * 100 : 0,
        weight: cat.weight,
        kpiCount: cat.kpis.length
      };
    });
  }, [employee]);
  const currentMonthScore = useMemo(() => {
    if (!employee?.categories) return 0;
    let totalW = 0, totalWeight = 0;
    for (const cat of employee.categories) {
      let sum = 0, count = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        sum += target > 0 ? (kpi.actual || 0) / target : 0;
        count++;
      }
      const catScore = count > 0 ? sum / count : 0;
      const w = cat.weight / 100;
      totalW += catScore * w;
      totalWeight += w;
    }
    return totalWeight > 0 ? totalW / totalWeight * 100 : 0;
  }, [employee]);
  const estimatedBonus = useMemo(() => {
    if (!employee) return 0;
    return calc.perEmployee[employee.id]?.bonus || 0;
  }, [employee, calc]);
  const monthOverMonthChange = useMemo(() => {
    if (employeeHistory.length < 2) return null;
    const sorted = [...employeeHistory].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (!last || !prev || prev.performanceMultiplier === 0) return null;
    return (last.performanceMultiplier - prev.performanceMultiplier) / prev.performanceMultiplier * 100;
  }, [employeeHistory]);
  const ytdAverage = useMemo(() => {
    if (employeeHistory.length === 0) return 0;
    return employeeHistory.reduce((s, d) => s + d.performanceMultiplier, 0) / employeeHistory.length * 100;
  }, [employeeHistory]);
  const timelineData = useMemo(() => {
    if (employeeHistory.length === 0) return [];
    return [...employeeHistory].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month).slice(-12).map((d) => ({
      month: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })} ${d.year}`,
      score: d.performanceMultiplier * 100
    }));
  }, [employeeHistory]);
  const kpiAchievementData = useMemo(() => {
    if (!employee?.categories) return [];
    const data = [];
    for (const cat of employee.categories) {
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const achievement = Math.min(100, target > 0 ? actual / target * 100 : 0);
        data.push({
          name: kpi.description,
          achievement,
          target: kpi.target,
          actual: kpi.actual,
          metric: kpi.metric,
          category: cat.name,
          status: achievement >= 100 ? "Exceeded" : achievement >= 70 ? "On Track" : achievement >= 50 ? "At Risk" : "Missed"
        });
      }
    }
    return data;
  }, [employee]);
  const kpiStatusData = useMemo(() => {
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
      label: "PIP",
      color: "text-red-600 dark:text-red-400",
      icon: AlertCircle
    };
  };
  const band = getBand(currentMonthScore);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (isAdmin) {
    return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
      /* @__PURE__ */ jsx(PageHeader, { title: "P4P Dashboard", description: "Live overview of pools, payouts, performance signals, and monthly trends.", icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6" }), badge: /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "gap-1.5", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
        monthlyData.length,
        " data points"
      ] }) }),
      /* @__PURE__ */ jsxs(SectionCard, { title: "Global P4P Settings", description: "Controls revenue, pool allocation, and thresholds", icon: /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }), action: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleSaveGlobals, disabled: saving, className: "gap-1.5", children: [
        saving ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }),
        "Save"
      ] }), children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: [{
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
        }].map((f) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground", children: f.label }),
          /* @__PURE__ */ jsx(Input, { type: "number", step: f.step, className: "mt-1 h-9", value: localGlobals[f.key], onChange: (e) => setLocalGlobals((prev) => ({
            ...prev,
            [f.key]: Number(e.target.value)
          })) })
        ] }, f.key)) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: localGlobals.prorationOn, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              prorationOn: e.target.checked
            })), className: "h-3.5 w-3.5 rounded accent-primary" }),
            "Proration On"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "ml-auto flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "P4P Pool: ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: fmtGHS(calc.totalPool) })
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Employee Pool: ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: fmtGHS(calc.employeePool) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }), label: "Revenue", value: fmtGHS(globals.totalRevenue), sub: `${globals.p4pPercent}% to P4P`, accent: "primary" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }), label: "Total Pool", value: fmtGHS(calc.totalPool), accent: "purple" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), label: "Adjunct Pool", value: fmtGHS(calc.adjunctPool), sub: `${globals.adjunctPercent}% share`, accent: "warning" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }), label: "Employee Pool", value: fmtGHS(calc.employeePool), accent: "success" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), label: "Headcount", value: calc.adjunctCount + calc.nonAdjunctCount, sub: `${calc.nonAdjunctCount} core · ${calc.adjunctCount} adjunct`, accent: "info" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(UserCheck, { className: "h-4 w-4" }), label: "Avg Bonus", value: fmtGHS(calc.avgBonus), accent: "default" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(SectionCard, { title: "Monthly Performance Trend", description: `${monthlyTrendData.length} months tracked`, icon: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-72", children: monthlyTrendData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyTrendData, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.35 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", fontSize: 11, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [fmtNum(v, 2), "Avg Multiplier"] }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "avgMultiplier", stroke: COLORS.primary, strokeWidth: 2.5, fill: "url(#trendFill)", dot: {
            r: 4,
            strokeWidth: 2,
            fill: "#fff"
          }, activeDot: {
            r: 6
          } })
        ] }) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Activity, { className: "h-6 w-6" }), title: "No monthly data yet", description: "Upload monthly performance data to see trends." }) }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4", children: [
          /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), label: "Tracked Employees", value: trends.length, accent: "primary" }),
          /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(stats.avgMultiplier, 2), accent: "success" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { title: "Top Performers", description: "Highest current performance multipliers", icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), children: trends.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [...trends].sort((a, b) => b.currentScore - a.currentScore).slice(0, 5).map((t, i) => /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        x: -8
      }, animate: {
        opacity: 1,
        x: 0
      }, transition: {
        delay: i * 0.05
      }, className: "flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm truncate", children: t.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            t.months.length,
            " months"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600 dark:text-blue-400", children: fmtNum(t.currentScore, 2) })
        ] })
      ] }, t.employeeId)) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Award, { className: "h-6 w-6" }), title: "No performers yet", description: "Performance data will appear here once employees submit." }) }),
      (stats.risingStars.length > 0 || stats.underachievers.length > 0) && /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        stats.risingStars.length > 0 && /* @__PURE__ */ jsx(SectionCard, { title: "Rising Stars", icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-emerald-600" }), action: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-emerald-600 border-emerald-500/30", children: stats.risingStars.length }), children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: stats.risingStars.slice(0, 8).map((name, i) => /* @__PURE__ */ jsx(motion.div, { initial: {
          opacity: 0,
          scale: 0.9
        }, animate: {
          opacity: 1,
          scale: 1
        }, transition: {
          delay: i * 0.04
        }, children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", children: name }) }, i)) }) }),
        stats.underachievers.length > 0 && /* @__PURE__ */ jsx(SectionCard, { title: "Underachievers", icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), action: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-red-600 border-red-500/30", children: stats.underachievers.length }), children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: stats.underachievers.slice(0, 8).map((name, i) => /* @__PURE__ */ jsx(motion.div, { initial: {
          opacity: 0,
          scale: 0.9
        }, animate: {
          opacity: 1,
          scale: 1
        }, transition: {
          delay: i * 0.04
        }, children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20", children: name }) }, i)) }) })
      ] }),
      calc.warnings.length > 0 && /* @__PURE__ */ jsx(Card, { className: "p-4 bg-amber-500/5 border-amber-500/30", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-amber-900 dark:text-amber-300", children: "Warnings" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-1.5 space-y-1 text-xs text-amber-800 dark:text-amber-400", children: calc.warnings.map((w, i) => /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            w
          ] }, i)) })
        ] })
      ] }) }),
      disabled && /* @__PURE__ */ jsx(Card, { className: "p-4 bg-red-500/5 border-red-500/30", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-red-600" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-red-900 dark:text-red-300", children: "Total revenue is 0 — set a revenue value to enable calculations." })
      ] }) })
    ] });
  }
  if (!employee) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6" }), title: "No Employee Record", description: "Your profile is not linked to an employee record. Please contact HR." });
  }
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "My Performance", description: `${employee.name} · ${employee.department} · ${employee.role}`, icon: /* @__PURE__ */ jsx(Award, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide font-semibold text-muted-foreground", children: "Current Score" }),
        /* @__PURE__ */ jsxs("div", { className: `text-xl font-bold ${band.color}`, children: [
          fmtNum(currentMonthScore, 1),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: `px-3 py-1.5 ${band.color} border-current/30`, children: [
        /* @__PURE__ */ jsx(band.icon, { className: "h-3.5 w-3.5 mr-1.5" }),
        band.label
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }), label: "Current Score", value: `${fmtNum(currentMonthScore, 1)}%`, sub: monthOverMonthChange !== null ? `${Math.abs(monthOverMonthChange).toFixed(1)}% from last month` : "No previous data", trend: monthOverMonthChange ?? void 0, accent: "primary" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), label: "YTD Average", value: `${fmtNum(ytdAverage, 1)}%`, sub: `${employeeHistory.length} months tracked`, accent: "success" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }), label: "Est. Bonus", value: fmtGHS(estimatedBonus), sub: "Based on current performance", accent: "info" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }), label: "Months Tracked", value: employeeHistory.length, sub: employeeHistory.length > 0 ? `${(/* @__PURE__ */ new Date()).getFullYear()}` : "Start your first submission", accent: "purple" })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "overview", onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-3", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "overview", className: "gap-2", children: [
          /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }),
          " Overview"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "categories", className: "gap-2", children: [
          /* @__PURE__ */ jsx(PieChart, { className: "h-4 w-4" }),
          " Categories"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "insights", className: "gap-2", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
          " Insights"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "overview", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsx(SectionCard, { title: "Performance Trend", description: "Last 12 months", icon: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-72", children: timelineData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: timelineData, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "empTrend", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.3 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", fontSize: 11, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { domain: [0, 150], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [`${fmtNum(v, 1)}%`, "Score"] }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "score", stroke: COLORS.primary, strokeWidth: 2.5, fill: "url(#empTrend)", dot: {
            r: 4,
            strokeWidth: 2,
            fill: "#fff"
          }, activeDot: {
            r: 6
          } })
        ] }) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Activity, { className: "h-6 w-6" }), title: "No data yet", description: "Submit your first appraisal to see your performance trend." }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(SectionCard, { title: "Category Performance", icon: /* @__PURE__ */ jsx(PieChart, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-64", children: categoryScores.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: categoryScores, layout: "vertical", margin: {
            left: 8,
            right: 16
          }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, horizontal: false }),
            /* @__PURE__ */ jsx(XAxis, { type: "number", domain: [0, 100], fontSize: 11, axisLine: false, tickLine: false }),
            /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "name", fontSize: 11, axisLine: false, tickLine: false, width: 90 }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [`${fmtNum(v, 1)}%`, "Score"] }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "score", fill: COLORS.primary, radius: [0, 6, 6, 0] })
          ] }) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(PieChart, { className: "h-6 w-6" }), title: "No categories" }) }) }),
          /* @__PURE__ */ jsx(SectionCard, { title: "KPI Status Breakdown", icon: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-64", children: kpiStatusData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart$1, { children: [
            /* @__PURE__ */ jsx(Pie, { data: kpiStatusData, cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 75, paddingAngle: 4, dataKey: "value", label: (entry) => `${entry.name} ${entry.value}`, labelLine: false, children: kpiStatusData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0 }, i)) }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle })
          ] }) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Target, { className: "h-6 w-6" }), title: "No KPIs" }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "categories", className: "mt-4", children: categoryScores.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: categoryScores.map((cat, i) => {
        const status = cat.score >= 100 ? "Exceeded" : cat.score >= 70 ? "On Track" : cat.score >= 50 ? "At Risk" : "Missed";
        const color = status === "Exceeded" ? "emerald" : status === "On Track" ? "blue" : status === "At Risk" ? "amber" : "red";
        return /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: `p-5 border-l-4 border-l-${color}-500`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm truncate", children: cat.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                cat.kpiCount,
                " KPIs · Weight ",
                cat.weight,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold text-${color}-600 dark:text-${color}-400`, children: [
                fmtNum(cat.score, 1),
                "%"
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `text-[10px] mt-1 text-${color}-600 border-${color}-500/30`, children: status })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ jsx(motion.div, { initial: {
            width: 0
          }, animate: {
            width: `${Math.min(100, cat.score)}%`
          }, transition: {
            duration: 0.8,
            delay: i * 0.1
          }, className: `h-full rounded-full bg-${color}-500` }) })
        ] }) }, i);
      }) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(PieChart, { className: "h-6 w-6" }), title: "No categories yet", description: "Categories will appear once you have KPIs assigned." }) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "insights", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(SectionCard, { title: "Strengths", description: "KPIs you've exceeded", icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-emerald-600" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            kpiAchievementData.filter((k) => k.achievement >= 100).slice(0, 5).map((k, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: k.name }),
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2", children: [
                fmtNum(k.achievement, 0),
                "%"
              ] })
            ] }, i)),
            kpiAchievementData.filter((k) => k.achievement >= 100).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "No exceeded KPIs yet. Keep pushing!" })
          ] }) }),
          /* @__PURE__ */ jsx(SectionCard, { title: "Areas for Improvement", description: "KPIs needing attention", icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            kpiAchievementData.filter((k) => k.achievement < 70).sort((a, b) => a.achievement - b.achievement).slice(0, 5).map((k, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm p-2.5 rounded-lg bg-red-500/5 border border-red-500/20", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: k.name }),
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-red-600 dark:text-red-400 shrink-0 ml-2", children: [
                fmtNum(k.achievement, 0),
                "%"
              ] })
            ] }, i)),
            kpiAchievementData.filter((k) => k.achievement < 70).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "All KPIs are on track! 🎉" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(SectionCard, { title: "Performance Summary", icon: /* @__PURE__ */ jsx(Info, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs(Card, { className: "p-4 bg-muted/30 border-border/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Overall Status" }),
            /* @__PURE__ */ jsx("div", { className: `text-lg font-bold ${band.color}`, children: band.label })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "p-4 bg-muted/30 border-border/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "KPIs on Target" }),
            /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold", children: [
              kpiAchievementData.filter((k) => k.achievement >= 70).length,
              " / ",
              kpiAchievementData.length
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              kpiAchievementData.length > 0 ? Math.round(kpiAchievementData.filter((k) => k.achievement >= 70).length / kpiAchievementData.length * 100) : 0,
              "% success rate"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "p-4 bg-muted/30 border-border/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Est. Bonus" }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: fmtGHS(estimatedBonus) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Based on current performance" })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
