import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { a as useP4P, s as supabase } from "./router-D7LNLANq.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { Loader2, AlertCircle, ArrowLeft, CheckCircle, TrendingUp, TrendingDown, MessageSquare, RefreshCw, Minus, Plus } from "lucide-react";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
function KpiUpdatesPage() {
  const navigate = useNavigate();
  const p4p = useP4P();
  const [employee, setEmployee] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data
      } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user || cancelled) {
        setAuthChecked(true);
        return;
      }
      const emp = p4p.employees.find((e) => e.authUserId === user.id) || p4p.employees.find((e) => e.email === user.email) || null;
      setEmployee(emp);
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [p4p.employees]);
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(null);
  if (!authChecked) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 flex justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  if (!employee) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs(Card, { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-amber-500 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold mb-1", children: "No employee record" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Your account isn't linked to an employee profile. Contact HR." })
    ] }) });
  }
  const requests = p4p.getKpiUpdateRequests(employee.id);
  const needsAck = requests.filter((r) => r.status === "unacknowledged");
  const history = requests.filter((r) => r.status === "acknowledged");
  const handleAcknowledge = async (req) => {
    setLoading(req.id);
    try {
      await p4p.acknowledgeKpiUpdate(req.id);
      showToast.success("Acknowledged", "Thanks — HR has been notified.");
    } catch (err) {
      showToast.error("Could not acknowledge", err.message);
    } finally {
      setLoading(null);
    }
  };
  const handleComment = async (req) => {
    if (!commentText.trim()) return;
    setLoading(req.id);
    try {
      await p4p.commentKpiUpdate(req.id, commentText.trim());
      showToast.success("Comment sent", "HR will see your feedback.");
      setCommentingId(null);
      setCommentText("");
    } catch (err) {
      showToast.error("Could not send comment", err.message);
    } finally {
      setLoading(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-3 sm:p-6 max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate({
        to: "/dashboard"
      }), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5 mr-1" }),
        "Back"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-lg sm:text-xl font-bold", children: "KPI Updates" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Changes HR has made to your KPIs" })
      ] })
    ] }),
    needsAck.length === 0 && history.length === 0 && /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-10 w-10 text-emerald-500 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold mb-1", children: "All caught up" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "You have no KPI updates." })
    ] }),
    needsAck.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-8", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: [
        "Needs your acknowledgment (",
        needsAck.length,
        ")"
      ] }),
      needsAck.map((req) => /* @__PURE__ */ jsx(RequestCard, { req, loading: loading === req.id, commenting: commentingId === req.id, commentText, setCommentText, onStartComment: () => {
        setCommentingId(req.id);
        setCommentText("");
      }, onCancelComment: () => {
        setCommentingId(null);
        setCommentText("");
      }, onAcknowledge: () => handleAcknowledge(req), onComment: () => handleComment(req) }, req.id))
    ] }),
    history.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: [
        "History (",
        history.length,
        ")"
      ] }),
      history.map((req) => /* @__PURE__ */ jsx(RequestCard, { req, loading: false, commenting: false, commentText: "", setCommentText: () => {
      }, onStartComment: () => {
      }, onCancelComment: () => {
      }, onAcknowledge: () => {
      }, onComment: () => {
      }, readOnly: true }, req.id))
    ] })
  ] });
}
function RequestCard({
  req,
  loading,
  commenting,
  commentText,
  setCommentText,
  onStartComment,
  onCancelComment,
  onAcknowledge,
  onComment,
  readOnly
}) {
  const scoreDelta = (req.afterScore - req.beforeScore) * 100;
  const scoreUp = scoreDelta > 0.05;
  const scoreDown = scoreDelta < -0.05;
  return /* @__PURE__ */ jsxs(Card, { className: "p-3 sm:p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between flex-wrap gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground mb-0.5", children: [
          "From ",
          req.department,
          " · ",
          req.role
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: new Date(req.createdAt).toLocaleDateString(void 0, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 sm:gap-3 flex-wrap max-w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: "Score impact" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[13px] font-semibold", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              (req.beforeScore * 100).toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "→" }),
            /* @__PURE__ */ jsxs("span", { className: scoreUp ? "text-emerald-600 dark:text-emerald-400" : scoreDown ? "text-red-600 dark:text-red-400" : "text-foreground", children: [
              (req.afterScore * 100).toFixed(1),
              "%"
            ] }),
            scoreUp && /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5 text-emerald-600" }),
            scoreDown && /* @__PURE__ */ jsx(TrendingDown, { className: "h-3.5 w-3.5 text-red-600" })
          ] })
        ] }),
        req.status === "unacknowledged" && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "border-amber-500/40 text-amber-600 text-[10px] h-5", children: "Action needed" }),
        req.status === "acknowledged" && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "border-emerald-500/40 text-emerald-600 text-[10px] h-5", children: "Acknowledged" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-4", children: req.diffs.map((diff, i) => /* @__PURE__ */ jsx(DiffRow, { diff }, i)) }),
    req.employeeComment && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 rounded-md bg-muted/40 border border-border/50", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1", children: "Your comment" }),
      /* @__PURE__ */ jsx("p", { className: "text-[13px]", children: req.employeeComment })
    ] }),
    !readOnly && /* @__PURE__ */ jsx(Fragment, { children: commenting ? /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-3 border-t border-border/50", children: [
      /* @__PURE__ */ jsx("textarea", { placeholder: "Add a comment for HR (optional)...", value: commentText, onChange: (e) => setCommentText(e.target.value), className: "w-full min-h-[80px] text-[13px] rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: onComment, disabled: loading || !commentText.trim(), className: "gap-1.5 w-full sm:w-auto", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
          loading ? "Sending..." : "Send comment"
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: onCancelComment, disabled: loading, className: "w-full sm:w-auto", children: "Cancel" })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 pt-3 border-t border-border/50", children: [
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: onAcknowledge, disabled: loading, className: "gap-1.5 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-3.5 w-3.5" }),
        loading ? "Saving..." : "I understand"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: onStartComment, disabled: loading, className: "gap-1.5 w-full sm:w-auto", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
        "Add comment"
      ] })
    ] }) })
  ] });
}
function DiffRow({
  diff
}) {
  const meta = {
    category_added: {
      icon: Plus,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      label: "New category"
    },
    category_removed: {
      icon: Minus,
      tone: "text-red-600 dark:text-red-400 bg-red-500/10",
      label: "Category removed"
    },
    category_weight_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Category weight changed"
    },
    category_name_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Category renamed"
    },
    kpi_added: {
      icon: Plus,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      label: "New KPI"
    },
    kpi_removed: {
      icon: Minus,
      tone: "text-red-600 dark:text-red-400 bg-red-500/10",
      label: "KPI removed"
    },
    kpi_target_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Target changed"
    },
    kpi_metric_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Metric changed"
    },
    kpi_weight_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "KPI weight changed"
    },
    kpi_description_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "KPI renamed"
    }
  };
  const m = meta[diff.kind] || meta.kpi_target_changed;
  const Icon = m.icon;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-2.5 rounded-md bg-muted/30 border border-border/40", children: [
    /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${m.tone}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap text-[11px]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: m.label }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: diff.categoryName }),
        diff.kpiDescription && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "/" }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: diff.kpiDescription })
        ] })
      ] }),
      (diff.before !== void 0 || diff.after !== void 0) && /* @__PURE__ */ jsxs("div", { className: "text-[11px] mt-1 flex items-center gap-2", children: [
        diff.before !== void 0 && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground line-through", children: String(diff.before) }),
        diff.after !== void 0 && /* @__PURE__ */ jsx("span", { className: "font-semibold", children: String(diff.after) })
      ] })
    ] })
  ] });
}
export {
  KpiUpdatesPage as component
};
