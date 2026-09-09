import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { u as useP4P } from "./store-Dy84gyCY.js";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { Users, FileSpreadsheet, Upload, FolderPlus, Trash2, Plus } from "lucide-react";
import { n as newId } from "./router-ykR6owpd.js";
import { g as getRolesForDepartment, a as getTemplateByDepartmentAndRole, b as getDepartments } from "./kpi-templates-BWf00XM8.js";
import * as XLSX from "xlsx";
import Papa from "papaparse";
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
function KPIFrameworkPage() {
  const {
    grades,
    getTemplate,
    saveTemplate,
    getAllTemplates,
    applyTemplateToEmployees
  } = useP4P();
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);
  const departments = getDepartments();
  useEffect(() => {
    if (selectedDept) {
      setRoles(getRolesForDepartment());
    }
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
        const editable = {
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
              measurementSource: k.measurementSource || ""
            }))
          }))
        };
        setTemplate(editable);
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
          measurementSource: ""
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
  const handleSave = () => {
    if (!template || !selectedDept || !selectedRole) return;
    const totalWeight = template.categories.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100 && template.categories.length > 0) {
      alert(`Category weights must sum to 100%. Currently: ${totalWeight}%.`);
      return;
    }
    saveTemplate(template);
    alert("Template saved successfully!");
  };
  const handleApplyToEmployees = () => {
    if (!template || !selectedDept || !selectedRole) {
      alert("Please select a department and role and load a template first.");
      return;
    }
    const count = applyTemplateToEmployees(selectedDept, selectedRole, template);
    if (count === 0) {
      alert("No employees found with this department and role.");
    } else {
      alert(`✅ Updated ${count} employee(s) with the new template. Their actuals have been reset to 0.`);
    }
  };
  const handleBulkUpload = (file) => {
    const reader = new FileReader();
    const extension = file.name.split(".").pop()?.toLowerCase();
    const processData = (data) => {
      if (!data || data.length === 0) {
        alert("No data found in file.");
        return;
      }
      const headers = Object.keys(data[0]);
      const required = ["Category", "KPI Description", "Metric", "Target"];
      const missing = required.filter((r) => !headers.some((h) => h.trim() === r));
      if (missing.length > 0) {
        alert(`Missing columns: ${missing.join(", ")}. Please check your file format.`);
        return;
      }
      const groups = {};
      let totalRows = 0;
      for (const row of data) {
        const dept = (row["Department"] || "").trim();
        const role = (row["Role"] || "").trim();
        const catName = (row["Category"] || "").trim();
        const catWeight = parseFloat(row["Category Weight (%)"]) || 0;
        const kpiDesc = (row["KPI Description"] || "").trim();
        const metric = (row["Metric"] || "").trim() || "%";
        const target = parseFloat(row["Target"]) || 0;
        const source = (row["Measurement Source"] || "").trim();
        if (!dept || !role || !catName || !kpiDesc) continue;
        const key = `${dept}-${role}`;
        if (!groups[key]) {
          groups[key] = {
            dept,
            role,
            categories: {}
          };
        }
        if (!groups[key].categories[catName]) {
          groups[key].categories[catName] = {
            weight: catWeight,
            kpis: []
          };
        }
        groups[key].categories[catName].kpis.push({
          description: kpiDesc,
          metric,
          target,
          measurementSource: source
        });
        totalRows++;
      }
      if (totalRows === 0) {
        alert("No valid data found. Please check your file format.");
        return;
      }
      let savedCount = 0;
      let errorCount = 0;
      const errors = [];
      for (const [key, group] of Object.entries(groups)) {
        try {
          const categories = Object.entries(group.categories).map(([name, data2]) => ({
            id: newId(),
            name,
            weight: data2.weight,
            kpis: data2.kpis.map((k) => ({
              id: newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
              measurementSource: k.measurementSource || ""
            }))
          }));
          const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
          if (totalWeight !== 100 && categories.length > 0) {
            errors.push(`${group.dept} / ${group.role}: Category weights sum to ${totalWeight}% (must be 100%)`);
            errorCount++;
            continue;
          }
          const template2 = {
            jobGrade: "",
            roleName: group.role,
            department: group.dept,
            categories
          };
          saveTemplate(template2);
          savedCount++;
        } catch (err) {
          errors.push(`${group.dept} / ${group.role}: ${err.message}`);
          errorCount++;
        }
      }
      const message = `✅ Saved ${savedCount} templates.`;
      if (errorCount > 0) {
        alert(`${message}

❌ ${errorCount} errors:
${errors.join("\n")}`);
      } else {
        alert(message);
      }
      setUploadProgress(`Saved ${savedCount} templates`);
      const firstKey = Object.keys(groups)[0];
      if (firstKey) {
        const group = groups[firstKey];
        setSelectedDept(group.dept);
        setSelectedRole(group.role);
        setTimeout(() => {
          const existing = getTemplate(group.dept, group.role);
          if (existing) {
            setTemplate(JSON.parse(JSON.stringify(existing)));
          }
        }, 100);
      }
    };
    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            processData(result.data);
          } else {
            alert("No data found in CSV.");
          }
        },
        error: (err) => alert(`CSV parse error: ${err.message}`)
      });
    } else if (extension === "xlsx" || extension === "xls") {
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
            alert("No data found in Excel file.");
          }
        } catch (err) {
          alert(`Excel parse error: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file format. Please use CSV or Excel (.xlsx).");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const downloadBulkTemplate = () => {
    const rows = [["Department", "Role", "Category", "Category Weight (%)", "KPI Description", "Metric", "Target", "Measurement Source"], ["Applications Development", "Senior Specialist", "Software Delivery", "35", "On-time delivery", "%", "95", "Task Tracker"], ["Applications Development", "Senior Specialist", "Software Delivery", "35", "Code quality", "#", "4.5", "Code Review"], ["Applications Development", "Senior Specialist", "Technical Excellence", "30", "Tech debt reduction", "%", "20", "Code Quality Report"], ["Enterprise Solutions", "Specialist", "Enterprise Project Delivery", "35", "On-time project delivery", "%", "90", "Project Tracker"], ["Enterprise Solutions", "Specialist", "Client & Stakeholder Management", "30", "Client satisfaction", "#", "4.0", "Survey"], ["Sales", "Analyst", "Revenue Generation", "40", "Revenue target achievement", "%", "90", "CRM"], ["Human Resources", "Senior Specialist", "Talent Management", "35", "Time-to-hire", "days", "30", "ATS"]];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_kpi_templates.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "KPI Framework" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        template && /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: handleApplyToEmployees, className: "flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
          " Apply to Existing Employees"
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: !template, children: "Save Template" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4 flex flex-wrap gap-4 items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Department" }),
        /* @__PURE__ */ jsxs(Select, { value: selectedDept, onValueChange: setSelectedDept, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-56", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select department" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: departments.map((d) => /* @__PURE__ */ jsx(SelectItem, { value: d, children: d }, d)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Role" }),
        /* @__PURE__ */ jsxs(Select, { value: selectedRole, onValueChange: setSelectedRole, disabled: !selectedDept, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-56", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select role" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: roles.map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 ml-auto", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: downloadBulkTemplate, children: [
          /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4 mr-1" }),
          " Download Template"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => fileInputRef.current?.click(), children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-1" }),
          " Bulk Upload"
        ] }),
        /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: ".csv,.xlsx,.xls", hidden: true, onChange: (e) => {
          const file = e.target.files?.[0];
          if (file) handleBulkUpload(file);
        } })
      ] })
    ] }),
    uploadProgress && /* @__PURE__ */ jsx("div", { className: "p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm", children: uploadProgress }),
    template && /* @__PURE__ */ jsxs(Card, { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-semibold", children: [
          "Template: ",
          selectedDept,
          " - ",
          selectedRole
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: addCategory, children: [
          /* @__PURE__ */ jsx(FolderPlus, { className: "h-4 w-4 mr-1" }),
          " Add Category"
        ] })
      ] }),
      template.categories.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-muted-foreground text-center py-8", children: "No categories yet. Add one or upload a template file." }),
      template.categories.map((cat) => /* @__PURE__ */ jsxs(Card, { className: "p-4 border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(Input, { value: cat.name, onChange: (e) => updateCategory(cat.id, {
            name: e.target.value
          }), placeholder: "Category name", className: "flex-1" }),
          /* @__PURE__ */ jsx(Input, { type: "number", value: cat.weight, onChange: (e) => updateCategory(cat.id, {
            weight: Number(e.target.value)
          }), placeholder: "Weight %", className: "w-24" }),
          /* @__PURE__ */ jsx(Button, { variant: "destructive", size: "sm", onClick: () => removeCategory(cat.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-11 gap-2 text-xs font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "KPI Description" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Metric" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Target" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Source" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Action" })
          ] }),
          cat.kpis.map((kpi) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-11 gap-2", children: [
            /* @__PURE__ */ jsx(Input, { value: kpi.description, onChange: (e) => updateKPI(cat.id, kpi.id, {
              description: e.target.value
            }), placeholder: "KPI description", className: "col-span-3" }),
            /* @__PURE__ */ jsxs(Select, { value: kpi.metric, onValueChange: (v) => updateKPI(cat.id, kpi.id, {
              metric: v
            }), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "col-span-2", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "%", children: "%" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "GHS", children: "GHS" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "$", children: "$" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "#", children: "#" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "ROI", children: "ROI" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "days", children: "days" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Input, { type: "number", value: kpi.target, onChange: (e) => updateKPI(cat.id, kpi.id, {
              target: Number(e.target.value)
            }), className: "col-span-2" }),
            /* @__PURE__ */ jsx(Input, { value: kpi.measurementSource || "", onChange: (e) => updateKPI(cat.id, kpi.id, {
              measurementSource: e.target.value
            }), placeholder: "Source", className: "col-span-2" }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeKPI(cat.id, kpi.id), className: "col-span-2", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, kpi.id)),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => addKPI(cat.id), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
            " Add KPI"
          ] })
        ] })
      ] }, cat.id)),
      template.categories.length > 0 && /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Total weight: ",
        template.categories.reduce((sum, c) => sum + c.weight, 0),
        "%"
      ] })
    ] })
  ] });
}
export {
  KPIFrameworkPage as component
};
