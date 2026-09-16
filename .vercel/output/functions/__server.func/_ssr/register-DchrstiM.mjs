import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { C as Card } from "./card-DJtmP4ah.mjs";
import { B as Button } from "./button-D-QX7IMW.mjs";
import { I as Input } from "./input-BgWjUwUQ.mjs";
import { L as Label } from "./label-zkAJpnXH.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-FVkpvMO7.mjs";
import { P as P4PProvider, a as useP4P, s as supabase } from "./router-BPHF_myF.mjs";
import { getRolesForDepartment, getDepartments } from "./kpi-templates-DZws1qej.mjs";
import { s as showToast } from "./toast-DYWvTbJb.mjs";
import { c as checkPassword, p as passwordColor } from "./password-BT88-4ic.mjs";
import "../_libs/sonner.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "../_libs/sentry__react.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__browser.mjs";
import "../_libs/sentry__browser-utils.mjs";
import "../_libs/sentry__conventions.mjs";
const MANAGER_ROLES = ["President", "Executive President", "Senior Vice President", "Vice President", "Head of Department", "Deputy Head of Department", "Line Manager", "Team Lead"];
function RegisterForm() {
  const navigate = useNavigate();
  const {
    upsertEmployee,
    getTemplate
  } = useP4P();
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [department, setDepartment] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [roles, setRoles] = reactExports.useState([]);
  const [pwCheck, setPwCheck] = reactExports.useState(checkPassword(""));
  const departments = getDepartments();
  reactExports.useEffect(() => {
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
      if (!authData.user) throw new Error("Failed to create user account");
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
        return;
      }
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
      const dbRow = {
        id: newEmployee.id,
        auth_id: authData.user.id,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role,
        job_grade: newEmployee.jobGrade,
        is_adjunct: newEmployee.isAdjunct,
        is_sales_role: newEmployee.isSalesRole,
        is_manager: newEmployee.isManager,
        supervisor_id: newEmployee.supervisorId || null,
        supervisor_name: newEmployee.supervisorName || null,
        join_date: newEmployee.joinDate,
        months_worked: newEmployee.monthsWorked,
        role_type: newEmployee.roleType,
        categories: newEmployee.categories,
        kpis: newEmployee.kpis,
        needs_kpi_setup: newEmployee.needsKpiSetup
      };
      const {
        error: dbError
      } = await supabase.from("employees").upsert(dbRow, {
        onConflict: "id"
      });
      if (dbError) {
        console.error("Failed to save employee to Supabase:", dbError);
        showToast.error("Profile sync failed", dbError.message);
      }
      upsertEmployee(newEmployee);
      localStorage.removeItem("p4p_pending_registration");
      showToast.success("Account Created!", "You're now logged in.");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-1", children: "Create your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Register to access your performance dashboard" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", placeholder: "Your full name", value: name, onChange: (e) => setName(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "••••••••", value: password, onChange: (e) => {
          setPassword(e.target.value);
          setPwCheck(checkPassword(e.target.value));
        }, required: true, disabled: loading }),
        password.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-2", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1 flex-1 rounded-full transition-colors ${i < pwCheck.score ? passwordColor(pwCheck.score) : "bg-muted"}` }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: pwCheck.errors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0.5", children: pwCheck.errors.map((err, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "• ",
              err
            ] }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600 dark:text-emerald-400", children: [
              "✓ Password is ",
              pwCheck.label.toLowerCase()
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium shrink-0", children: pwCheck.label })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: department, onValueChange: setDepartment, disabled: loading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select your department" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: departments.map((dept) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: dept, children: dept }, dept)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: role, onValueChange: setRole, disabled: !department || loading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: department ? "Select your role" : "Select department first" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading || !department || !role || !pwCheck.ok, children: loading ? "Creating Account..." : "Register" })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(P4PProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RegisterForm, {}) });
export {
  SplitComponent as component
};
