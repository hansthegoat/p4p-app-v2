import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { a as useP4P, c as fmtNum, f as fmtGHS, n as newId } from "./_ssr/router-BPHF_myF.mjs";
import { C as Card, c as cn } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { I as Input } from "./_ssr/input-BgWjUwUQ.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-CRI87WM2.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { S as StatCard } from "./_ssr/stat-card-DPr76q1z.mjs";
import { E as EmptyState } from "./_ssr/empty-state-DzL3lmex.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { s as staggerContainer, f as fadeUp } from "./_ssr/motion-DlChdgW6.mjs";
import { T as Textarea } from "./_ssr/textarea-BgZCD-Mr.mjs";
import { L as Label } from "./_ssr/label-zkAJpnXH.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "./_libs/radix-ui__react-checkbox.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-FVkpvMO7.mjs";
import { getTemplateForJobGrade } from "./_ssr/kpi-templates-DZws1qej.mjs";
import "./_libs/sonner.mjs";
import { m as motion, A as AnimatePresence } from "./_libs/framer-motion.mjs";
import { Y as UserPlus, F as FileSpreadsheet, X, f as Users, p as TriangleAlert, x as Award, g as TrendingUp, y as Search, a as CircleAlert, M as Mail, z as Building2, ai as Pen, a5 as Trash2, ae as FolderPlus, aa as Plus, L as LoaderCircle, u as Check } from "./_libs/lucide-react.mjs";
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
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/zod.mjs";
import "./_libs/sentry__react.mjs";
import "./_libs/sentry__core.mjs";
import "./_libs/sentry__browser.mjs";
import "./_libs/sentry__browser-utils.mjs";
import "./_libs/sentry__conventions.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
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
  const [data, setData] = reactExports.useState(blank());
  reactExports.useEffect(() => {
    if (open) {
      const emp = employee ? JSON.parse(JSON.stringify(employee)) : blank();
      if (!emp.categories) emp.categories = [];
      if (!emp.supervisorId) emp.supervisorId = "";
      if (!emp.supervisorName) emp.supervisorName = "";
      setData(emp);
    }
  }, [open, employee]);
  const setField = (k, v) => setData((d) => ({ ...d, [k]: v }));
  reactExports.useEffect(() => {
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
        weight: k.weight || 0,
        measurementSource: k.measurementSource || ""
      }))
    }));
    setData((prev) => ({ ...prev, categories }));
  }, [data.jobGrade, data.isAdjunct]);
  const loadTemplate = () => {
    const template = getTemplateForJobGrade(data.jobGrade);
    if (!template) {
      showToast.warning("No Template", `No KPI template found for job grade "${data.jobGrade}"`);
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
        weight: k.weight || 0,
        measurementSource: k.measurementSource || ""
      }))
    }));
    setData((prev) => ({ ...prev, categories }));
    showToast.success("Template Loaded", `${template.categories.length} categories loaded.`);
  };
  const getWeightStats = (categories) => {
    const total = categories.reduce((sum, c) => sum + c.weight, 0);
    const remaining = Math.max(0, 100 - total);
    return { total, remaining, isOver: total > 100, isComplete: total === 100 };
  };
  const getKpiWeightStats = (category) => {
    const total = category.kpis.reduce((sum, k) => sum + (k.weight || 0), 0);
    return {
      total,
      isComplete: Math.abs(total - 100) < 0.01,
      isOver: total > 100
    };
  };
  const addCategory = () => {
    const newCategory = {
      id: newId(),
      name: `Category ${(data.categories || []).length + 1}`,
      weight: 0,
      kpis: []
    };
    setData((d) => ({ ...d, categories: [...d.categories || [], newCategory] }));
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
      weight: 0,
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
        (c) => c.id === categoryId ? { ...c, kpis: c.kpis.map((k) => k.id === kpiId ? { ...k, ...updates } : k) } : c
      )
    }));
  };
  const save = () => {
    if (!data.name.trim()) {
      showToast.warning("Name Required", "Please enter the employee's name.");
      return;
    }
    const categories = data.categories || [];
    const stats = getWeightStats(categories);
    if (categories.length > 0 && !stats.isComplete) {
      showToast.error(
        "Category Weights Invalid",
        `Category weights must sum to 100%. Currently: ${stats.total}%.`
      );
      return;
    }
    for (const cat of categories) {
      const kpiStats = getKpiWeightStats(cat);
      if (cat.kpis.length > 0 && !kpiStats.isComplete) {
        showToast.error(
          "KPI Weights Invalid",
          `In "${cat.name}", KPI weights must sum to 100%. Currently: ${kpiStats.total}%.`
        );
        return;
      }
    }
    let supervisorName = data.supervisorName || "";
    if (data.supervisorId) {
      const supervisor = employees.find((e) => e.id === data.supervisorId);
      if (supervisor) supervisorName = supervisor.name;
    }
    upsertEmployee({
      ...data,
      email: data.email?.trim() || "",
      supervisorName,
      monthsWorked: Number(data.monthsWorked) || 0,
      kpis: data.isAdjunct ? [] : data.kpis,
      categories: data.isAdjunct ? [] : categories
    });
    showToast.success("Employee Saved", `${data.name} has been saved.`);
    onClose();
  };
  const hasCategories = (data.categories || []).length > 0;
  const hasLegacyKPIs = data.kpis.length > 0;
  const weightStats = getWeightStats(data.categories || []);
  const hasTemplate = !!getTemplateForJobGrade(data.jobGrade);
  const managers = employees.filter((e) => e.isManager === true && e.id !== data.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 bg-black/50 z-40"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "tween", duration: 0.3 },
        className: "@container fixed right-0 top-0 bottom-0 w-full sm:w-[720px] lg:w-[900px] bg-background z-50 shadow-2xl overflow-y-auto",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
              employee ? "Edit" : "Add",
              " Employee"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-2 rounded-md hover:bg-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: data.name, onChange: (e) => setField("name", e.target.value), placeholder: "Full name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: data.email || "", onChange: (e) => setField("email", e.target.value), placeholder: "Email address" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job Grade" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: data.jobGrade, onValueChange: (v) => setField("jobGrade", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: grades.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: g.code, children: [
                  g.code,
                  " — ",
                  g.name,
                  " (",
                  g.points,
                  ")"
                ] }, g.code)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Department" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: data.department || "", onChange: (e) => setField("department", e.target.value), placeholder: "Department" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: data.role || "", onChange: (e) => setField("role", e.target.value), placeholder: "Role (e.g., Senior Specialist)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supervisor/Manager" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: data.supervisorId || "none",
                  onValueChange: (v) => {
                    if (v === "none") {
                      setField("supervisorId", "");
                      setField("supervisorName", "");
                    } else {
                      const sup = employees.find((e) => e.id === v);
                      setField("supervisorId", v);
                      setField("supervisorName", sup?.name || "");
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supervisor (optional)" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None" }, "none"),
                      managers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: m.id, children: [
                        m.name,
                        " (",
                        m.department,
                        ")"
                      ] }, m.id))
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: data.isManager || false,
                  onCheckedChange: (v) => setField("isManager", !!v)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm cursor-pointer", children: "This employee is a Manager/Supervisor" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: data.isAdjunct, onCheckedChange: (v) => setField("isAdjunct", !!v) }),
                "Is Adjunct?"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: data.isSalesRole, onCheckedChange: (v) => setField("isSalesRole", !!v) }),
                "Is Sales Role?"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Join Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: data.joinDate, onChange: (e) => setField("joinDate", e.target.value) })
              ] }),
              globals.prorationOn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Months Worked" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
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
            !data.isAdjunct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Weighted Categories" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  hasTemplate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: loadTemplate, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { className: "h-4 w-4 mr-1" }),
                    " Load Template"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: addCategory, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
                    " Add Category"
                  ] })
                ] })
              ] }),
              hasCategories && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `rounded-md p-3 mb-3 text-sm flex items-center gap-2 ${weightStats.isOver ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:text-red-400" : weightStats.isComplete ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs sm:text-sm", children: [
                      weightStats.isOver ? "⚠️ Over 100%! " : weightStats.isComplete ? "✅ Perfect! " : "📊 ",
                      "Category Total: ",
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                        weightStats.total,
                        "%"
                      ] }),
                      !weightStats.isOver && !weightStats.isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        " · Remaining: ",
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                          weightStats.remaining,
                          "%"
                        ] })
                      ] })
                    ] })
                  ]
                }
              ),
              hasCategories ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: (data.categories || []).map((category) => {
                const kpiStats = getKpiWeightStats(category);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 sm:p-4 border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        value: category.name,
                        onChange: (e) => updateCategory(category.id, { name: e.target.value }),
                        placeholder: "Category name",
                        className: "flex-1"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 sm:w-24", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Input,
                          {
                            type: "number",
                            value: category.weight,
                            onChange: (e) => {
                              const nw = Number(e.target.value);
                              if (nw < 0) return;
                              const others = (data.categories || []).filter((c) => c.id !== category.id);
                              const otherTotal = others.reduce((s, c) => s + c.weight, 0);
                              const maxAllowed = 100 - otherTotal;
                              if (nw <= maxAllowed) {
                                updateCategory(category.id, { weight: nw });
                              } else {
                                showToast.warning(
                                  "Weight Too High",
                                  `Only ${maxAllowed}% remaining.`
                                );
                              }
                            },
                            placeholder: "Weight %",
                            className: "pr-6",
                            min: 0,
                            max: 100
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground", children: "%" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "sm", onClick: () => removeCategory(category.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
                    ] })
                  ] }),
                  category.kpis.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: `rounded-md px-3 py-2 mb-3 text-xs flex items-center gap-2 ${kpiStats.isOver ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:text-red-400" : kpiStats.isComplete ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 flex-shrink-0" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          kpiStats.isOver ? "⚠️ KPI weights over 100%! " : kpiStats.isComplete ? "✅ KPI weights perfect! " : "📊 ",
                          "KPI Total: ",
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                            kpiStats.total,
                            "%"
                          ] }),
                          !kpiStats.isOver && !kpiStats.isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            " · Need ",
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                              100 - kpiStats.total,
                              "%"
                            ] }),
                            " more"
                          ] })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                    category.kpis.map((kpi) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block", children: "KPI Description" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Textarea,
                                {
                                  value: kpi.description,
                                  onChange: (e) => {
                                    updateKPI(category.id, kpi.id, { description: e.target.value });
                                    e.target.style.height = "auto";
                                    e.target.style.height = e.target.scrollHeight + "px";
                                  },
                                  placeholder: "e.g., 100% of quarterly sales target from enterprise accounts",
                                  rows: 2,
                                  className: "min-h-[60px] resize-none text-sm overflow-hidden"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Button,
                              {
                                variant: "ghost",
                                size: "sm",
                                onClick: () => removeKPI(category.id, kpi.id),
                                className: "mt-5 h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 shrink-0",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-5 gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block", children: "Metric" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kpi.metric, onValueChange: (v) => updateKPI(category.id, kpi.id, { metric: v }), children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "%", children: "%" }, "%"),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "GHS", children: "GHS" }, "GHS"),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "#", children: "#" }, "#"),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hrs", children: "hrs" }, "hrs"),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "days", children: "days" }, "days")
                                ] })
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block", children: "Weight %" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Input,
                                {
                                  type: "number",
                                  min: 0,
                                  max: 100,
                                  value: kpi.weight || 0,
                                  onChange: (e) => updateKPI(category.id, kpi.id, { weight: Number(e.target.value) }),
                                  placeholder: "0",
                                  className: "h-9 font-mono"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block", children: "Target" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Input,
                                {
                                  type: "number",
                                  value: kpi.target,
                                  onChange: (e) => updateKPI(category.id, kpi.id, { target: Number(e.target.value) }),
                                  placeholder: "Target",
                                  className: "h-9"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block", children: "Actual" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Input,
                                {
                                  type: "number",
                                  value: kpi.actual,
                                  onChange: (e) => updateKPI(category.id, kpi.id, { actual: Number(e.target.value) }),
                                  placeholder: "Actual",
                                  className: "h-9"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block", children: "Source" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Input,
                                {
                                  value: kpi.measurementSource || "",
                                  onChange: (e) => updateKPI(category.id, kpi.id, { measurementSource: e.target.value }),
                                  placeholder: "e.g., CRM",
                                  className: "h-9"
                                }
                              )
                            ] })
                          ] })
                        ]
                      },
                      kpi.id
                    )),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => addKPI(category.id), className: "mt-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
                      " Add KPI"
                    ] })
                  ] })
                ] }, category.id);
              }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center", children: 'No categories yet. Click "Add Category" or "Load Template" to start.' })
            ] }),
            !data.isAdjunct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Legacy KPIs (Simple List — optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    onClick: () => setData((d) => ({
                      ...d,
                      kpis: [
                        ...d.kpis,
                        {
                          id: newId(),
                          description: "",
                          metric: "%",
                          target: 0,
                          actual: 0,
                          weight: 100,
                          measurementSource: ""
                        }
                      ]
                    })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
                      " Add Legacy KPI"
                    ]
                  }
                )
              ] }),
              hasLegacyKPIs ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data.kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border rounded-md space-y-2 bg-card", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      className: "flex-1 min-h-[60px] resize-none text-sm",
                      rows: 2,
                      placeholder: "Description",
                      value: k.description,
                      onChange: (e) => setData((d) => ({
                        ...d,
                        kpis: d.kpis.map((x) => x.id === k.id ? { ...x, description: e.target.value } : x)
                      }))
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setData((d) => ({ ...d, kpis: d.kpis.filter((x) => x.id !== k.id) })),
                      className: "p-2 hover:text-destructive",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Metric" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: k.metric,
                        onValueChange: (v) => setData((d) => ({
                          ...d,
                          kpis: d.kpis.map((x) => x.id === k.id ? { ...x, metric: v } : x)
                        })),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["%", "GHS", "#", "hrs", "days"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Target" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        value: k.target,
                        onChange: (e) => setData((d) => ({
                          ...d,
                          kpis: d.kpis.map((x) => x.id === k.id ? { ...x, target: Number(e.target.value) } : x)
                        }))
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Actual" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        value: k.actual,
                        onChange: (e) => setData((d) => ({
                          ...d,
                          kpis: d.kpis.map((x) => x.id === k.id ? { ...x, actual: Number(e.target.value) } : x)
                        }))
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Source" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        value: k.measurementSource || "",
                        onChange: (e) => setData((d) => ({
                          ...d,
                          kpis: d.kpis.map(
                            (x) => x.id === k.id ? { ...x, measurementSource: e.target.value } : x
                          )
                        })),
                        placeholder: "Measurement source"
                      }
                    )
                  ] })
                ] })
              ] }, k.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center", children: "No legacy KPIs. Use Weighted Categories above instead." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-4 sticky bottom-0 bg-background pb-2 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, className: "flex-1", disabled: hasCategories && !weightStats.isComplete, children: "Save" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" })
            ] })
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
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 bg-black/50 z-50",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        className: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 shadow-2xl border-red-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-red-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-red-600", children: "Delete Employee" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This action cannot be undone" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "p-1 rounded-md hover:bg-muted transition-colors",
                disabled: loading,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5 text-muted-foreground" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ Warning:" }),
              " You are about to permanently delete this employee's account."
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 rounded-md p-3 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Name:" }),
                " ",
                employeeName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Email:" }),
                " ",
                employeeEmail
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This will permanently remove:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside text-xs space-y-0.5 ml-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Employee record and all personal data" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All KPI history and performance data" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All appraisal submissions and reviews" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Login access (Supabase Auth account)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Uploaded proof files" })
              ] })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700", children: error })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "flex-1",
                onClick: onClose,
                disabled: loading,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "destructive",
                className: "flex-1 flex items-center gap-2",
                onClick: handleConfirm,
                disabled: loading,
                children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                  "Deleting..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
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
  const [search, setSearch] = reactExports.useState("");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editingEmployee, setEditingEmployee] = reactExports.useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = reactExports.useState(false);
  const [employeeToDelete, setEmployeeToDelete] = reactExports.useState(null);
  const realEmployees = employees.filter((e) => e.roleType !== "admin");
  const filteredEmployees = realEmployees.filter((emp) => {
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
    hardDeleteEmployee(employeeToDelete.id);
    showToast.success("Employee Removed", `${employeeToDelete.name} removed from app.`);
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
  const coreCount = realEmployees.filter((e) => !e.isAdjunct).length;
  const adjunctCount = realEmployees.filter((e) => e.isAdjunct).length;
  const managerCount = realEmployees.filter((e) => e.isManager).length;
  const needsKpiCount = realEmployees.filter((e) => e.needsKpiSetup).length;
  const avgMult = coreCount > 0 ? realEmployees.filter((e) => !e.isAdjunct).reduce((s, e) => s + (calc.perEmployee[e.id]?.performanceMultiplier || 0), 0) / coreCount : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Employees", description: "Manage employee records, KPIs, supervisors, and performance data.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditingEmployee(null);
        setModalOpen(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
        " Add Employee"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleLoadDemo, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4" }),
        " Demo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleClearAll, className: "gap-2 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
        " Clear All"
      ] })
    ] }) }),
    needsKpiCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 bg-amber-500/5 border-amber-500/20 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold text-amber-800 dark:text-amber-300", children: [
          needsKpiCount,
          " employee",
          needsKpiCount > 1 ? "s" : "",
          " need",
          needsKpiCount === 1 ? "s" : "",
          " KPIs assigned"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-700 dark:text-amber-400 mt-0.5", children: "Open the employee, load a KPI template, and save." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Total Employees", value: realEmployees.length, sub: `${coreCount} core · ${adjunctCount} adjunct`, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }), label: "Managers", value: managerCount, accent: "purple", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }), label: "Avg Multiplier", value: fmtNum(avgMult, 2), accent: "success", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }), label: "Needs KPIs", value: needsKpiCount, accent: needsKpiCount > 0 ? "warning" : "default", size: "large", pulse: needsKpiCount > 0 ? "amber" : "none" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by name, email, department, or role...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-10" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-center", children: "Grade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-center", children: "Multiplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-center", children: "Months" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-right", children: "Bonus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedEmployees.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }), title: search ? "No matches found" : "No employees yet", description: search ? "Try a different search term." : "Add your first employee or load demo data to get started.", action: !search && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingEmployee(null);
        setModalOpen(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
        " Add Employee"
      ] }) }) }) }) : sortedEmployees.map((emp, idx) => {
        const empCalc = calc.perEmployee[emp.id];
        const mult = empCalc?.performanceMultiplier || 0;
        const bonus = empCalc?.bonus || 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.tr, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, transition: {
          delay: Math.min(idx * 0.02, 0.3)
        }, className: "group hover:bg-accent/40 transition-colors border-b border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0", children: emp.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm truncate", children: emp.name }),
                emp.isSalesRole && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", children: "Sales" }),
                emp.isAdjunct && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", children: "Adjunct" }),
                emp.isManager && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", children: "Manager" }),
                emp.needsKpiSetup && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-2.5 w-2.5" }),
                  "Needs KPIs"
                ] })
              ] }),
              emp.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[180px]", children: emp.email })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
            emp.department || "—"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: emp.role || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "font-mono text-xs", children: emp.jobGrade || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: emp.isAdjunct ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold text-sm ${getMultiplierColor(mult)}`, children: fmtNum(mult, 2) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: emp.isAdjunct ? "—" : emp.monthsWorked || 12 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-blue-600 dark:text-blue-400", children: fmtGHS(bonus) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => {
              setEditingEmployee(emp);
              setModalOpen(true);
            }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10", onClick: () => {
              setEmployeeToDelete(emp);
              setDeleteModalOpen(true);
            }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) })
        ] }, emp.id);
      }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EmployeeModal, { open: modalOpen, onClose: () => {
      setModalOpen(false);
      setEditingEmployee(null);
    }, employee: editingEmployee }),
    deleteModalOpen && employeeToDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirmModal, { open: deleteModalOpen, onClose: () => {
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }, onConfirm: handleDeleteEmployee, employeeName: employeeToDelete.name, employeeEmail: employeeToDelete.email || "No email" })
  ] });
}
export {
  EmployeesPage as component
};
