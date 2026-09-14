import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { n as newId, a as useP4P } from "./router-w7c543WJ.js";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-FVkpvMO7.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-BU3bSDRt.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { E as EmptyState } from "./empty-state-BSqWlGcA.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { s as staggerContainer, f as fadeUp } from "./motion-BS01Szpl.js";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Upload, Loader2, AlertCircle, CheckCircle, Download, Save, Send, Building2, UserCog, AlertTriangle, Info, Layers, FolderPlus, Trash2, GripVertical, Plus, ListChecks } from "lucide-react";
import { getRolesForDepartment, getTemplateByDepartmentAndRole, getDepartments } from "./kpi-templates-jbf3Btmq.js";
import "@sentry/react";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "zod";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-dialog";
function exportTemplateToExcel(template, department, roleName) {
  const rows = [];
  for (const cat of template.categories) {
    if (cat.kpis.length === 0) {
      rows.push({
        "Department": department,
        "Role": roleName,
        "Category": cat.name,
        "Category Weight %": cat.weight,
        "KPI Description": "",
        "KPI Weight %": "",
        "Metric": "",
        "Target": "",
        "Measurement Source": ""
      });
      continue;
    }
    for (const kpi of cat.kpis) {
      rows.push({
        "Department": department,
        "Role": roleName,
        "Category": cat.name,
        "Category Weight %": cat.weight,
        "KPI Description": kpi.description,
        "KPI Weight %": kpi.weight ?? 0,
        "Metric": kpi.metric,
        "Target": kpi.target,
        "Measurement Source": kpi.measurementSource || ""
      });
    }
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 16 },
    // Department
    { wch: 18 },
    // Role
    { wch: 24 },
    // Category
    { wch: 16 },
    // Category Weight %
    { wch: 36 },
    // KPI Description
    { wch: 14 },
    // KPI Weight %
    { wch: 10 },
    // Metric
    { wch: 10 },
    // Target
    { wch: 22 }
    // Measurement Source
  ];
  const help = [
    ["How to use this KPI template"],
    [],
    ["1. One row per KPI."],
    ["   If a category has 3 KPIs, that category gets 3 rows."],
    [],
    ["2. Department, Role, Category, and Category Weight % repeat on every row"],
    ["   of the same category. That's normal — change one, change them all."],
    [],
    ["3. Two weight rules that MUST hold or the import will fail:"],
    ["   • Category Weight % must sum to 100 across the whole sheet"],
    ["   • KPI Weight % must sum to 100 inside each category"],
    [],
    ["4. Columns explained:"],
    ["   • Department         — free text, for reference"],
    ["   • Role               — free text, for reference"],
    ["   • Category           — the name of the KPI group"],
    ["   • Category Weight %  — how much this category counts toward the total (0–100)"],
    ["   • KPI Description    — what the KPI is, in plain language"],
    ["   • KPI Weight %       — how much this KPI counts inside its category (0–100)"],
    ["   • Metric             — the unit: %, #, hrs, days, GHS, $, ROI"],
    ["   • Target             — the goal number for the period"],
    ["   • Measurement Source — optional, where the number comes from (e.g. Zendesk)"],
    [],
    ["5. Common tasks:"],
    ["   • Add a KPI:      copy any row, change KPI Description, adjust KPI Weight %"],
    ["   • Change a target: edit the Target cell only"],
    ["   • Remove a KPI:   delete the row, adjust the remaining KPI weights to 100"],
    ["   • Rename category: edit Category cell on every row of that group"],
    [],
    ["6. When done, save the file and use the Import button in the KPI Framework page."],
    ["   The system will preview the changes before applying them."]
  ];
  const wsHelp = XLSX.utils.aoa_to_sheet(help);
  wsHelp["!cols"] = [{ wch: 90 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "KPIs");
  XLSX.utils.book_append_sheet(wb, wsHelp, "How to use");
  const safe = (s) => s.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `KPI_${safe(department)}_${safe(roleName)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
async function parseExcelToTemplate(file) {
  const errors = [];
  const warnings = [];
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames.includes("KPIs") ? "KPIs" : wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    if (!sheet) {
      return { template: null, errors: ["No data sheet found in the file."], warnings };
    }
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (rows.length === 0) {
      return { template: null, errors: ["The file has no data rows."], warnings };
    }
    const required = [
      "Category",
      "Category Weight %",
      "KPI Description",
      "KPI Weight %",
      "Target"
    ];
    const headers = Object.keys(rows[0]);
    for (const col of required) {
      if (!headers.includes(col)) errors.push(`Missing required column: "${col}"`);
    }
    if (errors.length > 0) return { template: null, errors, warnings };
    const categoryMap = /* @__PURE__ */ new Map();
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const rowNum = r + 2;
      const catName = String(row["Category"] || "").trim();
      if (!catName) continue;
      const catWeightRaw = row["Category Weight %"];
      const catWeight = Number(catWeightRaw);
      if (isNaN(catWeight)) {
        errors.push(
          `Row ${rowNum}: Category Weight % is not a number ("${catWeightRaw}").`
        );
        continue;
      }
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, {
          id: newId(),
          name: catName,
          weight: catWeight,
          kpis: []
        });
      }
      const cat = categoryMap.get(catName);
      cat.weight = catWeight;
      const kpiDesc = String(row["KPI Description"] || "").trim();
      if (!kpiDesc) continue;
      const weightRaw = row["KPI Weight %"];
      const targetRaw = row["Target"];
      const metric = String(row["Metric"] || "").trim();
      const source = String(row["Measurement Source"] || "").trim();
      const weight = Number(weightRaw);
      const target = Number(targetRaw);
      if (isNaN(weight)) {
        errors.push(
          `Row ${rowNum} ("${kpiDesc}"): KPI Weight % is not a number ("${weightRaw}").`
        );
        continue;
      }
      if (isNaN(target)) {
        errors.push(
          `Row ${rowNum} ("${kpiDesc}"): Target is not a number ("${targetRaw}").`
        );
        continue;
      }
      cat.kpis.push({
        id: newId(),
        description: kpiDesc,
        metric: metric || "%",
        target,
        weight,
        measurementSource: source || void 0
      });
    }
    if (categoryMap.size === 0) {
      errors.push("No valid category rows found.");
      return { template: null, errors, warnings };
    }
    const categories = Array.from(categoryMap.values());
    const totalCatWeight = categories.reduce((s, c) => s + c.weight, 0);
    if (Math.abs(totalCatWeight - 100) > 0.01) {
      errors.push(
        `Category weights sum to ${totalCatWeight}%. Must be exactly 100%.`
      );
    }
    for (const cat of categories) {
      if (cat.kpis.length === 0) continue;
      const kpiSum = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);
      if (Math.abs(kpiSum - 100) > 0.01) {
        errors.push(
          `In category "${cat.name}", KPI weights sum to ${kpiSum}%. Must be 100%.`
        );
      }
    }
    if (errors.length > 0) return { template: null, errors, warnings };
    const template = {
      department: "",
      roleName: "",
      jobGrade: "",
      categories
    };
    return { template, errors: [], warnings };
  } catch (err) {
    return {
      template: null,
      errors: [`Could not read file: ${err.message || "unknown error"}`],
      warnings
    };
  }
}
function ExcelImportDialog({
  open,
  onOpenChange,
  department,
  role,
  onApply
}) {
  const fileInputRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState("");
  const reset = () => {
    setParsed(null);
    setErrors([]);
    setFileName("");
    setParsing(false);
  };
  const handleChoose = () => {
    reset();
    fileInputRef.current?.click();
  };
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setErrors([]);
    setParsed(null);
    try {
      const result = await parseExcelToTemplate(file);
      if (result.errors.length > 0) {
        setErrors(result.errors);
      } else if (result.template) {
        setParsed(result.template);
      } else {
        setErrors(["Could not parse the file."]);
      }
    } catch (err) {
      setErrors([err.message || "Unknown error while reading the file."]);
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleApply = () => {
    if (!parsed) return;
    const finalTemplate = {
      ...parsed,
      department,
      roleName: role
    };
    onApply(finalTemplate);
    reset();
    onOpenChange(false);
  };
  const handleClose = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };
  const totalKpis = parsed?.categories.reduce((s, c) => s + c.kpis.length, 0) || 0;
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: handleClose, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] flex flex-col p-5", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4 text-primary" }),
        "Import KPI template from Excel"
      ] }),
      /* @__PURE__ */ jsxs(DialogDescription, { className: "text-[11px] leading-relaxed", children: [
        "Upload your KPI Excel file.",
        /* @__PURE__ */ jsx("br", {}),
        "Category weights must sum to 100% across the sheet. KPI weights must sum to 100% inside each category."
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: ".xlsx,.xls",
        onChange: handleFile,
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto -mx-5 px-5 py-1 space-y-3", children: [
      !parsed && !parsing && errors.length === 0 && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleChoose,
          className: "w-full p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-accent/30 transition-colors flex flex-col items-center gap-3 text-center",
          children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-8 w-8 text-muted-foreground" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[13px] font-medium", children: "Click to choose a file" }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: ".xlsx or .xls · first sheet is used" })
            ] })
          ]
        }
      ),
      parsing && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-12 gap-3 text-[13px] text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }),
        "Reading ",
        fileName,
        "…"
      ] }),
      errors.length > 0 && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg bg-red-500/5 border border-red-500/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-red-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-[12px] font-semibold text-red-700 dark:text-red-400 mb-1", children: [
            "Could not import ",
            fileName
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "text-[11px] text-red-800 dark:text-red-300 space-y-0.5", children: errors.map((e, i) => /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            e
          ] }, i)) })
        ] })
      ] }) }),
      parsed && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-emerald-600 shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "text-[12px] text-emerald-800 dark:text-emerald-300", children: [
            "Parsed ",
            /* @__PURE__ */ jsx("strong", { children: parsed.categories.length }),
            " categories ·",
            " ",
            /* @__PURE__ */ jsx("strong", { children: totalKpis }),
            " KPIs · weights valid"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: parsed.categories.map((cat, i) => /* @__PURE__ */ jsxs(Card, { className: "p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[13px] font-medium", children: cat.name }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px] h-5", children: [
              cat.weight,
              "% weight · ",
              cat.kpis.length,
              " KPIs"
            ] })
          ] }),
          cat.kpis.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-1", children: cat.kpis.map((kpi, j) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "text-[11px] flex items-center gap-2 text-muted-foreground leading-relaxed",
              children: [
                /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-primary shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "text-foreground truncate", children: kpi.description }),
                /* @__PURE__ */ jsxs("span", { className: "shrink-0", children: [
                  "· target ",
                  kpi.target,
                  " ",
                  kpi.metric,
                  " · weight ",
                  kpi.weight,
                  "%"
                ] })
              ]
            },
            j
          )) })
        ] }, i)) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleChoose,
            className: "w-full gap-2",
            children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
              "Choose a different file"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "flex-row justify-end gap-2 pt-3 border-t", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => handleClose(false), children: "Cancel" }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          onClick: handleApply,
          disabled: !parsed,
          className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white",
          children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-3.5 w-3.5" }),
            "Apply to template"
          ]
        }
      )
    ] })
  ] }) });
}
const METRICS = ["%", "GHS", "$", "#", "ROI", "days", "hrs"];
function KPIFrameworkPage() {
  const {
    getTemplate,
    saveTemplate,
    getAllTemplates,
    pushTemplateToEmployees,
    previewTemplateDiff,
    employees
  } = useP4P();
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [template, setTemplate] = useState(null);
  const [pushing, setPushing] = useState(false);
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushPreview, setPushPreview] = useState(null);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const departments = getDepartments();
  getAllTemplates();
  useEffect(() => {
    if (selectedDept) setRoles(getRolesForDepartment());
  }, [selectedDept]);
  useEffect(() => {
    if (selectedDept && selectedRole) {
      const existing = getTemplate(selectedDept, selectedRole);
      if (existing) {
        setTemplate(JSON.parse(JSON.stringify(existing)));
        return;
      }
      const defaultTemplate = getTemplateByDepartmentAndRole(selectedDept, selectedRole);
      if (defaultTemplate) {
        setTemplate({
          jobGrade: defaultTemplate.jobGrade || "",
          roleName: defaultTemplate.roleName,
          department: defaultTemplate.department,
          categories: defaultTemplate.categories.map((cat) => ({
            id: cat.id || newId(),
            name: cat.name,
            weight: cat.weight,
            kpis: cat.kpis.map((k) => ({
              id: k.id || newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
              weight: k.weight || 0
            }))
          }))
        });
        return;
      }
      setTemplate({
        jobGrade: "",
        roleName: selectedRole,
        department: selectedDept,
        categories: []
      });
    } else {
      setTemplate(null);
    }
  }, [selectedDept, selectedRole, getTemplate]);
  const totalWeight = template?.categories?.reduce((s, c) => s + c.weight, 0) || 0;
  const totalKpis = template?.categories?.reduce((s, c) => s + c.kpis.length, 0) || 0;
  const addCategory = () => {
    setTemplate((t) => ({
      ...t,
      categories: [...t.categories, {
        id: newId(),
        name: "New Category",
        weight: 0,
        kpis: []
      }]
    }));
  };
  const updateCategory = (catId, updates) => {
    setTemplate((t) => ({
      ...t,
      categories: t.categories.map((c) => c.id === catId ? {
        ...c,
        ...updates
      } : c)
    }));
  };
  const removeCategory = (catId) => {
    setTemplate((t) => ({
      ...t,
      categories: t.categories.filter((c) => c.id !== catId)
    }));
  };
  const addKPI = (catId) => {
    setTemplate((t) => ({
      ...t,
      categories: t.categories.map((c) => c.id === catId ? {
        ...c,
        kpis: [...c.kpis, {
          id: newId(),
          description: "New KPI",
          metric: "%",
          target: 0,
          weight: 0
        }]
      } : c)
    }));
  };
  const updateKPI = (catId, kpiId, updates) => {
    setTemplate((t) => ({
      ...t,
      categories: t.categories.map((c) => c.id === catId ? {
        ...c,
        kpis: c.kpis.map((k) => k.id === kpiId ? {
          ...k,
          ...updates
        } : k)
      } : c)
    }));
  };
  const removeKPI = (catId, kpiId) => {
    setTemplate((t) => ({
      ...t,
      categories: t.categories.map((c) => c.id === catId ? {
        ...c,
        kpis: c.kpis.filter((k) => k.id !== kpiId)
      } : c)
    }));
  };
  const validate = () => {
    if (!template || !selectedDept || !selectedRole) return false;
    if (totalWeight !== 100 && template.categories.length > 0) {
      showToast.error("Invalid Weights", `Category weights must sum to 100%. Currently: ${totalWeight}%.`);
      return false;
    }
    for (const cat of template.categories) {
      if (cat.kpis.length === 0) continue;
      const kpiWeight = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);
      if (Math.abs(kpiWeight - 100) > 0.01) {
        showToast.error("Invalid KPI Weights", `In "${cat.name}", KPI weights must sum to 100%. Currently: ${kpiWeight}%.`);
        return false;
      }
    }
    return true;
  };
  const handleSave = () => {
    if (!validate()) return;
    saveTemplate(template);
    showToast.success("Template Saved", `${selectedDept} · ${selectedRole}`);
  };
  const handleExportExcel = () => {
    if (!template || !selectedDept || !selectedRole) return;
    exportTemplateToExcel(template, selectedDept, selectedRole);
    showToast.success("Downloaded", `${selectedDept} · ${selectedRole}`);
  };
  const handleImportApply = (imported) => {
    setTemplate(imported);
    saveTemplate(imported);
    showToast.success("Imported from Excel", "Template loaded. Review and push when ready.");
  };
  const handlePush = async () => {
    if (!validate()) return;
    if (!template || !selectedDept || !selectedRole) return;
    saveTemplate(template);
    await new Promise((r) => setTimeout(r, 50));
    const rawPreview = previewTemplateDiff(selectedDept, selectedRole, template);
    const affectedIds = Object.keys(rawPreview);
    if (affectedIds.length === 0) {
      showToast.success("No changes", "Every employee is already up to date.");
      return;
    }
    const enriched = affectedIds.map((empId) => {
      const emp = employees.find((e) => e.id === empId);
      const diffs = rawPreview[empId];
      const existing = emp?.categories || [];
      let beforeSum = 0;
      let beforeW = 0;
      for (const cat of existing) {
        let catSum = 0;
        let kw = 0;
        for (const k of cat.kpis) {
          const ratio = (k.target || 1) > 0 ? (k.actual || 0) / (k.target || 1) : 0;
          const w = k.weight || 1;
          catSum += ratio * w;
          kw += w;
        }
        const catScore = kw > 0 ? catSum / kw : 0;
        const cw = (cat.weight || 0) / 100;
        beforeSum += catScore * cw;
        beforeW += cw;
      }
      const beforeScore = beforeW > 0 ? beforeSum / beforeW : 0;
      const afterScore = beforeScore;
      return {
        employeeId: empId,
        name: emp?.name || "Unknown",
        email: emp?.email || "",
        department: emp?.department || selectedDept,
        role: emp?.role || selectedRole,
        changeCount: diffs.length,
        beforeScore,
        afterScore,
        diffs
      };
    });
    const totalChanges = enriched.reduce((s, e) => s + e.changeCount, 0);
    setPushPreview({
      affectedCount: enriched.length,
      totalChanges,
      employees: enriched
    });
    setPushDialogOpen(true);
  };
  const confirmPush = async () => {
    if (!template || !selectedDept || !selectedRole) return;
    setPushing(true);
    try {
      const result = await pushTemplateToEmployees(selectedDept, selectedRole, template);
      showToast.success("Pushed", `${result.created} of ${result.affected} employee${result.affected > 1 ? "s" : ""} notified.`);
      setPushDialogOpen(false);
      setPushPreview(null);
    } catch (err) {
      showToast.error("Push failed", err.message || "Something went wrong.");
    } finally {
      setPushing(false);
    }
  };
  const weightStatus = totalWeight === 100 ? {
    color: "emerald",
    label: "Complete",
    icon: CheckCircle
  } : totalWeight > 100 ? {
    color: "red",
    label: "Over 100%",
    icon: AlertTriangle
  } : {
    color: "blue",
    label: `${100 - totalWeight}% remaining`,
    icon: Info
  };
  const WeightIcon = weightStatus.icon;
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "KPI Framework", description: "Define weighted KPI templates per department and role.", icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-6 w-6" }), actions: template && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleExportExcel, className: "gap-2", title: "Download current template as Excel", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
        " Export"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => setExcelImportOpen(true), className: "gap-2", title: "Import KPIs from an Excel file", children: [
        /* @__PURE__ */ jsx(Upload, { className: "h-3.5 w-3.5" }),
        " Import"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleSave, className: "gap-2", children: [
        /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }),
        " Save"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handlePush, disabled: pushing || totalWeight !== 100, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50", children: [
        /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
        "Push to Employees"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }),
          " Department"
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: selectedDept, onValueChange: setSelectedDept, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select department" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: departments.map((d, i) => /* @__PURE__ */ jsx(SelectItem, { value: d, children: d }, `dept-${i}-${d}`)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsx(UserCog, { className: "h-3.5 w-3.5" }),
          " Role"
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: selectedRole, onValueChange: setSelectedRole, disabled: !selectedDept, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: selectedDept ? "Select role" : "Select department first" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: roles.map((r, i) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, `role-${i}-${r}`)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground mb-1.5", children: "Template Status" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/30 text-sm", children: template ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: `bg-${weightStatus.color}-500/10 text-${weightStatus.color}-700 dark:text-${weightStatus.color}-400 border-${weightStatus.color}-500/30 gap-1 text-[10px] h-5`, children: [
            /* @__PURE__ */ jsx(WeightIcon, { className: "h-3 w-3" }),
            weightStatus.label
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground ml-auto", children: [
            template.categories.length,
            " cat · ",
            totalKpis,
            " KPI"
          ] })
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[11px]", children: "No template selected" }) })
      ] })
    ] }) }) }),
    template ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      template.categories.length > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: `p-4 flex items-center gap-3 bg-${weightStatus.color}-500/5 border-${weightStatus.color}-500/20`, children: [
        /* @__PURE__ */ jsx(WeightIcon, { className: `h-5 w-5 text-${weightStatus.color}-600 dark:text-${weightStatus.color}-400` }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-foreground", children: [
            "Category Total Weight: ",
            totalWeight,
            "%",
            totalWeight === 100 && /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-emerald-500" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: totalWeight === 100 ? "Category weights balanced. Now ensure each category's KPI weights sum to 100%." : totalWeight > 100 ? `Reduce category weights by ${totalWeight - 100}% to reach 100%.` : `Add ${100 - totalWeight}% more to reach 100%.` })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-32 h-2 bg-muted rounded-full overflow-hidden shrink-0", children: /* @__PURE__ */ jsx(motion.div, { initial: {
          width: 0
        }, animate: {
          width: `${Math.min(100, totalWeight)}%`
        }, transition: {
          duration: 0.6
        }, className: `h-full bg-${weightStatus.color}-500` }) })
      ] }) }),
      /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Categories" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: addCategory, className: "gap-2", children: [
          /* @__PURE__ */ jsx(FolderPlus, { className: "h-4 w-4" }),
          " Add Category"
        ] })
      ] }) }),
      template.categories.length === 0 ? /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Layers, { className: "h-6 w-6" }), title: "No categories yet", description: "Add your first KPI category to start building this template.", action: /* @__PURE__ */ jsxs(Button, { onClick: addCategory, className: "gap-2", children: [
        /* @__PURE__ */ jsx(FolderPlus, { className: "h-4 w-4" }),
        " Add Category"
      ] }) }) }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: template.categories.map((cat, catIdx) => {
        const kpiWeight = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);
        const kpiWeightOk = Math.abs(kpiWeight - 100) < 0.01;
        const kpiWeightOver = kpiWeight > 100;
        return /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, layout: true, children: /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0", children: catIdx + 1 }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[180px]", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Category Name" }),
                /* @__PURE__ */ jsx(Input, { value: cat.name, onChange: (e) => updateCategory(cat.id, {
                  name: e.target.value
                }), placeholder: "Category name", className: "mt-1 h-9 font-medium" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "w-32", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Category Weight %" }),
                /* @__PURE__ */ jsx(Input, { type: "number", value: cat.weight, onChange: (e) => updateCategory(cat.id, {
                  weight: Number(e.target.value)
                }), placeholder: "0", className: "mt-1 h-9 font-mono" })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 self-end", onClick: () => removeCategory(cat.id), title: "Delete category", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }),
            cat.kpis.length > 0 && /* @__PURE__ */ jsxs("div", { className: `mt-3 rounded-md px-3 py-2 text-[11px] flex items-center gap-2 ${kpiWeightOver ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:text-red-400" : kpiWeightOk ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"}`, children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxs("span", { children: [
                kpiWeightOver ? "⚠️ KPI weights over 100%! " : kpiWeightOk ? "✅ KPI weights balanced. " : "📊 ",
                "KPI Total: ",
                /* @__PURE__ */ jsxs("strong", { children: [
                  kpiWeight,
                  "%"
                ] }),
                !kpiWeightOver && !kpiWeightOk && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " · Need ",
                  /* @__PURE__ */ jsxs("strong", { children: [
                    100 - kpiWeight,
                    "%"
                  ] }),
                  " more"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-3", children: [
            cat.kpis.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground text-center py-6 border border-dashed border-border/50 rounded-lg", children: "No KPIs yet — add one below" }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-14 gap-3 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1", children: [
                /* @__PURE__ */ jsx("div", { className: "col-span-5", children: "KPI Description" }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Metric" }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Target" }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Weight %" }),
                /* @__PURE__ */ jsx("div", { className: "col-span-3 text-right", children: "Action" })
              ] }),
              cat.kpis.map((kpi, kpiIdx) => /* @__PURE__ */ jsxs(motion.div, { layout: true, initial: {
                opacity: 0,
                x: -8
              }, animate: {
                opacity: 1,
                x: 0
              }, transition: {
                delay: kpiIdx * 0.03
              }, className: "grid grid-cols-1 md:grid-cols-14 gap-3 items-center p-2 rounded-lg hover:bg-accent/30 transition-colors", children: [
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-5", children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block", children: "Description" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(GripVertical, { className: "hidden md:block h-4 w-4 text-muted-foreground/40 shrink-0" }),
                    /* @__PURE__ */ jsx(Input, { value: kpi.description, onChange: (e) => updateKPI(cat.id, kpi.id, {
                      description: e.target.value
                    }), placeholder: "KPI description", className: "h-9" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block", children: "Metric" }),
                  /* @__PURE__ */ jsxs(Select, { value: kpi.metric, onValueChange: (v) => updateKPI(cat.id, kpi.id, {
                    metric: v
                  }), children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 font-mono", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: METRICS.map((m, i) => /* @__PURE__ */ jsx(SelectItem, { value: m, children: m }, `metric-${i}-${m}`)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block", children: "Target" }),
                  /* @__PURE__ */ jsx(Input, { type: "number", value: kpi.target, onChange: (e) => updateKPI(cat.id, kpi.id, {
                    target: Number(e.target.value)
                  }), className: "h-9 font-mono" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block", children: "Weight %" }),
                  /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 100, value: kpi.weight || 0, onChange: (e) => updateKPI(cat.id, kpi.id, {
                    weight: Number(e.target.value)
                  }), placeholder: "0", className: "h-9 font-mono" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "md:col-span-3 flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10", onClick: () => removeKPI(cat.id, kpi.id), title: "Delete KPI", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
              ] }, kpi.id))
            ] }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => addKPI(cat.id), className: "gap-2 mt-2", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              " Add KPI to ",
              cat.name
            ] })
          ] })
        ] }) }, cat.id);
      }) }),
      template.categories.length > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: "p-4 flex flex-wrap items-center justify-between gap-3 bg-muted/30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsx(ListChecks, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground text-[13px]", children: [
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: template.categories.length }),
            " categories ·",
            " ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: totalKpis }),
            " KPIs ·",
            " ",
            /* @__PURE__ */ jsxs("strong", { className: totalWeight === 100 ? "text-emerald-600" : "text-amber-600", children: [
              totalWeight,
              "%"
            ] }),
            " ",
            "category weight"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleSave, variant: "outline", className: "gap-2", children: [
            /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }),
            " Save"
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handlePush, disabled: pushing || totalWeight !== 100, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
            "Push to Employees"
          ] })
        ] })
      ] }) })
    ] }) : /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-6 w-6" }), title: "No template selected", description: "Choose a department and role above to view or create its KPI template." }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: pushDialogOpen, onOpenChange: setPushDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] flex flex-col p-5", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 text-primary" }),
          "Push KPI changes to employees?"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "text-[11px] leading-relaxed", children: pushPreview && /* @__PURE__ */ jsxs(Fragment, { children: [
          "Changes apply ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "immediately" }),
          " to",
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: pushPreview.affectedCount }),
          " ",
          pushPreview.affectedCount === 1 ? "employee" : "employees",
          " —",
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: pushPreview.totalChanges }),
          " total",
          " ",
          pushPreview.totalChanges === 1 ? "change" : "changes",
          ".",
          /* @__PURE__ */ jsx("br", {}),
          "Each employee will be notified and can comment if they have concerns."
        ] }) })
      ] }),
      pushPreview && /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto -mx-5 px-5 py-1 space-y-2.5", children: pushPreview.employees.map((emp) => /* @__PURE__ */ jsxs(Card, { className: "p-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-2.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium text-[13px] truncate", children: emp.name }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: emp.email })
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "shrink-0 text-[10px] h-5 px-1.5 font-medium", children: [
            emp.changeCount,
            " ",
            emp.changeCount === 1 ? "change" : "changes"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          emp.diffs.slice(0, 5).map((d, i) => /* @__PURE__ */ jsxs("div", { className: "text-[11px] flex items-center gap-2 text-muted-foreground leading-relaxed", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-primary shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground shrink-0", children: labelForDiffKind(d.kind) }),
            d.kpiDescription && /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
              "· ",
              d.kpiDescription
            ] }),
            d.categoryName && !d.kpiDescription && /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
              "· ",
              d.categoryName
            ] })
          ] }, i)),
          emp.diffs.length > 5 && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground pl-3 italic", children: [
            "+ ",
            emp.diffs.length - 5,
            " more change",
            emp.diffs.length - 5 === 1 ? "" : "s"
          ] })
        ] })
      ] }, emp.employeeId)) }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "flex-row justify-end gap-2 pt-3 border-t", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => {
          setPushDialogOpen(false);
          setPushPreview(null);
        }, disabled: pushing, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", onClick: confirmPush, disabled: pushing, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white", children: pushing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
          "Pushing…"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }),
          "Push changes"
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ExcelImportDialog, { open: excelImportOpen, onOpenChange: setExcelImportOpen, department: selectedDept, role: selectedRole, onApply: handleImportApply })
  ] });
}
function labelForDiffKind(kind) {
  switch (kind) {
    case "category_added":
      return "New category";
    case "category_removed":
      return "Category removed";
    case "category_weight_changed":
      return "Category weight changed";
    case "category_name_changed":
      return "Category renamed";
    case "kpi_added":
      return "New KPI";
    case "kpi_removed":
      return "KPI removed";
    case "kpi_target_changed":
      return "Target changed";
    case "kpi_metric_changed":
      return "Metric changed";
    case "kpi_weight_changed":
      return "KPI weight changed";
    case "kpi_description_changed":
      return "KPI renamed";
    default:
      return kind;
  }
}
export {
  KPIFrameworkPage as component
};
