import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { s as supabase } from "./router-D7LNLANq.js";
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
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[login] handleSubmit fired", {
      email,
      passwordLength: password.length
    });
    setLoading(true);
    setError("");
    try {
      console.log("[login] calling login()...");
      await login(email, password);
      console.log("[login] login() resolved, navigating...");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      console.error("[login] login() threw:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-1", children: "Welcome back" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sign in to continue to your dashboard" })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsx(Label, { children: "Password" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => navigate({
            to: "/forgot-password"
          }), className: "text-xs text-primary hover:underline", children: "Forgot password?" })
        ] }),
        /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, disabled: loading })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in..." : "Sign In" })
    ] })
  ] });
}
export {
  LoginPage as component
};
