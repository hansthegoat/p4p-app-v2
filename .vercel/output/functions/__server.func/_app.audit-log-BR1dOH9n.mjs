import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { C as Card } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import { a as useP4P } from "./_ssr/router-BPHF_myF.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { E as EmptyState } from "./_ssr/empty-state-DzL3lmex.mjs";
import "./_libs/sonner.mjs";
import { H as History, C as CircleCheckBig, a4 as Clock, at as ChevronUp, E as ChevronDown } from "./_libs/lucide-react.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/class-variance-authority.mjs";
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
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "./_ssr/motion-DlChdgW6.mjs";
import "./_libs/framer-motion.mjs";
import "./_libs/motion-dom.mjs";
import "./_libs/motion-utils.mjs";
function AuditLogPage() {
  const p4p = useP4P();
  const [filter, setFilter] = reactExports.useState("all");
  const [expanded, setExpanded] = reactExports.useState(null);
  const all = [...p4p.kpiUpdateRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered = filter === "all" ? all : all.filter((r) => r.status === filter);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Audit Log", description: "Every KPI change HR has pushed — who sent it, who received it, and whether they've acknowledged.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-1 rounded-lg bg-muted border border-border", children: ["all", "unacknowledged", "acknowledged"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors capitalize ${filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: f }, f)) }) }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-6 w-6" }), title: "No KPI changes yet", description: "Push a template from the KPI Framework page to see history here." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((req) => {
      const emp = p4p.employees.find((e) => e.id === req.employeeId);
      const isOpen = expanded === req.id;
      const scoreDelta = (req.afterScore - req.beforeScore) * 100;
      const scoreUp = scoreDelta > 0.05;
      const scoreDown = scoreDelta < -0.05;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpanded(isOpen ? null : req.id), className: "w-full p-4 flex items-center gap-4 hover:bg-accent/20 transition-colors text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${req.status === "acknowledged" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`, children: req.status === "acknowledged" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium", children: req.pushedByName || "HR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "updated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium", children: emp?.name || "Unknown employee" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
              req.department,
              " / ",
              req.role,
              " · ",
              new Date(req.createdAt).toLocaleString(void 0, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }),
              " · ",
              req.diffs.length,
              " change",
              req.diffs.length === 1 ? "" : "s"
            ] })
          ] }),
          req.beforeScore > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-1.5 text-[11px] font-semibold shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              (req.beforeScore * 100).toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "→" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: scoreUp ? "text-emerald-600" : scoreDown ? "text-red-600" : "", children: [
              (req.afterScore * 100).toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-[10px] h-5 shrink-0 ${req.status === "acknowledged" ? "border-emerald-500/40 text-emerald-600" : "border-amber-500/40 text-amber-600"}`, children: req.status === "acknowledged" ? "Acknowledged" : "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 text-muted-foreground", children: isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) })
        ] }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 pt-2 border-t border-border/50 space-y-2", children: [
          req.diffs.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 rounded-md bg-muted/30 border border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-medium", children: labelForDiffKind(d.kind) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
              d.categoryName,
              d.kpiDescription && ` · ${d.kpiDescription}`
            ] }),
            (d.before !== void 0 || d.after !== void 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] mt-1 flex items-center gap-2", children: [
              d.before !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground line-through", children: String(d.before) }),
              d.after !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: String(d.after) })
            ] })
          ] }, i)),
          req.employeeComment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 rounded-md bg-blue-500/5 border border-blue-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1", children: "Employee comment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px]", children: req.employeeComment })
          ] }),
          req.acknowledgedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground pt-1", children: [
            "Acknowledged",
            " ",
            new Date(req.acknowledgedAt).toLocaleString()
          ] })
        ] })
      ] }, req.id);
    }) })
  ] });
}
function labelForDiffKind(kind) {
  switch (kind) {
    case "category_added":
      return "New category";
    case "category_removed":
      return "Category removed";
    case "category_weight_changed":
      return "Category weight changed";
    case "category_name_changed":
      return "Category renamed";
    case "kpi_added":
      return "New KPI";
    case "kpi_removed":
      return "KPI removed";
    case "kpi_target_changed":
      return "Target changed";
    case "kpi_metric_changed":
      return "Metric changed";
    case "kpi_weight_changed":
      return "KPI weight changed";
    case "kpi_description_changed":
      return "KPI renamed";
    default:
      return kind;
  }
}
export {
  AuditLogPage as component
};
