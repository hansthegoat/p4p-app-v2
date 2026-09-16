import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { P as Papa } from "./_libs/papaparse.mjs";
import { r as readSync, u as utils } from "./_libs/xlsx.mjs";
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
import { a as useP4P, c as fmtNum } from "./_ssr/router-BPHF_myF.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { s as staggerContainer, f as fadeUp } from "./_ssr/motion-DlChdgW6.mjs";
import "./_libs/sonner.mjs";
import { m as motion, A as AnimatePresence } from "./_libs/framer-motion.mjs";
import { R as RefreshCw, F as FileSpreadsheet, _ as Calendar, D as Download, a3 as Upload, Z as Zap, C as CircleCheckBig, f as Users, g as TrendingUp, x as Award, p as TriangleAlert, a4 as Clock, a5 as Trash2, t as ChevronRight, T as Target, a6 as Pencil, a7 as ChartColumn } from "./_libs/lucide-react.mjs";
import "stream";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
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
import "tslib";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
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
import "./_libs/isbot.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/zod.mjs";
import "./_libs/sentry__react.mjs";
import "./_libs/sentry__core.mjs";
import "./_libs/sentry__browser.mjs";
import "./_libs/sentry__browser-utils.mjs";
import "./_libs/sentry__conventions.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
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
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [selectedMonth, setSelectedMonth] = reactExports.useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [expandedEmployee, setExpandedEmployee] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  const [editingKPI, setEditingKPI] = reactExports.useState(null);
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
          const workbook = readSync(data, {
            type: "array"
          });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = utils.sheet_to_json(sheet);
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
  const allTriggers = reactExports.useMemo(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Monthly Performance", description: "Upload CSV/Excel monthly data to track trends, identify rising stars, and flag underachievers.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: refreshMonthlyData, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
      " Refresh"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { title: "Upload Monthly Data", description: `Target: ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric"
    })}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }), action: hasDataForMonth && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
      " Data exists"
    ] }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
            " Year"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({
              length: 5
            }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() + i).map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
            " Month"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(selectedMonth), onValueChange: (v) => setSelectedMonth(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({
              length: 12
            }, (_, i) => i + 1).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m), children: new Date(2e3, m - 1, 1).toLocaleString("default", {
              month: "long"
            }) }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
            " Template"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: downloadTemplate, className: "w-full h-10 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            " Download CSV"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
            " Upload"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: ".csv,.xlsx,.xls", hidden: true, onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => fileRef.current?.click(), disabled: isUploading, className: "w-full h-10 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Uploading..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
            " Choose File"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-blue-500/5 border border-blue-500/20 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-blue-800 dark:text-blue-300 space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Upload instructions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Download the template CSV above" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fill in employee data (including KPI Weight %) for the selected month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "KPI weights within each category must sum to 100%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Upload — data will be stored for the chosen period" })
          ] })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Tracked Employees", value: stats.totalEmployees, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(stats.avgMultiplier, 2), accent: "info", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }), label: "Rising Stars", value: stats.risingStars.length, sub: stats.risingStars.slice(0, 2).join(", ") || "None yet", accent: "success", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }), label: "Underachievers", value: stats.underachievers.length, sub: stats.underachievers.slice(0, 2).join(", ") || "None yet", accent: "danger", size: "large", pulse: stats.underachievers.length > 0 ? "red" : "none" })
    ] }),
    allTriggers.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Performance Alerts & Triggers", description: `${allTriggers.total} alert${allTriggers.total > 1 ? "s" : ""} require${allTriggers.total === 1 ? "s" : ""} attention`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-600" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      allTriggers.pip.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-amber-700 dark:text-amber-400", children: "PIP Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", children: allTriggers.pip.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: allTriggers.pip.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-800 dark:text-amber-300", children: t.employeeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700 dark:text-amber-400 ml-2", children: t.message })
        ] }, i)) })
      ] }),
      allTriggers.probation.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-orange-700 dark:text-orange-400", children: "Probation Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30", children: allTriggers.probation.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: allTriggers.probation.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-orange-800 dark:text-orange-300", children: t.employeeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-700 dark:text-orange-400 ml-2", children: t.message })
        ] }, i)) })
      ] }),
      allTriggers.managementAction.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-red-700 dark:text-red-400", children: "Management Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30", children: allTriggers.managementAction.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: allTriggers.managementAction.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-800 dark:text-red-300", children: t.employeeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700 dark:text-red-400 ml-2", children: t.message })
        ] }, i)) })
      ] })
    ] }) }) }),
    monthsWithData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Available Months", description: "Click a month to load it, or delete to remove its data", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: monthsWithData.map((m) => {
      const isActive = selectedYear === m.year && selectedMonth === m.month;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-lg border transition-all ${isActive ? "bg-primary/10 border-primary/40 text-primary" : "bg-background border-border hover:bg-accent/50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSelectedYear(m.year);
          setSelectedMonth(m.month);
        }, className: "text-xs font-medium whitespace-nowrap", children: new Date(m.year, m.month - 1, 1).toLocaleString("default", {
          month: "short",
          year: "numeric"
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          if (confirm(`Delete data for ${m.month}/${m.year}?`)) {
            const data = monthlyData.filter((d) => d.year === m.year && d.month === m.month);
            for (const d of data) deleteMonthlyData(d.employeeId, d.year, d.month);
            showToast.success("Data Deleted", `${m.month}/${m.year} removed.`);
          }
        }, className: "w-6 h-6 rounded-md flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
      ] }, `${m.year}-${m.month}`);
    }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { title: "Employee Performance Trends", description: "Click an employee to expand KPI details and edit values", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: employees.filter((e) => !e.isAdjunct).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }), title: "No employees", description: "Upload a file or add employees to start tracking." }) : employees.filter((e) => !e.isAdjunct).map((emp, idx) => {
      const trend = getPerformanceTrend(emp.id);
      const history = getMonthlyHistory(emp.id);
      const isExpanded = expandedEmployee === emp.id;
      const empTriggers = getTriggersForEmployee(emp.id);
      const hasMgmt = empTriggers.some((t) => t.type === "management_action");
      const hasProb = empTriggers.some((t) => t.type === "probation");
      const hasPip = empTriggers.some((t) => t.type === "pip");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: Math.min(idx * 0.03, 0.3)
      }, className: "border border-border/60 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpandedEmployee(isExpanded ? null : emp.id), className: "w-full p-4 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0", children: emp.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm truncate", children: emp.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "font-mono text-[10px]", children: emp.jobGrade }),
                trend && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: `text-[10px] gap-1 ${trend.trendDirection === "improving" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : trend.trendDirection === "declining" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" : "bg-muted"}`, children: [
                  trend.trendDirection === "improving" && "Improving",
                  trend.trendDirection === "declining" && "Declining",
                  trend.trendDirection === "stable" && "Stable"
                ] }),
                hasMgmt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-red-600 text-white text-[10px] gap-1 animate-pulse", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
                  "Mgmt Action"
                ] }),
                hasProb && !hasMgmt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-orange-500 text-white text-[10px] gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
                  "Probation"
                ] }),
                hasPip && !hasProb && !hasMgmt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-amber-500 text-white text-[10px] gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                  "PIP"
                ] })
              ] }),
              history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                history.length,
                " month",
                history.length > 1 ? "s" : "",
                " of data"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
            trend && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-foreground", children: fmtNum(trend.currentScore, 2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "current" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
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
        }, className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border/50 bg-muted/20", children: history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-6 w-6" }), title: "No monthly data", description: "Upload a file to start tracking this employee." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 bg-background", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Current" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1", children: trend ? fmtNum(trend.currentScore, 3) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 bg-background", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Average" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1", children: trend ? fmtNum(trend.averageScore, 3) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 bg-emerald-500/5 border-emerald-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400", children: "Best" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400", children: trend ? fmtNum(trend.bestMonth.score, 3) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 bg-red-500/5 border-red-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400", children: "Worst" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1 text-red-600 dark:text-red-400", children: trend ? fmtNum(trend.worstMonth.score, 3) : "—" })
            ] })
          ] }),
          emp.categories && emp.categories.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Weighted Category Performance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] gap-1 bg-muted", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5" }),
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
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: category.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                      "Weight ",
                      category.weight,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-lg font-bold text-${statusColor}-600 dark:text-${statusColor}-400`, children: [
                    fmtNum(finalScore, 1),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children: kpiDetails.map((kpi, kIdx) => {
                  const isEditTarget = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "target";
                  const isEditActual = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "actual";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-3 items-center p-3 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 md:col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: kpi.description }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 md:col-span-2 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Target" }),
                      isEditTarget ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "h-7 text-xs", value: editingKPI?.value || 0, onChange: (e) => setEditingKPI((p) => p ? {
                        ...p,
                        value: Number(e.target.value)
                      } : null), onBlur: saveEdit, onKeyDown: (e) => e.key === "Enter" && saveEdit(), autoFocus: true }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "hover:bg-accent/50 rounded px-1.5 py-0.5 w-full text-left hover:text-primary transition-colors", onClick: () => startEditing(emp.id, category.id, kpi.id, "target", kpi.target), children: [
                        fmtNum(kpi.target),
                        " ",
                        kpi.metric
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 md:col-span-2 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Actual" }),
                      isEditActual ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "h-7 text-xs", value: editingKPI?.value || 0, onChange: (e) => setEditingKPI((p) => p ? {
                        ...p,
                        value: Number(e.target.value)
                      } : null), onBlur: saveEdit, onKeyDown: (e) => e.key === "Enter" && saveEdit(), autoFocus: true }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "hover:bg-accent/50 rounded px-1.5 py-0.5 w-full text-left hover:text-primary transition-colors", onClick: () => startEditing(emp.id, category.id, kpi.id, "actual", kpi.actual), children: [
                        fmtNum(kpi.actual),
                        " ",
                        kpi.metric
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 md:col-span-2 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Weight" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                        kpi.weight,
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 md:col-span-2 text-right", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "md:hidden text-[10px] uppercase block text-muted-foreground", children: "Score" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold text-sm ${kpi.achievement >= 100 ? "text-emerald-600 dark:text-emerald-400" : kpi.achievement >= 70 ? "text-blue-600 dark:text-blue-400" : kpi.achievement >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`, children: [
                        fmtNum(kpi.achievement, 1),
                        "%"
                      ] })
                    ] })
                  ] }, kIdx);
                }) })
              ] }, catIdx);
            })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-6 w-6" }), title: "No categories", description: "This employee has no KPI categories assigned." })
        ] }) }) }) })
      ] }, emp.id);
    }) }) }) })
  ] });
}
export {
  MonthlyPage as component
};
