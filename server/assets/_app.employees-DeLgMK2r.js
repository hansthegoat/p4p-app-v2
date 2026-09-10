import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { u as useP4P, n as newId, c as fmtNum, f as fmtGHS, d as findUserByEmail, e as deleteSupabaseUser } from "./router-CQTT2apA.js";
import { C as Card } from "./card-RGlIzTYo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { s as staggerContainer, P as PageHeader, f as fadeUp, E as EmptyState } from "./empty-state-BKzet6q0.js";
import { S as StatCard } from "./stat-card-CEuC_AAE.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { Check, X, FolderPlus, Plus, AlertCircle, Trash2, Loader2, UserPlus, FileSpreadsheet, Users, Award, TrendingUp, AlertTriangle, Search, Mail, Building2, Edit2 } from "lucide-react";
import { L as Label } from "./label-JU3yqRBo.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { c as cn } from "./utils-H80jjgLf.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { c as getTemplateForJobGrade } from "./kpi-templates-ByGrDBHx.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
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
      const emp = employee ? JSON.parse(JSON.stringify(employee)) : blank();
      if (!emp.categories) emp.categories = [];
      if (!emp.supervisorId) emp.supervisorId = "";
      if (!emp.supervisorName) emp.supervisorName = "";
      setData(emp);
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
                /* @__PURE__ */ jsx("li", { children: "Login access (Supabase Auth account)" }),
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
function EmployeesPage() {
  const {
    employees,
    calc,
    clearEmployees,
    loadDemo,
    hardDeleteEmployee
  } = useP4P();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const filteredEmployees = employees.filter((emp) => {
    const s = search.toLowerCase();
    return emp.name.toLowerCase().includes(s) || emp.department.toLowerCase().includes(s) || emp.role.toLowerCase().includes(s) || (emp.email || "").toLowerCase().includes(s);
  });
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aScore = calc.perEmployee[a.id]?.performanceMultiplier || 0;
    const bScore = calc.perEmployee[b.id]?.performanceMultiplier || 0;
    return bScore - aScore;
  });
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      if (!employeeToDelete.authUserId) {
        const foundUser = await findUserByEmail(employeeToDelete.email);
        if (foundUser) {
          const {
            success: success2,
            error: error2
          } = await deleteSupabaseUser(foundUser.id);
          if (!success2) {
            hardDeleteEmployee(employeeToDelete.id);
            showToast.warning("Partial Deletion", `${employeeToDelete.name} removed from app, but could not delete from Supabase Auth.`);
            return;
          }
          hardDeleteEmployee(employeeToDelete.id);
          showToast.success("Employee Deleted", `${employeeToDelete.name} has been permanently deleted.`);
          return;
        } else {
          hardDeleteEmployee(employeeToDelete.id);
          showToast.success("Employee Removed", `${employeeToDelete.name} removed from app.`);
          return;
        }
      }
      const {
        success,
        error
      } = await deleteSupabaseUser(employeeToDelete.authUserId);
      if (!success) {
        hardDeleteEmployee(employeeToDelete.id);
        showToast.warning("Partial Deletion", `${employeeToDelete.name} removed from app but could not delete from Supabase Auth.`);
        return;
      }
      hardDeleteEmployee(employeeToDelete.id);
      showToast.success("Employee Deleted", `${employeeToDelete.name} has been permanently deleted.`);
    } catch (err) {
      showToast.error("Deletion Failed", err.message);
    }
  };
  const handleClearAll = () => {
    if (confirm("⚠️ Delete ALL employees? This cannot be undone.")) {
      clearEmployees();
      showToast.success("All Cleared", "All employees have been removed.");
    }
  };
  const handleLoadDemo = () => {
    if (employees.length > 0 && !confirm("This will replace all current employees. Continue?")) return;
    loadDemo();
    showToast.success("Demo Loaded", "Demo employees have been loaded.");
  };
  const getMultiplierColor = (mult) => {
    if (mult >= 1) return "text-emerald-600 dark:text-emerald-400";
    if (mult >= 0.8) return "text-blue-600 dark:text-blue-400";
    if (mult >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };
  const coreCount = employees.filter((e) => !e.isAdjunct).length;
  const adjunctCount = employees.filter((e) => e.isAdjunct).length;
  const managerCount = employees.filter((e) => e.isManager).length;
  const avgMult = coreCount > 0 ? employees.filter((e) => !e.isAdjunct).reduce((s, e) => s + (calc.perEmployee[e.id]?.performanceMultiplier || 0), 0) / coreCount : 0;
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Employees", description: "Manage employee records, KPIs, supervisors, and performance data.", icon: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => {
        setEditingEmployee(null);
        setModalOpen(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
        " Add Employee"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleLoadDemo, className: "gap-2", children: [
        /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4" }),
        " Demo"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleClearAll, className: "gap-2 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10", children: [
        /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
        " Clear All"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), label: "Total Employees", value: employees.length, sub: `${coreCount} core · ${adjunctCount} adjunct`, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }), label: "Managers", value: managerCount, accent: "purple", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(avgMult, 2), accent: "success", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }), label: "Adjunct", value: adjunctCount, accent: "warning", size: "large" })
    ] }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { placeholder: "Search by name, email, department, or role...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-10" })
    ] }) }) }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Employee" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Department" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Role" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold text-center", children: "Grade" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold text-center", children: "Multiplier" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold text-center", children: "Months" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold text-right", children: "Bonus" }),
        /* @__PURE__ */ jsx(TableHead, { className: "font-semibold text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: sortedEmployees.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 8, className: "p-0", children: /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6" }), title: search ? "No matches found" : "No employees yet", description: search ? "Try a different search term." : "Add your first employee or load demo data to get started.", action: !search && /* @__PURE__ */ jsxs(Button, { onClick: () => {
        setEditingEmployee(null);
        setModalOpen(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
        " Add Employee"
      ] }) }) }) }) : sortedEmployees.map((emp, idx) => {
        const empCalc = calc.perEmployee[emp.id];
        const mult = empCalc?.performanceMultiplier || 0;
        const bonus = empCalc?.bonus || 0;
        return /* @__PURE__ */ jsxs(motion.tr, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, transition: {
          delay: Math.min(idx * 0.02, 0.3)
        }, className: "group hover:bg-accent/40 transition-colors border-b border-border/50", children: [
          /* @__PURE__ */ jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0", children: emp.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-sm truncate", children: emp.name }),
                emp.isSalesRole && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", children: "Sales" }),
                emp.isAdjunct && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", children: "Adjunct" }),
                emp.isManager && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", children: "Manager" })
              ] }),
              emp.email && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx("span", { className: "truncate max-w-[180px]", children: emp.email })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }),
            emp.department || "—"
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: emp.role || "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono text-xs", children: emp.jobGrade || "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: emp.isAdjunct ? /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsx("span", { className: `font-bold text-sm ${getMultiplierColor(mult)}`, children: fmtNum(mult, 2) }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: emp.isAdjunct ? "—" : emp.monthsWorked || 12 }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-blue-600 dark:text-blue-400", children: fmtGHS(bonus) }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => {
              setEditingEmployee(emp);
              setModalOpen(true);
            }, title: "Edit", children: /* @__PURE__ */ jsx(Edit2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10", onClick: () => {
              setEmployeeToDelete(emp);
              setDeleteModalOpen(true);
            }, title: "Delete", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) })
        ] }, emp.id);
      }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(EmployeeModal, { open: modalOpen, onClose: () => {
      setModalOpen(false);
      setEditingEmployee(null);
    }, employee: editingEmployee }),
    deleteModalOpen && employeeToDelete && /* @__PURE__ */ jsx(DeleteConfirmModal, { open: deleteModalOpen, onClose: () => {
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }, onConfirm: handleDeleteEmployee, employeeName: employeeToDelete.name, employeeEmail: employeeToDelete.email || "No email" })
  ] });
}
export {
  EmployeesPage as component
};
