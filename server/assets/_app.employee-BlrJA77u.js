import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { u as useP4P, c as fmtNum, g as getCurrentUser, h as uploadProofFile } from "./router-CQTT2apA.js";
import { C as Card } from "./card-RGlIzTYo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-D_u1EXWn.js";
import { E as EmptyState, s as staggerContainer, P as PageHeader, f as fadeUp } from "./empty-state-BKzet6q0.js";
import { S as StatCard } from "./stat-card-CEuC_AAE.js";
import { S as SectionCard } from "./section-card-CU3fEC1l.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { AlertCircle, Target, Calendar, BarChart3, CheckCircle, Clock, Send, Info, Award, Activity, PieChart, Users, Paperclip, MessageSquare, Upload, ChevronRight, File, X, Star, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, AreaChart, Area } from "recharts";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
const COLORS = {
  primary: "hsl(221 70% 50%)"
};
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px"
};
function EmployeePortal() {
  const navigate = useNavigate();
  const {
    employees,
    setEmployees,
    getMonthlyHistory,
    submitAppraisal,
    saveKPIProof
  } = useP4P();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [editingActuals, setEditingActuals] = useState({});
  const [kpiComments, setKpiComments] = useState({});
  const [kpiProofs, setKpiProofs] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [selectedMonth, setSelectedMonth] = useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [viewMode, setViewMode] = useState("month");
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState(null);
  const fileInputRefs = useRef({});
  const getCurrentPeriod = () => {
    const now = /* @__PURE__ */ new Date();
    const month = now.getMonth() + 1;
    const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
    return `${quarter} ${now.getFullYear()}`;
  };
  const yearData = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id).filter((d) => d.year === selectedYear).sort((a, b) => a.month - b.month);
  }, [employee, getMonthlyHistory, selectedYear]);
  const trendData = useMemo(() => {
    if (!employee) return [];
    const sorted = [...getMonthlyHistory(employee.id)].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    return sorted.slice(-6).map((d) => ({
      month: `${d.month}/${d.year}`,
      score: d.performanceMultiplier,
      label: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })}`
    }));
  }, [employee, getMonthlyHistory]);
  const monthOverMonth = useMemo(() => {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1].score;
    const prev = trendData[trendData.length - 2].score;
    if (prev === 0) return null;
    return (last - prev) / prev * 100;
  }, [trendData]);
  const yearStats = useMemo(() => {
    if (yearData.length === 0) return null;
    const scores = yearData.map((d) => d.performanceMultiplier);
    return {
      best: Math.max(...scores),
      worst: Math.min(...scores),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length
    };
  }, [yearData]);
  const getPerformanceBand = (score) => {
    if (score >= 1.2) return {
      label: "Exceptional",
      full: "Exceptional Performer",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
      icon: Star,
      pulse: "purple",
      accent: "purple"
    };
    if (score >= 1) return {
      label: "Exceeds Expectations",
      full: "Exceeds Expectations",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: TrendingUp,
      pulse: "emerald",
      accent: "success"
    };
    if (score >= 0.8) return {
      label: "Meets Expectations",
      full: "Meets Expectations",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: Target,
      pulse: "blue",
      accent: "primary"
    };
    if (score >= 0.6) return {
      label: "Needs Improvement",
      full: "Needs Improvement",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: Clock,
      pulse: "amber",
      accent: "warning"
    };
    return {
      label: "PIP",
      full: "Performance Improvement Plan",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
      icon: AlertCircle,
      pulse: "red",
      accent: "danger"
    };
  };
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
        if (!emp) {
          setError("No employee record found for your email. Please contact HR.");
          setLoading(false);
          return;
        }
        setEmployee(emp);
        setLoading(false);
      } catch {
        setError("Failed to load your profile.");
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);
  useEffect(() => {
    if (!employee || viewMode === "year") {
      setSelectedSnapshot(null);
      return;
    }
    const snap = getMonthlyHistory(employee.id).find((d) => d.year === selectedYear && d.month === selectedMonth);
    setSelectedSnapshot(snap || null);
    const actuals = {};
    const comments = {};
    const proofs = {};
    if (snap) {
      for (const cat of snap.categories || []) {
        for (const kpi of cat.kpis) {
          actuals[kpi.id] = kpi.actual || 0;
          comments[kpi.id] = kpi.comment || "";
          proofs[kpi.id] = kpi.proof || [];
        }
      }
    } else {
      for (const cat of employee.categories || []) {
        for (const kpi of cat.kpis) {
          actuals[kpi.id] = 0;
          comments[kpi.id] = "";
          proofs[kpi.id] = [];
        }
      }
    }
    setEditingActuals(actuals);
    setKpiComments(comments);
    setKpiProofs(proofs);
  }, [employee, selectedYear, selectedMonth, getMonthlyHistory, viewMode]);
  const updateActual = (kpiId, value) => setEditingActuals((prev) => ({
    ...prev,
    [kpiId]: value
  }));
  const updateComment = (kpiId, value) => setKpiComments((prev) => ({
    ...prev,
    [kpiId]: value
  }));
  const handleFileUpload = async (kpiId, files) => {
    if (!files || files.length === 0 || !employee) return;
    setUploadingFiles((prev) => ({
      ...prev,
      [kpiId]: true
    }));
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadProofFile(employee.id, kpiId, file);
        if (result) {
          const fileData = {
            id: result.id,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            fileType: result.fileType,
            fileSize: file.size,
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          uploaded.push(fileData);
          saveKPIProof(employee.id, kpiId, fileData);
        }
      }
      setKpiProofs((prev) => ({
        ...prev,
        [kpiId]: [...prev[kpiId] || [], ...uploaded]
      }));
      showToast.success(`Uploaded ${uploaded.length} file(s)`, "Proof uploaded.");
    } catch {
      showToast.error("Upload Failed", "Please try again.");
    } finally {
      setUploadingFiles((prev) => ({
        ...prev,
        [kpiId]: false
      }));
      if (fileInputRefs.current[kpiId]) fileInputRefs.current[kpiId].value = "";
    }
  };
  const removeProof = (kpiId, proofId) => {
    setKpiProofs((prev) => ({
      ...prev,
      [kpiId]: (prev[kpiId] || []).filter((p) => p.id !== proofId)
    }));
    if (!employee) return;
    setEmployees(employees.map((emp) => {
      if (emp.id !== employee.id) return emp;
      return {
        ...emp,
        categories: (emp.categories || []).map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => {
            if (k.id !== kpiId) return k;
            return {
              ...k,
              proof: (k.proof || []).filter((p) => p.id !== proofId)
            };
          })
        }))
      };
    }));
  };
  const handleSubmitForAppraisal = () => {
    if (!employee) return;
    if (!employee.categories || employee.categories.length === 0) {
      showToast.warning("No KPIs", "You don't have any KPIs to submit.");
      return;
    }
    const updated = employees.map((emp) => {
      if (emp.id !== employee.id) return emp;
      return {
        ...emp,
        categories: (emp.categories || []).map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({
            ...k,
            actual: editingActuals[k.id] ?? 0,
            comment: kpiComments[k.id] ?? "",
            proof: kpiProofs[k.id] || [],
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }))
        }))
      };
    });
    setEmployees(updated);
    const refreshed = updated.find((e) => e.id === employee.id);
    if (refreshed) setEmployee(refreshed);
    const period = getCurrentPeriod();
    setSubmittingAppraisal(true);
    try {
      submitAppraisal(employee.id, period, selectedYear, selectedMonth);
      showToast.success("Appraisal Submitted!", `Submitted for ${period}.`);
    } catch (err) {
      showToast.error("Submission Failed", err.message);
    } finally {
      setSubmittingAppraisal(false);
    }
  };
  let displayCategories = employee?.categories || [];
  let overallPercent = 0;
  if (employee) {
    if (viewMode === "year" && yearData.length > 0 && employee.categories) {
      const catAvg = {};
      employee.categories.forEach((c) => catAvg[c.id] = {
        total: 0,
        count: 0
      });
      for (const snap of yearData) {
        for (const snapCat of snap.categories || []) {
          if (catAvg[snapCat.id]) {
            let sum = 0, count = 0;
            for (const kpi of snapCat.kpis) {
              const target = kpi.target || 1;
              sum += target > 0 ? kpi.actual / target : 0;
              count++;
            }
            catAvg[snapCat.id].total += count > 0 ? sum / count : 0;
            catAvg[snapCat.id].count++;
          }
        }
      }
      let tw = 0, twt = 0;
      for (const cat of employee.categories) {
        const avg = catAvg[cat.id];
        const score = avg && avg.count > 0 ? avg.total / avg.count : 0;
        const w = cat.weight / 100;
        tw += score * w;
        twt += w;
      }
      overallPercent = twt > 0 ? tw / twt * 100 : 0;
    } else {
      const cats = employee.categories || [];
      displayCategories = cats;
      let tw = 0, twt = 0;
      for (const cat of cats) {
        let sum = 0, count = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = editingActuals[kpi.id] ?? 0;
          sum += target > 0 ? actual / target : 0;
          count++;
        }
        const score = count > 0 ? sum / count : 0;
        const w = cat.weight / 100;
        tw += score * w;
        twt += w;
      }
      overallPercent = twt > 0 ? tw / twt * 100 : 0;
    }
  }
  const band = getPerformanceBand(overallPercent / 100);
  const BandIcon = band.icon;
  const hasApprovedData = !!selectedSnapshot;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading your profile..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6" }), title: "Unable to load", description: error, action: /* @__PURE__ */ jsx(Button, { onClick: () => navigate({
      to: "/logout"
    }), children: "Logout" }) });
  }
  if (!employee) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6" }), title: "No data found" });
  }
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "My KPIs", description: `${employee.name} · ${employee.department} · ${employee.role}`, icon: /* @__PURE__ */ jsx(Target, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide font-semibold text-muted-foreground", children: viewMode === "year" ? `Year ${selectedYear} Avg` : "Overall Score" }),
        /* @__PURE__ */ jsxs("div", { className: `text-3xl font-bold ${band.color}`, children: [
          fmtNum(overallPercent, 1),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `px-4 py-2.5 rounded-xl text-sm font-bold border-2 flex items-center gap-2 ${band.bg} ${band.color} pulse-${band.pulse}`, children: [
        /* @__PURE__ */ jsx(BandIcon, { className: "h-4 w-4" }),
        band.full
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(Tabs, { value: viewMode, onValueChange: (v) => setViewMode(v), children: /* @__PURE__ */ jsxs(TabsList, { className: "grid grid-cols-2", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "month", className: "gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
          " Monthly"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "year", className: "gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(BarChart3, { className: "h-3.5 w-3.5" }),
          " Yearly"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-28 h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
            length: 5
          }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - 2 + i).map((y) => /* @__PURE__ */ jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        viewMode === "month" && /* @__PURE__ */ jsxs(Select, { value: String(selectedMonth), onValueChange: (v) => setSelectedMonth(Number(v)), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-36 h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
            length: 12
          }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsx(SelectItem, { value: String(m), children: new Date(2e3, m - 1, 1).toLocaleString("default", {
            month: "long"
          }) }, m)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 ml-auto", children: [
        viewMode === "month" && (hasApprovedData ? /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
          " Approved"
        ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-muted gap-1.5", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
          " Not submitted"
        ] })),
        /* @__PURE__ */ jsx(Button, { onClick: handleSubmitForAppraisal, disabled: submittingAppraisal, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: submittingAppraisal ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
          "Submitting"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
          " Submit for Appraisal"
        ] }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: `p-4 flex items-start gap-3 ${hasApprovedData ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"}`, children: [
      hasApprovedData ? /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-emerald-600 mt-0.5 shrink-0" }) : /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-blue-600 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsx("p", { className: `text-xs leading-relaxed ${hasApprovedData ? "text-emerald-800 dark:text-emerald-300" : "text-blue-800 dark:text-blue-300"}`, children: hasApprovedData ? "This period has approved data. You can edit and resubmit — new approval will replace the old data." : "Enter your actuals, add comments, and upload proof. Click Submit for Appraisal when ready." })
    ] }) }),
    viewMode === "year" && yearStats ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }), label: "Months Tracked", value: yearStats.count, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), label: "Best Month", value: fmtNum(yearStats.best, 2), accent: "success", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }), label: "Worst Month", value: fmtNum(yearStats.worst, 2), accent: "danger", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }), label: "Year Average", value: fmtNum(yearStats.avg, 2), accent: "info", size: "large" })
    ] }) : viewMode === "month" ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }), label: "Overall Score", value: `${fmtNum(overallPercent, 1)}%`, sub: monthOverMonth !== null ? `${monthOverMonth >= 0 ? "+" : ""}${monthOverMonth.toFixed(1)}% MoM` : "No data", trend: monthOverMonth ?? void 0, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(PieChart, { className: "h-4 w-4" }), label: "Categories", value: displayCategories.length, accent: "purple", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), label: "Total KPIs", value: displayCategories.reduce((s, c) => s + c.kpis.length, 0), accent: "info", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(BandIcon, { className: "h-4 w-4" }), label: "Performance Status", value: band.label, sub: band.full, accent: band.accent, size: "large", pulse: band.pulse })
    ] }) : null,
    viewMode === "year" && yearData.length > 0 && /* @__PURE__ */ jsx(SectionCard, { title: `Monthly Breakdown · ${selectedYear}`, description: `${yearData.length} months`, icon: /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: yearData.map((d) => ({
      label: new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      }),
      score: d.performanceMultiplier
    })), children: [
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "label", fontSize: 11, axisLine: false, tickLine: false }),
      /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
      /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [fmtNum(v, 2), "Score"] }),
      /* @__PURE__ */ jsx(Bar, { dataKey: "score", fill: COLORS.primary, radius: [6, 6, 0, 0] })
    ] }) }) }) }),
    viewMode === "month" && trendData.length > 1 && /* @__PURE__ */ jsx(SectionCard, { title: "Performance Trend", description: `Last ${trendData.length} months`, icon: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }), noPadding: true, children: /* @__PURE__ */ jsx("div", { className: "p-4 h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: trendData, children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: COLORS.primary, stopOpacity: 0.35 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: COLORS.primary, stopOpacity: 0.02 })
      ] }) }),
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1, vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "label", fontSize: 11, axisLine: false, tickLine: false }),
      /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 11, axisLine: false, tickLine: false, width: 30 }),
      /* @__PURE__ */ jsx(Tooltip, { contentStyle: tooltipStyle, formatter: (v) => [fmtNum(v, 2), "Score"] }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "score", stroke: COLORS.primary, strokeWidth: 2.5, fill: "url(#trendGrad)", dot: {
        r: 4,
        strokeWidth: 2,
        fill: "#fff"
      }, activeDot: {
        r: 6
      } })
    ] }) }) }) }),
    displayCategories.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: displayCategories.map((category, idx) => {
      let catScore = 0;
      let totalWeight = 0;
      const kpiDetails = category.kpis.map((kpi) => {
        const target = kpi.target || 0;
        const actual = editingActuals[kpi.id] ?? 0;
        const comment = kpiComments[kpi.id] ?? "";
        const proof = kpiProofs[kpi.id] || [];
        const ratio = target > 0 ? actual / target : 0;
        const achievement = ratio * 100;
        const weight = kpi.weight || 100;
        if (target > 0) {
          catScore += ratio * weight;
          totalWeight += weight;
        }
        return {
          ...kpi,
          actual,
          achievement,
          comment,
          proof
        };
      });
      const finalScore = totalWeight > 0 ? catScore / totalWeight * 100 : 0;
      const statusColor = finalScore >= 100 ? "emerald" : finalScore >= 70 ? "blue" : finalScore >= 50 ? "amber" : "red";
      return /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl bg-${statusColor}-500/10 text-${statusColor}-600 dark:text-${statusColor}-400 flex items-center justify-center font-bold text-sm shrink-0`, children: idx + 1 }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base text-foreground truncate", children: category.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                category.kpis.length,
                " KPIs · Weight ",
                category.weight,
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
            hasApprovedData && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]", children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
              " Approved"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold text-${statusColor}-600 dark:text-${statusColor}-400`, children: [
              fmtNum(finalScore, 1),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full bg-muted h-1.5 overflow-hidden", children: /* @__PURE__ */ jsx(motion.div, { initial: {
          width: 0
        }, animate: {
          width: `${Math.min(100, finalScore)}%`
        }, transition: {
          duration: 0.8
        }, className: `h-full bg-${statusColor}-500` }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/50", children: kpiDetails.map((kpi) => {
          const isUploading = uploadingFiles[kpi.id] || false;
          const isExpanded = expandedKpi === kpi.id;
          const achColor = kpi.achievement >= 100 ? "text-emerald-600 dark:text-emerald-400" : kpi.achievement >= 70 ? "text-blue-600 dark:text-blue-400" : kpi.achievement >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
          return /* @__PURE__ */ jsxs("div", { className: "p-5 hover:bg-accent/30 transition-colors", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-3 items-start", children: [
              /* @__PURE__ */ jsxs("div", { className: "col-span-12 sm:col-span-5 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground break-words whitespace-normal leading-relaxed", children: kpi.description }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap", children: [
                    "Target: ",
                    /* @__PURE__ */ jsxs("strong", { className: "text-foreground", children: [
                      fmtNum(kpi.target),
                      " ",
                      kpi.metric
                    ] })
                  ] }),
                  kpi.measurementSource && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-border/60", children: "·" }),
                    /* @__PURE__ */ jsxs("span", { className: "break-words whitespace-normal", children: [
                      "Source: ",
                      kpi.measurementSource
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-span-4 sm:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1 sm:hidden", children: "Actual" }),
                /* @__PURE__ */ jsx(Input, { type: "number", className: "h-9 text-sm", value: editingActuals[kpi.id] ?? 0, onChange: (e) => updateActual(kpi.id, Number(e.target.value)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-span-4 sm:col-span-1 text-center", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1 sm:hidden", children: "Score" }),
                /* @__PURE__ */ jsxs("div", { className: `text-base font-bold ${achColor}`, children: [
                  fmtNum(kpi.achievement, 1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-span-4 sm:col-span-2 flex items-center gap-1.5", children: [
                kpi.proof.length > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px] gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5", children: [
                  /* @__PURE__ */ jsx(Paperclip, { className: "h-2.5 w-2.5" }),
                  kpi.proof.length
                ] }),
                kpi.comment && kpi.comment.trim().length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-1.5", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-2.5 w-2.5" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-span-12 sm:col-span-2 flex items-center justify-end gap-1.5", children: [
                /* @__PURE__ */ jsx("input", { type: "file", ref: (el) => {
                  fileInputRefs.current[kpi.id] = el;
                }, className: "hidden", multiple: true, onChange: (e) => handleFileUpload(kpi.id, e.target.files) }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "h-8 gap-1.5 text-xs", onClick: () => fileInputRefs.current[kpi.id]?.click(), disabled: isUploading, children: [
                  isUploading ? /* @__PURE__ */ jsx("div", { className: "w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3" }),
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Proof" })
                ] }),
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => setExpandedKpi(isExpanded ? null : kpi.id), children: /* @__PURE__ */ jsx(ChevronRight, { className: `h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}` }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsx(motion.div, { initial: {
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
            }, className: "overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "pt-4 mt-4 border-t border-border/50 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
                  /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
                  " Comment"
                ] }),
                /* @__PURE__ */ jsx(Input, { type: "text", className: "h-9 text-sm", placeholder: "Add a comment for this KPI...", value: kpiComments[kpi.id] ?? "", onChange: (e) => updateComment(kpi.id, e.target.value) })
              ] }),
              kpi.proof.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
                  /* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3" }),
                  " Proof Files"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: kpi.proof.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1.5 rounded-lg text-xs", children: [
                  /* @__PURE__ */ jsx(File, { className: "h-3 w-3 shrink-0" }),
                  /* @__PURE__ */ jsx("a", { href: p.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "hover:underline truncate max-w-[180px]", children: p.fileName }),
                  /* @__PURE__ */ jsx("button", { onClick: () => removeProof(kpi.id, p.id), className: "text-red-500 hover:text-red-700 ml-0.5", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
                ] }, p.id)) })
              ] })
            ] }) }) })
          ] }, kpi.id);
        }) })
      ] }) }, idx);
    }) }) : /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Target, { className: "h-6 w-6" }), title: "No KPIs assigned", description: "Contact HR to have KPIs assigned to your profile." }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-xs text-muted-foreground max-w-md", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("span", { children: "Data saves only after manager approval. Submit any month/year — resubmit anytime." })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: handleSubmitForAppraisal, disabled: submittingAppraisal, size: "lg", className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20", children: submittingAppraisal ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
        "Submitting..."
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
        "Submit for Appraisal (",
        getCurrentPeriod(),
        ")"
      ] }) })
    ] }) })
  ] });
}
export {
  EmployeePortal as component
};
