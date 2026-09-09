import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useRef, useMemo, Fragment as Fragment$1 } from "react";
import Papa from "papaparse";
import { Check, X, FolderPlus, Plus, AlertCircle, Trash2, Loader2, Download, Upload, Database, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { u as useP4P, f as fmtNum, a as fmtGHS } from "./store-BAYdnpO7.js";
import { AnimatePresence, motion } from "framer-motion";
import { L as Label } from "./label-JU3yqRBo.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { c as cn } from "./utils-H80jjgLf.js";
import { c as getTemplateForJobGrade } from "./kpi-templates-BxwbgPy9.js";
import { n as newId, d as deleteSupabaseUser } from "./router-B8uhSUT7.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-select";
import "@radix-ui/react-label";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@supabase/supabase-js";
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
function blank() {
  return {
    id: newId(),
    name: "",
    email: "",
    jobGrade: "4",
    department: "",
    role: "",
    isAdjunct: false,
    isSalesRole: false,
    joinDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    monthsWorked: 12,
    kpis: [],
    categories: [],
    supervisorId: "",
    supervisorName: "",
    isManager: false,
    roleType: "employee"
  };
}
function EmployeeModal({ open, onClose, employee }) {
  const { grades, globals, upsertEmployee, employees } = useP4P();
  const [data, setData] = useState(blank());
  useEffect(() => {
    if (open) {
      const emp2 = employee ? JSON.parse(JSON.stringify(employee)) : blank();
      if (!emp2.categories) emp2.categories = [];
      if (!emp2.supervisorId) emp2.supervisorId = "";
      if (!emp2.supervisorName) emp2.supervisorName = "";
      setData(emp2);
    }
  }, [open, employee]);
  const setField = (k, v) => setData((d) => ({ ...d, [k]: v }));
  useEffect(() => {
    if (!data.jobGrade || data.isAdjunct) return;
    if (data.categories && data.categories.length > 0) return;
    const template = getTemplateForJobGrade(data.jobGrade);
    if (!template) return;
    const categories = template.categories.map((cat) => ({
      id: newId(),
      name: cat.name,
      weight: cat.weight,
      kpis: cat.kpis.map((k) => ({
        id: newId(),
        description: k.description,
        metric: k.metric,
        target: k.target,
        actual: 0,
        weight: 100,
        measurementSource: k.measurementSource || ""
      }))
    }));
    setData((prev) => ({ ...prev, categories }));
  }, [data.jobGrade, data.isAdjunct]);
  const loadTemplate = () => {
    const template = getTemplateForJobGrade(data.jobGrade);
    if (!template) {
      alert(`No KPI template found for job grade "${data.jobGrade}"`);
      return;
    }
    const categories = template.categories.map((cat) => ({
      id: newId(),
      name: cat.name,
      weight: cat.weight,
      kpis: cat.kpis.map((k) => ({
        id: newId(),
        description: k.description,
        metric: k.metric,
        target: k.target,
        actual: 0,
        weight: 100,
        measurementSource: k.measurementSource || ""
      }))
    }));
    setData((prev) => ({ ...prev, categories }));
  };
  const getWeightStats = (categories) => {
    const total = categories.reduce((sum, c) => sum + c.weight, 0);
    const remaining = Math.max(0, 100 - total);
    return { total, remaining, isOver: total > 100, isComplete: total === 100 };
  };
  const addCategory = () => {
    const newCategory = {
      id: newId(),
      name: `Category ${(data.categories || []).length + 1}`,
      weight: 0,
      kpis: []
    };
    setData((d) => ({
      ...d,
      categories: [...d.categories || [], newCategory]
    }));
  };
  const removeCategory = (categoryId) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).filter((c) => c.id !== categoryId)
    }));
  };
  const updateCategory = (categoryId, updates) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map(
        (c) => c.id === categoryId ? { ...c, ...updates } : c
      )
    }));
  };
  const addKPI = (categoryId) => {
    const newKPI = {
      id: newId(),
      description: "New KPI",
      metric: "%",
      target: 0,
      actual: 0,
      weight: 1,
      measurementSource: ""
    };
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map(
        (c) => c.id === categoryId ? { ...c, kpis: [...c.kpis, newKPI] } : c
      )
    }));
  };
  const removeKPI = (categoryId, kpiId) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map(
        (c) => c.id === categoryId ? { ...c, kpis: c.kpis.filter((k) => k.id !== kpiId) } : c
      )
    }));
  };
  const updateKPI = (categoryId, kpiId, updates) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map(
        (c) => c.id === categoryId ? {
          ...c,
          kpis: c.kpis.map((k) => k.id === kpiId ? { ...k, ...updates } : k)
        } : c
      )
    }));
  };
  const addLegacyKpi = () => setData((d) => ({
    ...d,
    kpis: [
      ...d.kpis,
      { id: newId(), description: "", metric: "%", target: 0, actual: 0, weight: 1, measurementSource: "" }
    ]
  }));
  const updLegacyKpi = (id, patch) => setData((d) => ({
    ...d,
    kpis: d.kpis.map((k) => k.id === id ? { ...k, ...patch } : k)
  }));
  const rmLegacyKpi = (id) => setData((d) => ({
    ...d,
    kpis: d.kpis.filter((k) => k.id !== id)
  }));
  const save = () => {
    if (!data.name.trim()) return;
    const categories = data.categories || [];
    const stats = getWeightStats(categories);
    if (categories.length > 0 && !stats.isComplete) {
      alert(`Category weights must sum to 100%. Currently: ${stats.total}%. Please adjust.`);
      return;
    }
    let supervisorName = data.supervisorName || "";
    if (data.supervisorId) {
      const supervisor = employees.find((e) => e.id === data.supervisorId);
      if (supervisor) {
        supervisorName = supervisor.name;
      }
    }
    upsertEmployee({
      ...data,
      email: data.email?.trim() || "",
      supervisorName,
      monthsWorked: Number(data.monthsWorked) || 0,
      kpis: data.isAdjunct ? [] : data.kpis,
      categories: data.isAdjunct ? [] : categories
    });
    onClose();
  };
  const hasCategories = (data.categories || []).length > 0;
  const hasLegacyKPIs = data.kpis.length > 0;
  const weightStats = getWeightStats(data.categories || []);
  const hasTemplate = !!getTemplateForJobGrade(data.jobGrade);
  const managers = employees.filter((e) => e.isManager === true && e.id !== data.id);
  return /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 bg-black/50 z-40"
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "tween", duration: 0.3 },
        className: "fixed right-0 top-0 bottom-0 w-full sm:w-[700px] bg-background z-50 shadow-2xl overflow-y-auto",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold", children: [
              employee ? "Edit" : "Add",
              " Employee"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-2 rounded-md hover:bg-accent", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.name,
                  onChange: (e) => setField("name", e.target.value),
                  placeholder: "Full name"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "email",
                  value: data.email || "",
                  onChange: (e) => setField("email", e.target.value),
                  placeholder: "Email address"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Job Grade" }),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  value: data.jobGrade,
                  onValueChange: (v) => setField("jobGrade", v),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: grades.map((g) => /* @__PURE__ */ jsxs(SelectItem, { value: g.code, children: [
                      g.code,
                      " — ",
                      g.name,
                      " (",
                      g.points,
                      ")"
                    ] }, g.code)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Department" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.department || "",
                  onChange: (e) => setField("department", e.target.value),
                  placeholder: "Department"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Role" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.role || "",
                  onChange: (e) => setField("role", e.target.value),
                  placeholder: "Role (e.g., Senior Specialist)"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Supervisor/Manager" }),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  value: data.supervisorId || "none",
                  onValueChange: (v) => {
                    if (v === "none") {
                      setField("supervisorId", "");
                      setField("supervisorName", "");
                    } else {
                      const supervisor = employees.find((e) => e.id === v);
                      setField("supervisorId", v);
                      setField("supervisorName", supervisor?.name || "");
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select supervisor (optional)" }) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "None" }),
                      managers.map((m) => /* @__PURE__ */ jsxs(SelectItem, { value: m.id, children: [
                        m.name,
                        " (",
                        m.department,
                        ")"
                      ] }, m.id))
                    ] })
                  ]
                }
              ),
              data.supervisorName && data.supervisorId && data.supervisorId !== "none" && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "Supervisor: ",
                data.supervisorName
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: data.isManager || false,
                  onCheckedChange: (v) => setField("isManager", !!v)
                }
              ),
              /* @__PURE__ */ jsx(Label, { className: "text-sm cursor-pointer", children: "This employee is a Manager/Supervisor" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: data.isAdjunct,
                    onCheckedChange: (v) => setField("isAdjunct", !!v)
                  }
                ),
                "Is Adjunct?"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: data.isSalesRole,
                    onCheckedChange: (v) => setField("isSalesRole", !!v)
                  }
                ),
                "Is Sales Role?"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Join Date" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "date",
                    value: data.joinDate,
                    onChange: (e) => setField("joinDate", e.target.value)
                  }
                )
              ] }),
              globals.prorationOn && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Months Worked" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "number",
                    min: 0,
                    max: 12,
                    value: data.monthsWorked,
                    onChange: (e) => setField("monthsWorked", Number(e.target.value))
                  }
                )
              ] })
            ] }),
            !data.isAdjunct && /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Weighted Categories" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  hasTemplate && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: loadTemplate, children: [
                    /* @__PURE__ */ jsx(FolderPlus, { className: "h-4 w-4 mr-1" }),
                    " Load Template"
                  ] }),
                  /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: addCategory, children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                    " Add Category"
                  ] })
                ] })
              ] }),
              hasCategories && /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `rounded-md p-3 mb-3 text-sm flex items-center gap-2 ${weightStats.isOver ? "bg-red-50 border border-red-200 text-red-700" : weightStats.isComplete ? "bg-green-50 border border-green-200 text-green-700" : "bg-blue-50 border border-blue-200 text-blue-700"}`,
                  children: [
                    /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 flex-shrink-0" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      weightStats.isOver ? /* @__PURE__ */ jsx("strong", { children: "⚠️ Over 100%!" }) : weightStats.isComplete ? /* @__PURE__ */ jsx("strong", { children: "✅ Perfect!" }) : /* @__PURE__ */ jsx("strong", { children: "📊 Assign weights" }),
                      " ",
                      "Total: ",
                      /* @__PURE__ */ jsxs("strong", { children: [
                        weightStats.total,
                        "%"
                      ] }),
                      !weightStats.isOver && !weightStats.isComplete && /* @__PURE__ */ jsxs(Fragment, { children: [
                        " · Remaining: ",
                        /* @__PURE__ */ jsxs("strong", { children: [
                          weightStats.remaining,
                          "%"
                        ] })
                      ] }),
                      weightStats.isOver && /* @__PURE__ */ jsxs(Fragment, { children: [
                        " · Reduce by ",
                        /* @__PURE__ */ jsxs("strong", { children: [
                          Math.abs(weightStats.remaining),
                          "%"
                        ] })
                      ] })
                    ] })
                  ]
                }
              ),
              hasCategories ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: (data.categories || []).map((category) => /* @__PURE__ */ jsxs(Card, { className: "p-4 border", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-3", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: category.name,
                      onChange: (e) => updateCategory(category.id, { name: e.target.value }),
                      placeholder: "Category name",
                      className: "flex-1"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "relative w-24", children: [
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        value: category.weight,
                        onChange: (e) => {
                          const newWeight = Number(e.target.value);
                          if (newWeight < 0) return;
                          const otherCategories = (data.categories || []).filter(
                            (c) => c.id !== category.id
                          );
                          const otherTotal = otherCategories.reduce(
                            (sum, c) => sum + c.weight,
                            0
                          );
                          const maxAllowed = 100 - otherTotal;
                          if (newWeight <= maxAllowed) {
                            updateCategory(category.id, { weight: newWeight });
                          } else {
                            alert(
                              `Cannot set weight to ${newWeight}%. Only ${maxAllowed}% remaining.`
                            );
                          }
                        },
                        placeholder: "Weight %",
                        className: "pr-6",
                        min: 0,
                        max: 100
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "%" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "destructive",
                      size: "sm",
                      onClick: () => removeCategory(category.id),
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mb-2", children: [
                  category.kpis.length,
                  " KPI(s) - All equally weighted"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-11 gap-2 text-xs font-medium text-muted-foreground", children: [
                    /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "KPI Description" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Metric" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Target" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Actual" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "Source" }),
                    /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "Action" })
                  ] }),
                  category.kpis.map((kpi) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-11 gap-2", children: [
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        value: kpi.description,
                        onChange: (e) => updateKPI(category.id, kpi.id, {
                          description: e.target.value
                        }),
                        placeholder: "KPI name",
                        className: "col-span-3"
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: kpi.metric,
                        onValueChange: (v) => updateKPI(category.id, kpi.id, { metric: v }),
                        children: [
                          /* @__PURE__ */ jsx(SelectTrigger, { className: "col-span-2", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                          /* @__PURE__ */ jsxs(SelectContent, { children: [
                            /* @__PURE__ */ jsx(SelectItem, { value: "%", children: "%" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "GHS", children: "GHS" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "#", children: "#" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "hrs", children: "hrs" }),
                            /* @__PURE__ */ jsx(SelectItem, { value: "days", children: "days" })
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        value: kpi.target,
                        onChange: (e) => updateKPI(category.id, kpi.id, {
                          target: Number(e.target.value)
                        }),
                        className: "col-span-2"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        value: kpi.actual,
                        onChange: (e) => updateKPI(category.id, kpi.id, {
                          actual: Number(e.target.value)
                        }),
                        className: "col-span-2"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        value: kpi.measurementSource || "",
                        onChange: (e) => updateKPI(category.id, kpi.id, {
                          measurementSource: e.target.value
                        }),
                        placeholder: "Source",
                        className: "col-span-1"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        onClick: () => removeKPI(category.id, kpi.id),
                        className: "col-span-1 px-0",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] }, kpi.id)),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      onClick: () => addKPI(category.id),
                      className: "mt-2",
                      children: [
                        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                        " Add KPI"
                      ]
                    }
                  )
                ] })
              ] }, category.id)) }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center", children: 'No categories yet. Click "Add Category" or "Load Template" to start.' })
            ] }),
            !data.isAdjunct && /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("h3", { className: "font-medium text-sm text-muted-foreground", children: [
                  "Legacy KPIs (Simple List - optional)",
                  /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs font-normal", children: "(only used if no categories)" })
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: addLegacyKpi, children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                  " Add Legacy KPI"
                ] })
              ] }),
              hasLegacyKPIs ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.kpis.map((k) => /* @__PURE__ */ jsxs("div", { className: "p-3 border rounded-md space-y-2 bg-card", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-start", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      className: "flex-1",
                      placeholder: "Description",
                      value: k.description,
                      onChange: (e) => updLegacyKpi(k.id, { description: e.target.value })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => rmLegacyKpi(k.id),
                      className: "p-2 hover:text-destructive",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Metric" }),
                    /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: k.metric,
                        onValueChange: (v) => updLegacyKpi(k.id, { metric: v }),
                        children: [
                          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                          /* @__PURE__ */ jsx(SelectContent, { children: ["%", "GHS", "#", "hrs", "days"].map((m) => /* @__PURE__ */ jsx(SelectItem, { value: m, children: m }, m)) })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Target" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        value: k.target,
                        onChange: (e) => updLegacyKpi(k.id, { target: Number(e.target.value) })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Actual" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        value: k.actual,
                        onChange: (e) => updLegacyKpi(k.id, { actual: Number(e.target.value) })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Source" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        value: k.measurementSource || "",
                        onChange: (e) => updLegacyKpi(k.id, { measurementSource: e.target.value }),
                        placeholder: "Measurement source"
                      }
                    )
                  ] })
                ] })
              ] }, k.id)) }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center", children: "No legacy KPIs. Use Weighted Categories above instead." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4 sticky bottom-0 bg-background pb-2 border-t", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: save,
                  className: "flex-1",
                  disabled: hasCategories && !weightStats.isComplete,
                  children: "Save"
                }
              ),
              /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" })
            ] }),
            hasCategories && !weightStats.isComplete && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 -mt-2", children: "Please adjust weights to sum to 100% before saving." })
          ] })
        ]
      }
    )
  ] }) });
}
function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  employeeName,
  employeeEmail
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 bg-black/50 z-50",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md",
        children: /* @__PURE__ */ jsxs(Card, { className: "p-6 shadow-2xl border-red-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-red-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-red-600" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-red-600", children: "Delete Employee" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "This action cannot be undone" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-1 rounded-md hover:bg-muted transition-colors",
                disabled: loading,
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-muted-foreground" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-3", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800", children: [
              /* @__PURE__ */ jsx("strong", { children: "⚠️ Warning:" }),
              " You are about to permanently delete this employee's account."
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 rounded-md p-3 space-y-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Name:" }),
                " ",
                employeeName
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Email:" }),
                " ",
                employeeEmail
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsx("p", { children: "This will permanently remove:" }),
              /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-xs space-y-0.5 ml-2", children: [
                /* @__PURE__ */ jsx("li", { children: "Employee record and all personal data" }),
                /* @__PURE__ */ jsx("li", { children: "All KPI history and performance data" }),
                /* @__PURE__ */ jsx("li", { children: "All appraisal submissions and reviews" }),
                /* @__PURE__ */ jsx("li", { children: "Login access" }),
                /* @__PURE__ */ jsx("li", { children: "Uploaded proof files" })
              ] })
            ] }),
            error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700", children: error })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                className: "flex-1",
                onClick: onClose,
                disabled: loading,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "destructive",
                className: "flex-1 flex items-center gap-2",
                onClick: handleConfirm,
                disabled: loading,
                children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                  "Deleting..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                  "Delete Permanently"
                ] })
              }
            )
          ] })
        ] })
      }
    )
  ] }) });
}
const CSV_TEMPLATE = `Name,JobGrade,IsAdjunct,IsSalesRole,JoinDate,MonthsWorked,Category,CategoryWeight,KPI_Name,KPI_Target,KPI_Actual,KPI_Weight,KPI_Metric
Alice,G,false,true,2025-01-15,12,Strategic,30,Revenue,500000,600000,40,₵
Alice,G,false,true,2025-01-15,12,Strategic,30,CSAT,90,85,30,%
Alice,G,false,true,2025-01-15,12,Strategic,30,Market Share,25,20,30,%
Alice,G,false,true,2025-01-15,12,Operations,20,Process Efficiency,95,88,100,%
Jane Adjunct,5,true,false,2025-01-01,12,,,,,,,,,
`;
function downloadFile(content, name, type = "text/csv") {
  const blob = new Blob([content], {
    type
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function EmployeesPage() {
  const {
    employees,
    calc,
    removeEmployee,
    clearEmployees,
    loadDemo,
    setEmployees,
    getTriggersForEmployee
  } = useP4P();
  const [mode, setMode] = useState("company");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const filtered = useMemo(() => {
    const list = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    if (mode === "individual" && selectedId) return list.filter((e) => e.id === selectedId);
    return list;
  }, [employees, search, mode, selectedId]);
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleEdit = (e) => {
    setEditing(e);
    setModalOpen(true);
  };
  const handleUpload = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const required = ["Name", "JobGrade"];
          const headers = res.meta.fields || [];
          for (const r of required) if (!headers.includes(r)) throw new Error(`Missing column: ${r}`);
          const groups = /* @__PURE__ */ new Map();
          for (const row of res.data) {
            const name = (row.Name || "").trim();
            const grade = (row.JobGrade || "").trim();
            if (!name || !grade) continue;
            const key = `${name}__${grade}`;
            if (!groups.has(key)) {
              groups.set(key, {
                id: newId(),
                name,
                jobGrade: grade,
                isAdjunct: String(row.IsAdjunct).toLowerCase() === "true",
                isSalesRole: String(row.IsSalesRole).toLowerCase() === "true",
                joinDate: row.JoinDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                monthsWorked: Number(row.MonthsWorked) || 12,
                kpis: [],
                categories: []
              });
            }
            const emp2 = groups.get(key);
            if (emp2.isAdjunct) continue;
            const categoryName = row.Category;
            if (categoryName) {
              if (!emp2.categories) emp2.categories = [];
              let category = emp2.categories.find((c) => c.name === categoryName);
              if (!category) {
                category = {
                  id: newId(),
                  name: categoryName,
                  weight: Number(row.CategoryWeight) || 0,
                  kpis: []
                };
                emp2.categories.push(category);
              }
              if (row.KPI_Name) {
                category.kpis.push({
                  id: newId(),
                  name: row.KPI_Name,
                  description: row.KPI_Name,
                  target: Number(row.KPI_Target) || 0,
                  actual: Number(row.KPI_Actual) || 0,
                  weight: Number(row.KPI_Weight) || 100,
                  metric: row.KPI_Metric || "%"
                });
              }
            } else if (row.KPI_Description && !emp2.isAdjunct) {
              if (!emp2.kpis) emp2.kpis = [];
              emp2.kpis.push({
                id: newId(),
                description: row.KPI_Description,
                name: row.KPI_Description,
                metric: row.KPI_Metric || "%",
                target: Number(row.KPI_Target) || 0,
                actual: Number(row.KPI_Actual) || 0,
                weight: 1
              });
            }
          }
          const list = Array.from(groups.values());
          setEmployees(list);
          setUploadMsg({
            ok: true,
            msg: `Imported ${list.length} employees.`
          });
        } catch (e) {
          setUploadMsg({
            ok: false,
            msg: e.message || "Failed to parse CSV."
          });
        }
      },
      error: (err) => setUploadMsg({
        ok: false,
        msg: err.message
      })
    });
  };
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    const {
      success,
      error
    } = await deleteSupabaseUser(employeeToDelete.id);
    if (!success) {
      throw new Error(`Failed to delete Supabase account: ${error}`);
    }
    hardDeleteEmployee(employeeToDelete.id);
  };
  const renderCategoryBreakdown = (employee, calcResult) => {
    if (!employee.categories || employee.categories.length === 0) {
      if (employee.kpis && employee.kpis.length > 0) {
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "KPIs (Legacy Mode)" }),
          /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "pb-1", children: "Description" }),
              /* @__PURE__ */ jsx("th", { children: "Metric" }),
              /* @__PURE__ */ jsx("th", { children: "Target" }),
              /* @__PURE__ */ jsx("th", { children: "Actual" }),
              /* @__PURE__ */ jsx("th", { children: "Ratio" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: employee.kpis.map((k) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-muted", children: [
              /* @__PURE__ */ jsx("td", { className: "py-1", children: k.description || k.name }),
              /* @__PURE__ */ jsx("td", { children: k.metric }),
              /* @__PURE__ */ jsx("td", { children: fmtNum(k.target) }),
              /* @__PURE__ */ jsx("td", { children: fmtNum(k.actual) }),
              /* @__PURE__ */ jsx("td", { children: k.target > 0 ? fmtNum(k.actual / k.target, 3) : "—" })
            ] }, k.id)) })
          ] })
        ] });
      }
      return /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "No KPIs or Categories defined" });
    }
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "Weighted Categories Performance" }),
      employee.categories.map((category) => {
        let categoryScore = 0;
        let totalKpiWeight = 0;
        for (const kpi of category.kpis) {
          if (kpi.target > 0) {
            const ratio = kpi.actual / kpi.target;
            const kpiWeight = kpi.weight || 100;
            categoryScore += ratio * kpiWeight;
            totalKpiWeight += kpiWeight;
          }
        }
        const finalScore = totalKpiWeight > 0 ? categoryScore / totalKpiWeight * 100 : 0;
        return /* @__PURE__ */ jsxs("div", { className: "border rounded-md p-3 bg-muted/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium text-sm", children: [
              category.name,
              /* @__PURE__ */ jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
                "(Weight: ",
                category.weight,
                "%)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `text-xs font-semibold px-2 py-0.5 rounded ${finalScore >= 100 ? "bg-green-100 text-green-700" : finalScore >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`, children: [
              "Score: ",
              fmtNum(finalScore, 1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "pb-1", children: "KPI" }),
              /* @__PURE__ */ jsx("th", { children: "Metric" }),
              /* @__PURE__ */ jsx("th", { children: "Target" }),
              /* @__PURE__ */ jsx("th", { children: "Actual" }),
              /* @__PURE__ */ jsx("th", { children: "Weight" }),
              /* @__PURE__ */ jsx("th", { children: "Achievement" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: category.kpis.map((kpi) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-muted", children: [
              /* @__PURE__ */ jsx("td", { className: "py-1", children: kpi.name || kpi.description }),
              /* @__PURE__ */ jsx("td", { children: kpi.metric || "%" }),
              /* @__PURE__ */ jsx("td", { children: fmtNum(kpi.target) }),
              /* @__PURE__ */ jsx("td", { children: fmtNum(kpi.actual) }),
              /* @__PURE__ */ jsxs("td", { children: [
                kpi.weight || 100,
                "%"
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "font-mono", children: [
                kpi.target > 0 ? fmtNum(kpi.actual / kpi.target * 100, 1) : "—",
                "%"
              ] })
            ] }, kpi.id)) })
          ] })
        ] }, category.id);
      }),
      calcResult?.categoryBreakdown && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-2 pt-2 border-t", children: [
        "Final Performance Multiplier: ",
        /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: fmtNum(calcResult.performanceMultiplier, 3) })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold", children: "Employees" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Manage employees with weighted category KPIs." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: handleAdd, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Add"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => downloadFile(CSV_TEMPLATE, "p4p_template.csv"), children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
          " Template"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => fileRef.current?.click(), children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-1" }),
          " Upload CSV"
        ] }),
        /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: ".csv", hidden: true, onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: loadDemo, children: [
          /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 mr-1" }),
          " Demo"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: clearEmployees, children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-1" }),
          " Clear"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", onClick: () => {
          setEmployeeToDelete(emp);
          setDeleteModalOpen(true);
        }, className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
          "Delete"
        ] })
      ] })
    ] }),
    uploadMsg && /* @__PURE__ */ jsx("div", { className: `p-3 rounded-md text-sm ${uploadMsg.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-destructive/10 text-destructive"}`, children: uploadMsg.msg }),
    /* @__PURE__ */ jsx(Card, { className: "p-4 space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Search" }),
        /* @__PURE__ */ jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search by name…" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "View Mode" }),
        /* @__PURE__ */ jsxs(Select, { value: mode, onValueChange: (v) => setMode(v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "company", children: "Company Mode" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "individual", children: "Individual Preview" })
          ] })
        ] })
      ] }),
      mode === "individual" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Employee" }),
        /* @__PURE__ */ jsxs(Select, { value: selectedId, onValueChange: setSelectedId, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[240px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose…" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: employees.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e.id, children: e.name }, e.id)) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm min-w-[820px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted/50 text-left", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "p-3 w-8" }),
        /* @__PURE__ */ jsx("th", { className: "p-3", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-16", children: "Grade" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-20", children: "Points" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-16", children: "Sales" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-24", children: "Multiplier" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-20", children: "Months" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-36 text-right", children: "Final Bonus" }),
        /* @__PURE__ */ jsx("th", { className: "p-3 w-20" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        filtered.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "p-8 text-center text-muted-foreground", children: "No employees." }) }),
        filtered.map((e) => {
          const r = calc.perEmployee[e.id];
          const hasCategories = e.categories && e.categories.length > 0;
          const hasKpis = e.kpis && e.kpis.length > 0;
          const hasExpandable = (hasCategories || hasKpis) && !e.isAdjunct;
          const isOpen = expanded === e.id;
          const empTriggers = getTriggersForEmployee ? getTriggersForEmployee(e.id) : [];
          const hasProbation = empTriggers.some((t) => t.type === "probation");
          const hasManagement = empTriggers.some((t) => t.type === "management_action");
          const hasPIP = empTriggers.some((t) => t.type === "pip");
          return /* @__PURE__ */ jsxs(Fragment$1, { children: [
            /* @__PURE__ */ jsxs("tr", { className: "border-t hover:bg-muted/30", children: [
              /* @__PURE__ */ jsx("td", { className: "p-3", children: hasExpandable && /* @__PURE__ */ jsx("button", { onClick: () => setExpanded(isOpen ? null : e.id), children: isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxs("td", { className: "p-3 font-medium", children: [
                e.name,
                e.isAdjunct && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-secondary rounded-full", children: "Adjunct" }),
                hasCategories && !e.isAdjunct && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-primary/10 rounded-full", children: "Categories" }),
                hasManagement && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-red-700 text-white rounded-full font-bold animate-pulse", children: "🔴 Mgmt Action" }),
                hasProbation && !hasManagement && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full font-bold", children: "📋 Probation" }),
                hasPIP && !hasProbation && !hasManagement && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 bg-yellow-500 text-white rounded-full font-bold", children: "⚠️ PIP" })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "p-3", children: e.jobGrade }),
              /* @__PURE__ */ jsx("td", { className: "p-3", children: r ? fmtNum(r.gradePoints, 0) : "—" }),
              /* @__PURE__ */ jsx("td", { className: "p-3", children: e.isSalesRole ? "Yes" : "—" }),
              /* @__PURE__ */ jsx("td", { className: "p-3", children: r && !e.isAdjunct ? fmtNum(r.performanceMultiplier, 2) : "—" }),
              /* @__PURE__ */ jsx("td", { className: "p-3", children: e.monthsWorked }),
              /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold whitespace-nowrap", title: r ? new Intl.NumberFormat("en-GH", {
                style: "currency",
                currency: "GHS",
                maximumFractionDigits: 2
              }).format(r.bonus) : "", children: r ? fmtGHS(r.bonus) : "—" }),
              /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1 justify-end", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => handleEdit(e), className: "p-1.5 hover:bg-accent rounded", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => removeEmployee(e.id), className: "p-1.5 hover:bg-destructive/10 hover:text-destructive rounded", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
              ] }) })
            ] }),
            isOpen && /* @__PURE__ */ jsx("tr", { className: "border-t bg-muted/20", children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "p-4", children: renderCategoryBreakdown(e, r) }) })
          ] }, e.id);
        })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(EmployeeModal, { open: modalOpen, onClose: () => setModalOpen(false), employee: editing }),
    deleteModalOpen && employeeToDelete && /* @__PURE__ */ jsx(DeleteConfirmModal, { open: deleteModalOpen, onClose: () => {
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }, onConfirm: handleDeleteEmployee, employeeName: employeeToDelete.name, employeeEmail: employeeToDelete.email })
  ] });
}
export {
  EmployeesPage as component
};
