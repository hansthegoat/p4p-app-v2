import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { s as supabase } from "./router-w7c543WJ.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { c as checkPassword, p as passwordColor } from "./password-BT88-4ic.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwCheck, setPwCheck] = useState(checkPassword(""));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const {
      data: sub
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const pwResult = checkPassword(password);
    if (!pwResult.ok) {
      setError(pwResult.errors[0] || "Password doesn't meet requirements");
      return;
    }
    setLoading(true);
    try {
      const {
        error: error2
      } = await supabase.auth.updateUser({
        password
      });
      if (error2) throw error2;
      showToast.success("Password updated", "Redirecting to sign in...");
      setTimeout(() => navigate({
        to: "/login"
      }), 1500);
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-center mb-2", children: "Set New Password" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center mb-6", children: "Choose a new password for your account" }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
    !ready ? /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: "Verifying your reset link..." }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "New Password" }),
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
        /* @__PURE__ */ jsx(Label, { children: "Confirm New Password" }),
        /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: confirm, onChange: (e) => setConfirm(e.target.value), required: true, minLength: 6, disabled: loading })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Updating..." : "Update Password" })
    ] })
  ] }) });
}
export {
  ResetPasswordPage as component
};
