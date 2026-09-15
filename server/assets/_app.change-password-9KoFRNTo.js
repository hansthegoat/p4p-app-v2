import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { I as Input } from "./input-BgWjUwUQ.js";
import { L as Label } from "./label-zkAJpnXH.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { s as supabase } from "./router-D7LNLANq.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { c as checkPassword, p as passwordColor } from "./password-BT88-4ic.js";
import { KeyRound, Loader2 } from "lucide-react";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@sentry/react";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "zod";
function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwCheck, setPwCheck] = useState(checkPassword(""));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!current) {
      setError("Enter your current password");
      return;
    }
    const pwResult = checkPassword(next);
    if (!pwResult.ok) {
      setError(pwResult.errors[0] || "New password doesn't meet requirements");
      return;
    }
    if (next !== confirm) {
      setError("New passwords don't match");
      return;
    }
    if (current === next) {
      setError("New password must be different from the current one");
      return;
    }
    setLoading(true);
    try {
      const {
        data: userData
      } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) throw new Error("Not signed in");
      const {
        error: signInErr
      } = await supabase.auth.signInWithPassword({
        email,
        password: current
      });
      if (signInErr) {
        setError("Current password is incorrect");
        setLoading(false);
        return;
      }
      const {
        error: updateErr
      } = await supabase.auth.updateUser({
        password: next
      });
      if (updateErr) throw updateErr;
      showToast.success("Password changed", "Use your new password next time you sign in.");
      setCurrent("");
      setNext("");
      setConfirm("");
      setPwCheck(checkPassword(""));
    } catch (err) {
      setError(err.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Change Password", description: "Update your account password.", icon: /* @__PURE__ */ jsx(KeyRound, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      error && /* @__PURE__ */ jsx("div", { className: "text-[13px] text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Current password" }),
          /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: current, onChange: (e) => setCurrent(e.target.value), required: true, disabled: loading, autoComplete: "current-password" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "New password" }),
          /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: next, onChange: (e) => {
            setNext(e.target.value);
            setPwCheck(checkPassword(e.target.value));
          }, required: true, disabled: loading, autoComplete: "new-password" }),
          next.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
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
          /* @__PURE__ */ jsx(Label, { children: "Confirm new password" }),
          /* @__PURE__ */ jsx(Input, { type: "password", placeholder: "••••••••", value: confirm, onChange: (e) => setConfirm(e.target.value), required: true, disabled: loading, autoComplete: "new-password" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, className: "w-full gap-2", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
          "Updating…"
        ] }) : "Update password" })
      ] })
    ] })
  ] });
}
export {
  ChangePasswordPage as component
};
