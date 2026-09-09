import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { u as useP4P, a as fmtGHS, f as fmtNum } from "./store-Dy84gyCY.js";
import { C as Card, B as Button } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { motion } from "framer-motion";
import { g as getCurrentUser } from "./router-ykR6owpd.js";
import { Sparkles, Calendar, Settings, RefreshCw, Save, DollarSign, Wallet, TrendingUp, Users, UserCheck, Target, Award, AlertTriangle, AlertCircle, BarChart3, PieChart, Zap, Activity, CheckCircle, Info, Star, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, PieChart as PieChart$1, Pie, Cell } from "recharts";
import { u as useUser } from "./user-context-D6z2rSW2.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "@tanstack/react-query";
import "@supabase/supabase-js";
const COLORS = {
  primary: "hsl(221 70% 50%)",
  accent: "hsl(250 50% 58%)",
  success: "hsl(152 55% 42%)",
  warning: "hsl(38 75% 52%)",
  danger: "hsl(0 65% 55%)",
  slate: "hsl(215 25% 55%)",
  cyan: "hsl(189 70% 42%)",
  purple: "hsl(270 70% 55%)",
  pink: "hsl(330 70% 55%)",
  orange: "hsl(25 80% 55%)",
  teal: "hsl(170 70% 45%)"
};
const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.cyan, COLORS.pink, COLORS.orange, COLORS.teal];
const chartTooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,.10)"
};
function StatCard({
  icon,
  label,
  value,
  accentColor,
  sub
}) {
  return /* @__PURE__ */ jsx(motion.div, { className: "h-full", initial: {
    opacity: 0,
    y: 10
  }, animate: {
    opacity: 1,
    y: 0
  }, whileHover: {
    y: -2
  }, transition: {
    type: "spring",
    stiffness: 240,
    damping: 24
  }, children: /* @__PURE__ */ jsxs(Card, { className: "relative overflow-hidden border flex items-stretch h-full", children: [
    /* @__PURE__ */ jsx("div", { className: "w-1 shrink-0 rounded-l-xl", style: {
      background: accentColor
    } }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 p-4 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest font-semibold text-muted-foreground truncate", children: label }),
        /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white", style: {
          background: accentColor + "cc"
        }, children: icon })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "font-bold tracking-tight leading-none truncate mt-auto", style: {
        fontSize: "clamp(0.9rem, 1.8vw, 1.25rem)"
      }, title: value, children: value }),
      /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mt-1 truncate min-h-[1rem]", children: sub ?? "" })
    ] })
  ] }) });
}
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
    const months = monthlyData.filter((d) => !employees.find((e) => e.id === d.employeeId)?.isAdjunct).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const grouped = {};
    for (const d of months) {
      const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
      const label = `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })} ${d.year}`;
      if (!grouped[key]) grouped[key] = {
        month: label,
        avg: 0,
        count: 0,
        total: 0
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
    setGlobals({
      totalRevenue: localGlobals.totalRevenue,
      p4pPercent: localGlobals.p4pPercent,
      adjunctPercent: localGlobals.adjunctPercent,
      floor: localGlobals.floor,
      cap: localGlobals.cap,
      prorationOn: localGlobals.prorationOn,
      salesMultiplier: localGlobals.salesMultiplier
    });
    setTimeout(() => setSaving(false), 500);
  };
  const disabled = globals.totalRevenue <= 0;
  const employeeHistory = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);
  useMemo(() => {
    if (!employee) return null;
    const history = getMonthlyHistory(employee.id);
    if (history.length === 0) return null;
    return history;
  }, [employee, getMonthlyHistory]);
  const categoryScores = useMemo(() => {
    if (!employee || !employee.categories) return [];
    const categories = employee.categories || [];
    const scores = [];
    for (const cat of categories) {
      let catSum = 0;
      let catCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        catSum += ratio;
        catCount++;
      }
      const catScore = catCount > 0 ? catSum / catCount * 100 : 0;
      scores.push({
        name: cat.name,
        score: catScore,
        weight: cat.weight,
        kpiCount: cat.kpis.length
      });
    }
    return scores;
  }, [employee]);
  const currentMonthScore = useMemo(() => {
    if (!employee) return 0;
    if (!employee.categories) return 0;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    for (const cat of employee.categories) {
      let catSum = 0;
      let catCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        catSum += ratio;
        catCount++;
      }
      const catScore = catCount > 0 ? catSum / catCount : 0;
      const weight = cat.weight / 100;
      totalWeightedScore += catScore * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? totalWeightedScore / totalWeight * 100 : 0;
  }, [employee]);
  const estimatedBonus = useMemo(() => {
    if (!employee) return 0;
    const empCalc = calc.perEmployee[employee.id];
    if (!empCalc) return 0;
    return empCalc.bonus || 0;
  }, [employee, calc]);
  const monthOverMonthChange = useMemo(() => {
    if (employeeHistory.length < 2) return null;
    const sorted = [...employeeHistory].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (!last || !prev) return null;
    const change = (last.performanceMultiplier - prev.performanceMultiplier) / prev.performanceMultiplier * 100;
    return change;
  }, [employeeHistory]);
  const ytdAverage = useMemo(() => {
    if (employeeHistory.length === 0) return 0;
    const sum = employeeHistory.reduce((acc, d) => acc + d.performanceMultiplier, 0);
    return sum / employeeHistory.length * 100;
  }, [employeeHistory]);
  const timelineData = useMemo(() => {
    if (employeeHistory.length === 0) return [];
    const sorted = [...employeeHistory].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    return sorted.slice(-12).map((d) => ({
      month: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })} ${d.year}`,
      score: d.performanceMultiplier * 100,
      multiplier: d.performanceMultiplier
    }));
  }, [employeeHistory]);
  const kpiAchievementData = useMemo(() => {
    if (!employee || !employee.categories) return [];
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
    for (const kpi of kpiAchievementData) {
      if (kpi.status === "Exceeded") statuses.Exceeded++;
      else if (kpi.status === "On Track") statuses["On Track"]++;
      else if (kpi.status === "At Risk") statuses["At Risk"]++;
      else statuses.Missed++;
    }
    return Object.entries(statuses).map(([name, value]) => ({
      name,
      value
    }));
  }, [kpiAchievementData]);
  const getBand = (score) => {
    if (score >= 120) return {
      label: "Exceptional",
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      icon: Star
    };
    if (score >= 100) return {
      label: "Exceeds Expectations",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      icon: TrendingUp
    };
    if (score >= 80) return {
      label: "Meets Expectations",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      icon: Target
    };
    if (score >= 60) return {
      label: "Needs Improvement",
      color: "text-yellow-600",
      bg: "bg-yellow-50 border-yellow-200",
      icon: Clock
    };
    return {
      label: "Performance Improvement Plan",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle
    };
  };
  const band = getBand(currentMonthScore);
  const BandIcon = band.icon;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "Loading dashboard..." });
  }
  if (isAdmin) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold tracking-tight flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            "P4P Dashboard"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Live overview of pools, payouts, performance signals, and monthly trends." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium border flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
          monthlyData.length > 0 ? `${monthlyData.length} data points` : "No monthly data yet"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5 border-2 border-dashed border-primary/30 bg-primary/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Global P4P Settings" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground ml-auto", children: "Controls revenue, pool allocation, and thresholds" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Revenue (GHS)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", className: "h-8 text-sm", value: localGlobals.totalRevenue, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              totalRevenue: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "P4P %" }),
            /* @__PURE__ */ jsx(Input, { type: "number", className: "h-8 text-sm", value: localGlobals.p4pPercent, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              p4pPercent: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Adjunct %" }),
            /* @__PURE__ */ jsx(Input, { type: "number", className: "h-8 text-sm", value: localGlobals.adjunctPercent, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              adjunctPercent: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Floor" }),
            /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm", value: localGlobals.floor, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              floor: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Cap" }),
            /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm", value: localGlobals.cap, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              cap: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Sales Multiplier" }),
            /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm", value: localGlobals.salesMultiplier, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              salesMultiplier: Number(e.target.value)
            })) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "w-full h-8 flex items-center gap-1", onClick: handleSaveGlobals, disabled: saving, children: [
            saving ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }),
            "Save"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: localGlobals.prorationOn, onChange: (e) => setLocalGlobals((prev) => ({
              ...prev,
              prorationOn: e.target.checked
            })), className: "h-3.5 w-3.5" }),
            "Proration On"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "P4P Pool: ",
            /* @__PURE__ */ jsx("strong", { className: "text-primary", children: fmtGHS(calc.totalPool) })
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Employee Pool: ",
            /* @__PURE__ */ jsx("strong", { className: "text-primary", children: fmtGHS(calc.employeePool) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 items-stretch", children: [
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(DollarSign, { className: "h-3.5 w-3.5" }), label: "Revenue", value: fmtGHS(globals.totalRevenue), accentColor: COLORS.primary, sub: `${globals.p4pPercent}% to P4P` }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-3.5 w-3.5" }), label: "Total Pool", value: fmtGHS(calc.totalPool), accentColor: COLORS.accent }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5" }), label: "Adjunct Pool", value: fmtGHS(calc.adjunctPool), accentColor: COLORS.warning, sub: `${globals.adjunctPercent}% share` }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-3.5 w-3.5" }), label: "Employee Pool", value: fmtGHS(calc.employeePool), accentColor: COLORS.success }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }), label: "Headcount", value: `${calc.adjunctCount + calc.nonAdjunctCount}`, accentColor: COLORS.cyan, sub: `${calc.nonAdjunctCount} core / ${calc.adjunctCount} adjunct` }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(UserCheck, { className: "h-3.5 w-3.5" }), label: "Avg Bonus", value: fmtGHS(calc.avgBonus), accentColor: COLORS.slate })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Monthly Performance Trend" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground ml-auto", children: [
              monthlyTrendData.length,
              " months"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-44 sm:h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyTrendData, margin: {
            left: 8
          }, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.35 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
            ] }) }),
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "month", fontSize: 10, axisLine: false, tickLine: false }),
            /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 10, axisLine: false, tickLine: false, width: 28 }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: chartTooltipStyle, formatter: (v) => [fmtNum(v, 2), "Avg Multiplier"] }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "avgMultiplier", stroke: COLORS.primary, strokeWidth: 2, fill: "url(#trendFill)", dot: {
              r: 3
            } })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-primary", children: trends.length }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Tracked Employees" })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center flex flex-col justify-center border-green-200 bg-green-50/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-green-600", children: fmtNum(stats.avgMultiplier, 2) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-green-600", children: "Average Multiplier" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5 lg:col-span-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Target, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "P4P % of Revenue" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "h-44 sm:h-56 relative flex items-center justify-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold text-primary", children: [
              globals.p4pPercent,
              "%"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 text-xs text-muted-foreground", children: "of revenue" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5 lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm", children: "Top Performers" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            trends.sort((a, b) => b.currentScore - a.currentScore).slice(0, 5).map((t, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 border rounded-md", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-muted-foreground", children: [
                  "#",
                  i + 1
                ] }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: t.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                  t.months.length,
                  " months"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600", children: fmtNum(t.currentScore, 2) })
              ] })
            ] }, i)),
            trends.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No performance data yet." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        stats.risingStars.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4 border-green-200 bg-green-50/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-green-600" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-green-800", children: "🌟 Rising Stars" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full ml-auto", children: [
              stats.risingStars.length,
              " employees"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.risingStars.slice(0, 5).map((name, i) => /* @__PURE__ */ jsx("div", { className: "flex items-center p-2 bg-white rounded-md border border-green-200", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: name }) }, i)) })
        ] }),
        stats.underachievers.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4 border-red-200 bg-red-50/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-red-800", children: "⚠️ Underachievers" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full ml-auto", children: [
              stats.underachievers.length,
              " employees"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.underachievers.slice(0, 5).map((name, i) => /* @__PURE__ */ jsx("div", { className: "flex items-center p-2 bg-white rounded-md border border-red-200", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: name }) }, i)) })
        ] })
      ] }),
      disabled && /* @__PURE__ */ jsx("div", { className: "p-4 rounded-md bg-destructive/10 text-destructive text-sm", children: "Total revenue is 0 — set a revenue value to enable calculations." }),
      calc.warnings.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-300", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium flex items-center gap-2", children: "⚠️ Warnings" }),
        /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside", children: calc.warnings.map((w, i) => /* @__PURE__ */ jsx("li", { children: w }, i)) })
      ] })
    ] });
  }
  if (!employee) {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "No Employee Record" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Your profile is not linked to an employee record. Please contact HR." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Award, { className: "h-5 w-5 text-primary" }),
          "My Performance Dashboard"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm mt-0.5", children: [
          employee.name,
          " · ",
          employee.department,
          " · ",
          employee.role
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Current Score" }),
          /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold ${band.color}`, children: [
            fmtNum(currentMonthScore, 1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `px-3 py-1.5 rounded-full text-sm font-medium ${band.bg} ${band.color} border flex items-center gap-1.5`, children: [
          /* @__PURE__ */ jsx(BandIcon, { className: "h-4 w-4" }),
          band.label
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Target, { className: "h-3.5 w-3.5" }), label: "Current Score", value: `${fmtNum(currentMonthScore, 1)}%`, accentColor: COLORS.primary, sub: monthOverMonthChange !== null ? `${monthOverMonthChange >= 0 ? "↑" : "↓"} ${Math.abs(monthOverMonthChange).toFixed(1)}% from last month` : "No previous data" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5" }), label: "YTD Average", value: `${fmtNum(ytdAverage, 1)}%`, accentColor: COLORS.success, sub: `${employeeHistory.length} months tracked` }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Wallet, { className: "h-3.5 w-3.5" }), label: "Est. Bonus", value: fmtGHS(estimatedBonus), accentColor: COLORS.cyan, sub: `Based on current performance` }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }), label: "Months Tracked", value: `${employeeHistory.length}`, accentColor: COLORS.purple, sub: employeeHistory.length > 0 ? `${(/* @__PURE__ */ new Date()).getFullYear()} - ${(/* @__PURE__ */ new Date()).getMonth() + 1}` : "Start your first submission" })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "overview", onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "overview", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }),
          " Overview"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "categories", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(PieChart, { className: "h-4 w-4" }),
          " Categories"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "insights", className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
          " Insights"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "overview", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-primary" }),
              "Performance Trend (Last 12 Months)"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
              timelineData.length,
              " months"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: timelineData, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "empTrendFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.3 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
            ] }) }),
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "month", fontSize: 10, axisLine: false, tickLine: false }),
            /* @__PURE__ */ jsx(YAxis, { domain: [0, 150], fontSize: 10, axisLine: false, tickLine: false, width: 28 }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: chartTooltipStyle, formatter: (v) => [`${fmtNum(v, 1)}%`, "Score"] }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "score", stroke: COLORS.primary, strokeWidth: 2.5, fill: "url(#empTrendFill)", dot: {
              r: 3,
              fill: COLORS.primary,
              strokeWidth: 0
            } })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(PieChart, { className: "h-4 w-4 text-primary" }),
              "Category Performance"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-44", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: categoryScores, layout: "vertical", margin: {
              left: 0
            }, children: [
              /* @__PURE__ */ jsx(XAxis, { type: "number", domain: [0, 100], fontSize: 10, tickLine: false, axisLine: false }),
              /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "name", fontSize: 10, tickLine: false, axisLine: false, width: 80 }),
              /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => [`${fmtNum(v, 1)}%`, "Score"] }),
              /* @__PURE__ */ jsx(Bar, { dataKey: "score", fill: COLORS.primary, radius: [0, 4, 4, 0] })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-primary" }),
              "KPI Status Breakdown"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-44 flex items-center justify-center", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart$1, { children: [
              /* @__PURE__ */ jsx(Pie, { data: kpiStatusData, cx: "50%", cy: "50%", labelLine: false, label: ({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 60, fill: "#8884d8", dataKey: "value", children: kpiStatusData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`)) }),
              /* @__PURE__ */ jsx(Tooltip, {})
            ] }) }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "categories", className: "mt-4 space-y-4", children: /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: categoryScores.map((cat, idx) => {
        const status = cat.score >= 100 ? "Exceeded" : cat.score >= 70 ? "On Track" : cat.score >= 50 ? "At Risk" : "Missed";
        const color = status === "Exceeded" ? COLORS.success : status === "On Track" ? COLORS.primary : status === "At Risk" ? COLORS.warning : COLORS.danger;
        return /* @__PURE__ */ jsxs(Card, { className: "p-4 border-l-4", style: {
          borderLeftColor: color
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium", children: cat.name }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
                cat.kpiCount,
                " KPIs · Weight: ",
                cat.weight,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", style: {
                color
              }, children: [
                fmtNum(cat.score, 1),
                "%"
              ] }),
              /* @__PURE__ */ jsx(Badge, { className: "text-[10px]", variant: status === "Exceeded" || status === "On Track" ? "default" : "destructive", children: status })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5 mt-2", children: /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full transition-all", style: {
            width: `${Math.min(100, cat.score)}%`,
            background: color
          } }) })
        ] }, idx);
      }) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "insights", className: "mt-4 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-4 border-green-200 bg-green-50/50", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm text-green-800 flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }),
            "Strengths"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            kpiAchievementData.filter((k) => k.achievement >= 100).slice(0, 5).map((k, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm bg-white p-2 rounded-md border border-green-200", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: k.name }),
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-green-600", children: [
                fmtNum(k.achievement, 0),
                "%"
              ] })
            ] }, i)),
            kpiAchievementData.filter((k) => k.achievement >= 100).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No exceeded KPIs yet. Keep pushing!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-4 border-red-200 bg-red-50/50", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm text-red-800 flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }),
            "Areas for Improvement"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            kpiAchievementData.filter((k) => k.achievement < 70).sort((a, b) => a.achievement - b.achievement).slice(0, 5).map((k, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm bg-white p-2 rounded-md border border-red-200", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: k.name }),
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-red-600", children: [
                fmtNum(k.achievement, 0),
                "%"
              ] })
            ] }, i)),
            kpiAchievementData.filter((k) => k.achievement < 70).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "All KPIs are on track! Great job! 🎉" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-4 border-blue-200 bg-blue-50/50 md:col-span-2", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm text-blue-800 flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-blue-600" }),
            "Performance Summary"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border border-blue-200", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Overall Status" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", style: {
                color: band.color
              }, children: band.label })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border border-blue-200", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "KPIs on Target" }),
              /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold", children: [
                kpiAchievementData.filter((k) => k.achievement >= 70).length,
                " / ",
                kpiAchievementData.length
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                kpiAchievementData.length > 0 ? (kpiAchievementData.filter((k) => k.achievement >= 70).length / kpiAchievementData.length * 100).toFixed(0) : 0,
                "% success rate"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border border-blue-200", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Est. Bonus" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: fmtGHS(estimatedBonus) }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Based on current performance" })
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    employeeHistory.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-sm flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-primary" }),
        "Recent Activity"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: employeeHistory.slice(-5).reverse().map((h, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm border-b border-muted pb-2 last:border-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            new Date(h.year, h.month - 1, 1).toLocaleString("default", {
              month: "long"
            }),
            " ",
            h.year
          ] }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-green-50 border-green-200 text-green-700", children: "✅ Approved" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
            "Multiplier: ",
            fmtNum(h.performanceMultiplier, 2)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
            fmtNum(h.performanceMultiplier * 100, 1),
            "%"
          ] })
        ] })
      ] }, idx)) })
    ] })
  ] });
}
export {
  Dashboard as component
};
