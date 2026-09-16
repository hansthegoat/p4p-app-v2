import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { a as useP4P } from "./_ssr/router-BPHF_myF.mjs";
import { C as Card } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { I as Input } from "./_ssr/input-BgWjUwUQ.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-FVkpvMO7.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-CRI87WM2.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { S as StatCard } from "./_ssr/stat-card-DPr76q1z.mjs";
import { E as EmptyState } from "./_ssr/empty-state-DzL3lmex.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./_ssr/dialog-BU3bSDRt.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { s as staggerContainer, f as fadeUp } from "./_ssr/motion-DlChdgW6.mjs";
import "./_libs/sonner.mjs";
import { m as motion } from "./_libs/framer-motion.mjs";
import { R as RefreshCw, N as UserCog, f as Users, i as UserCheck, Q as UserMinus, V as Crown, y as Search, M as Mail, z as Building2, C as CircleCheckBig, r as CircleX, Y as UserPlus, S as Shield, t as ChevronRight } from "./_libs/lucide-react.mjs";
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
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
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
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
function SupervisorsPage() {
  const {
    employees,
    upsertEmployee
  } = useP4P();
  const [search, setSearch] = reactExports.useState("");
  const [selectedSupervisor, setSelectedSupervisor] = reactExports.useState("");
  const [editingSupervisor, setEditingSupervisor] = reactExports.useState(null);
  const [crownTarget, setCrownTarget] = reactExports.useState(null);
  const managers = reactExports.useMemo(() => employees.filter((e) => e.isManager === true), [employees]);
  const employeesWithSupervisors = reactExports.useMemo(() => employees.filter((e) => !e.isManager).sort((a, b) => a.name.localeCompare(b.name)), [employees]);
  const filteredEmployees = reactExports.useMemo(() => {
    if (!search.trim()) return employeesWithSupervisors;
    const t = search.toLowerCase();
    return employeesWithSupervisors.filter((e) => e.name.toLowerCase().includes(t) || e.department.toLowerCase().includes(t) || e.supervisorName && e.supervisorName.toLowerCase().includes(t));
  }, [employeesWithSupervisors, search]);
  const getSupervisorName = (id) => {
    if (!id) return "None";
    return employees.find((e) => e.id === id)?.name || "Unknown";
  };
  const handleAssignSupervisor = (employeeId, supervisorId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;
    const supervisor = employees.find((e) => e.id === supervisorId);
    upsertEmployee({
      ...employee,
      supervisorId: supervisorId || void 0,
      supervisorName: supervisor?.name || ""
    });
    setEditingSupervisor(null);
    setSelectedSupervisor("");
    showToast.success(supervisorId ? "Supervisor Assigned" : "Supervisor Removed", supervisorId ? `${employee.name} → ${supervisor?.name}` : `${employee.name} is now unassigned.`);
  };
  const confirmToggleManager = () => {
    if (!crownTarget) return;
    const employee = employees.find((e) => e.id === crownTarget);
    if (!employee) return;
    upsertEmployee({
      ...employee,
      isManager: !employee.isManager
    });
    showToast.success(employee.isManager ? "Manager Status Removed" : "Manager Status Added", employee.name);
    setCrownTarget(null);
  };
  const totalEmployees = employees.filter((e) => !e.isManager).length;
  const assigned = employees.filter((e) => e.supervisorId && !e.isManager).length;
  const unassigned = totalEmployees - assigned;
  const totalManagers = managers.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Supervisor Assignment", description: "Assign managers to employees for appraisal reviews and team oversight.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => window.location.reload(), className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
      " Refresh"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Total Employees", value: totalEmployees, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }), label: "Assigned", value: assigned, sub: totalEmployees > 0 ? `${Math.round(assigned / totalEmployees * 100)}% coverage` : void 0, accent: "success", size: "large" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "h-4 w-4" }), label: "Unassigned", value: unassigned, accent: "warning", size: "large", pulse: unassigned > 0 ? "amber" : "none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }), label: "Managers", value: totalManagers, accent: "purple", size: "large" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Managers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            totalManagers,
            " active managers"
          ] })
        ] })
      ] }) }),
      managers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No managers defined yet. Toggle the crown icon below to promote an employee." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: managers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.9
      }, animate: {
        opacity: 1,
        scale: 1
      }, className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-amber-600 dark:text-amber-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: m.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
          "· ",
          m.department
        ] })
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by name, department, or supervisor...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-10" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold", children: "Supervisor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-center", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "font-semibold text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredEmployees.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }), title: search ? "No matches" : "No employees", description: search ? "Try a different search." : "Add employees first to assign supervisors." }) }) }) : filteredEmployees.map((emp, idx) => {
        const hasSupervisor = !!emp.supervisorId;
        const isEditing = editingSupervisor === emp.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.tr, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, transition: {
          delay: Math.min(idx * 0.02, 0.3)
        }, className: "border-b border-border/50 hover:bg-accent/40 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0", children: emp.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: emp.name }),
              emp.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[140px]", children: emp.email })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
            emp.department || "—"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: emp.role || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedSupervisor, onValueChange: setSelectedSupervisor, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supervisor" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None" }),
                managers.filter((m) => m.id !== emp.id).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: m.id, children: [
                  m.name,
                  " (",
                  m.department,
                  ")"
                ] }, m.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 px-2 gap-1", onClick: () => {
              if (!selectedSupervisor) {
                showToast.warning("Select Supervisor", "Please choose a supervisor.");
                return;
              }
              handleAssignSupervisor(emp.id, selectedSupervisor === "none" ? "" : selectedSupervisor);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 px-2", onClick: () => {
              setEditingSupervisor(null);
              setSelectedSupervisor("");
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5" }) })
          ] }) : hasSupervisor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: emp.supervisorName || getSupervisorName(emp.supervisorId) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-600 dark:text-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Unassigned" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: hasSupervisor ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
            " Assigned"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
            " Pending"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8 gap-1.5 text-xs", onClick: () => {
              setEditingSupervisor(emp.id);
              setSelectedSupervisor(emp.supervisorId || "none");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
              hasSupervisor ? "Change" : "Assign"
            ] }),
            hasSupervisor && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10", onClick: () => handleAssignSupervisor(emp.id, ""), title: "Remove supervisor", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: `h-8 w-8 p-0 ${emp.isManager ? "text-amber-600 hover:bg-amber-500/10" : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"}`, onClick: () => setCrownTarget(emp.id), title: emp.isManager ? "Remove as manager" : "Make manager", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }) })
          ] }) })
        ] }, emp.id);
      }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 bg-blue-500/5 border-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-blue-900 dark:text-blue-300", children: "How Supervisor Assignment Works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Assign" }),
            " next to an employee to set their supervisor."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Managers only see their ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "direct reports" }),
            " in the appraisals review page."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Click the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "crown icon" }),
            " to promote or demote a manager."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0" }),
            "Employees without a supervisor appear as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Unassigned" }),
            "."
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!crownTarget, onOpenChange: (open) => !open && setCrownTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-amber-500" }),
          employees.find((employee) => employee.id === crownTarget)?.isManager ? "Remove manager status?" : "Promote to manager?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-[11px]", children: employees.find((employee) => employee.id === crownTarget)?.isManager ? "They will no longer appear as a supervisor option for other employees." : "They will be able to be assigned as a supervisor to other employees." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-row justify-end gap-2 pt-3 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setCrownTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: confirmToggleManager, className: "gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5" }),
          "Confirm"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SupervisorsPage as component
};
