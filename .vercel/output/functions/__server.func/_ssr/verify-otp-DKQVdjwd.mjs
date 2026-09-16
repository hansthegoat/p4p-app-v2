import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useSearch } from "../_libs/tanstack__react-router.mjs";
import { C as Card } from "./card-DJtmP4ah.mjs";
import { B as Button } from "./button-D-QX7IMW.mjs";
import { L as Label } from "./label-zkAJpnXH.mjs";
import { s as showToast } from "./toast-DYWvTbJb.mjs";
import { s as supabase } from "./router-BPHF_myF.mjs";
import "../_libs/sonner.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { C as CircleCheckBig, L as LoaderCircle, S as Shield, M as Mail, K as KeyRound, a as CircleAlert, R as RefreshCw, A as ArrowLeft, b as Sparkles } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "../_libs/sentry__react.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__browser.mjs";
import "../_libs/sentry__browser-utils.mjs";
import "../_libs/sentry__conventions.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const MANAGER_ROLES = ["President", "Executive President", "Senior Vice President", "Vice President", "Head of Department", "Deputy Head of Department", "Line Manager", "Team Lead"];
const OTP_TTL_SECONDS = 5 * 60;
function VerifyOtpPage() {
  const navigate = useNavigate();
  const search = useSearch({
    from: "/verify-otp"
  });
  const email = search.email || "";
  const [otp, setOtp] = reactExports.useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = reactExports.useState(false);
  const [resending, setResending] = reactExports.useState(false);
  const [resendCooldown, setResendCooldown] = reactExports.useState(0);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState(false);
  const [secondsLeft, setSecondsLeft] = reactExports.useState(OTP_TTL_SECONDS);
  const inputs = reactExports.useRef([]);
  const expired = secondsLeft <= 0;
  reactExports.useEffect(() => {
    if (inputs.current[0]) inputs.current[0]?.focus();
  }, []);
  reactExports.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1e3);
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  reactExports.useEffect(() => {
    if (expired || success) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => s <= 1 ? 0 : s - 1);
    }, 1e3);
    return () => clearInterval(t);
  }, [expired, success]);
  reactExports.useEffect(() => {
    if (!email) navigate({
      to: "/register"
    });
  }, [email, navigate]);
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };
  const timerTone = expired ? "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/5" : secondsLeft <= 120 ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5" : "text-muted-foreground border-border bg-muted/40";
  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < 5) inputs.current[index + 1]?.focus();
    if (digit && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) setTimeout(() => handleVerify(code), 100);
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
    setOtp(newOtp);
    if (pasted.length === 6) {
      setTimeout(() => handleVerify(pasted), 100);
    } else {
      inputs.current[pasted.length]?.focus();
    }
  };
  const handleVerify = async (code) => {
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (expired) {
      setError("Code expired. Please request a new one.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const {
        data,
        error: verifyError
      } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });
      if (verifyError) throw verifyError;
      if (!data.user) throw new Error("Verification failed");
      const pendingRaw = localStorage.getItem("p4p_pending_registration");
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          const {
            getTemplateByDepartmentAndRole
          } = await import("./kpi-templates-DZws1qej.mjs");
          const template = getTemplateByDepartmentAndRole(pending.department, pending.role);
          const hasTemplate = !!template;
          const isManager = MANAGER_ROLES.some((r) => r.toLowerCase() === (pending.role || "").toLowerCase());
          const dbRow = {
            id: data.user.id,
            auth_id: data.user.id,
            name: pending.name,
            email: pending.email,
            department: pending.department,
            role: pending.role,
            job_grade: template?.jobGrade || "4",
            is_adjunct: false,
            is_sales_role: false,
            is_manager: isManager,
            supervisor_id: null,
            supervisor_name: null,
            join_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            months_worked: 12,
            role_type: "employee",
            categories: template ? template.categories.map((cat) => ({
              id: cat.id || `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: cat.name,
              weight: cat.weight,
              kpis: cat.kpis.map((k) => ({
                id: k.id || `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                description: k.description,
                metric: k.metric,
                target: k.target,
                actual: 0,
                weight: k.weight || 0,
                measurementSource: k.measurementSource || ""
              }))
            })) : [],
            kpis: [],
            needs_kpi_setup: !hasTemplate
          };
          console.log("💾 Writing employee to Supabase:", dbRow);
          const {
            error: dbError
          } = await supabase.from("employees").upsert(dbRow, {
            onConflict: "id"
          });
          if (dbError) {
            console.error("❌ Failed to save employee to Supabase:", dbError);
            showToast.error("Profile sync failed", dbError.message || "Unknown error");
          } else {
            console.log("✅ Employee saved to Supabase");
          }
          try {
            const newEmployeeCache = {
              id: data.user.id,
              authUserId: data.user.id,
              name: pending.name,
              email: pending.email,
              department: pending.department,
              role: pending.role,
              jobGrade: template?.jobGrade || "4",
              isAdjunct: false,
              isSalesRole: false,
              isManager,
              supervisorId: "",
              supervisorName: "",
              joinDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              monthsWorked: 12,
              roleType: "employee",
              categories: dbRow.categories,
              kpis: [],
              needsKpiSetup: !hasTemplate
            };
            const existingState = localStorage.getItem("p4p_state_v1");
            const state = existingState ? JSON.parse(existingState) : {
              employees: []
            };
            if (!Array.isArray(state.employees)) state.employees = [];
            const alreadyInCache = state.employees.some((e) => e.id === data.user.id || e.email === pending.email);
            if (!alreadyInCache) {
              state.employees.push(newEmployeeCache);
              localStorage.setItem("p4p_state_v1", JSON.stringify(state));
            }
          } catch (cacheErr) {
            console.warn("Could not update localStorage cache:", cacheErr);
          }
          localStorage.removeItem("p4p_pending_registration");
        } catch (storageErr) {
          console.error("Failed to save pending registration:", storageErr);
        }
      }
      setSuccess(true);
      showToast.success("Email Verified!", "Your account is ready.");
      setTimeout(() => navigate({
        to: "/dashboard"
      }), 1200);
    } catch (err) {
      console.error("Verify error:", err);
      setError(err.message || "Invalid or expired code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const {
        error: resendError
      } = await supabase.auth.resend({
        type: "signup",
        email
      });
      if (resendError) throw resendError;
      setSecondsLeft(OTP_TTL_SECONDS);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      showToast.success("Code Sent", `New code sent to ${email}`);
      setResendCooldown(60);
    } catch (err) {
      showToast.error("Could Not Resend", err.message);
    } finally {
      setResending(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(otp.join(""));
  };
  const orbitState = loading ? "loading" : error ? "error" : "idle";
  const ringStroke = orbitState === "loading" ? "text-primary/40" : orbitState === "error" ? "text-red-500/40" : "text-border";
  const dotFill = orbitState === "loading" ? "bg-primary" : orbitState === "error" ? "bg-red-500" : "bg-primary";
  const hubClass = orbitState === "loading" ? "bg-primary/15 border-primary/30 text-primary" : orbitState === "error" ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" : "bg-primary/10 border-primary/20 text-primary";
  if (success) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      scale: 0.9,
      opacity: 0
    }, animate: {
      scale: 1,
      opacity: 1
    }, className: "w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-8 w-8 text-emerald-600 dark:text-emerald-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-2", children: "Verified!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Your account is ready. Redirecting..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
    opacity: 0,
    y: 12
  }, animate: {
    opacity: 1,
    y: 0
  }, className: "w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-24 h-24 mx-auto mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "absolute inset-0 w-full h-full", viewBox: "0 0 96 96", children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "48", cy: "48", r: "40", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeDasharray: "2 6", strokeLinecap: "round", className: ringStroke }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute inset-0", initial: {
          rotate: 0
        }, animate: {
          rotate: 360
        }, transition: {
          duration: loading ? 1.2 : 3.5,
          repeat: Infinity,
          ease: "linear"
        }, style: {
          transformOrigin: "center"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute top-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${dotFill} shadow-sm` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${hubClass}`, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6" }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-2", children: "Verify Your Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "We sent a 6-digit code to" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: email })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs text-muted-foreground flex items-center gap-1.5 mb-3 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-3.5 w-3.5" }),
          "Enter the 6-digit code"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2", onPaste: handlePaste, children: otp.map((digit, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: (el) => inputs.current[i] = el, type: "text", inputMode: "numeric", autoComplete: "one-time-code", maxLength: 1, value: digit, onChange: (e) => handleChange(i, e.target.value), onKeyDown: (e) => handleKeyDown(i, e), disabled: loading || expired, className: `w-12 h-14 text-center text-xl font-bold rounded-lg border-2 bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 ${digit ? "border-primary/40 bg-primary/5" : "border-border"}` }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${timerTone}`, children: expired ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3" }),
          "Code expired — request a new one"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-current opacity-70" }),
          "Expires in ",
          formatTime(secondsLeft)
        ] }) }) })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: -4
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-800 dark:text-red-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading || otp.join("").length !== 6 || expired, className: "w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        "Verifying..."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
        "Verify Email"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: expired ? "Code expired." : "Didn't receive the code?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: handleResend, disabled: resendCooldown > 0 || resending, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 ${resending ? "animate-spin" : ""}` }),
        resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resending ? "Sending..." : "Resend Code"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-border/50 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
      to: "/register"
    }), className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
      "Back to registration"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed", children: "Check your spam folder if you don't see the code within 2 minutes. The code expires after 5 minutes — use the resend button if needed." })
    ] }) })
  ] }) }) });
}
export {
  VerifyOtpPage as component
};
