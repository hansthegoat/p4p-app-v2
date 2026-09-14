import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { s as supabase } from "./router-w7c543WJ.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
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
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const {
        error: error2
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error2) throw error2;
      showToast.success("Reset link sent", `Check ${email} for instructions.`);
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-center mb-2", children: "Reset Password" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center mb-6", children: "Enter your email and we'll send you a reset link" }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
    sent ? /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground text-center py-2", children: [
      "Check your inbox at ",
      /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: email }),
      ".",
      /* @__PURE__ */ jsx("br", {}),
      "Didn't get it? Check spam, or try again."
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Sending..." : "Send Reset Link" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center mt-4", children: /* @__PURE__ */ jsx("button", { onClick: () => navigate({
      to: "/login"
    }), className: "text-primary hover:underline", children: "Back to sign in" }) })
  ] }) });
}
export {
  ForgotPasswordPage as component
};
