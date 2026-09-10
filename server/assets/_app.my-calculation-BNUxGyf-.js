import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { u as useP4P, f as fmtGHS, c as fmtNum, g as getCurrentUser } from "./router-CQTT2apA.js";
import { C as Card } from "./card-RGlIzTYo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { E as EmptyState, s as staggerContainer, P as PageHeader, f as fadeUp } from "./empty-state-BKzet6q0.js";
import { S as SectionCard } from "./section-card-CU3fEC1l.js";
import { Info, Calculator, DollarSign, TrendingUp, Building2, Wallet, Users, Lightbulb, Award, CircleDollarSign, Target, Percent, Scale, Calendar, Zap, Star, Sparkles, Activity, HelpCircle, ChevronRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
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
      avgMultiplier,
      valuePerPoint: calc.valuePerUnit
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
      fmtGHS(empCalc.bonus)
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: "p-6 bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20 overflow-hidden relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-wrap items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2", children: [
            /* @__PURE__ */ jsx(DollarSign, { className: "h-3.5 w-3.5" }),
            "Your Current Bonus"
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
        " that comes from company revenue. That pool is then split among all employees based on their",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: " grade points" }),
        " and",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: " performance" }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-blue-500/5 border border-blue-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400", children: "1. Company Revenue" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: fmtGHS(globals.totalRevenue) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Total money the company made this period" })
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
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: fmtGHS(calc.totalPool) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            globals.p4pPercent,
            "% of revenue is set aside for bonuses"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-purple-500/5 border border-purple-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-purple-600 dark:text-purple-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400", children: "3. Your Share" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-emerald-600 dark:text-emerald-400", children: fmtGHS(empCalc.bonus) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Your slice of the ",
            fmtGHS(calc.employeePool),
            " employee pool"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-800 dark:text-amber-300", children: [
          /* @__PURE__ */ jsx("strong", { children: "Why this matters:" }),
          " If the company makes more revenue, everyone's bonus grows. If fewer people share the pool, each person gets more."
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 1 · Your Grade Points", description: `You're a Grade ${employee.jobGrade} (${employee.role})`, icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
        "Every employee gets a ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "point value" }),
        " based on their ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "job grade" }),
        ". Higher grades = more points = bigger share of the pool."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-purple-500/5 border border-purple-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-purple-600 dark:text-purple-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400", children: "Your Points" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-purple-600 dark:text-purple-400", children: fmtNum(empCalc.gradePoints, 1) }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "points" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
            "Grade ",
            employee.jobGrade,
            " · ",
            employee.role
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
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 2 · Value per Point", description: "How much each of your points is worth in money", icon: /* @__PURE__ */ jsx(CircleDollarSign, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
        "We divide the ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "total employee pool" }),
        " by the",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: " total points" }),
        " across everyone. This gives us the money value of a single point."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-5 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4 items-center", children: [
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
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400 mb-1", children: "Your base (before performance)" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: fmtGHS(empCalc.gradePoints * calc.valuePerUnit) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            fmtNum(empCalc.gradePoints, 1),
            " points × ",
            fmtGHS(calc.valuePerUnit)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1", children: "Total pool across everyone" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: fmtGHS(calc.employeePool) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Distributed to ",
            companyStats.totalEmployees,
            " employees"
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 3 · Your Performance Multiplier", description: "This is where YOUR efforts change the outcome", icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
        "Your ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "multiplier" }),
        " measures how well you're hitting your KPIs. It's calculated by comparing your ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "actuals" }),
        " to your ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "targets" }),
        " across every KPI, then averaging with category weights."
      ] }),
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
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
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
            "Average of KPIs, weighted by category %",
            /* @__PURE__ */ jsx("br", {}),
            "Example: Strategic 30% → avg 1.07"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx(Scale, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "Overall" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
            "Weighted sum of all categories",
            /* @__PURE__ */ jsx("br", {}),
            "Example: 0.30×1.07 + 0.20×0.93 + ..."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-800 dark:text-blue-300", children: [
          /* @__PURE__ */ jsx("strong", { children: "This is the part YOU control." }),
          " Every KPI you hit above target increases your multiplier — which multiplies your entire bonus."
        ] })
      ] })
    ] }) }) }),
    (globals.prorationOn || employee.isSalesRole) && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Step 4 · Adjustments", description: "Extra factors that can increase or decrease your bonus", icon: /* @__PURE__ */ jsx(Scale, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      globals.prorationOn && /* @__PURE__ */ jsx("div", { className: `p-4 rounded-xl border ${empCalc.proration < 1 ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${empCalc.proration < 1 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`, children: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Proration" }),
            /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold font-mono ${empCalc.proration < 1 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`, children: [
              "×",
              fmtNum(empCalc.proration, 2)
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: empCalc.proration < 1 ? `You worked ${employee.monthsWorked || 12} of 12 months this period, so your bonus is adjusted proportionally.` : "You worked the full period, so no adjustment is needed." })
        ] })
      ] }) }),
      employee.isSalesRole && /* @__PURE__ */ jsx("div", { className: `p-4 rounded-xl border ${empCalc.salesMult > 1 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30 border-border/60"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${empCalc.salesMult > 1 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Sales Multiplier" }),
            /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold font-mono ${empCalc.salesMult > 1 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`, children: [
              "×",
              fmtNum(empCalc.salesMult, 2)
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: empCalc.salesMult > 1 ? `Sales roles receive a ${fmtNum(empCalc.salesMult, 2)}× boost because their performance is directly tied to revenue generation.` : "No sales multiplier applies to your role." })
        ] })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Putting It All Together", description: "Your final formula", icon: /* @__PURE__ */ jsx(Calculator, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs mb-4", children: [
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
          /* @__PURE__ */ jsx(TrendingUp, { className: `h-3.5 w-3.5 ${empCalc.performanceMultiplier >= 1 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}` }),
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
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "All values above are based on approved KPI data for the current period." })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(SectionCard, { title: "What If You Improved?", description: "See how changes to your performance would affect your bonus", icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }), children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/30 border border-border/60", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-lg bg-muted-foreground/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Calculator, { className: "h-3 w-3 text-muted-foreground" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "Current" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: fmtGHS(empCalc.bonus) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "At ",
            fmtNum(empCalc.performanceMultiplier * 100, 0),
            "% achievement"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl border ${empCalc.performanceMultiplier >= 1 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: `w-6 h-6 rounded-lg flex items-center justify-center ${empCalc.performanceMultiplier >= 1 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"}`, children: /* @__PURE__ */ jsx(Target, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground", children: "If You Hit All Targets" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: fmtGHS(potentialBonus) }),
          /* @__PURE__ */ jsx("p", { className: `text-xs mt-1 ${differenceToTarget > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`, children: differenceToTarget > 0 ? `+${fmtGHS(differenceToTarget)} more` : "You're already there! 🎉" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-purple-500/5 border border-purple-500/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(Star, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400", children: "Max Potential (120%)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: fmtGHS(perfectBonus) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-purple-700 dark:text-purple-400 mt-1", children: [
            "+",
            fmtGHS(perfectBonus - empCalc.bonus),
            " more"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20", children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-800 dark:text-emerald-300", children: [
          /* @__PURE__ */ jsx("strong", { children: "Focus tip:" }),
          " Look at your lowest-performing KPIs first. Improving them has the biggest impact on your multiplier. Visit ",
          /* @__PURE__ */ jsx("strong", { children: "My Performance" }),
          " to see which KPIs need attention."
        ] })
      ] })
    ] }) }),
    yearHistoryData.length > 1 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Your Performance History", description: "Monthly multipliers used in your calculation", icon: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }), action: /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
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
              " KPI data for the period."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "To improve your multiplier, update KPIs on ",
              /* @__PURE__ */ jsx("strong", { children: "My Performance" }),
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Contact HR if you believe your grade or points are incorrect." })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  MyCalculationPage as component
};
