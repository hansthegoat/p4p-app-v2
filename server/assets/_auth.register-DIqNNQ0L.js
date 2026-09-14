import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-FVkpvMO7.js";
import { P as P4PProvider, a as useP4P, s as supabase } from "./router-w7c543WJ.js";
import { getDepartments, getRolesForDepartment } from "./kpi-templates-jbf3Btmq.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { c as checkPassword, p as passwordColor } from "./password-BT88-4ic.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
const MANAGER_ROLES = ["President", "Executive President", "Senior Vice President", "Vice President", "Head of Department", "Deputy Head of Department", "Line Manager", "Team Lead"];
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
  const [pwCheck, setPwCheck] = useState(checkPassword(""));
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
    const pwResult = checkPassword(password);
    if (!pwResult.ok) {
      setError(pwResult.errors[0] || "Password doesn't meet requirements");
      setLoading(false);
      return;
    }
    try {
      const template = getTemplate(department, role);
      const hasTemplate = !!template;
      if (!hasTemplate) {
        console.warn(`No KPI template for ${department} / ${role}. Employee will be created with empty KPIs.`);
      }
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            department,
            role
          }
        }
      });
      if (authError) throw authError;
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }
      const needsVerification = !authData.session;
      const pendingRegistration = {
        authUserId: authData.user.id,
        name,
        email,
        department,
        role
      };
      localStorage.setItem("p4p_pending_registration", JSON.stringify(pendingRegistration));
      if (needsVerification) {
        showToast.success("Verification Code Sent", `Check ${email} for your 6-digit code.`);
        navigate({
          to: "/verify-otp",
          search: {
            email
          }
        });
      } else {
        const isManager = MANAGER_ROLES.some((r) => r.toLowerCase() === role.toLowerCase());
        const newEmployee = {
          id: authData.user.id,
          name,
          email,
          authUserId: authData.user.id,
          department,
          role,
          jobGrade: template?.jobGrade || "4",
          isAdjunct: false,
          isSalesRole: false,
          joinDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          monthsWorked: 12,
          kpis: [],
          categories: template ? template.categories.map((cat) => ({
            id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: cat.name,
            weight: cat.weight,
            kpis: cat.kpis.map((k) => ({
              id: `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              description: k.description,
              metric: k.metric,
              target: k.target,
              actual: 0,
              weight: 100,
              measurementSource: k.measurementSource || ""
            }))
          })) : [],
          roleType: "employee",
          isManager,
          supervisorId: "",
          supervisorName: "",
          needsKpiSetup: !hasTemplate
        };
        upsertEmployee(newEmployee);
        localStorage.removeItem("p4p_pending_registration");
        showToast.success("Account Created!", "You're now logged in.");
        navigate({
          to: "/dashboard"
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-1", children: "Create your account" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Register to access your performance dashboard" })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Full Name" }),
        /* @__PURE__ */ jsx(Input, { type: "text", placeholder: "Your full name", value: name, onChange: (e) => setName(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Password" }),
        /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: password, onChange: (e) => {
          setPassword(e.target.value);
          setPwCheck(checkPassword(e.target.value));
        }, required: true, disabled: loading }),
        password.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 mt-2", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: `h-1 flex-1 rounded-full transition-colors ${i < pwCheck.score ? passwordColor(pwCheck.score) : "bg-muted"}` }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: pwCheck.errors.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "space-y-0.5", children: pwCheck.errors.map((err, i) => /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              err
            ] }, i)) }) : /* @__PURE__ */ jsxs("span", { className: "text-emerald-600 dark:text-emerald-400", children: [
              "✓ Password is ",
              pwCheck.label.toLowerCase()
            ] }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium shrink-0", children: pwCheck.label })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Department" }),
        /* @__PURE__ */ jsxs(Select, { value: department, onValueChange: setDepartment, disabled: loading, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select your department" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: departments.map((dept) => /* @__PURE__ */ jsx(SelectItem, { value: dept, children: dept }, dept)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Role" }),
        /* @__PURE__ */ jsxs(Select, { value: role, onValueChange: setRole, disabled: !department || loading, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: department ? "Select your role" : "Select department first" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: roles.map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading || !department || !role, children: loading ? "Creating Account..." : "Register" })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(P4PProvider, { children: /* @__PURE__ */ jsx(RegisterForm, {}) });
export {
  SplitComponent as component
};
