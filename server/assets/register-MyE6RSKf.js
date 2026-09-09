import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { C as Card, B as Button } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { P as P4PProvider, u as useP4P } from "./store-BAYdnpO7.js";
import { r as register, l as login } from "./auth-BuRtUrw4.js";
import { g as getRolesForDepartment, a as getTemplateByDepartmentAndRole, b as getDepartments } from "./kpi-templates-BxwbgPy9.js";
import { n as newId } from "./router-B8uhSUT7.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
import "@tanstack/react-query";
import "@supabase/supabase-js";
const MANAGER_ROLES = ["President", "Executive President", "Senior Vice President", "Vice President", "Head of Department", "Deputy Head of Department", "Line Manager/SBU Head", "Team Lead"];
function RegisterForm() {
  const navigate = useNavigate();
  const {
    upsertEmployee,
    getTemplate
  } = useP4P();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const departments = getDepartments();
  useEffect(() => {
    if (department) {
      setRoles(getRolesForDepartment());
      setRole("");
    }
  }, [department]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(email, password);
      const template = getTemplateByDepartmentAndRole(department, role);
      if (!template) {
        setError(`No KPI framework defined for ${department} / ${role}. Please contact HR.`);
        setLoading(false);
        return;
      }
      const isManager = MANAGER_ROLES.some((r) => r.toLowerCase() === role.toLowerCase());
      const newEmployee = {
        id: newId(),
        name,
        email,
        department,
        role,
        jobGrade: template.jobGrade || "4",
        isAdjunct: false,
        isSalesRole: false,
        joinDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        monthsWorked: 12,
        kpis: [],
        categories: template.categories.map((cat) => ({
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
        })),
        roleType: "employee",
        isManager,
        supervisorId: "",
        supervisorName: ""
      };
      upsertEmployee(newEmployee);
      await login(email, password);
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-center mb-2", children: "Create Account" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center mb-6", children: "Register to access your performance dashboard" }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Full Name" }),
        /* @__PURE__ */ jsx(Input, { type: "text", placeholder: "Your full name", value: name, onChange: (e) => setName(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Password" }),
        /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6 })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Department" }),
        /* @__PURE__ */ jsxs(Select, { value: department, onValueChange: setDepartment, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select your department" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: departments.map((dept) => /* @__PURE__ */ jsx(SelectItem, { value: dept, children: dept }, dept)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Role" }),
        /* @__PURE__ */ jsxs(Select, { value: role, onValueChange: setRole, disabled: !department, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: department ? "Select your role" : "Select department first" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: roles.map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading || !department || !role, children: loading ? "Creating Account..." : "Register" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground text-center mt-4", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx("button", { onClick: () => navigate({
        to: "/login"
      }), className: "text-primary hover:underline", children: "Sign In" })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsx(P4PProvider, { children: /* @__PURE__ */ jsx(RegisterForm, {}) });
export {
  SplitComponent as component
};
