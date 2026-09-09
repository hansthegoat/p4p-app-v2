import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { u as useP4P, f as fmtNum } from "./store-Dy84gyCY.js";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { AlertCircle, Eye, Send, Info, Target, Paperclip, Upload, File, X, Star, TrendingUp, Clock } from "lucide-react";
import { g as getCurrentUser, u as uploadProofFile } from "./router-ykR6owpd.js";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, AreaChart, Area } from "recharts";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "@supabase/supabase-js";
function EmployeePortal() {
  const navigate = useNavigate();
  const {
    employees,
    setEmployees,
    getMonthlyHistory,
    submitAppraisal,
    saveKPIProof,
    saveKPIComment
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
  const fileInputRefs = useRef({});
  const getCurrentPeriod = () => {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let quarter = "";
    if (month <= 3) quarter = "Q1";
    else if (month <= 6) quarter = "Q2";
    else if (month <= 9) quarter = "Q3";
    else quarter = "Q4";
    return `${quarter} ${year}`;
  };
  const yearData = useMemo(() => {
    if (!employee) return [];
    const history = getMonthlyHistory(employee.id);
    const yearHistory = history.filter((d) => d.year === selectedYear).sort((a, b) => a.month - b.month);
    return yearHistory;
  }, [employee, getMonthlyHistory, selectedYear]);
  const trendData = useMemo(() => {
    if (!employee) return [];
    const history = getMonthlyHistory(employee.id);
    const sorted = [...history].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const last6 = sorted.slice(-6);
    return last6.map((d) => ({
      month: `${d.month}/${d.year}`,
      score: d.performanceMultiplier,
      label: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", {
        month: "short"
      })} ${d.year}`
    }));
  }, [employee, getMonthlyHistory]);
  const monthOverMonth = useMemo(() => {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1].score;
    const prev = trendData[trendData.length - 2].score;
    if (prev === 0) return null;
    const change = (last - prev) / prev * 100;
    return change;
  }, [trendData]);
  const yearStats = useMemo(() => {
    if (yearData.length === 0) return null;
    const scores = yearData.map((d) => d.performanceMultiplier);
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      best,
      worst,
      avg,
      count: scores.length
    };
  }, [yearData]);
  const getPerformanceBand = (score) => {
    if (score >= 1.2) return {
      label: "Exceptional",
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      icon: Star
    };
    if (score >= 1) return {
      label: "Exceeds Expectations",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      icon: TrendingUp
    };
    if (score >= 0.8) return {
      label: "Meets Expectations",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      icon: Target
    };
    if (score >= 0.6) return {
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
        const now = /* @__PURE__ */ new Date();
        setSelectedYear(now.getFullYear());
        setSelectedMonth(now.getMonth() + 1);
        setLoading(false);
      } catch (err) {
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
    const history = getMonthlyHistory(employee.id);
    const snap = history.find((d) => d.year === selectedYear && d.month === selectedMonth);
    setSelectedSnapshot(snap || null);
    const categories = employee.categories || [];
    if (snap) {
      const actuals = {};
      const comments = {};
      const proofs = {};
      for (const cat of snap.categories || []) {
        for (const kpi of cat.kpis) {
          actuals[kpi.id] = kpi.actual || 0;
          comments[kpi.id] = kpi.comment || "";
          proofs[kpi.id] = kpi.proof || [];
        }
      }
      setEditingActuals(actuals);
      setKpiComments(comments);
      setKpiProofs(proofs);
    } else {
      const emptyActuals = {};
      const emptyComments = {};
      const emptyProofs = {};
      for (const cat of categories) {
        for (const kpi of cat.kpis) {
          emptyActuals[kpi.id] = 0;
          emptyComments[kpi.id] = "";
          emptyProofs[kpi.id] = [];
        }
      }
      setEditingActuals(emptyActuals);
      setKpiComments(emptyComments);
      setKpiProofs(emptyProofs);
    }
  }, [employee, selectedYear, selectedMonth, getMonthlyHistory, viewMode]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "Loading your profile..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-600", children: error }),
      /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: () => navigate({
        to: "/logout"
      }), children: "Logout" })
    ] });
  }
  if (!employee) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "No employee data found." });
  }
  const updateActual = (kpiId, value) => {
    setEditingActuals((prev) => ({
      ...prev,
      [kpiId]: value
    }));
  };
  const updateComment = (kpiId, value) => {
    setKpiComments((prev) => ({
      ...prev,
      [kpiId]: value
    }));
  };
  const handleFileUpload = async (kpiId, files) => {
    if (!files || files.length === 0 || !employee) return;
    setUploadingFiles((prev) => ({
      ...prev,
      [kpiId]: true
    }));
    try {
      const uploadedFiles = [];
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
          uploadedFiles.push(fileData);
        }
      }
      setKpiProofs((prev) => {
        const current = prev[kpiId] || [];
        return {
          ...prev,
          [kpiId]: [...current, ...uploadedFiles]
        };
      });
      for (const fileData of uploadedFiles) {
        saveKPIProof(employee.id, kpiId, fileData);
      }
      alert(`✅ ${uploadedFiles.length} file(s) uploaded successfully!`);
    } catch (err) {
      alert("❌ Failed to upload files. Please try again.");
    } finally {
      setUploadingFiles((prev) => ({
        ...prev,
        [kpiId]: false
      }));
      if (fileInputRefs.current[kpiId]) {
        fileInputRefs.current[kpiId].value = "";
      }
    }
  };
  const removeProof = (kpiId, proofId) => {
    setKpiProofs((prev) => ({
      ...prev,
      [kpiId]: (prev[kpiId] || []).filter((p) => p.id !== proofId)
    }));
    if (!employee) return;
    const updatedEmployees = employees.map((emp) => {
      if (emp.id !== employee.id) return emp;
      const updatedCategories = (emp.categories || []).map((cat) => ({
        ...cat,
        kpis: cat.kpis.map((k) => {
          if (k.id !== kpiId) return k;
          return {
            ...k,
            proof: (k.proof || []).filter((p) => p.id !== proofId)
          };
        })
      }));
      return {
        ...emp,
        categories: updatedCategories
      };
    });
    setEmployees(updatedEmployees);
  };
  const handleSubmitForAppraisal = () => {
    if (!employee) return;
    if (!employee.categories || employee.categories.length === 0) {
      alert("You don't have any KPIs to submit. Please contact HR.");
      return;
    }
    const updatedEmployees = employees.map((emp) => {
      if (emp.id !== employee.id) return emp;
      const updatedCategories = (emp.categories || []).map((cat) => ({
        ...cat,
        kpis: cat.kpis.map((k) => ({
          ...k,
          actual: editingActuals[k.id] !== void 0 ? editingActuals[k.id] : 0,
          comment: kpiComments[k.id] !== void 0 ? kpiComments[k.id] : "",
          proof: kpiProofs[k.id] || [],
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }))
      }));
      return {
        ...emp,
        categories: updatedCategories
      };
    });
    setEmployees(updatedEmployees);
    const updatedEmp = updatedEmployees.find((e) => e.id === employee.id);
    if (updatedEmp) setEmployee(updatedEmp);
    const period = getCurrentPeriod();
    setSubmittingAppraisal(true);
    try {
      submitAppraisal(employee.id, period, selectedYear, selectedMonth);
      alert(`✅ Appraisal submitted for ${period} (${selectedMonth}/${selectedYear})! Your manager will review it.`);
    } catch (error2) {
      alert(`❌ Failed to submit: ${error2.message}`);
    } finally {
      setSubmittingAppraisal(false);
    }
  };
  let displayCategories = employee.categories || [];
  let overallScore = 0;
  let overallPercent = 0;
  const categoryScores = [];
  if (viewMode === "year") {
    if (yearData.length > 0 && employee.categories) {
      const categoryAverages = {};
      for (const cat of employee.categories) {
        categoryAverages[cat.id] = {
          total: 0,
          count: 0
        };
      }
      for (const snap of yearData) {
        if (snap.categories) {
          for (const snapCat of snap.categories) {
            const catId = snapCat.id;
            if (categoryAverages[catId]) {
              let catSum = 0;
              let catCount = 0;
              for (const kpi of snapCat.kpis) {
                const target = kpi.target || 1;
                const ratio = target > 0 ? kpi.actual / target : 0;
                catSum += ratio;
                catCount++;
              }
              const catScore = catCount > 0 ? catSum / catCount : 0;
              categoryAverages[catId].total += catScore;
              categoryAverages[catId].count++;
            }
          }
        }
      }
      let totalWeightedScore = 0;
      let totalWeight = 0;
      for (const cat of employee.categories) {
        const avg = categoryAverages[cat.id];
        const catScore = avg && avg.count > 0 ? avg.total / avg.count : 0;
        const weight = cat.weight / 100;
        categoryScores.push({
          name: cat.name,
          score: catScore,
          weight: weight * 100
        });
        totalWeightedScore += catScore * weight;
        totalWeight += weight;
      }
      overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      overallPercent = overallScore * 100;
    }
  } else {
    const displayCats = employee.categories || [];
    displayCategories = displayCats;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    if (displayCats.length > 0) {
      for (const cat of displayCats) {
        let catSum = 0;
        let catCount = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = editingActuals[kpi.id] !== void 0 ? editingActuals[kpi.id] : 0;
          const ratio = target > 0 ? actual / target : 0;
          catSum += ratio;
          catCount++;
        }
        const catScore = catCount > 0 ? catSum / catCount : 0;
        const weight = cat.weight / 100;
        categoryScores.push({
          name: cat.name,
          score: catScore,
          weight: weight * 100
        });
        totalWeightedScore += catScore * weight;
        totalWeight += weight;
      }
      overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      overallPercent = overallScore * 100;
    }
  }
  const band = getPerformanceBand(overallScore);
  const BandIcon = band.icon;
  const hasApprovedData = !!selectedSnapshot;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "My KPI's" }),
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
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: viewMode === "year" ? `Year ${selectedYear} Average` : "Overall Score" }),
          /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold ${band.color}`, children: [
            fmtNum(overallPercent, 1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `px-3 py-1.5 rounded-full text-sm font-medium ${band.bg} ${band.color} border flex items-center gap-1.5`, children: [
          /* @__PURE__ */ jsx(BandIcon, { className: "h-4 w-4" }),
          band.label
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-3 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "View:" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 bg-muted p-1 rounded-md", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: viewMode === "year" ? "default" : "ghost", onClick: () => setViewMode("year"), className: "text-xs h-7 px-3", children: "Year View" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: viewMode === "month" ? "default" : "ghost", onClick: () => setViewMode("month"), className: "text-xs h-7 px-3", children: "Monthly View" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        viewMode === "month" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Year" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
              length: 5
            }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - 2 + i).map((y) => /* @__PURE__ */ jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: String(selectedMonth), onValueChange: (v) => setSelectedMonth(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Month" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
              length: 12
            }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsx(SelectItem, { value: String(m), children: new Date(2e3, m - 1, 1).toLocaleString("default", {
              month: "long"
            }) }, m)) })
          ] })
        ] }),
        viewMode === "year" && /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Year" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
            length: 5
          }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - 2 + i).map((y) => /* @__PURE__ */ jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          viewMode === "year" && yearData.length > 0 && `${yearData.length} months of data`,
          viewMode === "month" && selectedSnapshot ? `✅ Approved for ${selectedMonth}/${selectedYear}` : `📝 Not yet approved`
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "default", onClick: handleSubmitForAppraisal, disabled: submittingAppraisal, className: "flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white h-8", children: [
        /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
        submittingAppraisal ? "Submitting..." : `Submit for Appraisal (${getCurrentPeriod()})`
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-3 border-blue-200 bg-blue-50/50 text-blue-700 text-sm flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }),
      /* @__PURE__ */ jsx("div", { children: hasApprovedData ? /* @__PURE__ */ jsxs("span", { children: [
        "✅ This period has ",
        /* @__PURE__ */ jsx("strong", { children: "approved" }),
        " data. You can edit and resubmit for a new review. New approval will replace the old data."
      ] }) : /* @__PURE__ */ jsxs("span", { children: [
        "📝 Enter your actuals, add comments, and upload proof. Click ",
        /* @__PURE__ */ jsx("strong", { children: '"Submit for Appraisal"' }),
        " when ready. Data will only be saved after approval."
      ] }) })
    ] }),
    viewMode === "year" && yearData.length > 0 && yearStats && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-3 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Months Tracked" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: yearStats.count })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-3 text-center border-green-200 bg-green-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-green-600", children: "Best Month" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-green-600", children: fmtNum(yearStats.best, 2) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-3 text-center border-red-200 bg-red-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600", children: "Worst Month" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-red-600", children: fmtNum(yearStats.worst, 2) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-3 text-center border-blue-200 bg-blue-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-600", children: "Year Average" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-blue-600", children: fmtNum(yearStats.avg, 2) })
      ] })
    ] }),
    viewMode === "year" && yearData.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-3", children: [
        "📊 Monthly Breakdown (",
        selectedYear,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-52", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: yearData.map((d) => ({
        month: `${d.month}/${d.year}`,
        label: new Date(d.year, d.month - 1, 1).toLocaleString("default", {
          month: "short"
        }),
        score: d.performanceMultiplier
      })), children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "label", fontSize: 11, tickLine: false }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 11, tickLine: false, width: 28 }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => [fmtNum(v, 2), "Score"] }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "score", fill: "#3b82f6", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] }),
    viewMode === "month" && trendData.length > 1 && /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "📈 Performance Trend" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "Last ",
          trendData.length,
          " months"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-52", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: trendData, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#3b82f6", stopOpacity: 0.3 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#3b82f6", stopOpacity: 0.02 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.15, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "label", fontSize: 11, tickLine: false }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 2], fontSize: 11, tickLine: false, width: 28 }),
        /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => [fmtNum(v, 2), "Score"] }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "score", stroke: "#3b82f6", strokeWidth: 2.5, fill: "url(#trendGradient)", dot: {
          r: 4,
          fill: "#3b82f6",
          strokeWidth: 0
        } })
      ] }) }) }),
      monthOverMonth !== null && /* @__PURE__ */ jsxs("div", { className: `text-sm mt-2 text-center ${monthOverMonth >= 0 ? "text-green-600" : "text-red-600"}`, children: [
        monthOverMonth >= 0 ? "↑" : "↓",
        " ",
        Math.abs(monthOverMonth).toFixed(1),
        "% from last month"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: viewMode === "year" ? "Year Average" : "Overall Score" }),
        /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold ${band.color}`, children: [
          fmtNum(overallPercent, 1),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Categories" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: displayCategories.length || 0 })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "KPIs Tracked" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: displayCategories.reduce((sum, c) => sum + c.kpis.length, 0) || 0 })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Performance Band" }),
        /* @__PURE__ */ jsxs("div", { className: `text-sm font-semibold ${band.color} mt-1 flex items-center justify-center gap-1`, children: [
          /* @__PURE__ */ jsx(BandIcon, { className: "h-4 w-4" }),
          band.label
        ] }),
        viewMode === "month" && monthOverMonth !== null && /* @__PURE__ */ jsxs("div", { className: `text-xs mt-1 ${monthOverMonth >= 0 ? "text-green-600" : "text-red-600"}`, children: [
          monthOverMonth >= 0 ? "↑" : "↓",
          " ",
          Math.abs(monthOverMonth).toFixed(1),
          "% from last month"
        ] })
      ] })
    ] }),
    displayCategories.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Target, { className: "h-5 w-5" }),
        " Weighted Categories",
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-normal ml-2", children: viewMode === "year" ? `(Year ${selectedYear} Average)` : hasApprovedData ? `(Approved for ${selectedMonth}/${selectedYear})` : `(Enter data for ${selectedMonth}/${selectedYear})` })
      ] }),
      displayCategories.map((category, idx) => {
        let catScore = 0;
        let totalKpiWeight = 0;
        const kpiDetails = category.kpis.map((kpi) => {
          const target = kpi.target || 0;
          const actual = editingActuals[kpi.id] !== void 0 ? editingActuals[kpi.id] : 0;
          const comment = kpiComments[kpi.id] !== void 0 ? kpiComments[kpi.id] : "";
          const proof = kpiProofs[kpi.id] || [];
          const ratio = target > 0 ? actual / target : 0;
          const achievement = ratio * 100;
          const weight = kpi.weight || 100;
          const hasProof = proof.length > 0;
          if (target > 0) {
            catScore += ratio * weight;
            totalKpiWeight += weight;
          }
          return {
            ...kpi,
            actual,
            achievement,
            ratio,
            comment,
            proof,
            hasProof
          };
        });
        const finalScore = totalKpiWeight > 0 ? catScore / totalKpiWeight * 100 : 0;
        const status = finalScore >= 100 ? "exceeded" : finalScore >= 70 ? "met" : finalScore >= 50 ? "partial" : "missed";
        return /* @__PURE__ */ jsxs(Card, { className: "p-4 border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: category.name }),
              /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
                "(Weight: ",
                category.weight,
                "%)"
              ] }),
              hasApprovedData && /* @__PURE__ */ jsx(Badge, { className: "ml-2 bg-green-100 text-green-700 border-green-200 text-[10px]", children: "✅ Approved" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `text-sm font-semibold ${status === "exceeded" ? "text-green-600" : status === "met" ? "text-blue-600" : status === "partial" ? "text-yellow-600" : "text-red-600"}`, children: [
              fmtNum(finalScore, 1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mb-3", children: /* @__PURE__ */ jsx("div", { className: `h-2 rounded-full ${status === "exceeded" ? "bg-green-500" : status === "met" ? "bg-blue-500" : status === "partial" ? "bg-yellow-500" : "bg-red-500"}`, style: {
            width: `${Math.min(100, finalScore)}%`
          } }) }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: kpiDetails.map((kpi, kIdx) => {
            const isUploading = uploadingFiles[kpi.id] || false;
            return /* @__PURE__ */ jsxs("div", { className: "border-b border-muted pb-3 last:border-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 text-xs items-center", children: [
                /* @__PURE__ */ jsx("div", { className: "col-span-3 font-medium break-words whitespace-normal", children: kpi.description }),
                /* @__PURE__ */ jsxs("div", { className: "col-span-1 text-muted-foreground", children: [
                  "Target: ",
                  fmtNum(kpi.target),
                  " ",
                  kpi.metric
                ] }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Input, { type: "number", className: "h-7 w-full text-xs p-1", value: editingActuals[kpi.id] !== void 0 ? editingActuals[kpi.id] : 0, onChange: (e) => updateActual(kpi.id, Number(e.target.value)) }) }),
                /* @__PURE__ */ jsxs("div", { className: "col-span-1 font-semibold", children: [
                  fmtNum(kpi.achievement, 1),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "col-span-1 text-[10px] text-muted-foreground", children: kpi.metric }),
                /* @__PURE__ */ jsx("div", { className: "col-span-1 text-[10px] text-muted-foreground truncate", title: kpi.measurementSource, children: kpi.measurementSource || "—" }),
                /* @__PURE__ */ jsx("div", { className: "col-span-1 text-center", children: kpi.hasProof && /* @__PURE__ */ jsxs("span", { className: "text-blue-500 text-[10px] flex items-center gap-0.5 justify-center", children: [
                  /* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3" }),
                  kpi.proof.length
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "col-span-1 text-center", children: kpi.comment && kpi.comment.trim().length > 0 && /* @__PURE__ */ jsx("span", { className: "text-purple-500 text-[10px]", children: "💬" }) }),
                /* @__PURE__ */ jsxs("div", { className: "col-span-1 text-right", children: [
                  /* @__PURE__ */ jsx("input", { type: "file", ref: (el) => {
                    fileInputRefs.current[kpi.id] = el;
                  }, className: "hidden", multiple: true, onChange: (e) => handleFileUpload(kpi.id, e.target.files) }),
                  /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "h-6 text-[10px] px-2", onClick: () => fileInputRefs.current[kpi.id]?.click(), disabled: isUploading, children: [
                    isUploading ? /* @__PURE__ */ jsx("span", { className: "animate-spin", children: "⏳" }) : /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3 mr-0.5" }),
                    "Proof"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 mt-1", children: [
                /* @__PURE__ */ jsx("div", { className: "col-span-10", children: /* @__PURE__ */ jsx(Input, { type: "text", className: "h-6 w-full text-xs p-1", placeholder: "Add a comment for this KPI...", value: kpiComments[kpi.id] !== void 0 ? kpiComments[kpi.id] : "", onChange: (e) => updateComment(kpi.id, e.target.value) }) }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2 text-[10px] text-muted-foreground flex items-center", children: kpi.comment && kpi.comment.trim().length > 0 && /* @__PURE__ */ jsx("span", { className: "text-purple-500", children: "💬 Has comment" }) })
              ] }),
              kpi.proof && kpi.proof.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: kpi.proof.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px]", children: [
                /* @__PURE__ */ jsxs("a", { href: p.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "hover:underline truncate max-w-[120px]", children: [
                  /* @__PURE__ */ jsx(File, { className: "h-3 w-3 inline mr-0.5" }),
                  p.fileName
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => removeProof(kpi.id, p.id), className: "text-red-500 hover:text-red-700 ml-0.5", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
              ] }, p.id)) })
            ] }, kIdx);
          }) })
        ] }, idx);
      })
    ] }) : /* @__PURE__ */ jsx(Card, { className: "p-8 text-center text-muted-foreground", children: "No KPIs assigned yet. Please contact HR." }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Data will only be saved and appear on the dashboard after your manager ",
          /* @__PURE__ */ jsx("strong", { children: "approves" }),
          " your submission. You can edit and resubmit at any time."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: handleSubmitForAppraisal, disabled: submittingAppraisal, className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white", children: [
        /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
        submittingAppraisal ? "Submitting..." : `Submit for Appraisal (${getCurrentPeriod()})`
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center -mt-2", children: "💡 Select any month/year to enter or update data. Each period starts empty." })
  ] });
}
export {
  EmployeePortal as component
};
