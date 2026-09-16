import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { a as useP4P, f as fmtGHS, c as fmtNum } from "./_ssr/router-BPHF_myF.mjs";
import { C as Card } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { I as Input } from "./_ssr/input-BgWjUwUQ.mjs";
import { L as Label } from "./_ssr/label-zkAJpnXH.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-FVkpvMO7.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { S as StatCard } from "./_ssr/stat-card-DPr76q1z.mjs";
import { S as SectionCard } from "./_ssr/section-card-Dur1lkFz.mjs";
import { E as EmptyState } from "./_ssr/empty-state-DzL3lmex.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { s as staggerContainer, f as fadeUp } from "./_ssr/motion-DlChdgW6.mjs";
import "./_libs/sonner.mjs";
import { m as motion, A as AnimatePresence } from "./_libs/framer-motion.mjs";
import { D as Download, d as Calculator, W as Wallet, f as Users, w as DollarSign, g as TrendingUp, x as Award, y as Search, z as Building2, E as ChevronDown, t as ChevronRight, T as Target, G as Activity, I as Info, J as Hash, P as Percent, Z as Zap } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/tanstack__react-router.mjs";
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
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
function TracePage() {
  const {
    employees,
    calc,
    globals,
    getPerformanceTrend
  } = useP4P();
  const [search, setSearch] = reactExports.useState("");
  const [selectedDept, setSelectedDept] = reactExports.useState("all");
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const departments = reactExports.useMemo(() => [...new Set(employees.map((e) => e.department).filter(Boolean))], [employees]);
  const filteredEmployees = reactExports.useMemo(() => {
    return employees.filter((emp) => {
      if (emp.isAdjunct) return false;
      if (selectedDept !== "all" && emp.department !== selectedDept) return false;
      if (search) {
        const s = search.toLowerCase();
        return emp.name.toLowerCase().includes(s) || emp.department.toLowerCase().includes(s) || emp.role.toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => {
      const aCalc = calc.perEmployee[a.id];
      const bCalc = calc.perEmployee[b.id];
      return (bCalc?.bonus || 0) - (aCalc?.bonus || 0);
    });
  }, [employees, selectedDept, search, calc]);
  const stats = reactExports.useMemo(() => {
    const values = filteredEmployees.map((e) => calc.perEmployee[e.id]);
    return {
      count: filteredEmployees.length,
      totalBonus: values.reduce((s, v) => s + (v?.bonus || 0), 0),
      avgMultiplier: values.length > 0 ? values.reduce((s, v) => s + (v?.performanceMultiplier || 0), 0) / values.length : 0,
      totalPoints: values.reduce((s, v) => s + (v?.gradePoints || 0), 0)
    };
  }, [filteredEmployees, calc]);
  const exportTrace = () => {
    const rows = [["Employee", "Department", "Role", "Grade", "Points", "Multiplier", "Proration", "Sales Mult", "Weight", "Bonus"]];
    for (const emp of filteredEmployees) {
      const c = calc.perEmployee[emp.id];
      if (!c) continue;
      rows.push([emp.name, emp.department, emp.role, emp.jobGrade, String(c.gradePoints), fmtNum(c.performanceMultiplier, 3), fmtNum(c.proration, 2), fmtNum(c.salesMult, 2), fmtNum(c.weight, 2), fmtNum(c.bonus, 2)]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `calculation_trace_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast.success("Export Complete", "CSV downloaded.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Calculation Trace", description: "Full breakdown of how each employee's bonus is calculated — from grade points to final payout.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: exportTrace, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
      " Export CSV"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-gradient-to-r from-primary/5 via-background to-background border-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Pool Breakdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Revenue: ",
            fmtGHS(globals.totalRevenue),
            " · P4P ",
            globals.p4pPercent,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Total Pool" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1", children: fmtGHS(calc.totalPool) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Employee Pool" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400", children: fmtGHS(calc.employeePool) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Value / Point" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1", children: fmtGHS(calc.valuePerUnit) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Adjunct Pool" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1 text-amber-600 dark:text-amber-400", children: fmtGHS(calc.adjunctPool) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Employees Traced", value: stats.count, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }), label: "Total Bonus", value: fmtGHS(stats.totalBonus), accent: "success", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(stats.avgMultiplier, 2), accent: "info", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }), label: "Total Points", value: fmtNum(stats.totalPoints, 1), accent: "purple", size: "large" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5" }),
          " Search"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by name, department, or role...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-10" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
          " Department"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedDept, onValueChange: setSelectedDept, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Departments" }),
            departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d))
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Employee Calculation Traces", description: "Click any row to see the full breakdown", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }), children: filteredEmployees.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-6 w-6" }), title: "No employees to trace", description: "Add employees or adjust your filters to see calculations." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredEmployees.map((emp, idx) => {
      const empCalc = calc.perEmployee[emp.id];
      if (!empCalc) return null;
      const isExpanded = expandedId === emp.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 6
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: Math.min(idx * 0.02, 0.3)
      }, className: "border border-border/60 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpandedId(isExpanded ? null : emp.id), className: "w-full p-4 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0", children: emp.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm truncate", children: emp.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-mono text-[10px]", children: [
                  "Grade ",
                  emp.jobGrade
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: [
                emp.department,
                " · ",
                emp.role
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center hidden sm:block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide font-semibold text-muted-foreground", children: "Points" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: fmtNum(empCalc.gradePoints, 1) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center hidden sm:block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide font-semibold text-muted-foreground", children: "Mult." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-blue-600 dark:text-blue-400", children: fmtNum(empCalc.performanceMultiplier, 2) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide font-semibold text-muted-foreground", children: "Bonus" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-emerald-600 dark:text-emerald-400", children: fmtGHS(empCalc.bonus) })
            ] }),
            isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
          opacity: 0,
          height: 0
        }, animate: {
          opacity: 1,
          height: "auto"
        }, exit: {
          opacity: 0,
          height: 0
        }, transition: {
          duration: 0.25
        }, className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-t border-border/50 bg-muted/20 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStep, { step: 1, title: "Grade & Weight", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3.5 w-3.5" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStat, { label: "Grade Points", value: fmtNum(empCalc.gradePoints, 1), color: "purple" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStat, { label: "Weight", value: fmtNum(empCalc.weight, 1), color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStat, { label: "Sales Multiplier", value: `×${fmtNum(empCalc.salesMult, 2)}`, color: "info", muted: !emp.isSalesRole }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStat, { label: "Proration", value: `×${fmtNum(empCalc.proration, 2)}`, color: "warning", muted: !globals.prorationOn })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStep, { step: 2, title: "Performance Multiplier", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-background border border-border/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Calculated from KPI achievement" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: empCalc.performanceMultiplier >= 1 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" : empCalc.performanceMultiplier >= 0.7 ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30", children: fmtNum(empCalc.performanceMultiplier, 3) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
              width: 0
            }, animate: {
              width: `${Math.min(100, empCalc.performanceMultiplier * 100)}%`
            }, transition: {
              duration: 0.6
            }, className: `h-full ${empCalc.performanceMultiplier >= 1 ? "bg-emerald-500" : empCalc.performanceMultiplier >= 0.7 ? "bg-blue-500" : "bg-red-500"}` }) })
          ] }) }),
          empCalc.categoryBreakdown && empCalc.categoryBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStep, { step: 3, title: "Category Breakdown", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: empCalc.categoryBreakdown.map((cat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: cat.categoryName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                  "Weight ",
                  cat.categoryWeight,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-bold ${cat.categoryScore >= 1 ? "text-emerald-600 dark:text-emerald-400" : cat.categoryScore >= 0.7 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`, children: [
                fmtNum(cat.categoryScore * 100, 1),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 mt-2 pl-4 border-l-2 border-border/40", children: cat.kpis.map((kpi, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 text-xs py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 text-muted-foreground truncate", children: kpi.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 text-center font-mono", children: [
                fmtNum(kpi.target),
                " → ",
                fmtNum(kpi.actual)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 text-center font-mono", children: [
                "×",
                fmtNum(kpi.ratio, 2)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-2 text-right font-semibold ${kpi.ratio >= 1 ? "text-emerald-600 dark:text-emerald-400" : kpi.ratio >= 0.7 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`, children: [
                fmtNum(kpi.ratio * 100, 0),
                "%"
              ] })
            ] }, j)) })
          ] }, i)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TraceStep, { step: 4, title: "Final Bonus Calculation", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-3.5 w-3.5" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 rounded-md bg-background border border-border font-mono", children: [
                fmtNum(empCalc.gradePoints, 1),
                " pts"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "×" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md bg-background border border-border font-mono", children: fmtGHS(calc.valuePerUnit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "×" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md bg-background border border-border font-mono", children: fmtNum(empCalc.performanceMultiplier, 3) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "×" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md bg-background border border-border font-mono", children: fmtNum(empCalc.proration, 2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "×" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md bg-background border border-border font-mono", children: fmtNum(empCalc.salesMult, 2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "=" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-emerald-700 dark:text-emerald-400", children: fmtGHS(empCalc.bonus) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Final bonus = Grade Points × Value per Point × Performance Multiplier × Proration × Sales Multiplier" })
          ] }) })
        ] }) }) })
      ] }, emp.id);
    }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 bg-blue-500/5 border-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-blue-900 dark:text-blue-300", children: "How the Calculation Works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 space-y-1.5 text-xs text-blue-800 dark:text-blue-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Grade Points" }),
              " come from the employee's job grade."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Value per Point" }),
              " = Employee Pool ÷ Total Grade Points across all employees."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Performance Multiplier" }),
              " = weighted KPI achievement."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Proration" }),
              " and ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sales Multiplier" }),
              " adjust for partial-year service and sales-specific roles."
            ] })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
function TraceStep({
  step,
  title,
  icon,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0", children: step }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: title })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-8", children })
  ] });
}
function TraceStat({
  label,
  value,
  color,
  muted = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg border ${muted ? "bg-muted/30 border-border/40 opacity-60" : `bg-${color}-500/5 border-${color}-500/20`}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-base font-bold mt-1 font-mono ${muted ? "text-muted-foreground" : `text-${color}-600 dark:text-${color}-400`}`, children: value })
  ] });
}
export {
  TracePage as component
};
