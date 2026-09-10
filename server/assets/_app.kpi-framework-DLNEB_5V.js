import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { u as useP4P, n as newId } from "./router-CQTT2apA.js";
import { C as Card } from "./card-RGlIzTYo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { s as staggerContainer, P as PageHeader, f as fadeUp, E as EmptyState } from "./empty-state-BKzet6q0.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { Save, FileSpreadsheet, Building2, UserCog, CheckCircle, AlertTriangle, Info, Layers, FolderPlus, Trash2, GripVertical, Plus, ListChecks } from "lucide-react";
import { g as getRolesForDepartment, a as getTemplateByDepartmentAndRole, b as getDepartments } from "./kpi-templates-ByGrDBHx.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function KPIFrameworkPage() {
  const {
    getTemplate,
    saveTemplate,
    getAllTemplates
  } = useP4P();
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [template, setTemplate] = useState(null);
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
              target: k.target
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
          target: 0
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
    if (totalWeight !== 100 && template.categories.length > 0) {
      showToast.error("Invalid Weights", `Category weights must sum to 100%. Currently: ${totalWeight}%.`);
      return;
    }
    saveTemplate(template);
    showToast.success("Template Saved", `${selectedDept} · ${selectedRole}`);
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
    /* @__PURE__ */ jsx(PageHeader, { title: "KPI Framework", description: "Define weighted KPI templates per department and role. Employees inherit these on registration.", icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-6 w-6" }), actions: template && /* @__PURE__ */ jsxs(Button, { onClick: handleSave, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: [
      /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
      " Save Template"
    ] }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }),
          " Department"
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: selectedDept, onValueChange: setSelectedDept, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select department" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: departments.map((d) => /* @__PURE__ */ jsx(SelectItem, { value: d, children: d }, d)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsx(UserCog, { className: "h-3.5 w-3.5" }),
          " Role"
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: selectedRole, onValueChange: setSelectedRole, disabled: !selectedDept, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-10", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: selectedDept ? "Select role" : "Select department first" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: roles.map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5", children: "Template Status" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/30 text-sm", children: template ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: `bg-${weightStatus.color}-500/10 text-${weightStatus.color}-700 dark:text-${weightStatus.color}-400 border-${weightStatus.color}-500/30 gap-1`, children: [
            /* @__PURE__ */ jsx(WeightIcon, { className: "h-3 w-3" }),
            weightStatus.label
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground ml-auto", children: [
            template.categories.length,
            " categories · ",
            totalKpis,
            " KPIs"
          ] })
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "No template selected" }) })
      ] })
    ] }) }) }),
    template ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      template.categories.length > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: `p-4 flex items-center gap-3 bg-${weightStatus.color}-500/5 border-${weightStatus.color}-500/20`, children: [
        /* @__PURE__ */ jsx(WeightIcon, { className: `h-5 w-5 text-${weightStatus.color}-600 dark:text-${weightStatus.color}-400` }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-foreground", children: [
            "Total Weight: ",
            totalWeight,
            "%",
            totalWeight === 100 && /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-emerald-500" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: totalWeight === 100 ? "All weights balanced. Ready to save." : totalWeight > 100 ? `Reduce by ${totalWeight - 100}% to reach 100%.` : `Add ${100 - totalWeight}% more to reach 100%.` })
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
      ] }) }) }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: template.categories.map((cat, catIdx) => /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, layout: true, children: /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0", children: catIdx + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[180px]", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Category Name" }),
            /* @__PURE__ */ jsx(Input, { value: cat.name, onChange: (e) => updateCategory(cat.id, {
              name: e.target.value
            }), placeholder: "Category name", className: "mt-1 h-9 font-medium" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "w-32", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: "Weight %" }),
            /* @__PURE__ */ jsx(Input, { type: "number", value: cat.weight, onChange: (e) => updateCategory(cat.id, {
              weight: Number(e.target.value)
            }), placeholder: "0", className: "mt-1 h-9 font-mono" })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 self-end", onClick: () => removeCategory(cat.id), title: "Delete category", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-3", children: [
          cat.kpis.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-6 border border-dashed border-border/50 rounded-lg", children: "No KPIs yet — add one below" }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1", children: [
              /* @__PURE__ */ jsx("div", { className: "col-span-6", children: "KPI Description" }),
              /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Metric" }),
              /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Target" }),
              /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Action" })
            ] }),
            cat.kpis.map((kpi, kpiIdx) => /* @__PURE__ */ jsxs(motion.div, { layout: true, initial: {
              opacity: 0,
              x: -8
            }, animate: {
              opacity: 1,
              x: 0
            }, transition: {
              delay: kpiIdx * 0.03
            }, className: "grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-accent/30 transition-colors", children: [
              /* @__PURE__ */ jsxs("div", { className: "md:col-span-6", children: [
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
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "%", children: "%" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "GHS", children: "GHS" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "$", children: "$" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "#", children: "#" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "ROI", children: "ROI" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "days", children: "days" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "hrs", children: "hrs" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block", children: "Target" }),
                /* @__PURE__ */ jsx(Input, { type: "number", value: kpi.target, onChange: (e) => updateKPI(cat.id, kpi.id, {
                  target: Number(e.target.value)
                }), className: "h-9 font-mono" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "md:col-span-2 flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10", onClick: () => removeKPI(cat.id, kpi.id), title: "Delete KPI", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
            ] }, kpi.id))
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => addKPI(cat.id), className: "gap-2 mt-2", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Add KPI to ",
            cat.name
          ] })
        ] })
      ] }) }, cat.id)) }),
      template.categories.length > 0 && /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(Card, { className: "p-4 flex flex-wrap items-center justify-between gap-3 bg-muted/30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsx(ListChecks, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
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
            "total weight"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSave, disabled: totalWeight !== 100, className: "gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50", children: [
          /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          " Save Template"
        ] })
      ] }) })
    ] }) : /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-6 w-6" }), title: "No template selected", description: "Choose a department and role above to view or create its KPI template." }) }) })
  ] });
}
export {
  KPIFrameworkPage as component
};
