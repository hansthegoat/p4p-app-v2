import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { C as Card, B as Button } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { u as useP4P, f as fmtNum, a as fmtGHS } from "./store-BAYdnpO7.js";
import { Upload, Download, RefreshCw, CheckCircle, Users, TrendingUp, Award, AlertTriangle, Calendar, Trash2, ChevronDown, ChevronRight, Target } from "lucide-react";
import "./router-B8uhSUT7.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@supabase/supabase-js";
const TEMPLATE_CSV = `Employee Name,Employee ID,Category,Category Weight (%),KPI Description,KPI Metric,KPI Target,KPI Actual
Alice Johnson,emp1,Strategic,30,Revenue Growth,GHS,500000,600000
Alice Johnson,emp1,Strategic,30,CSAT Score,%,90,85
Alice Johnson,emp1,Strategic,30,Market Share,%,25,20
Alice Johnson,emp1,Operational,20,Process Efficiency,%,95,88
Bob Smith,emp2,Team Performance,40,Team Lead,%,100,90
Bob Smith,emp2,Team Performance,40,Projects Completed,#,12,10
Carol Davis,emp3,Project Delivery,50,Project completion,%,100,95
Carol Davis,emp3,Client Satisfaction,30,Client NPS,%,80,75`;
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
    calc,
    upsertEmployee,
    setEmployees,
    detectTriggers,
    getTriggersForEmployee
  } = useP4P();
  const [selectedYear, setSelectedYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [selectedMonth, setSelectedMonth] = useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [uploadStatus, setUploadStatus] = useState(null);
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
    const updatedEmployees = employees.map((emp) => {
      if (emp.id !== editingKPI.employeeId) return emp;
      const updatedCategories = (emp.categories || []).map((cat) => {
        if (cat.id !== editingKPI.categoryId) return cat;
        const updatedKpis = cat.kpis.map((k) => {
          if (k.id !== editingKPI.kpiId) return k;
          return {
            ...k,
            [editingKPI.field]: editingKPI.value
          };
        });
        return {
          ...cat,
          kpis: updatedKpis
        };
      });
      return {
        ...emp,
        categories: updatedCategories
      };
    });
    setEmployees(updatedEmployees);
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
    saveMonthlySnapshot(editingKPI.employeeId, currentYear, currentMonth);
    setEditingKPI(null);
    alert("✅ KPI updated successfully!");
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
    a.download = `monthly_performance_template_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const refreshMonthlyData = () => {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
    let count = 0;
    for (const emp of employees) {
      if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) {
        saveMonthlySnapshot(emp.id, currentYear, currentMonth);
        count++;
      }
    }
    alert(`✅ Refreshed data for ${count} employees for ${currentMonth}/${currentYear}`);
  };
  const handleUpload = (file) => {
    setIsUploading(true);
    setUploadStatus(null);
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const processData = (data) => {
      try {
        const headers = Object.keys(data[0] || {});
        const required = ["Employee Name", "KPI Description", "KPI Target", "KPI Actual"];
        const missing = required.filter((r) => !headers.some((h) => h.trim() === r));
        if (missing.length > 0) {
          throw new Error(`Missing columns: ${missing.join(", ")}`);
        }
        const employeeMap = /* @__PURE__ */ new Map();
        for (const row of data) {
          const empName = row["Employee Name"]?.trim();
          const empId = row["Employee ID"]?.trim() || `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const category = row["Category"]?.trim() || "General";
          const categoryWeight = Number(row["Category Weight (%)"]) || 0;
          const kpiDesc = row["KPI Description"]?.trim();
          const kpiMetric = row["KPI Metric"]?.trim() || "%";
          const kpiTarget = Number(row["KPI Target"]);
          const kpiActual = Number(row["KPI Actual"]);
          if (!empName || !kpiDesc || isNaN(kpiTarget) || isNaN(kpiActual)) continue;
          if (!employeeMap.has(empId)) {
            employeeMap.set(empId, {
              name: empName,
              categories: /* @__PURE__ */ new Map()
            });
          }
          const emp = employeeMap.get(empId);
          if (!emp.categories.has(category)) {
            emp.categories.set(category, {
              weight: categoryWeight,
              kpis: []
            });
          }
          emp.categories.get(category).kpis.push({
            description: kpiDesc,
            metric: kpiMetric,
            target: kpiTarget,
            actual: kpiActual,
            weight: 100
            // equal weight within category
          });
        }
        const updatedEmployees = [...employees];
        let newCount = 0;
        let updateCount = 0;
        for (const [empId, empData] of employeeMap) {
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
                weight: 100
              }))
            });
          }
          const existingIdx = updatedEmployees.findIndex((e) => e.name === empData.name);
          if (existingIdx >= 0) {
            updatedEmployees[existingIdx] = {
              ...updatedEmployees[existingIdx],
              categories,
              kpis: []
              // Clear legacy KPIs when using categories
            };
            updateCount++;
          } else {
            updatedEmployees.push({
              id: empId,
              name: empData.name,
              jobGrade: "4",
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
        setEmployees(updatedEmployees);
        for (const emp of updatedEmployees) {
          if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) {
            saveMonthlySnapshot(emp.id, selectedYear, selectedMonth);
          }
        }
        setUploadStatus({
          ok: true,
          msg: `✅ Uploaded ${employeeMap.size} employees (${newCount} new, ${updateCount} updated) for ${selectedMonth}/${selectedYear}`
        });
      } catch (error) {
        setUploadStatus({
          ok: false,
          msg: error.message || "Failed to process file"
        });
      } finally {
        setIsUploading(false);
      }
    };
    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            processData(result.data);
          } else {
            setUploadStatus({
              ok: false,
              msg: "No data found in file"
            });
            setIsUploading(false);
          }
        },
        error: (err) => {
          setUploadStatus({
            ok: false,
            msg: err.message
          });
          setIsUploading(false);
        }
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result);
          const workbook = XLSX.read(data, {
            type: "array"
          });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          if (jsonData && jsonData.length > 0) {
            processData(jsonData);
          } else {
            setUploadStatus({
              ok: false,
              msg: "No data found in file"
            });
            setIsUploading(false);
          }
        } catch (err) {
          setUploadStatus({
            ok: false,
            msg: err.message
          });
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus({
        ok: false,
        msg: "Unsupported file format. Please use CSV or Excel (.xlsx)"
      });
      setIsUploading(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };
  const allTriggers = useMemo(() => {
    try {
      return detectTriggers();
    } catch (e) {
      return {
        pip: [],
        probation: [],
        managementAction: [],
        total: 0
      };
    }
  }, [detectTriggers]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-start justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold", children: "Monthly Performance Upload" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Upload monthly performance data via CSV/Excel to track trends and identify rising stars." })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }),
        " Upload Monthly Data"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Year" }),
          /* @__PURE__ */ jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
              length: 5
            }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() + i).map((y) => /* @__PURE__ */ jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Month" }),
          /* @__PURE__ */ jsxs(Select, { value: String(selectedMonth), onValueChange: (v) => setSelectedMonth(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: Array.from({
              length: 12
            }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsx(SelectItem, { value: String(m), children: new Date(2e3, m - 1, 1).toLocaleString("default", {
              month: "long"
            }) }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: downloadTemplate, className: "flex-1", children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
            " Template"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => fileRef.current?.click(), className: "flex-1", disabled: isUploading, children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-1" }),
            " Upload"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: refreshMonthlyData, className: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-1" }),
            " Refresh"
          ] }),
          /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: ".csv,.xlsx,.xls", hidden: true, onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          } })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground bg-muted/30 p-3 rounded-md", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium", children: "📋 Upload Instructions:" }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-xs space-y-1 mt-1", children: [
          /* @__PURE__ */ jsx("li", { children: "Download the template CSV file above" }),
          /* @__PURE__ */ jsx("li", { children: "Fill in employee performance data for the selected month" }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Upload the file - it will be stored for ",
            selectedMonth,
            "/",
            selectedYear
          ] }),
          /* @__PURE__ */ jsx("li", { children: "Data is automatically saved and used for trend analysis" })
        ] })
      ] }),
      uploadStatus && /* @__PURE__ */ jsx("div", { className: `mt-4 p-3 rounded-md text-sm ${uploadStatus.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`, children: uploadStatus.msg }),
      hasDataForMonth && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
        "Data already exists for ",
        selectedMonth,
        "/",
        selectedYear,
        ". Uploading will replace it."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
          " Tracked Employees"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats.totalEmployees })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
          " Average Multiplier"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: fmtNum(stats.avgMultiplier, 2) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 border-green-200 bg-green-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-green-700", children: [
          /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }),
          " Rising Stars"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-green-700", children: stats.risingStars.length }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-green-600 truncate", children: stats.risingStars.join(", ") || "None yet" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 border-red-200 bg-red-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-red-700", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
          " Underachievers"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-red-700", children: stats.underachievers.length }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600 truncate", children: stats.underachievers.join(", ") || "None yet" })
      ] })
    ] }),
    allTriggers.total > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4 border-orange-200 bg-orange-50/50", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2 text-orange-800", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        " Performance Alerts & Triggers"
      ] }),
      allTriggers.pip.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-sm font-medium text-yellow-700 mb-2", children: [
          "⚠️ PIP Required (",
          allTriggers.pip.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: allTriggers.pip.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: t.employeeName }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-yellow-700 ml-2", children: t.message })
        ] }, i)) })
      ] }),
      allTriggers.probation.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-sm font-medium text-orange-700 mb-2", children: [
          "📋 Probation Period (",
          allTriggers.probation.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: allTriggers.probation.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "p-2 bg-orange-50 border border-orange-200 rounded-md text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: t.employeeName }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-orange-700 ml-2", children: t.message })
        ] }, i)) })
      ] }),
      allTriggers.managementAction.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-sm font-medium text-red-700 mb-2", children: [
          "🔴 Management Action Required (",
          allTriggers.managementAction.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: allTriggers.managementAction.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "p-2 bg-red-50 border border-red-200 rounded-md text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: t.employeeName }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-red-700 ml-2", children: t.message })
        ] }, i)) })
      ] })
    ] }),
    monthsWithData.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "📅 Available Months" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: monthsWithData.map((m) => /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-2", onClick: () => {
        setSelectedYear(m.year);
        setSelectedMonth(m.month);
      }, children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
        new Date(m.year, m.month - 1, 1).toLocaleString("default", {
          month: "short"
        }),
        " ",
        m.year,
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-4 w-4 p-0 text-red-500", onClick: (e) => {
          e.stopPropagation();
          if (confirm(`Delete data for ${m.month}/${m.year}?`)) {
            const monthData = monthlyData.filter((d) => d.year === m.year && d.month === m.month);
            for (const d of monthData) {
              deleteMonthlyData(d.employeeId, d.year, d.month);
            }
          }
        }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
      ] }, `${m.year}-${m.month}`)) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "📈 Employee Performance Trends" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        employees.filter((e) => !e.isAdjunct).map((emp) => {
          const trend = getPerformanceTrend(emp.id);
          const history = getMonthlyHistory(emp.id);
          const isExpanded = expandedEmployee === emp.id;
          const empTriggers = getTriggersForEmployee(emp.id);
          const hasManagement = empTriggers.some((t) => t.type === "management_action");
          const hasProbation = empTriggers.some((t) => t.type === "probation");
          const hasPIP = empTriggers.some((t) => t.type === "pip");
          return /* @__PURE__ */ jsxs("div", { className: "border rounded-md overflow-hidden", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setExpandedEmployee(isExpanded ? null : emp.id), className: "w-full p-3 flex items-center justify-between hover:bg-muted/30 text-left", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: emp.name }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: emp.jobGrade }),
                trend && /* @__PURE__ */ jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full ${trend.trendDirection === "improving" ? "bg-green-100 text-green-700" : trend.trendDirection === "declining" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`, children: [
                  trend.trendDirection === "improving" && "📈 Improving",
                  trend.trendDirection === "declining" && "📉 Declining",
                  trend.trendDirection === "stable" && "➖ Stable"
                ] }),
                hasManagement && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs px-2 py-0.5 bg-red-700 text-white rounded-full font-bold animate-pulse", children: "🔴 Mgmt Action" }),
                hasProbation && !hasManagement && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full font-bold", children: "📋 Probation" }),
                hasPIP && !hasProbation && !hasManagement && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs px-2 py-0.5 bg-yellow-500 text-white rounded-full font-bold", children: "⚠️ PIP" }),
                history.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "No data yet" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                trend && /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: fmtNum(trend.currentScore, 2) }),
                isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ jsx("div", { className: "p-4 border-t bg-muted/10", children: history.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No monthly data yet. Upload a file to start tracking." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Current Score" }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: trend ? fmtNum(trend.currentScore, 3) : "—" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Average" }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: trend ? fmtNum(trend.averageScore, 3) : "—" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Best Month" }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: trend ? `${fmtNum(trend.bestMonth.score, 3)} (${trend.bestMonth.month}/${trend.bestMonth.year})` : "—" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-md border", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Worst Month" }),
                  /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: trend ? `${fmtNum(trend.worstMonth.score, 3)} (${trend.worstMonth.month}/${trend.worstMonth.year})` : "—" })
                ] })
              ] }),
              emp.categories && emp.categories.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-4", children: [
                /* @__PURE__ */ jsxs("p", { className: "font-medium text-sm flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Target, { className: "h-4 w-4" }),
                  " Weighted Category Performance ",
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(click numbers to edit)" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                  emp.categories.map((category, catIdx) => {
                    let categoryScore = 0;
                    let totalKpiWeight = 0;
                    let kpiDetails = [];
                    if (category.kpis && category.kpis.length > 0) {
                      for (const kpi of category.kpis) {
                        const target = Number(kpi.target) || 0;
                        const actual = Number(kpi.actual) || 0;
                        const ratio = target > 0 ? actual / target : 0;
                        const achievement = ratio * 100;
                        const weight = Number(kpi.weight) || 100;
                        kpiDetails.push({
                          id: kpi.id,
                          description: kpi.description,
                          target,
                          actual,
                          ratio,
                          achievement,
                          metric: kpi.metric || "%"
                        });
                        if (target > 0) {
                          categoryScore += ratio * weight;
                          totalKpiWeight += weight;
                        }
                      }
                    }
                    const finalScore = totalKpiWeight > 0 ? categoryScore / totalKpiWeight * 100 : 0;
                    const catStatus = finalScore >= 100 ? "exceeded" : finalScore >= 70 ? "met" : finalScore >= 50 ? "partial" : "missed";
                    return /* @__PURE__ */ jsxs("div", { className: "border rounded-md p-3 bg-white", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("span", { className: "font-medium", children: category.name }),
                          /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
                            "(Weight: ",
                            category.weight,
                            "%)"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: `text-sm font-semibold ${catStatus === "exceeded" ? "text-green-600" : catStatus === "met" ? "text-blue-600" : catStatus === "partial" ? "text-yellow-600" : "text-red-600"}`, children: [
                          fmtNum(finalScore, 1),
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx("div", { className: `h-2 rounded-full ${catStatus === "exceeded" ? "bg-green-500" : catStatus === "met" ? "bg-blue-500" : catStatus === "partial" ? "bg-yellow-500" : "bg-red-500"}`, style: {
                        width: `${Math.min(100, finalScore)}%`
                      } }) }),
                      /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-1 gap-1", children: kpiDetails.length > 0 ? kpiDetails.map((kpi, kIdx) => {
                        const isEditingTarget = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "target";
                        const isEditingActual = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "actual";
                        return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 gap-2 text-xs border-b border-muted pb-1 last:border-0 items-center", children: [
                          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: kpi.description }),
                          /* @__PURE__ */ jsx("div", { className: "col-span-1", children: isEditingTarget ? /* @__PURE__ */ jsx(Input, { type: "number", className: "h-6 w-full text-xs p-1", value: editingKPI?.value || 0, onChange: (e) => setEditingKPI((prev) => prev ? {
                            ...prev,
                            value: Number(e.target.value)
                          } : null), onBlur: saveEdit, onKeyDown: (e) => e.key === "Enter" && saveEdit(), autoFocus: true }) : /* @__PURE__ */ jsxs("button", { className: "hover:bg-muted/30 rounded px-1 py-0.5 w-full text-left hover:text-blue-600 transition-colors", onClick: () => startEditing(emp.id, category.id, kpi.id, "target", kpi.target), children: [
                            fmtNum(kpi.target),
                            " ",
                            kpi.metric
                          ] }) }),
                          /* @__PURE__ */ jsx("div", { className: "col-span-1", children: isEditingActual ? /* @__PURE__ */ jsx(Input, { type: "number", className: "h-6 w-full text-xs p-1", value: editingKPI?.value || 0, onChange: (e) => setEditingKPI((prev) => prev ? {
                            ...prev,
                            value: Number(e.target.value)
                          } : null), onBlur: saveEdit, onKeyDown: (e) => e.key === "Enter" && saveEdit(), autoFocus: true }) : /* @__PURE__ */ jsxs("button", { className: "hover:bg-muted/30 rounded px-1 py-0.5 w-full text-left hover:text-blue-600 transition-colors", onClick: () => startEditing(emp.id, category.id, kpi.id, "actual", kpi.actual), children: [
                            fmtNum(kpi.actual),
                            " ",
                            kpi.metric
                          ] }) }),
                          /* @__PURE__ */ jsxs("div", { className: `col-span-1 font-semibold ${kpi.achievement >= 100 ? "text-green-600" : kpi.achievement >= 70 ? "text-yellow-600" : "text-red-600"}`, children: [
                            fmtNum(kpi.achievement, 1),
                            "%",
                            kpi.achievement >= 100 && " ✅",
                            kpi.achievement < 50 && " ⚠️"
                          ] }),
                          /* @__PURE__ */ jsx("div", { className: "col-span-1 text-right", children: isEditingTarget || isEditingActual ? /* @__PURE__ */ jsx("span", { className: "text-blue-500 text-[10px]", children: "editing..." }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "✎ click" }) })
                        ] }, kIdx);
                      }) : /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "No KPI data available" }) })
                    ] }, catIdx);
                  }),
                  trend && /* @__PURE__ */ jsxs("div", { className: `p-3 rounded-lg ${trend.currentScore < 0.5 ? "bg-red-50 border border-red-200" : trend.currentScore >= 1 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`, children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Overall Performance Score" }),
                      /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold ${trend.currentScore < 0.5 ? "text-red-600" : trend.currentScore >= 1 ? "text-green-600" : "text-yellow-600"}`, children: [
                        fmtNum(trend.currentScore * 100, 1),
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mt-1", children: /* @__PURE__ */ jsx("div", { className: `h-2 rounded-full ${trend.currentScore < 0.5 ? "bg-red-500" : trend.currentScore >= 1 ? "bg-green-500" : "bg-yellow-500"}`, style: {
                      width: `${Math.min(100, trend.currentScore * 100)}%`
                    } }) })
                  ] })
                ] })
              ] }) : (
                // Fallback: Monthly History table (if no categories)
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-sm", children: "📊 Monthly History" }),
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 md:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Month" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Year" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "Multiplier" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "Bonus" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Actions" })
                  ] }),
                  history.map((h, idx) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 md:grid-cols-12 gap-2 text-sm border-b border-muted py-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: h.month }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: h.year }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-3 font-mono", children: fmtNum(h.performanceMultiplier, 3) }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-3 font-mono", children: fmtGHS(h.bonusEligible) }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700", onClick: () => {
                      if (confirm(`Delete ${h.month}/${h.year} data?`)) {
                        deleteMonthlyData(emp.id, h.year, h.month);
                      }
                    }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) }) })
                  ] }, idx))
                ] })
              )
            ] }) })
          ] }, emp.id);
        }),
        employees.filter((e) => !e.isAdjunct).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground py-8", children: "No non-adjunct employees found. Upload a file to add employees." })
      ] })
    ] })
  ] });
}
export {
  MonthlyPage as component
};
