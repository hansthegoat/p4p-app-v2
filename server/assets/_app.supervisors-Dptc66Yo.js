import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { u as useP4P } from "./store-Dy84gyCY.js";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { RefreshCw, Search, Users, User, CheckCircle, XCircle } from "lucide-react";
import "./router-ykR6owpd.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function SupervisorsPage() {
  const {
    employees,
    upsertEmployee
  } = useP4P();
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [loading, setLoading] = useState(false);
  const managers = useMemo(() => {
    return employees.filter((e) => e.isManager === true);
  }, [employees]);
  const employeesWithSupervisors = useMemo(() => {
    return employees.filter((e) => !e.isManager).sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employeesWithSupervisors;
    const term = search.toLowerCase();
    return employeesWithSupervisors.filter((e) => e.name.toLowerCase().includes(term) || e.department.toLowerCase().includes(term) || e.supervisorName && e.supervisorName.toLowerCase().includes(term));
  }, [employeesWithSupervisors, search]);
  const getSupervisorName = (id) => {
    if (!id) return "None";
    const supervisor = employees.find((e) => e.id === id);
    return supervisor ? supervisor.name : "Unknown";
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
    setSelectedEmployee(null);
    setEditingSupervisor(null);
    setSelectedSupervisor("");
  };
  const toggleManager = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;
    const confirmMsg = employee.isManager ? `Remove ${employee.name} as a manager?` : `Make ${employee.name} a manager?`;
    if (confirm(confirmMsg)) {
      upsertEmployee({
        ...employee,
        isManager: !employee.isManager
      });
    }
  };
  const totalEmployees = employees.filter((e) => !e.isManager).length;
  const assignedEmployees = employees.filter((e) => e.supervisorId && !e.isManager).length;
  const unassignedEmployees = totalEmployees - assignedEmployees;
  const totalManagers = managers.length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "👤 Supervisor Assignment" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Assign managers/supervisors to employees for appraisal reviews." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => window.location.reload(), children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-1" }),
        " Refresh"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: totalEmployees }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Total Employees" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-green-200 bg-green-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-600", children: assignedEmployees }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-green-600", children: "Assigned to Supervisor" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-yellow-200 bg-yellow-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-600", children: unassignedEmployees }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-yellow-600", children: "Unassigned" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-blue-200 bg-blue-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600", children: totalManagers }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-600", children: "Managers" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(Label, { children: "Search Employees" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Search by name, department, or supervisor...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setSearch(""), children: "Clear" }) })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }),
        " Managers (",
        totalManagers,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: managers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No managers defined yet. Make someone a manager below." }) : managers.map((m) => /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "px-3 py-1.5 text-sm bg-blue-50 border-blue-200", children: [
        /* @__PURE__ */ jsx(User, { className: "h-3 w-3 mr-1" }),
        m.name,
        " (",
        m.department,
        ")"
      ] }, m.id)) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Employee" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Department" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Supervisor" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filteredEmployees.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "No employees found." }) }) : filteredEmployees.map((emp) => {
        const hasSupervisor = !!emp.supervisorId;
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: emp.name }),
          /* @__PURE__ */ jsx(TableCell, { children: emp.department }),
          /* @__PURE__ */ jsx(TableCell, { children: emp.role }),
          /* @__PURE__ */ jsx(TableCell, { children: hasSupervisor ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-green-600", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
            emp.supervisorName || getSupervisorName(emp.supervisorId)
          ] }) : /* @__PURE__ */ jsxs("span", { className: "text-yellow-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
            "Unassigned"
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: hasSupervisor ? /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-700 border-green-200", children: "Assigned" }) : /* @__PURE__ */ jsx(Badge, { className: "bg-yellow-100 text-yellow-700 border-yellow-200", children: "Pending" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: editingSupervisor === emp.id ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(Select, { value: selectedSupervisor, onValueChange: setSelectedSupervisor, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select supervisor" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "None" }),
                managers.filter((m) => m.id !== emp.id).map((m) => /* @__PURE__ */ jsxs(SelectItem, { value: m.id, children: [
                  m.name,
                  " (",
                  m.department,
                  ")"
                ] }, m.id))
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", className: "border-green-500 text-green-600 hover:bg-green-50", onClick: () => {
              if (!selectedSupervisor) {
                alert("Please select a supervisor.");
                return;
              }
              handleAssignSupervisor(emp.id, selectedSupervisor);
            }, children: "Save" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
              setEditingSupervisor(null);
              setSelectedSupervisor("");
            }, children: "Cancel" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
              setEditingSupervisor(emp.id);
              setSelectedSupervisor(emp.supervisorId || "");
            }, children: "Assign" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "text-red-500 hover:text-red-700 hover:bg-red-50", onClick: () => {
              if (hasSupervisor && confirm(`Remove supervisor from ${emp.name}?`)) {
                handleAssignSupervisor(emp.id, "");
              }
            }, disabled: !hasSupervisor, children: "Remove" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: `text-blue-500 hover:text-blue-700 hover:bg-blue-50 ${emp.isManager ? "bg-blue-50 text-blue-700" : ""}`, onClick: () => toggleManager(emp.id), title: emp.isManager ? "Remove as manager" : "Make manager", children: emp.isManager ? "👑" : "➕" })
          ] }) }) })
        ] }, emp.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-4 border-blue-200 bg-blue-50/50", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-blue-800 mb-2", children: "💡 How It Works" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-700 space-y-1 list-disc list-inside", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "Click ",
          /* @__PURE__ */ jsx("strong", { children: '"Assign"' }),
          " next to an employee to set their supervisor/manager."
        ] }),
        /* @__PURE__ */ jsx("li", { children: "Managers will only see their direct reports in the Review Appraisals page." }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Click ",
          /* @__PURE__ */ jsx("strong", { children: '"👑"' }),
          " to make someone a manager (or remove manager status)."
        ] }),
        /* @__PURE__ */ jsx("li", { children: 'An employee without a supervisor will appear as "Unassigned".' })
      ] })
    ] })
  ] });
}
export {
  SupervisorsPage as component
};
