import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useP4P, f as fmtNum } from "./store-BAYdnpO7.js";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { AlertCircle, RefreshCw, Send, FileText, Calendar, User, MessageSquare, Eye } from "lucide-react";
import { g as getCurrentUser } from "./router-B8uhSUT7.js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@tanstack/react-query";
import "@supabase/supabase-js";
function AppraisalsPage() {
  const navigate = useNavigate();
  const {
    employees,
    getEmployeeAppraisals,
    submitAppraisal,
    getPendingAppraisals,
    getNotifications,
    markNotificationRead
  } = useP4P();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("");
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
        const empAppraisals = getEmployeeAppraisals(emp.id);
        setAppraisals(empAppraisals);
        const pending = getPendingAppraisals();
        setPendingCount(pending.length);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data.");
        setLoading(false);
      }
    };
    fetchData();
  }, [employees, navigate, getEmployeeAppraisals, getPendingAppraisals]);
  const handleSubmitAppraisal = () => {
    if (!employee || !period.trim()) {
      alert("Please enter a period (e.g., Q1 2025)");
      return;
    }
    setSubmitting(true);
    submitAppraisal(employee.id, period);
    setSubmitting(false);
    const updated = getEmployeeAppraisals(employee.id);
    setAppraisals(updated);
    setPeriod("");
    alert(`✅ Appraisal submitted for ${period}!`);
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-700 border-green-200", children: "✅ Approved" });
      case "rejected":
        return /* @__PURE__ */ jsx(Badge, { className: "bg-red-100 text-red-700 border-red-200", children: "❌ Rejected" });
      case "needs_revision":
        return /* @__PURE__ */ jsx(Badge, { className: "bg-yellow-100 text-yellow-700 border-yellow-200", children: "📝 Needs Revision" });
      default:
        return /* @__PURE__ */ jsx(Badge, { className: "bg-blue-100 text-blue-700 border-blue-200", children: "⏳ Pending" });
    }
  };
  const getScoreColor = (score) => {
    if (score >= 1.2) return "text-purple-600";
    if (score >= 1) return "text-green-600";
    if (score >= 0.8) return "text-blue-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "Loading your appraisals..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-600", children: error }),
      /* @__PURE__ */ jsx(Button, { className: "mt-4", onClick: () => navigate({
        to: "/logout"
      }), children: "Logout" })
    ] });
  }
  if (!employee) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "No employee record found." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "📋 My Appraisals" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "View your appraisal history and submit new requests for review." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        pendingCount > 0 && /* @__PURE__ */ jsxs(Badge, { className: "bg-blue-100 text-blue-700 border-blue-200", children: [
          pendingCount,
          " pending"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          const updated = getEmployeeAppraisals(employee.id);
          setAppraisals(updated);
        }, children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-1" }),
          " Refresh"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "p-4 border-dashed border-2 bg-muted/20", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-end gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Appraisal Period" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
        /* @__PURE__ */ jsx("input", { type: "text", value: period, onChange: (e) => setPeriod(e.target.value), placeholder: "e.g., Q1 2025", className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSubmitAppraisal, disabled: submitting || !period.trim(), className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          "Submit for Review"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your current KPI data will be submitted for manager review." })
    ] }) }) }),
    appraisals.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "No Appraisals Yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Submit your first appraisal above to get started." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: appraisals.map((appraisal) => /* @__PURE__ */ jsxs(Card, { className: "p-4 hover:shadow-md transition-shadow", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: appraisal.period }),
            getStatusBadge(appraisal.status)
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
              new Date(appraisal.submittedAt).toLocaleDateString()
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
              appraisal.employeeName
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
              appraisal.categories.length,
              " categories"
            ] })
          ] }),
          appraisal.revisionReason && /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md mt-2", children: [
            "📝 ",
            appraisal.revisionReason
          ] }),
          appraisal.comments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
            appraisal.comments.length,
            " comment(s)"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxs("div", { className: `text-lg font-bold ${getScoreColor(appraisal.overallScore)}`, children: [
              fmtNum(appraisal.overallPercent, 1),
              "%"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: appraisal.performanceBand })
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setSelectedAppraisal(appraisal), children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
            " Details"
          ] })
        ] })
      ] }),
      selectedAppraisal?.id === appraisal.id && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Categories" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: appraisal.categories.map((cat) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm border-b pb-1", children: [
              /* @__PURE__ */ jsx("span", { children: cat.name }),
              /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                fmtNum(cat.kpis.reduce((sum, k) => {
                  const target = k.target || 1;
                  const actual = k.actual || 0;
                  return sum + (target > 0 ? actual / target : 0);
                }, 0) / (cat.kpis.length || 1) * 100, 1),
                "%"
              ] })
            ] }, cat.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Comments" }),
            appraisal.comments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "No comments yet." }) : /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: appraisal.comments.map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-2 rounded-md text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: c.authorName }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.timestamp).toLocaleDateString() })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1", children: c.text })
            ] }, c.id)) }),
            appraisal.status === "needs_revision" && /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md mt-2", children: "💡 Edit your KPIs and resubmit for review." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setSelectedAppraisal(null), children: "Close" }),
          appraisal.status === "needs_revision" && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => navigate({
            to: "/employee"
          }), children: "Edit KPIs" })
        ] })
      ] })
    ] }, appraisal.id)) })
  ] });
}
export {
  AppraisalsPage as component
};
