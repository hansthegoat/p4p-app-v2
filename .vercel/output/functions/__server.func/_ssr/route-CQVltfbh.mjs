import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useRouterState, O as Outlet, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as Sparkles } from "../_libs/lucide-react.mjs";
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
function AuthLayout({ children, mode }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: `${"/"}auth-bg.jpg`,
          alt: "",
          className: "absolute inset-0 w-full h-full object-cover",
          draggable: false
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-slate-950/55 via-blue-950/35 to-slate-950/55" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col justify-between w-full p-12 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: `${"/"}logo-mark.png`,
              alt: "P4P",
              className: "w-10 h-10 object-contain",
              style: { filter: "brightness(0) invert(1)" },
              draggable: false
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold tracking-tight", children: "P4P Platform" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-8 max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-32 h-32", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                className: "absolute inset-0 w-full h-full text-white/25 animate-[spin_30s_linear_infinite]",
                viewBox: "0 0 128 128",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 animate-[spin_6s_linear_infinite]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.9)]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: `${"/"}logo-mark.png`,
                alt: "P4P",
                className: "w-14 h-14 object-contain",
                style: { filter: "brightness(0) invert(1)" },
                draggable: false
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-bold tracking-tight leading-tight drop-shadow-lg", children: [
              "Pay for performance.",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-300", children: "Reward what matters." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-white/70 leading-relaxed drop-shadow", children: "Track KPIs, run appraisals, and turn performance into fair, transparent rewards — all in one place." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-white/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Trusted by teams that measure what matters" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-white/40", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " P4P Platform. All rights reserved."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: `${"/"}logo.png`,
          alt: "P4P Platform",
          className: "w-72 sm:w-80 h-auto object-contain",
          draggable: false
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-grid grid-cols-2 p-1 rounded-full bg-muted border border-border w-full max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm transition-transform duration-300 ease-out ${mode === "register" ? "translate-x-full" : "translate-x-0"}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: `relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors text-center ${mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/register",
            className: `relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors text-center ${mode === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: "Create account"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "animate-[authRouteIn_0.32s_cubic-bezier(0.22,1,0.36,1)_forwards]",
          children
        },
        mode
      )
    ] }) })
  ] });
}
function AuthLayoutWrapper() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const mode = pathname.includes("register") ? "register" : "login";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, { mode, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-[fadeSlide_0.32s_cubic-bezier(0.22,1,0.36,1)_forwards]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }, pathname) });
}
export {
  AuthLayoutWrapper as component
};
