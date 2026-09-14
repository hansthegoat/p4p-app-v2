import { jsxs, jsx } from "react/jsx-runtime";
import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
function AuthLayout({ children, mode }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-muted/30", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 opacity-[0.06]",
          style: {
            backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col justify-between w-full p-12 text-white", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-bold tracking-tight", children: "P4P" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold tracking-tight", children: "P4P Platform" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-8 max-w-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative w-32 h-32", children: [
            /* @__PURE__ */ jsx(
              motion.svg,
              {
                className: "absolute inset-0 w-full h-full text-white/25",
                viewBox: "0 0 128 128",
                animate: { rotate: 360 },
                transition: { duration: 30, repeat: Infinity, ease: "linear" },
                style: { transformOrigin: "center" },
                children: /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "64",
                    cy: "64",
                    r: "56",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeDasharray: "2 8",
                    strokeLinecap: "round"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              motion.div,
              {
                className: "absolute inset-0",
                initial: { rotate: 0 },
                animate: { rotate: 360 },
                transition: { duration: 6, repeat: Infinity, ease: "linear" },
                style: { transformOrigin: "center" },
                children: /* @__PURE__ */ jsx("div", { className: "absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.9)]" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Shield, { className: "h-7 w-7 text-white" }) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-bold tracking-tight leading-tight drop-shadow-lg", children: [
              "Pay for performance.",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-blue-300", children: "Reward what matters." })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-white/70 leading-relaxed drop-shadow", children: "Track KPIs, run appraisals, and turn performance into fair, transparent rewards — all in one place." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-white/60", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: "Trusted by teams that measure what matters" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/50", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " P4P Platform. All rights reserved."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:hidden flex items-center justify-center gap-2 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary", children: "P4P" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-base font-semibold", children: "P4P Platform" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxs("div", { className: "relative inline-grid grid-cols-2 p-1 rounded-lg bg-muted border border-border", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-out ${mode === "register" ? "translate-x-full" : "translate-x-0"}`
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/login",
            className: `relative z-10 px-4 py-1.5 text-xs font-medium rounded-md transition-colors text-center ${mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/register",
            className: `relative z-10 px-4 py-1.5 text-xs font-medium rounded-md transition-colors text-center ${mode === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: "Create account"
          }
        )
      ] }) }),
      children
    ] }) })
  ] });
}
function AuthLayoutWrapper() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const mode = pathname.includes("register") ? "register" : "login";
  return /* @__PURE__ */ jsx(AuthLayout, { mode, children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(motion.div, { initial: {
    opacity: 0,
    x: mode === "register" ? 24 : -24,
    filter: "blur(4px)"
  }, animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)"
  }, exit: {
    opacity: 0,
    x: mode === "register" ? -24 : 24,
    filter: "blur(4px)"
  }, transition: {
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1]
  }, children: /* @__PURE__ */ jsx(Outlet, {}) }, pathname) }) });
}
export {
  AuthLayoutWrapper as component
};
