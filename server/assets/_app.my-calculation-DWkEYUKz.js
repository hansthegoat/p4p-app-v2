import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { a as useP4P, f as fmtGHS, c as fmtNum, g as getCurrentUser } from "./router-w7c543WJ.js";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-FVkpvMO7.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { S as SectionCard } from "./section-card-Dur1lkFz.js";
import { E as EmptyState } from "./empty-state-BSqWlGcA.js";
import { s as staggerContainer, f as fadeUp } from "./motion-BS01Szpl.js";
import { Info, Calculator, DollarSign, TrendingUp, Building2, Wallet, Users, Lightbulb, Award, CircleDollarSign, Target, Percent, Scale, Calendar, Zap, Sparkles, Activity, HelpCircle, ChevronRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
import "clsx";
import "tailwind-merge";
import "class-variance-authority";
import "@radix-ui/react-select";
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px"
};
function MyCalculationPage() {
  const navigate = useNavigate();
  const {
    employees,
    calc,
    globals,
    getMonthlyHistory
  } = useP4P();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [selectedYear, setSelectedYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
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
      } catch {
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);
  const empCalc = useMemo(() => {
    if (!employee) return null;
    return calc.perEmployee[employee.id] || null;
  }, [employee, calc]);
  const history = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);
  const yearHistoryData = useMemo(() => {
    return history.filter((h) => h.year === selectedYear).sort((a, b) => a.month - b.month).map((h) => ({
      label: new Date(h.year, h.month - 1, 1).toLocaleString("default", {
        month: "short"
      }),
      multiplier: h.performanceMultiplier
    }));
  }, [history, selectedYear]);
  const companyStats = useMemo(() => {
    const nonAdjunct = employees.filter((e) => !e.isAdjunct);
    const values = nonAdjunct.map((e) => calc.perEmployee[e.id]).filter(Boolean);
    const totalPoints = values.reduce((s, v) => s + (v?.gradePoints || 0), 0);
    const avgMultiplier = values.length > 0 ? values.reduce((s, v) => s + (v?.performanceMultiplier || 0), 0) / values.length : 0;
    return {
      totalEmployees: nonAdjunct.length,
      totalPoints,
      avgMultiplier
    };
  }, [employees, calc]);
  const potentialBonus = useMemo(() => {
    if (!empCalc) return 0;
    return empCalc.gradePoints * calc.valuePerUnit * empCalc.proration * empCalc.salesMult;
  }, [empCalc, calc]);
  const perfectBonus = useMemo(() => {
    if (!empCalc) return 0;
    return empCalc.gradePoints * calc.valuePerUnit * empCalc.proration * empCalc.salesMult * 1.2;
  }, [empCalc, calc]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading your calculation..." })
    ] }) });
  }
  if (!employee) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Info, { className: "h-6 w-6" }), title: "No Employee Record", description: "Your profile is not linked to an employee record. Please contact HR." });
  }
  if (!empCalc) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Calculator, { className: "h-6 w-6" }), title: "No Calculation Available", description: "Your bonus calculation is not available yet. Please submit an appraisal first." });
  }
  const getBand = (score) => {
    if (score >= 1.2) return {
      label: "Exceptional",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30"
    };
    if (score >= 1) return {
      label: "Exceeds Expectations",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30"
    };
    if (score >= 0.8) return {
      label: "Meets Expectations",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30"
    };
    if (score >= 0.6) return {
      label: "Needs Improvement",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30"
    };
    return {
      label: "Performance Improvement Plan",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 border-red-500/30"
    };
  };
  const band = getBand(empCalc.performanceMultiplier);
  const differenceToTarget = potentialBonus - empCalc.bonus;
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "My Calculation", description: "Understand exactly how your bonus is calculated — from company revenue to your final payout.", icon: /* @__PURE__ */ jsx(Calculator, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs("div", { className: `px-4 py-2.5 rounded-xl text-sm font-bold border-2 flex items-center gap-2 ${band.bg} ${band.color}`, children: [
      /* @__PURE__ */ jsx(Calculator, { className: "h-4 w-4" }),
      " ",
      fmtGHS(empCalc.bonus)
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: "p-6 bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20 overflow-hidden relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-wrap items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2", children: [
            /* @__PURE__ */ jsx(DollarSign, { className: "h-3.5 w-3.5" }),
            " Your Current Bonus"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight", children: fmtGHS(empCalc.bonus) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-3", children: [
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: `${band.bg} ${band.color} gap-1`, children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }),
              band.label
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Based on ",
              fmtNum(empCalc.performanceMultiplier * 100, 0),
              "% KPI achievement"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60 min-w-[120px]", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Grade Points" }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mt-1", children: fmtNum(empCalc.gradePoints, 1) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60 min-w-[120px]", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Multiplier" }),
            /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mt-1 text-blue-600 dark:text-blue-400", children: fmtNum(empCalc.performanceMultiplier, 2) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 0 · Where the Money Comes From", description: "Before we calculate your bonus, here's the big picture", icon: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
        "Your bonus is funded from a ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "shared pool" }),
        " that comes from company revenue."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-blue-500/5 border border-blue-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400", children: "1. Company Revenue" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: fmtGHS(globals.totalRevenue) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400", children: [
              "2. P4P Pool (",
              globals.p4pPercent,
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: fmtGHS(calc.totalPool) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-purple-500/5 border border-purple-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-purple-600 dark:text-purple-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400", children: "3. Your Share" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-emerald-600 dark:text-emerald-400", children: fmtGHS(empCalc.bonus) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-800 dark:text-amber-300", children: [
          /* @__PURE__ */ jsx("strong", { children: "Why this matters:" }),
          " If the company makes more revenue, everyone's bonus grows."
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 1 · Your Grade Points", description: `You're a Grade ${employee.jobGrade} (${employee.role})`, icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-purple-500/5 border border-purple-500/20", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400 mb-3", children: "Your Points" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-purple-600 dark:text-purple-400", children: fmtNum(empCalc.gradePoints, 1) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "points" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-muted/30 border border-border/60 space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "How You Compare" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Your points" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: fmtNum(empCalc.gradePoints, 1) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Total company points" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: fmtNum(companyStats.totalPoints, 0) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-px bg-border/60 my-1" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Your share of pool" }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30", children: [
              companyStats.totalPoints > 0 ? fmtNum(empCalc.gradePoints / companyStats.totalPoints * 100, 2) : "0",
              "%"
            ] })
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 2 · Value per Point", description: "How much each of your points is worth in money", icon: /* @__PURE__ */ jsx(CircleDollarSign, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsx("div", { className: "p-5 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4 items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 text-center md:text-left", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1", children: "Employee Pool" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: fmtGHS(calc.employeePool) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-muted-foreground", children: "÷" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1", children: "Total Points" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: fmtNum(companyStats.totalPoints, 0) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center md:text-right", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400 mb-1", children: "Value per Point" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400", children: fmtGHS(calc.valuePerUnit) })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(SectionCard, { title: "Step 3 · Your Performance Multiplier", description: "This is where YOUR efforts change the outcome", icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), children: [
      /* @__PURE__ */ jsxs("div", { className: `p-5 rounded-xl ${band.bg} border-2`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1", children: "Your Multiplier" }),
            /* @__PURE__ */ jsx("div", { className: `text-4xl font-bold ${band.color}`, children: fmtNum(empCalc.performanceMultiplier, 3) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${band.bg} ${band.color} gap-1`, children: band.label }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Company avg: ",
              fmtNum(companyStats.avgMultiplier, 2)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full bg-background rounded-full h-3 overflow-hidden mb-2", children: /* @__PURE__ */ jsx(motion.div, { initial: {
          width: 0
        }, animate: {
          width: `${Math.min(100, empCalc.performanceMultiplier / 1.5 * 100)}%`
        }, transition: {
          duration: 0.8
        }, className: "h-full bg-blue-500" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "0" }),
          /* @__PURE__ */ jsx("span", { children: "0.8 (Meets)" }),
          /* @__PURE__ */ jsx("span", { children: "1.0 (Exceeds)" }),
          /* @__PURE__ */ jsx("span", { children: "1.5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Target, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "Per KPI" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Actual ÷ Target" }),
            /* @__PURE__ */ jsx("br", {}),
            "Example: 85 ÷ 90 = 0.94"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Percent, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "Per Category" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
            "Weighted by KPI weight",
            /* @__PURE__ */ jsx("br", {}),
            "within each category"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Scale, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "Overall" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
            "Weighted sum",
            /* @__PURE__ */ jsx("br", {}),
            "of all categories"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-4", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-800 dark:text-blue-300", children: [
          /* @__PURE__ */ jsx("strong", { children: "This is the part YOU control." }),
          " Every KPI you hit above target increases your multiplier."
        ] })
      ] })
    ] }) }),
    empCalc.categoryBreakdown && empCalc.categoryBreakdown.length > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Your Category Breakdown", description: "How each KPI category contributed to your multiplier", icon: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: empCalc.categoryBreakdown.map((cat, i) => {
      const color = cat.categoryScore >= 1 ? "emerald" : cat.categoryScore >= 0.7 ? "blue" : cat.categoryScore >= 0.5 ? "amber" : "red";
      return /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 bg-muted/20 border-b border-border/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: `w-8 h-8 rounded-lg bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 flex items-center justify-center text-xs font-bold`, children: i + 1 }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: cat.categoryName }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "Category weight ",
                cat.categoryWeight,
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `text-lg font-bold text-${color}-600 dark:text-${color}-400`, children: [
            fmtNum(cat.categoryScore * 100, 1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground pb-2 border-b border-border/30", children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-4", children: "KPI Description" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center", children: "Weight" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center", children: "Target → Actual" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center", children: "Ratio" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Achievement" })
          ] }),
          cat.kpis.map((kpi, j) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 items-center text-xs py-2 border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-4 font-medium break-words whitespace-normal", children: kpi.description }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-3 md:col-span-2 text-center font-mono font-semibold", children: [
              kpi.weight,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-2 text-center font-mono text-muted-foreground", children: [
              fmtNum(kpi.target),
              " → ",
              fmtNum(kpi.actual)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-2 md:col-span-2 text-center font-mono", children: [
              "×",
              fmtNum(kpi.ratio, 2)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `col-span-3 md:col-span-2 text-right font-semibold ${kpi.ratio >= 1 ? "text-emerald-600 dark:text-emerald-400" : kpi.ratio >= 0.7 ? "text-blue-600 dark:text-blue-400" : kpi.ratio >= 0.5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`, children: [
              fmtNum(kpi.ratio * 100, 1),
              "%"
            ] })
          ] }, j))
        ] })
      ] }, i);
    }) }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Putting It All Together", description: "Your final formula", icon: /* @__PURE__ */ jsx(Calculator, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsx("div", { className: "p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-purple-500/30", children: [
        /* @__PURE__ */ jsx(Award, { className: "h-3.5 w-3.5 text-purple-600 dark:text-purple-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: fmtNum(empCalc.gradePoints, 1) }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "points" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-bold", children: "×" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-blue-500/30", children: [
        /* @__PURE__ */ jsx(CircleDollarSign, { className: "h-3.5 w-3.5 text-blue-600 dark:text-blue-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: fmtGHS(calc.valuePerUnit) }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "per point" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-bold", children: "×" }),
      /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border ${empCalc.performanceMultiplier >= 1 ? "border-emerald-500/30" : "border-amber-500/30"}`, children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: fmtNum(empCalc.performanceMultiplier, 3) }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "multiplier" })
      ] }),
      globals.prorationOn && empCalc.proration !== 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-bold", children: "×" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-amber-500/30", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-amber-600 dark:text-amber-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: fmtNum(empCalc.proration, 2) }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "proration" })
        ] })
      ] }),
      employee.isSalesRole && empCalc.salesMult !== 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-bold", children: "×" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-cyan-500/30", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: fmtNum(empCalc.salesMult, 2) }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "sales" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-bold", children: "=" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500/15 border-2 border-emerald-500/40", children: [
        /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm", children: fmtGHS(empCalc.bonus) }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-emerald-700 dark:text-emerald-400", children: "your bonus" })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "What If You Improved?", description: "See how changes to your performance would affect your bonus", icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "Current" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mt-2", children: fmtGHS(empCalc.bonus) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "At ",
          fmtNum(empCalc.performanceMultiplier * 100, 0),
          "% achievement"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl border ${empCalc.performanceMultiplier >= 1 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"}`, children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "If You Hit Targets" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mt-2", children: fmtGHS(potentialBonus) }),
        /* @__PURE__ */ jsx("p", { className: `text-xs mt-1 ${differenceToTarget > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`, children: differenceToTarget > 0 ? `+${fmtGHS(differenceToTarget)} more` : "You're already there!" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-purple-500/5 border border-purple-500/20", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400", children: "Max Potential (120%)" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mt-2", children: fmtGHS(perfectBonus) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-purple-700 dark:text-purple-400 mt-1", children: [
          "+",
          fmtGHS(perfectBonus - empCalc.bonus),
          " more"
        ] })
      ] })
    ] }) }) }),
    yearHistoryData.length > 1 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Your Performance History", icon: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }), action: /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-28 h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
        length: 5
      }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - 2 + i).map((y) => /* @__PURE__ */ jsx(SelectItem, { value: String(y), children: y }, y)) })
    ] }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: yearHistoryData, children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "myCalcGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "hsl(221 70% 50%)", stopOpacity: 0.35 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "hsl(221 70% 50%)", stopOpacity: 0.02 })
      ] }) }),
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "label", fontSize: 11, axisLine: false, tickLine: false }),
      /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
      /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [fmtNum(v, 2), "Multiplier"] }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "multiplier", stroke: "hsl(221 70% 50%)", strokeWidth: 2.5, fill: "url(#myCalcGrad)", dot: {
        r: 4,
        strokeWidth: 2,
        fill: "#fff"
      }, activeDot: {
        r: 6
      } })
    ] }) }) }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "p-5 bg-blue-500/5 border-blue-500/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-blue-900 dark:text-blue-300", children: "Questions About Your Calculation?" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1.5 text-xs text-blue-800 dark:text-blue-400", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Bonus is based on ",
              /* @__PURE__ */ jsx("strong", { children: "approved" }),
              " KPI data."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "To improve, update KPIs on ",
              /* @__PURE__ */ jsx("strong", { children: "My Performance" }),
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Contact HR if your grade or points are incorrect." })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  MyCalculationPage as component
};
