import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { u as useP4P, g as getCurrentUser, c as fmtNum } from "./router-CQTT2apA.js";
import { C as Card } from "./card-RGlIzTYo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { E as EmptyState, s as staggerContainer, P as PageHeader, f as fadeUp } from "./empty-state-BKzet6q0.js";
import { S as StatCard } from "./stat-card-CEuC_AAE.js";
import { S as SectionCard } from "./section-card-CU3fEC1l.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { AlertCircle, RefreshCw, Clock, ClipboardCheck, FileText, CheckCircle, Edit3, XCircle, Send, Info, Award, Calendar, User, MessageSquare, Eye, Target } from "lucide-react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
function AppraisalsPage() {
  const navigate = useNavigate();
  const {
    employees,
    getEmployeeAppraisals,
    submitAppraisal,
    getPendingAppraisals
  } = useP4P();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("");
  const getCurrentPeriod = () => {
    const now = /* @__PURE__ */ new Date();
    const month = now.getMonth() + 1;
    const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
    return `${quarter} ${now.getFullYear()}`;
  };
  useEffect(() => {
    setPeriod(getCurrentPeriod());
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate({
            to: "/login"
          });
          return;
        }
        const emp = employees.find((e) => e.email === user.email);
        if (!emp) {
          setError("No employee record found.");
          setLoading(false);
          return;
        }
        setEmployee(emp);
        setAppraisals(getEmployeeAppraisals(emp.id));
        setPendingCount(getPendingAppraisals().length);
        setLoading(false);
      } catch {
        setError("Failed to load data.");
        setLoading(false);
      }
    };
    fetchData();
  }, [employees, navigate, getEmployeeAppraisals, getPendingAppraisals]);
  const handleSubmitAppraisal = () => {
    if (!employee || !period.trim()) {
      showToast.warning("Missing Period", "Please enter a period (e.g., Q1 2025).");
      return;
    }
    setSubmitting(true);
    const now = /* @__PURE__ */ new Date();
    try {
      submitAppraisal(employee.id, period, now.getFullYear(), now.getMonth() + 1);
      const updated = getEmployeeAppraisals(employee.id);
      setAppraisals(updated);
      showToast.success("Appraisal Submitted", `Submitted for ${period}.`);
      setPeriod(getCurrentPeriod());
    } catch (err) {
      showToast.error("Submission Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return /* @__PURE__ */ jsxs(Badge, { className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
          "Approved"
        ] });
      case "rejected":
        return /* @__PURE__ */ jsxs(Badge, { className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 gap-1", children: [
          /* @__PURE__ */ jsx(XCircle, { className: "h-3 w-3" }),
          "Rejected"
        ] });
      case "needs_revision":
        return /* @__PURE__ */ jsxs(Badge, { className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1", children: [
          /* @__PURE__ */ jsx(Edit3, { className: "h-3 w-3" }),
          "Needs Revision"
        ] });
      default:
        return /* @__PURE__ */ jsxs(Badge, { className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
          "Pending"
        ] });
    }
  };
  const getScoreColor = (score) => {
    if (score >= 1.2) return "text-purple-600 dark:text-purple-400";
    if (score >= 1) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 0.8) return "text-blue-600 dark:text-blue-400";
    if (score >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading your appraisals..." })
    ] }) });
  }
  if (error || !employee) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6" }), title: "Unable to load", description: error || "No employee record found.", action: /* @__PURE__ */ jsx(Button, { onClick: () => navigate({
      to: "/logout"
    }), children: "Logout" }) });
  }
  const approvedCount = appraisals.filter((a) => a.status === "approved").length;
  const rejectedCount = appraisals.filter((a) => a.status === "rejected").length;
  const revisionCount = appraisals.filter((a) => a.status === "needs_revision").length;
  const pendingAppraisals = appraisals.filter((a) => a.status === "pending");
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "My Appraisals", description: "Submit your KPIs for review and track approval status.", icon: /* @__PURE__ */ jsx(ClipboardCheck, { className: "h-6 w-6" }), badge: pendingCount > 0 ? /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1", children: [
      /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
      pendingCount,
      " pending"
    ] }) : void 0, actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
      setAppraisals(getEmployeeAppraisals(employee.id));
      showToast.success("Refreshed", "Appraisal list updated.");
    }, className: "gap-2", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
      " Refresh"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }), label: "Total Appraisals", value: appraisals.length, accent: "primary", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }), label: "Approved", value: approvedCount, accent: "success", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }), label: "Needs Revision", value: revisionCount, accent: "warning", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }), label: "Rejected", value: rejectedCount, accent: "danger", size: "large" })
    ] }),
    /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, children: /* @__PURE__ */ jsxs(SectionCard, { title: "Submit New Appraisal", description: "Your current KPI data will be sent to your manager for review", icon: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground mb-1.5 block", children: "Period" }),
          /* @__PURE__ */ jsx(Input, { type: "text", value: period, onChange: (e) => setPeriod(e.target.value), placeholder: "e.g., Q1 2025", className: "h-10" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(Button, { onClick: handleSubmitAppraisal, disabled: submitting || !period.trim(), className: "h-10 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20", children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
          "Submitting"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          " Submit for Review"
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-start gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("span", { children: "Your current KPI data will be submitted for manager review. You can resubmit anytime." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "all", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-3", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "all", className: "gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
          " All (",
          appraisals.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "pending", className: "gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
          " Pending (",
          pendingAppraisals.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "history", className: "gap-2", children: [
          /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }),
          " History"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "all", className: "mt-4 space-y-4", children: appraisals.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6" }), title: "No appraisals yet", description: "Submit your first appraisal above to get started." }) : appraisals.map((appraisal, idx) => /* @__PURE__ */ jsx(AppraisalCard, { appraisal, idx, isSelected: selectedAppraisal?.id === appraisal.id, onSelect: () => setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal), getStatusBadge, getScoreColor, onEditKpis: () => navigate({
        to: "/employee"
      }) }, appraisal.id)) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "pending", className: "mt-4 space-y-4", children: pendingAppraisals.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-6 w-6" }), title: "All Caught Up!", description: "You have no pending appraisals. Great work!" }) : pendingAppraisals.map((appraisal, idx) => /* @__PURE__ */ jsx(AppraisalCard, { appraisal, idx, isSelected: selectedAppraisal?.id === appraisal.id, onSelect: () => setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal), getStatusBadge, getScoreColor, onEditKpis: () => navigate({
        to: "/employee"
      }) }, appraisal.id)) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "history", className: "mt-4 space-y-4", children: appraisals.filter((a) => a.status !== "pending").length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Award, { className: "h-6 w-6" }), title: "No history yet", description: "Approved and reviewed appraisals will appear here." }) : appraisals.filter((a) => a.status !== "pending").map((appraisal, idx) => /* @__PURE__ */ jsx(AppraisalCard, { appraisal, idx, isSelected: selectedAppraisal?.id === appraisal.id, onSelect: () => setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal), getStatusBadge, getScoreColor, onEditKpis: () => navigate({
        to: "/employee"
      }) }, appraisal.id)) })
    ] })
  ] });
}
function AppraisalCard({
  appraisal,
  idx,
  isSelected,
  onSelect,
  getStatusBadge,
  getScoreColor,
  onEditKpis
}) {
  const isPending = appraisal.status === "pending";
  const needsRevision = appraisal.status === "needs_revision";
  const isApproved = appraisal.status === "approved";
  const isRejected = appraisal.status === "rejected";
  const borderColor = isApproved ? "border-l-emerald-500" : isRejected ? "border-l-red-500" : needsRevision ? "border-l-amber-500" : "border-l-blue-500";
  return /* @__PURE__ */ jsx(motion.div, { initial: {
    opacity: 0,
    y: 12
  }, animate: {
    opacity: 1,
    y: 0
  }, transition: {
    delay: idx * 0.04
  }, children: /* @__PURE__ */ jsxs(Card, { className: `overflow-hidden border-l-4 ${borderColor} transition-shadow ${isSelected ? "shadow-md" : ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base", children: appraisal.period }),
          getStatusBadge(appraisal.status)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
            new Date(appraisal.submittedAt).toLocaleDateString()
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
            appraisal.employeeName
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
            appraisal.categories.length,
            " categories"
          ] }),
          appraisal.comments?.length > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
            appraisal.comments.length,
            " comment(s)"
          ] })
        ] }),
        appraisal.revisionReason && /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 rounded-md p-2.5", children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold mb-0.5", children: "Feedback:" }),
          /* @__PURE__ */ jsx("div", { children: appraisal.revisionReason })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxs("div", { className: `text-2xl font-bold ${getScoreColor(appraisal.overallScore)}`, children: [
            fmtNum(appraisal.overallPercent, 1),
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: appraisal.performanceBand })
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: isSelected ? "default" : "outline", onClick: onSelect, className: "gap-2", children: [
          /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
          isSelected ? "Hide" : "Details"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isSelected && /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      height: 0
    }, animate: {
      opacity: 1,
      height: "auto"
    }, exit: {
      opacity: 0,
      height: 0
    }, transition: {
      duration: 0.25
    }, className: "overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "border-t border-border/50 p-5 space-y-4 bg-muted/20", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Target, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm", children: "Categories" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: appraisal.categories.map((cat) => {
            const catScore = cat.kpis.reduce((sum, k) => {
              const target = k.target || 1;
              const actual = k.actual || 0;
              return sum + (target > 0 ? actual / target : 0);
            }, 0) / (cat.kpis.length || 1);
            const pct = catScore * 100;
            const color = pct >= 100 ? "emerald" : pct >= 70 ? "blue" : pct >= 50 ? "amber" : "red";
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-background border border-border/60", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full bg-${color}-500 shrink-0` }),
                /* @__PURE__ */ jsx("span", { className: "text-sm truncate", children: cat.name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `font-semibold text-sm text-${color}-600 dark:text-${color}-400 shrink-0 ml-2`, children: [
                fmtNum(pct, 1),
                "%"
              ] })
            ] }, cat.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm", children: "Comments" })
          ] }),
          appraisal.comments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground p-3 rounded-lg bg-background border border-border/60", children: "No comments yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: appraisal.comments.map((c) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-background border border-border/60 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: c.authorName }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.timestamp).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: c.text })
          ] }, c.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-xs text-muted-foreground", children: [
          needsRevision && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" }),
            /* @__PURE__ */ jsx("span", { children: "Your manager has requested changes. Edit your KPIs and resubmit." })
          ] }),
          isPending && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" }),
            /* @__PURE__ */ jsx("span", { children: "Awaiting manager review." })
          ] }),
          isApproved && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" }),
            /* @__PURE__ */ jsx("span", { children: "Approved and saved as official data for this period." })
          ] }),
          isRejected && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5 shrink-0 mt-0.5 text-red-600" }),
            /* @__PURE__ */ jsx("span", { children: "This appraisal was rejected. Please contact your manager." })
          ] })
        ] }),
        needsRevision && /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: onEditKpis, className: "gap-2", children: [
          /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
          " Edit KPIs & Resubmit"
        ] })
      ] })
    ] }) }) })
  ] }) });
}
export {
  AppraisalsPage as component
};
