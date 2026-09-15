import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-FVkpvMO7.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { S as StatCard } from "./stat-card-DPr76q1z.js";
import { S as SectionCard } from "./section-card-Dur1lkFz.js";
import { E as EmptyState } from "./empty-state-DzL3lmex.js";
import { a as useP4P, c as fmtNum } from "./router-D7LNLANq.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { s as staggerContainer, f as fadeUp } from "./motion-DlChdgW6.js";
import { RefreshCw, FileSpreadsheet, Calendar, Download, Upload, Zap, CheckCircle, Users, TrendingUp, Award, AlertTriangle, Clock, Trash2, ChevronRight, Target, Pencil, BarChart3 } from "lucide-react";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@sentry/react";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "zod";
const TEMPLATE_CSV = `Employee Name,Employee ID,Category,Category Weight (%),KPI Description,KPI Metric,KPI Target,KPI Weight (%),KPI Actual
Alice Johnson,emp1,Strategic,30,Revenue Growth,GHS,500000,50,600000
Alice Johnson,emp1,Strategic,30,CSAT Score,%,90,50,85
Bob Smith,emp2,Team Performance,40,Team Lead,%,100,60,90
Bob Smith,emp2,Team Performance,40,Projects Completed,#,12,40,10`;
function MonthlyPage() {
  const {
    employees,
    monthlyData,
    saveMonthlySnapshot,
    getMonthlyHistory,
    getPerformanceTrend,
    getAllTrends,
    getMonthlyStats,
    deleteMonthlyData,
    setEmployees,
    detectTriggers,
    getTriggersForEmployee
  } = useP4P();
  const [selectedYear, setSelectedYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [selectedMonth, setSelectedMonth] = useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const fileRef = useRef(null);
  const [editingKPI, setEditingKPI] = useState(null);
  const startEditing = (employeeId, categoryId, kpiId, field, currentValue) => {
    setEditingKPI({
      employeeId,
      categoryId,
      kpiId,
      field,
      value: currentValue
    });
  };
  const saveEdit = () => {
    if (!editingKPI) return;
    const updated = employees.map((emp) => {
      if (emp.id !== editingKPI.employeeId) return emp;
      return {
        ...emp,
        categories: (emp.categories || []).map((cat) => {
          if (cat.id !== editingKPI.categoryId) return cat;
          return {
            ...cat,
            kpis: cat.kpis.map((k) => k.id === editingKPI.kpiId ? {
              ...k,
              [editingKPI.field]: editingKPI.value
            } : k)
          };
        })
      };
    });
    setEmployees(updated);
    const cy = (/* @__PURE__ */ new Date()).getFullYear();
    const cm = (/* @__PURE__ */ new Date()).getMonth() + 1;
    saveMonthlySnapshot(editingKPI.employeeId, cy, cm);
    setEditingKPI(null);
    showToast.success("KPI Updated", "Value saved.");
  };
  const stats = getMonthlyStats();
  getAllTrends();
  const monthsWithData = stats.monthsWithData || [];
  const hasDataForMonth = monthsWithData.some((m) => m.year === selectedYear && m.month === selectedMonth);
  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], {
      type: "text/csv"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `monthly_template_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast.success("Template Downloaded", "CSV template ready to use.");
  };
  const refreshMonthlyData = () => {
    const cy = (/* @__PURE__ */ new Date()).getFullYear();
    const cm = (/* @__PURE__ */ new Date()).getMonth() + 1;
    let count = 0;
    for (const emp of employees) {
      if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) {
        saveMonthlySnapshot(emp.id, cy, cm);
        count++;
      }
    }
    showToast.success("Data Refreshed", `${count} employees updated.`);
  };
  const handleUpload = (file) => {
    setIsUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const processData = (data) => {
      try {
        const headers = Object.keys(data[0] || {});
        const required = ["Employee Name", "KPI Description", "KPI Target", "KPI Actual"];
        const missing = required.filter((r) => !headers.some((h) => h.trim() === r));
        if (missing.length > 0) throw new Error(`Missing columns: ${missing.join(", ")}`);
        const map = /* @__PURE__ */ new Map();
        for (const row of data) {
          const empName = row["Employee Name"]?.trim();
          const empId = row["Employee ID"]?.trim() || `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const category = row["Category"]?.trim() || "General";
          const categoryWeight = Number(row["Category Weight (%)"]) || 0;
          const kpiDesc = row["KPI Description"]?.trim();
          const kpiMetric = row["KPI Metric"]?.trim() || "%";
          const kpiTarget = Number(row["KPI Target"]);
          const kpiWeight = Number(row["KPI Weight (%)"]) || 0;
          const kpiActual = Number(row["KPI Actual"]);
          if (!empName || !kpiDesc || isNaN(kpiTarget) || isNaN(kpiActual)) continue;
          if (!map.has(empId)) map.set(empId, {
            name: empName,
            categories: /* @__PURE__ */ new Map()
          });
          const emp = map.get(empId);
          if (!emp.categories.has(category)) emp.categories.set(category, {
            weight: categoryWeight,
            kpis: []
          });
          emp.categories.get(category).kpis.push({
            description: kpiDesc,
            metric: kpiMetric,
            target: kpiTarget,
            actual: kpiActual,
            weight: kpiWeight
          });
        }
        const updated = [...employees];
        let newCount = 0, updateCount = 0;
        for (const [empId, empData] of map) {
          const categories = [];
          for (const [catName, catData] of empData.categories) {
            categories.push({
              id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: catName,
              weight: catData.weight || 0,
              kpis: catData.kpis.map((k) => ({
                id: `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                description: k.description,
                metric: k.metric,
                target: k.target,
                actual: k.actual,
                weight: k.weight
              }))
            });
          }
          const idx = updated.findIndex((e) => e.name === empData.name);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              categories,
              kpis: []
            };
            updateCount++;
          } else {
            updated.push({
              id: empId,
              name: empData.name,
              email: "",
              jobGrade: "4",
              department: "",
              role: "",
              isAdjunct: false,
              isSalesRole: false,
              joinDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              monthsWorked: 12,
              kpis: [],
              categories
            });
            newCount++;
          }
        }
        setEmployees(updated);
        for (const emp of updated) {
          if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) saveMonthlySnapshot(emp.id, selectedYear, selectedMonth);
        }
        showToast.success("Upload Complete", `${map.size} employees (${newCount} new, ${updateCount} updated).`);
      } catch (error) {
        showToast.error("Upload Failed", error.message);
      } finally {
        setIsUploading(false);
      }
    };
    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data?.length > 0) processData(result.data);
          else {
            showToast.error("Upload Failed", "No data found");
            setIsUploading(false);
          }
        },
        error: (err) => {
          showToast.error("Upload Failed", err.message);
          setIsUploading(false);
        }
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result);
          const workbook = XLSX.read(data, {
            type: "array"
          });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          if (json?.length > 0) processData(json);
          else {
            showToast.error("Upload Failed", "No data found");
            setIsUploading(false);
          }
        } catch (err) {
          showToast.error("Upload Failed", err.message);
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast.error("Upload Failed", "Use CSV or Excel (.xlsx)");
      setIsUploading(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };
  const allTriggers = useMemo(() => {
    try {
      return detectTriggers();
    } catch {
      return {
        pip: [],
        probation: [],
        managementAction: [],
        total: 0
      };
    }
  }, [detectTriggers]);
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Monthly Performance", description: "Upload CSV/Excel monthly data to track trends, identify rising stars, and flag underachievers.", icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: refreshMonthlyData, className: "gap-2", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
      " Refresh"
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(SectionCard, { title: "Upload Monthly Data", description: `Target: ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric"
    })}`, icon: /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }), action: hasDataForMonth && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
      " Data exists"
    ] }), children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
            " Year"
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
              length: 5
            }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() + i).map((y) => /* @__PURE__ */ jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
            " Month"
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: String(selectedMonth), onValueChange: (v) => setSelectedMonth(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
              length: 12
            }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsx(SelectItem, { value: String(m), children: new Date(2e3, m - 1, 1).toLocaleString("default", {
              month: "long"
            }) }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
            " Template"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: downloadTemplate, className: "w-full h-10 gap-2", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            " Download CSV"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
            " Upload"
          ] }),
          /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: ".csv,.xlsx,.xls", hidden: true, onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          } }),
          /* @__PURE__ */ jsx(Button, { onClick: () => fileRef.current?.click(), disabled: isUploading, className: "w-full h-10 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: isUploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Uploading..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            " Choose File"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-blue-500/5 border border-blue-500/20 p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-blue-800 dark:text-blue-300 space-y-0.5", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Upload instructions" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-0.5", children: [
            /* @__PURE__ */ jsx("li", { children: "Download the template CSV above" }),
            /* @__PURE__ */ jsx("li", { children: "Fill in employee data (including KPI Weight %) for the selected month" }),
            /* @__PURE__ */ jsx("li", { children: "KPI weights within each category must sum to 100%" }),
            /* @__PURE__ */ jsx("li", { children: "Upload — data will be stored for the chosen period" })
          ] })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), label: "Tracked Employees", value: stats.totalEmployees, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(stats.avgMultiplier, 2), accent: "info", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), label: "Rising Stars", value: stats.risingStars.length, sub: stats.risingStars.slice(0, 2).join(", ") || "None yet", accent: "success", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }), label: "Underachievers", value: stats.underachievers.length, sub: stats.underachievers.slice(0, 2).join(", ") || "None yet", accent: "danger", size: "large", pulse: stats.underachievers.length > 0 ? "red" : "none" })
    ] }),
    allTriggers.total > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Performance Alerts & Triggers", description: `${allTriggers.total} alert${allTriggers.total > 1 ? "s" : ""} require${allTriggers.total === 1 ? "s" : ""} attention`, icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-amber-600" }), children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      allTriggers.pip.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-amber-700 dark:text-amber-400", children: "PIP Required" }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", children: allTriggers.pip.length })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: allTriggers.pip.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-amber-800 dark:text-amber-300", children: t.employeeName }),
          /* @__PURE__ */ jsx("span", { className: "text-amber-700 dark:text-amber-400 ml-2", children: t.message })
        ] }, i)) })
      ] }),
      allTriggers.probation.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-orange-700 dark:text-orange-400", children: "Probation Period" }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30", children: allTriggers.probation.length })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: allTriggers.probation.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-orange-800 dark:text-orange-300", children: t.employeeName }),
          /* @__PURE__ */ jsx("span", { className: "text-orange-700 dark:text-orange-400 ml-2", children: t.message })
        ] }, i)) })
      ] }),
      allTriggers.managementAction.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-red-700 dark:text-red-400", children: "Management Action Required" }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30", children: allTriggers.managementAction.length })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: allTriggers.managementAction.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-red-800 dark:text-red-300", children: t.employeeName }),
          /* @__PURE__ */ jsx("span", { className: "text-red-700 dark:text-red-400 ml-2", children: t.message })
        ] }, i)) })
      ] })
    ] }) }) }),
    monthsWithData.length > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Available Months", description: "Click a month to load it, or delete to remove its data", icon: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: monthsWithData.map((m) => {
      const isActive = selectedYear === m.year && selectedMonth === m.month;
      return /* @__PURE__ */ jsxs("div", { className: `group flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-lg border transition-all ${isActive ? "bg-primary/10 border-primary/40 text-primary" : "bg-background border-border hover:bg-accent/50"}`, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => {
          setSelectedYear(m.year);
          setSelectedMonth(m.month);
        }, className: "text-xs font-medium whitespace-nowrap", children: new Date(m.year, m.month - 1, 1).toLocaleString("default", {
          month: "short",
          year: "numeric"
        }) }),
        /* @__PURE__ */ jsx("button", { onClick: (e) => {
          e.stopPropagation();
          if (confirm(`Delete data for ${m.month}/${m.year}?`)) {
            const data = monthlyData.filter((d) => d.year === m.year && d.month === m.month);
            for (const d of data) deleteMonthlyData(d.employeeId, d.year, d.month);
            showToast.success("Data Deleted", `${m.month}/${m.year} removed.`);
          }
        }, className: "w-6 h-6 rounded-md flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-opacity", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
      ] }, `${m.year}-${m.month}`);
    }) }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(SectionCard, { title: "Employee Performance Trends", description: "Click an employee to expand KPI details and edit values", icon: /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: employees.filter((e) => !e.isAdjunct).length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6" }), title: "No employees", description: "Upload a file or add employees to start tracking." }) : employees.filter((e) => !e.isAdjunct).map((emp, idx) => {
      const trend = getPerformanceTrend(emp.id);
      const history = getMonthlyHistory(emp.id);
      const isExpanded = expandedEmployee === emp.id;
      const empTriggers = getTriggersForEmployee(emp.id);
      const hasMgmt = empTriggers.some((t) => t.type === "management_action");
      const hasProb = empTriggers.some((t) => t.type === "probation");
      const hasPip = empTriggers.some((t) => t.type === "pip");
      return /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: Math.min(idx * 0.03, 0.3)
      }, className: "border border-border/60 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setExpandedEmployee(isExpanded ? null : emp.id), className: "w-full p-4 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors text-left", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-wrap", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0", children: emp.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm truncate", children: emp.name }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono text-[10px]", children: emp.jobGrade }),
                trend && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: `text-[10px] gap-1 ${trend.trendDirection === "improving" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : trend.trendDirection === "declining" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" : "bg-muted"}`, children: [
                  trend.trendDirection === "improving" && "Improving",
                  trend.trendDirection === "declining" && "Declining",
                  trend.trendDirection === "stable" && "Stable"
                ] }),
                hasMgmt && /* @__PURE__ */ jsxs(Badge, { className: "bg-red-600 text-white text-[10px] gap-1 animate-pulse", children: [
                  /* @__PURE__ */ jsx(AlertTriangle, { className: "h-2.5 w-2.5" }),
                  "Mgmt Action"
                ] }),
                hasProb && !hasMgmt && /* @__PURE__ */ jsxs(Badge, { className: "bg-orange-500 text-white text-[10px] gap-1", children: [
                  /* @__PURE__ */ jsx(AlertTriangle, { className: "h-2.5 w-2.5" }),
                  "Probation"
                ] }),
                hasPip && !hasProb && !hasMgmt && /* @__PURE__ */ jsxs(Badge, { className: "bg-amber-500 text-white text-[10px] gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-2.5 w-2.5" }),
                  "PIP"
                ] })
              ] }),
              history.length > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                history.length,
                " month",
                history.length > 1 ? "s" : "",
                " of data"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
            trend && /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-base font-bold text-foreground", children: fmtNum(trend.currentScore, 2) }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: "current" })
            ] }),
            /* @__PURE__ */ jsx(ChevronRight, { className: `h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsx(motion.div, { initial: {
          height: 0,
          opacity: 0
        }, animate: {
          height: "auto",
          opacity: 1
        }, exit: {
          height: 0,
          opacity: 0
        }, transition: {
          duration: 0.25
        }, className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-border/50 bg-muted/20", children: history.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Calendar, { className: "h-6 w-6" }), title: "No monthly data", description: "Upload a file to start tracking this employee." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-5", children: [
            /* @__PURE__ */ jsxs(Card, { className: "p-3 bg-background", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Current" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mt-1", children: trend ? fmtNum(trend.currentScore, 3) : "—" })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "p-3 bg-background", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Average" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mt-1", children: trend ? fmtNum(trend.averageScore, 3) : "—" })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "p-3 bg-emerald-500/5 border-emerald-500/20", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400", children: "Best" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400", children: trend ? fmtNum(trend.bestMonth.score, 3) : "—" })
            ] }),
            /* @__PURE__ */ jsxs(Card, { className: "p-3 bg-red-500/5 border-red-500/20", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400", children: "Worst" }),
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold mt-1 text-red-600 dark:text-red-400", children: trend ? fmtNum(trend.worstMonth.score, 3) : "—" })
            ] })
          ] }),
          emp.categories && emp.categories.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Target, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Weighted Category Performance" }),
              /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px] gap-1 bg-muted", children: [
                /* @__PURE__ */ jsx(Pencil, { className: "h-2.5 w-2.5" }),
                " Click numbers to edit"
              ] })
            ] }),
            emp.categories.map((category, catIdx) => {
              let catSum = 0;
              let totalW = 0;
              const kpiDetails = category.kpis.map((kpi) => {
                const target = Number(kpi.target) || 0;
                const actual = Number(kpi.actual) || 0;
                const ratio = target > 0 ? actual / target : 0;
                const weight = Number(kpi.weight) || 0;
                if (target > 0 && weight > 0) {
                  catSum += ratio * weight;
                  totalW += weight;
                }
                return {
                  ...kpi,
                  target,
                  actual,
                  ratio,
                  weight,
                  achievement: ratio * 100
                };
              });
              const finalScore = totalW > 0 ? catSum / totalW * 100 : 0;
              const statusColor = finalScore >= 100 ? "emerald" : finalScore >= 70 ? "blue" : finalScore >= 50 ? "amber" : "red";
              return /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: category.name }),
                    /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                      "Weight ",
                      category.weight,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold text-${statusColor}-600 dark:text-${statusColor}-400`, children: [
                    fmtNum(finalScore, 1),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/50", children: kpiDetails.map((kpi, kIdx) => {
                  const isEditTarget = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "target";
                  const isEditActual = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "actual";
                  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-3 items-center p-3 text-sm", children: [
                    /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-4", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: kpi.description }) }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-3 md:col-span-2 text-xs", children: [
                      /* @__PURE__ */ jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Target" }),
                      isEditTarget ? /* @__PURE__ */ jsx(Input, { type: "number", className: "h-7 text-xs", value: editingKPI?.value || 0, onChange: (e) => setEditingKPI((p) => p ? {
                        ...p,
                        value: Number(e.target.value)
                      } : null), onBlur: saveEdit, onKeyDown: (e) => e.key === "Enter" && saveEdit(), autoFocus: true }) : /* @__PURE__ */ jsxs("button", { className: "hover:bg-accent/50 rounded px-1.5 py-0.5 w-full text-left hover:text-primary transition-colors", onClick: () => startEditing(emp.id, category.id, kpi.id, "target", kpi.target), children: [
                        fmtNum(kpi.target),
                        " ",
                        kpi.metric
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-3 md:col-span-2 text-xs", children: [
                      /* @__PURE__ */ jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Actual" }),
                      isEditActual ? /* @__PURE__ */ jsx(Input, { type: "number", className: "h-7 text-xs", value: editingKPI?.value || 0, onChange: (e) => setEditingKPI((p) => p ? {
                        ...p,
                        value: Number(e.target.value)
                      } : null), onBlur: saveEdit, onKeyDown: (e) => e.key === "Enter" && saveEdit(), autoFocus: true }) : /* @__PURE__ */ jsxs("button", { className: "hover:bg-accent/50 rounded px-1.5 py-0.5 w-full text-left hover:text-primary transition-colors", onClick: () => startEditing(emp.id, category.id, kpi.id, "actual", kpi.actual), children: [
                        fmtNum(kpi.actual),
                        " ",
                        kpi.metric
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-3 md:col-span-2 text-xs", children: [
                      /* @__PURE__ */ jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Weight" }),
                      /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
                        kpi.weight,
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-3 md:col-span-2 text-right", children: [
                      /* @__PURE__ */ jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Score" }),
                      /* @__PURE__ */ jsxs("span", { className: `font-bold text-sm ${kpi.achievement >= 100 ? "text-emerald-600 dark:text-emerald-400" : kpi.achievement >= 70 ? "text-blue-600 dark:text-blue-400" : kpi.achievement >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`, children: [
                        fmtNum(kpi.achievement, 1),
                        "%"
                      ] })
                    ] })
                  ] }, kIdx);
                }) })
              ] }, catIdx);
            })
          ] }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Target, { className: "h-6 w-6" }), title: "No categories", description: "This employee has no KPI categories assigned." })
        ] }) }) }) })
      ] }, emp.id);
    }) }) }) })
  ] });
}
export {
  MonthlyPage as component
};
