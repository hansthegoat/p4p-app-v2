import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { a as useP4P, c as fmtNum, g as getCurrentUser } from "./router-D7LNLANq.js";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Bh6hTGzN.js";
import { T as Textarea } from "./textarea-BgZCD-Mr.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-FVkpvMO7.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { S as StatCard } from "./stat-card-DPr76q1z.js";
import { S as SectionCard } from "./section-card-Dur1lkFz.js";
import { E as EmptyState } from "./empty-state-DzL3lmex.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { s as staggerContainer } from "./motion-DlChdgW6.js";
import { AlertCircle, Users, RefreshCw, ClipboardCheck, Clock, CheckCircle, Edit3, XCircle, FileText, User, Calendar, Eye, Paperclip, MessageSquare, Download, FileQuestion, Check, X, Filter } from "lucide-react";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
import "@radix-ui/react-select";
function AppraisalsReviewPage() {
  const navigate = useNavigate();
  const {
    employees,
    getPendingAppraisals,
    getEmployeeAppraisals,
    approveAppraisal,
    rejectAppraisal,
    requestChanges,
    addAppraisalComment
  } = useP4P();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [pendingAppraisals, setPendingAppraisals] = useState([]);
  const [allAppraisals, setAllAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [reviewerName, setReviewerName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isManager, setIsManager] = useState(false);
  const [directReportIds, setDirectReportIds] = useState([]);
  const [expandedAppraisal, setExpandedAppraisal] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate({
            to: "/login"
          });
          return;
        }
        setUser(currentUser);
        const emp = employees.find((e) => e.email === currentUser.email);
        setCurrentEmployee(emp || null);
        setReviewerName(emp?.name || currentUser.email || "Reviewer");
        const isManagerUser = emp?.isManager === true;
        setIsManager(isManagerUser);
        const directReports = isManagerUser ? employees.filter((e) => e.supervisorId === emp?.id).map((e) => e.id) : [];
        setDirectReportIds(directReports);
        loadAppraisals(directReports, isManagerUser);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [employees, navigate]);
  const loadAppraisals = (directReports = directReportIds, isManagerUser = isManager) => {
    const pending = getPendingAppraisals();
    const filteredPending = isManagerUser ? pending.filter((a) => directReports.includes(a.employeeId)) : pending;
    setPendingAppraisals(filteredPending);
    const all = [];
    const targetEmployees = isManagerUser ? directReports : employees.map((e) => e.id);
    for (const empId of targetEmployees) {
      all.push(...getEmployeeAppraisals(empId));
    }
    all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setAllAppraisals(all);
  };
  const handleApprove = (appraisalId) => {
    setActionLoading(true);
    approveAppraisal(appraisalId, user?.id || "reviewer", reviewerName);
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    showToast.success("Appraisal Approved", "The appraisal has been approved.");
  };
  const handleReject = (appraisalId) => {
    setActionLoading(true);
    rejectAppraisal(appraisalId, user?.id || "reviewer", reviewerName, "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    showToast.error("Appraisal Rejected", "The appraisal has been rejected.");
  };
  const handleRequestChanges = (appraisalId) => {
    setActionLoading(true);
    requestChanges(appraisalId, user?.id || "reviewer", reviewerName, "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    showToast.warning("Changes Requested", "Feedback sent to the employee.");
  };
  const handleAddComment = (appraisalId) => {
    if (!commentText.trim()) return;
    addAppraisalComment(appraisalId, user?.id || "reviewer", reviewerName, commentText);
    setCommentText("");
    loadAppraisals();
    showToast.success("Comment Posted", "Your comment has been added.");
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
  const filteredAppraisals = allAppraisals.filter((a) => {
    if (filterDepartment !== "all" && a.department !== filterDepartment) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });
  const departments = [...new Set(allAppraisals.map((a) => a.department))];
  const statuses = ["pending", "approved", "rejected", "needs_revision"];
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading appraisals..." })
    ] }) });
  }
  if (!isManager && currentEmployee?.roleType !== "admin" && currentEmployee?.roleType !== "hr") {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6" }), title: "No Access", description: "You don't have any direct reports to review." });
  }
  if (isManager && directReportIds.length === 0) {
    return /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6" }), title: "No Direct Reports", description: "You don't have any employees assigned to you yet." });
  }
  const approvedCount = allAppraisals.filter((a) => a.status === "approved").length;
  const rejectedCount = allAppraisals.filter((a) => a.status === "rejected").length;
  const revisionCount = allAppraisals.filter((a) => a.status === "needs_revision").length;
  return /* @__PURE__ */ jsxs(motion.div, { initial: "hidden", animate: "show", variants: staggerContainer, className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Review Appraisals", description: isManager ? `Review appraisals from your team (${directReportIds.length} direct reports)` : "Review and approve employee appraisal submissions.", icon: /* @__PURE__ */ jsx(ClipboardCheck, { className: "h-6 w-6" }), actions: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => loadAppraisals(), className: "gap-2", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
      " Refresh"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }), label: "Pending", value: pendingAppraisals.length, accent: "primary", size: "large", pulse: pendingAppraisals.length > 0 ? "blue" : "none" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }), label: "Approved", value: approvedCount, accent: "success", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }), label: "Needs Revision", value: revisionCount, accent: "warning", size: "large" }),
      /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }), label: "Rejected", value: rejectedCount, accent: "danger", size: "large" })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "pending", onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full max-w-md grid-cols-2", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "pending", className: "gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
          " Pending (",
          pendingAppraisals.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "history", className: "gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
          " History"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "pending", className: "mt-4 space-y-4", children: pendingAppraisals.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-6 w-6" }), title: "All Caught Up!", description: "No pending appraisals from your team." }) : pendingAppraisals.map((appraisal, idx) => {
        const isSelected = selectedAppraisal?.id === appraisal.id;
        return /* @__PURE__ */ jsx(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: idx * 0.05
        }, children: /* @__PURE__ */ jsxs(Card, { className: `overflow-hidden border-l-4 border-l-blue-500 transition-shadow ${isSelected ? "shadow-md" : ""}`, children: [
          /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base", children: appraisal.employeeName }),
                /* @__PURE__ */ jsxs(Badge, { className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                  " Pending"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
                  " ",
                  appraisal.department
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
                  " ",
                  appraisal.role
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
                  " ",
                  new Date(appraisal.submittedAt).toLocaleDateString()
                ] })
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
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: isSelected ? "default" : "outline", onClick: () => setSelectedAppraisal(isSelected ? null : appraisal), className: "gap-2", children: isSelected ? "Close" : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                " Review"
              ] }) })
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
            duration: 0.3
          }, className: "overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "border-t border-border/50 p-5 space-y-5 bg-muted/20", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h4", { className: "font-semibold text-sm mb-3 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
                " All KPIs with Inputs"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: appraisal.categories.map((cat) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 px-4 py-2.5 flex items-center justify-between border-b border-border/50", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: cat.name }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "Category Weight ",
                    cat.weight,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/50", children: cat.kpis.map((kpi) => {
                  const target = kpi.target || 1;
                  const actual = kpi.actual || 0;
                  const achievement = target > 0 ? actual / target * 100 : 0;
                  const hasProof = kpi.proof && kpi.proof.length > 0;
                  const hasComment = kpi.comment && kpi.comment.trim().length > 0;
                  const achColor = achievement >= 100 ? "text-emerald-600 dark:text-emerald-400" : achievement >= 70 ? "text-blue-600 dark:text-blue-400" : achievement >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
                  return /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-3 items-start", children: [
                      /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-4 min-w-0", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground break-words whitespace-normal leading-relaxed", children: kpi.description }) }),
                      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-2 text-xs text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("div", { className: "md:hidden text-[10px] uppercase tracking-wide font-semibold mb-0.5", children: "Target" }),
                        fmtNum(kpi.target),
                        " ",
                        kpi.metric
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-2", children: [
                        /* @__PURE__ */ jsx("div", { className: "md:hidden text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5", children: "Actual" }),
                        /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-blue-600 dark:text-blue-400", children: [
                          fmtNum(kpi.actual),
                          " ",
                          kpi.metric
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "col-span-4 md:col-span-2", children: [
                        /* @__PURE__ */ jsx("div", { className: "md:hidden text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5", children: "Weight" }),
                        /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold", children: [
                          kpi.weight || 0,
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "col-span-12 md:col-span-1 text-right", children: [
                        /* @__PURE__ */ jsx("div", { className: "md:hidden text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5", children: "Score" }),
                        /* @__PURE__ */ jsxs("span", { className: `text-sm font-bold ${achColor}`, children: [
                          fmtNum(achievement, 1),
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "col-span-12 md:col-span-1 flex items-center justify-end gap-1", children: [
                        hasProof && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-[10px] gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5", children: [
                          /* @__PURE__ */ jsx(Paperclip, { className: "h-2.5 w-2.5" }),
                          " ",
                          kpi.proof.length
                        ] }),
                        hasComment && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-1.5", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-2.5 w-2.5" }) })
                      ] })
                    ] }),
                    hasProof && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: kpi.proof.map((p) => /* @__PURE__ */ jsxs("a", { href: p.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md hover:bg-blue-500/20 flex items-center gap-1 transition-colors", children: [
                      /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
                      " ",
                      p.fileName
                    ] }, p.id)) }),
                    hasComment && /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs bg-muted/50 rounded-md p-2.5 border border-border/50", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "Employee comment: " }),
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: kpi.comment })
                    ] }),
                    !hasProof && !hasComment && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-muted-foreground flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(FileQuestion, { className: "h-3 w-3" }),
                      " No support file or comment provided"
                    ] })
                  ] }, kpi.id);
                }) })
              ] }, cat.id)) })
            ] }),
            /* @__PURE__ */ jsxs(SectionCard, { title: "Comments & Feedback", icon: /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }), children: [
              appraisal.comments.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto mb-4", children: appraisal.comments.map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 p-3 rounded-lg text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold", children: c.authorName }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.timestamp).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: c.text })
              ] }, c.id)) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
                /* @__PURE__ */ jsx(Textarea, { placeholder: "Add a comment or feedback...", value: commentText, onChange: (e) => setCommentText(e.target.value), className: "flex-1 min-h-[70px] text-sm" }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => handleAddComment(appraisal.id), disabled: !commentText.trim(), className: "gap-2 shrink-0 self-end sm:self-auto", children: [
                  /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
                  " Post Comment"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(SectionCard, { title: "Review Decision", description: "Use Post Comment above to add feedback first if needed", icon: /* @__PURE__ */ jsx(ClipboardCheck, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxs(Button, { onClick: () => handleApprove(appraisal.id), disabled: actionLoading, className: "gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20", children: [
                /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
                " Approve"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => handleReject(appraisal.id), disabled: actionLoading, className: "gap-2", children: [
                /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
                " Reject"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20", onClick: () => handleRequestChanges(appraisal.id), disabled: actionLoading, children: [
                /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4" }),
                " Request Changes"
              ] })
            ] }) })
          ] }) }) })
        ] }) }, appraisal.id);
      }) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "history", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
            " Filters:"
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: filterDepartment, onValueChange: setFilterDepartment, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-48 h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Department" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Departments" }),
              departments.map((d) => /* @__PURE__ */ jsx(SelectItem, { value: d, children: d }, d))
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-48 h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Status" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Statuses" }),
              statuses.map((s) => /* @__PURE__ */ jsxs(SelectItem, { value: s, children: [
                s === "pending" && "Pending",
                s === "approved" && "Approved",
                s === "rejected" && "Rejected",
                s === "needs_revision" && "Needs Revision"
              ] }, s))
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => loadAppraisals(), className: "gap-2", children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
            " Refresh"
          ] })
        ] }) }),
        filteredAppraisals.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { icon: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6" }), title: "No Appraisal History", description: "No appraisals match your filters." }) : filteredAppraisals.slice(0, 50).map((appraisal, idx) => {
          const isExpanded = expandedAppraisal === appraisal.id;
          return /* @__PURE__ */ jsx(motion.div, { initial: {
            opacity: 0,
            y: 8
          }, animate: {
            opacity: 1,
            y: 0
          }, transition: {
            delay: idx * 0.03
          }, children: /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: appraisal.employeeName }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: appraisal.department }),
                getStatusBadge(appraisal.status)
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
                  " ",
                  new Date(appraisal.submittedAt).toLocaleDateString()
                ] }),
                appraisal.reviewerName && /* @__PURE__ */ jsxs("span", { children: [
                  "Reviewed by: ",
                  appraisal.reviewerName
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Period: ",
                  appraisal.period
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxs("div", { className: `text-xl font-bold ${getScoreColor(appraisal.overallScore)}`, children: [
                  fmtNum(appraisal.overallPercent, 1),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: appraisal.performanceBand })
              ] }),
              /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setExpandedAppraisal(isExpanded ? null : appraisal.id), className: "gap-2", children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                " ",
                isExpanded ? "Hide" : "Details"
              ] })
            ] })
          ] }) }) }) }, appraisal.id);
        })
      ] })
    ] })
  ] });
}
export {
  AppraisalsReviewPage as component
};
