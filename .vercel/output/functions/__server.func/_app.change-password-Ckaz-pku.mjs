import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { C as Card } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { I as Input } from "./_ssr/input-BgWjUwUQ.mjs";
import { L as Label } from "./_ssr/label-zkAJpnXH.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { s as supabase } from "./_ssr/router-BPHF_myF.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import { c as checkPassword, p as passwordColor } from "./_ssr/password-BT88-4ic.mjs";
import "./_libs/sonner.mjs";
import { K as KeyRound, L as LoaderCircle } from "./_libs/lucide-react.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/tanstack__react-router.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/isbot.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/zod.mjs";
import "./_libs/sentry__react.mjs";
import "./_libs/sentry__core.mjs";
import "./_libs/sentry__browser.mjs";
import "./_libs/sentry__browser-utils.mjs";
import "./_libs/sentry__conventions.mjs";
function ChangePasswordPage() {
  const [current, setCurrent] = reactExports.useState("");
  const [next, setNext] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [pwCheck, setPwCheck] = reactExports.useState(checkPassword(""));
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Change Password", description: "Update your account password.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "••••••••", value: current, onChange: (e) => setCurrent(e.target.value), required: true, disabled: loading, autoComplete: "current-password" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "New password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "••••••••", value: next, onChange: (e) => {
            setNext(e.target.value);
            setPwCheck(checkPassword(e.target.value));
          }, required: true, disabled: loading, autoComplete: "new-password" }),
          next.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirm new password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "••••••••", value: confirm, onChange: (e) => setConfirm(e.target.value), required: true, disabled: loading, autoComplete: "new-password" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full gap-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Updating…"
        ] }) : "Update password" })
      ] })
    ] })
  ] });
}
export {
  ChangePasswordPage as component
};
