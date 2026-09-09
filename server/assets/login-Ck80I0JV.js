import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { C as Card, B as Button } from "./button-BWCukwRo.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { l as login } from "./auth-BuRtUrw4.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "./router-B8uhSUT7.js";
import "@tanstack/react-query";
import "@supabase/supabase-js";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-center mb-2", children: "P4P Calculator" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center mb-6", children: "Sign in to your account" }),
    error && /* @__PURE__ */ jsx("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Password" }),
        /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6 })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in..." : "Sign In" })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground text-center mt-4", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx("button", { onClick: () => navigate({
        to: "/register"
      }), className: "text-primary hover:underline", children: "Register" })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
