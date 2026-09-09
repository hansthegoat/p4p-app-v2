import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useMemo } from "react";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { c as cn } from "./utils-H80jjgLf.js";
import { u as useP4P, f as fmtNum, a as fmtGHS, b as fmtGHSFull } from "./store-Dy84gyCY.js";
import { Download, Search, User, AlertCircle, Target, CheckCircle, Award, ChevronDown, ChevronRight } from "lucide-react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./router-ykR6owpd.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@supabase/supabase-js";
const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = ProgressPrimitive.Root.displayName;
function Section({
  title,
  defaultOpen = true,
  children
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => setOpen(!open), className: "w-full flex items-center justify-between p-4 hover:bg-muted/30", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: title }),
      open ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
    ] }),
    open && /* @__PURE__ */ jsx("div", { className: "p-4 pt-0 border-t", children })
  ] });
}
function exportCSV(rows, name) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function TracePage() {
  const {
    globals,
    employees,
    grades,
    calc
  } = useP4P();
  const gradeMap = new Map(grades.map((g) => [g.code, g]));
  const adjuncts = employees.filter((e) => e.isAdjunct);
  const nonAdjuncts = employees.filter((e) => !e.isAdjunct);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return nonAdjuncts;
    const term = searchTerm.toLowerCase();
    return nonAdjuncts.filter((e) => e.name.toLowerCase().includes(term));
  }, [searchTerm, nonAdjuncts]);
  const selectedEmployee = useMemo(() => {
    if (!selectedEmpId) return null;
    return employees.find((e) => e.id === selectedEmpId);
  }, [selectedEmpId, employees]);
  const selectedResult = selectedEmpId ? calc.perEmployee[selectedEmpId] : null;
  const calculatePerformance = (categories) => {
    if (!categories || categories.length === 0) return null;
    const categoryScores = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;
    for (const category of categories) {
      if (!category.kpis || category.kpis.length === 0) continue;
      const kpiDetails = category.kpis.map((k) => {
        const target = Number(k.target);
        const actual = Number(k.actual);
        const ratio = target > 0 ? actual / target : 0;
        const achievement2 = ratio * 100;
        return {
          description: k.description,
          target,
          actual,
          ratio,
          achievement: achievement2,
          metric: k.metric || "%",
          status: achievement2 >= 100 ? "exceeded" : achievement2 >= 70 ? "met" : achievement2 >= 50 ? "partial" : "missed"
        };
      });
      const categoryScore = kpiDetails.reduce((sum, k) => sum + k.ratio, 0) / (kpiDetails.length || 1);
      const categoryWeight = category.weight || 0;
      const achievement = categoryScore * 100;
      const status = achievement >= 100 ? "exceeded" : achievement >= 70 ? "met" : achievement >= 50 ? "partial" : "missed";
      categoryScores.push({
        name: category.name,
        score: categoryScore,
        weight: categoryWeight,
        kpis: kpiDetails,
        status
      });
      totalWeightedScore += categoryScore * (categoryWeight / 100);
      totalWeight += categoryWeight / 100;
    }
    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 1;
    const overallAchievement = overallScore * 100;
    const needsPIP = overallScore < 0.5;
    return {
      categoryScores,
      overallScore,
      overallAchievement,
      needsPIP
    };
  };
  const getRecommendations = (employee, result, perfData2) => {
    const recs = [];
    if (!perfData2) {
      recs.push({
        type: "info",
        message: "No categories or KPIs defined. Add weighted categories to track performance."
      });
      return recs;
    }
    if (perfData2.needsPIP) {
      recs.push({
        type: "danger",
        message: `⚠️ PERFORMANCE IMPROVEMENT PLAN (PIP) REQUIRED: Overall performance below 50% (${fmtNum(perfData2.overallAchievement, 1)}%). Immediate intervention needed.`
      });
    }
    for (const cat of perfData2.categoryScores) {
      const achievement = cat.score * 100;
      if (achievement < 50) {
        recs.push({
          type: "danger",
          message: `🔴 ${cat.name}: Critical performance (${fmtNum(achievement, 1)}%). Immediate attention required.`
        });
      } else if (achievement < 70) {
        recs.push({
          type: "warning",
          message: `🟡 ${cat.name}: Below target (${fmtNum(achievement, 1)}%). Needs improvement.`
        });
      } else if (achievement >= 100) {
        recs.push({
          type: "success",
          message: `🟢 ${cat.name}: Excellent performance (${fmtNum(achievement, 1)}%). Exceeded targets!`
        });
      }
    }
    if (perfData2.categoryScores) {
      for (const cat of perfData2.categoryScores) {
        for (const kpi of cat.kpis) {
          if (kpi.achievement < 50 && kpi.target > 0) {
            recs.push({
              type: "danger",
              message: `📉 ${kpi.description}: Critical miss (${fmtNum(kpi.achievement, 1)}% of ${fmtNum(kpi.target)} ${kpi.metric})`
            });
          } else if (kpi.achievement >= 120 && kpi.target > 0) {
            recs.push({
              type: "success",
              message: `📈 ${kpi.description}: Outstanding (${fmtNum(kpi.achievement, 1)}% of target)`
            });
          }
        }
      }
    }
    if (result && result.bonus > 0) {
      const avgBonus = calc.totalPool / (nonAdjuncts.length || 1);
      const bonusRatio = result.bonus / avgBonus;
      if (bonusRatio > 1.5) {
        recs.push({
          type: "success",
          message: `💰 Bonus: ${fmtGHS(result.bonus)} (${fmtNum((bonusRatio - 1) * 100, 0)}% above average) - Well deserved!`
        });
      } else if (bonusRatio < 0.5 && result.bonus > 0) {
        recs.push({
          type: "warning",
          message: `💰 Bonus: ${fmtGHS(result.bonus)} (${fmtNum((1 - bonusRatio) * 100, 0)}% below average) - Consider performance improvement.`
        });
      }
    }
    if (recs.length === 0) {
      recs.push({
        type: "info",
        message: "✅ All KPIs on track. Continue current focus."
      });
    }
    return recs;
  };
  const getLegacyRecommendation = (kpis) => {
    const low = kpis.filter((k) => k.ratio < 0.8);
    const high = kpis.filter((k) => k.ratio > 1.2);
    if (high.length > 0) {
      return `🌟 Strong performance on: ${high.map((h) => h.description).join(", ")}. Maintain this momentum!`;
    }
    if (low.length > 0) {
      return `⚠️ Areas needing improvement: ${low.map((l) => l.description).join(", ")}. Consider additional training, resource support, or revised targets.`;
    }
    return "✅ Performance is on track. Continue current focus.";
  };
  const handleExport = () => {
    const rows = [["Section", "Field", "Value"]];
    rows.push(["Global", "Total Revenue", String(globals.totalRevenue)]);
    rows.push(["Global", "P4P %", String(globals.p4pPercent)]);
    rows.push(["Global", "Total Pool", String(calc.totalPool)]);
    rows.push(["Global", "Adjunct %", String(globals.adjunctPercent)]);
    rows.push(["Global", "Adjunct Pool", String(calc.adjunctPool)]);
    rows.push(["Global", "Employee Pool", String(calc.employeePool)]);
    rows.push(["Global", "Sum of Weights", String(calc.sumWeights)]);
    rows.push(["Global", "Value per Weight Unit", String(calc.valuePerUnit)]);
    rows.push([]);
    rows.push(["Employee", "Name", "Grade", "Points", "Multiplier", "Proration", "SalesMult", "Weight", "Bonus", "PIP"]);
    for (const e of nonAdjuncts) {
      const r = calc.perEmployee[e.id];
      if (!r) continue;
      const needsPIP = r.needsPIP ? "YES" : "NO";
      rows.push(["Employee", e.name, e.jobGrade, String(r.gradePoints), String(r.performanceMultiplier), String(r.proration), String(r.salesMult), String(r.weight), String(r.bonus), needsPIP]);
    }
    rows.push([]);
    rows.push(["Adjunct", "Name", "Bonus"]);
    for (const a of adjuncts) rows.push(["Adjunct", a.name, String(calc.perAdjunctBonus)]);
    exportCSV(rows, "p4p_calculation_log.csv");
  };
  const stat = (l, v, fullV) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1.5 text-sm border-b last:border-0 gap-4", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: l }),
    /* @__PURE__ */ jsx("span", { className: "font-mono whitespace-nowrap", title: fullV, children: v })
  ] });
  const perfData = selectedEmployee?.categories ? calculatePerformance(selectedEmployee.categories) : null;
  const recommendations = selectedEmployee && selectedResult ? getRecommendations(selectedEmployee, selectedResult, perfData) : [];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold", children: "Calculation Trace" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Step-by-step breakdown of the bonus computation with weighted category details." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: handleExport, children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
        " Export Log"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold text-lg", children: "Employee Performance Insights" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search employee by name...", value: searchTerm, onChange: (e) => {
          setSearchTerm(e.target.value);
          setSelectedEmpId(null);
        }, className: "pl-8" })
      ] }),
      searchTerm && filteredEmployees.length > 0 && /* @__PURE__ */ jsx("div", { className: "border rounded-md divide-y max-h-60 overflow-auto", children: filteredEmployees.map((emp) => {
        const r = calc.perEmployee[emp.id];
        const needsPIP = r?.needsPIP;
        return /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedEmpId(emp.id), className: `w-full text-left p-2 hover:bg-muted/50 flex items-center gap-2 ${selectedEmpId === emp.id ? "bg-primary/10" : ""}`, children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { children: emp.name }),
          needsPIP && /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold animate-pulse", children: "⚠️ PIP" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: gradeMap.get(emp.jobGrade)?.name || emp.jobGrade })
        ] }, emp.id);
      }) }),
      searchTerm && filteredEmployees.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No employees match your search." }),
      selectedEmployee && selectedResult && /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4 border-t pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg", children: selectedEmployee.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: gradeMap.get(selectedEmployee.jobGrade)?.name || selectedEmployee.jobGrade })
          ] }),
          perfData?.needsPIP && /* @__PURE__ */ jsxs("div", { className: "bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
            " PIP REQUIRED"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Grade points:" }),
              " ",
              selectedResult.gradePoints
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Performance multiplier:" }),
              " ",
              fmtNum(selectedResult.performanceMultiplier, 3)
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Pro‑ration factor:" }),
              " ",
              selectedResult.proration
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Sales multiplier:" }),
              " ",
              selectedResult.salesMult
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Weight:" }),
              " ",
              fmtNum(selectedResult.weight, 4)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Calculation:" }) }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground break-words", children: [
              "Weight = ",
              selectedResult.gradePoints,
              " × ",
              fmtNum(selectedResult.performanceMultiplier, 3),
              " × ",
              selectedResult.proration,
              " × ",
              selectedResult.salesMult,
              " = ",
              fmtNum(selectedResult.weight, 4)
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Final bonus:" }),
              " ",
              fmtGHS(selectedResult.bonus)
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "= Value per point × Weight = ",
              fmtGHS(calc.valuePerUnit),
              " × ",
              fmtNum(selectedResult.weight, 4)
            ] })
          ] })
        ] }),
        perfData && perfData.categoryScores.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-sm flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }),
            " Weighted Category Performance"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            perfData.categoryScores.map((cat, idx) => /* @__PURE__ */ jsxs("div", { className: "border rounded-md p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", children: cat.name }),
                  /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
                    "(Weight: ",
                    cat.weight,
                    "%)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: `text-sm font-semibold ${cat.status === "exceeded" ? "text-green-600" : cat.status === "met" ? "text-blue-600" : cat.status === "partial" ? "text-yellow-600" : "text-red-600"}`, children: [
                  fmtNum(cat.score * 100, 1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: Math.min(100, cat.score * 100), className: "h-2" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-1 gap-1", children: cat.kpis.map((kpi, kIdx) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-5 gap-2 text-xs border-b border-muted pb-1 last:border-0", children: [
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: kpi.description }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "Target: ",
                  fmtNum(kpi.target),
                  " ",
                  kpi.metric
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "Actual: ",
                  fmtNum(kpi.actual),
                  " ",
                  kpi.metric
                ] }),
                /* @__PURE__ */ jsxs("div", { className: `font-semibold ${kpi.achievement >= 100 ? "text-green-600" : kpi.achievement >= 70 ? "text-yellow-600" : "text-red-600"}`, children: [
                  fmtNum(kpi.achievement, 1),
                  "%",
                  kpi.achievement >= 100 && /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3 inline ml-1" }),
                  kpi.achievement < 50 && /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3 inline ml-1" })
                ] })
              ] }, kIdx)) })
            ] }, idx)),
            /* @__PURE__ */ jsxs("div", { className: `p-3 rounded-lg ${perfData.needsPIP ? "bg-red-50 border border-red-200" : perfData.overallAchievement >= 100 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Overall Performance Score" }),
                /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold ${perfData.needsPIP ? "text-red-600" : perfData.overallAchievement >= 100 ? "text-green-600" : "text-yellow-600"}`, children: [
                  fmtNum(perfData.overallAchievement, 1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: Math.min(100, perfData.overallAchievement), className: "h-2 mt-1" })
            ] })
          ] })
        ] }),
        (!perfData || perfData.categoryScores.length === 0) && selectedEmployee.kpis.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-sm", children: "KPI Performance Details (Legacy Mode)" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm border rounded-md", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "p-2 text-left", children: "Description" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 text-left", children: "Metric" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 text-right", children: "Target" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 text-right", children: "Actual" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 text-right", children: "Ratio" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 text-left", children: "Insight" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: selectedEmployee.kpis.map((kpi, idx) => {
              const ratio = kpi.target > 0 ? kpi.actual / kpi.target : 0;
              let insight = "";
              if (ratio >= 1.2) insight = "✅ Excellent – exceeded";
              else if (ratio >= 1) insight = "✔ Met target";
              else if (ratio >= 0.8) insight = "⚠️ Slightly below";
              else insight = "❌ Needs improvement";
              return /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
                /* @__PURE__ */ jsx("td", { className: "p-2", children: kpi.description }),
                /* @__PURE__ */ jsx("td", { className: "p-2", children: kpi.metric }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: fmtNum(kpi.target) }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: fmtNum(kpi.actual) }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-right font-mono", children: fmtNum(ratio, 3) }),
                /* @__PURE__ */ jsx("td", { className: "p-2 text-xs text-muted-foreground", children: insight })
              ] }, idx);
            }) })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 bg-secondary/30 rounded-md", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-sm", children: "💡 Recommendation" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: getLegacyRecommendation(selectedEmployee.kpis.map((k) => ({
              description: k.description,
              ratio: k.target > 0 ? k.actual / k.target : 0
            }))) })
          ] })
        ] }),
        recommendations.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-sm flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }),
            " Recommendations & Insights"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: recommendations.map((rec, idx) => /* @__PURE__ */ jsx("div", { className: `p-3 rounded-lg border ${rec.type === "success" ? "border-green-200 bg-green-50" : rec.type === "warning" ? "border-yellow-200 bg-yellow-50" : rec.type === "danger" ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            rec.type === "success" && /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" }),
            rec.type === "warning" && /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" }),
            rec.type === "danger" && /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" }),
            rec.type === "info" && /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsx("span", { className: `text-sm ${rec.type === "success" ? "text-green-800" : rec.type === "warning" ? "text-yellow-800" : rec.type === "danger" ? "text-red-800" : "text-blue-800"}`, children: rec.message })
          ] }) }, idx)) })
        ] })
      ] }),
      !selectedEmpId && searchTerm && filteredEmployees.length > 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center pt-2", children: "Click on an employee above to see details." }),
      !searchTerm && !selectedEmpId && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-2", children: "Start typing an employee name to search." })
    ] }),
    /* @__PURE__ */ jsxs(Section, { title: "Global Calculation", children: [
      stat("Total Revenue", fmtGHS(globals.totalRevenue), fmtGHSFull(globals.totalRevenue)),
      stat("P4P %", `${globals.p4pPercent}%`),
      stat("Total P4P Pool = Revenue × P4P%", fmtGHS(calc.totalPool), fmtGHSFull(calc.totalPool)),
      stat("Adjunct %", `${globals.adjunctPercent}%`),
      stat("Adjunct Pool = Total × Adjunct%", fmtGHS(calc.adjunctPool), fmtGHSFull(calc.adjunctPool)),
      stat("Employee Pool = Total × (1 − Adjunct%)", fmtGHS(calc.employeePool), fmtGHSFull(calc.employeePool)),
      stat("Sum of Weights (non-adjuncts)", fmtNum(calc.sumWeights, 4)),
      stat("Value per Weight Unit = Pool / Sum", fmtGHS(calc.valuePerUnit), fmtGHSFull(calc.valuePerUnit)),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-muted/30 rounded-md text-xs", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-muted-foreground", children: "💡 How it works:" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-muted-foreground", children: [
          "For each employee: ",
          /* @__PURE__ */ jsx("strong", { children: "Weight = Grade Points × Performance Multiplier × Proration × Sales Multiplier" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Then: ",
          /* @__PURE__ */ jsx("strong", { children: "Bonus = (Employee Pool / Sum of all Weights) × Employee's Weight" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Section, { title: `Non-Adjunct Employees (${nonAdjuncts.length})`, children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: nonAdjuncts.map((e) => {
      const r = calc.perEmployee[e.id];
      if (!r) return null;
      const needsPIP = r.needsPIP;
      const hasCategories = e.categories && e.categories.length > 0;
      return /* @__PURE__ */ jsxs("div", { className: `p-3 border rounded-md ${needsPIP ? "border-red-300 bg-red-50/50" : "bg-muted/20"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
            e.name,
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [
              "(",
              gradeMap.get(e.jobGrade)?.name || e.jobGrade,
              ")"
            ] }),
            needsPIP && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold animate-pulse", children: "⚠️ PIP" }),
            hasCategories && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full", children: "Categories" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "font-bold whitespace-nowrap", title: fmtGHSFull(r.bonus), children: fmtGHS(r.bonus) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Grade Pts:" }),
            " ",
            r.gradePoints
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Multiplier:" }),
            " ",
            fmtNum(r.performanceMultiplier, 3)
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Proration:" }),
            " ",
            fmtNum(r.proration, 3)
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Sales:" }),
            " ×",
            r.salesMult
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2 sm:col-span-4 break-words", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Weight:" }),
            " ",
            r.gradePoints,
            " × ",
            fmtNum(r.performanceMultiplier, 3),
            " × ",
            fmtNum(r.proration, 2),
            " × ",
            r.salesMult,
            " = ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: fmtNum(r.weight, 4) })
          ] })
        ] }),
        hasCategories && r.categoryBreakdown && r.categoryBreakdown.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 pt-2 border-t", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Categories: " }),
          r.categoryBreakdown.map((cat, i) => /* @__PURE__ */ jsxs("span", { className: "text-xs mr-3", children: [
            cat.categoryName,
            " (",
            fmtNum(cat.categoryScore * 100, 0),
            "%)"
          ] }, i))
        ] }),
        r.kpiBreakdown.length > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs mt-2 pt-2 border-t", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "KPIs: " }),
          r.kpiBreakdown.map((k, i) => /* @__PURE__ */ jsxs("span", { className: "mr-3", children: [
            k.description,
            " (",
            fmtNum(k.ratio, 2),
            " ratio)"
          ] }, i))
        ] }),
        needsPIP && /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs text-red-600 font-medium", children: "⚠️ Performance below 50% - PIP required" })
      ] }, e.id);
    }) }) }),
    /* @__PURE__ */ jsxs(Section, { title: `Adjuncts (${adjuncts.length})`, children: [
      adjuncts.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No adjuncts." }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: adjuncts.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 border rounded-md", children: [
        /* @__PURE__ */ jsx("span", { children: a.name }),
        /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold whitespace-nowrap", title: fmtGHSFull(calc.perAdjunctBonus), children: fmtGHS(calc.perAdjunctBonus) })
      ] }, a.id)) })
    ] })
  ] });
}
export {
  TracePage as component
};
