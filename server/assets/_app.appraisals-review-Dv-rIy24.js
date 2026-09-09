import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { u as useP4P, f as fmtNum } from "./store-Dy84gyCY.js";
import { B as Button, C as Card } from "./button-BWCukwRo.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { AlertCircle, Users, RefreshCw, CheckCircle, User, FileText, Calendar, Paperclip, MessageSquare, Download, FileQuestion, Check, X, Edit3, Eye } from "lucide-react";
import { g as getCurrentUser } from "./router-ykR6owpd.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "@supabase/supabase-js";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
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
    let all = [];
    const targetEmployees = isManagerUser ? directReports : employees.map((e) => e.id);
    for (const empId of targetEmployees) {
      const empAppraisals = getEmployeeAppraisals(empId);
      all.push(...empAppraisals);
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
    alert("✅ Appraisal approved successfully!");
  };
  const handleReject = (appraisalId) => {
    setActionLoading(true);
    rejectAppraisal(appraisalId, user?.id || "reviewer", reviewerName, "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    alert("❌ Appraisal rejected.");
  };
  const handleRequestChanges = (appraisalId) => {
    setActionLoading(true);
    requestChanges(appraisalId, user?.id || "reviewer", reviewerName, "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    alert("📝 Changes requested.");
  };
  const handleAddComment = (appraisalId) => {
    if (!commentText.trim()) return;
    addAppraisalComment(appraisalId, user?.id || "reviewer", reviewerName, commentText);
    setCommentText("");
    loadAppraisals();
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
  const filteredAppraisals = allAppraisals.filter((a) => {
    if (filterDepartment !== "all" && a.department !== filterDepartment) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });
  const departments = [...new Set(allAppraisals.map((a) => a.department))];
  const statuses = ["pending", "approved", "rejected", "needs_revision"];
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "Loading appraisals..." });
  }
  if (!isManager && currentEmployee?.roleType !== "admin" && currentEmployee?.roleType !== "hr") {
    return /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "No Access" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "You don't have any direct reports to review." })
    ] });
  }
  if (isManager && directReportIds.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "No Direct Reports" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "You don't have any employees assigned to you yet. Contact your admin to assign team members." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "📋 Review Appraisals" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: isManager ? `Review appraisals from your team (${directReportIds.length} direct reports)` : "Review and approve employee appraisal submissions." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => loadAppraisals(), children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-1" }),
        " Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-blue-200 bg-blue-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600", children: pendingAppraisals.length }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-600", children: "Pending" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-green-200 bg-green-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-600", children: allAppraisals.filter((a) => a.status === "approved").length }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-green-600", children: "Approved" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-yellow-200 bg-yellow-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-600", children: allAppraisals.filter((a) => a.status === "needs_revision").length }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-yellow-600", children: "Needs Revision" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-4 text-center border-red-200 bg-red-50/50", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-red-600", children: allAppraisals.filter((a) => a.status === "rejected").length }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600", children: "Rejected" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "pending", onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "pending", className: "flex items-center gap-1", children: [
          "⏳ Pending (",
          pendingAppraisals.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "history", children: "📊 History" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "pending", className: "mt-4 space-y-4", children: pendingAppraisals.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "All Caught Up!" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "No pending appraisals from your team." })
      ] }) : pendingAppraisals.map((appraisal) => /* @__PURE__ */ jsxs(Card, { className: "p-4 border-l-4 border-l-blue-500", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: appraisal.employeeName }),
              /* @__PURE__ */ jsx(Badge, { className: "bg-blue-100 text-blue-700 border-blue-200", children: "⏳ Pending" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
                appraisal.department
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
                appraisal.role
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
                new Date(appraisal.submittedAt).toLocaleDateString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxs("div", { className: `text-lg font-bold ${getScoreColor(appraisal.overallScore)}`, children: [
                fmtNum(appraisal.overallPercent, 1),
                "%"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: appraisal.performanceBand })
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
              setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal);
            }, children: selectedAppraisal?.id === appraisal.id ? "Close" : "Review" })
          ] })
        ] }),
        selectedAppraisal?.id === appraisal.id && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h4", { className: "font-medium text-sm mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
              "All KPIs with Inputs"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4", children: appraisal.categories.map((cat) => /* @__PURE__ */ jsxs("div", { className: "border rounded-md overflow-hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 px-3 py-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: cat.name }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "Weight: ",
                  cat.weight,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-3 space-y-3", children: cat.kpis.map((kpi) => {
                const target = kpi.target || 1;
                const actual = kpi.actual || 0;
                const ratio = target > 0 ? actual / target : 0;
                const achievement = ratio * 100;
                const hasProof = kpi.proof && kpi.proof.length > 0;
                const hasComment = kpi.comment && kpi.comment.trim().length > 0;
                return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-md border p-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 text-sm items-start", children: [
                    /* @__PURE__ */ jsx("div", { className: "col-span-5 font-medium break-words whitespace-normal", children: kpi.description }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-2 text-muted-foreground text-xs", children: [
                      "Target: ",
                      fmtNum(kpi.target),
                      " ",
                      kpi.metric
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-2 font-semibold text-blue-600 text-xs", children: [
                      "Actual: ",
                      fmtNum(kpi.actual),
                      " ",
                      kpi.metric
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: `col-span-2 font-bold text-xs ${achievement >= 100 ? "text-green-600" : achievement >= 70 ? "text-yellow-600" : "text-red-600"}`, children: [
                      fmtNum(achievement, 1),
                      "%"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "col-span-1 text-right", children: [
                      hasProof && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-blue-600 border-blue-200 text-[10px] px-1.5 py-0", children: [
                        /* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3 mr-0.5" }),
                        kpi.proof.length
                      ] }),
                      hasComment && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-purple-600 border-purple-200 text-[10px] px-1.5 py-0 ml-1", children: [
                        /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3 mr-0.5" }),
                        "💬"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2", children: hasProof ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: kpi.proof.map((p) => /* @__PURE__ */ jsxs("a", { href: p.fileUrl, target: "_blank", rel: "noopener noreferrer", className: "text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 flex items-center gap-1 transition-colors", children: [
                    /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
                    p.fileName
                  ] }, p.id)) }) : /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(FileQuestion, { className: "h-3 w-3" }),
                    "No proof uploaded"
                  ] }) }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2", children: hasComment ? /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground bg-muted/30 p-2 rounded-md", children: [
                    "💬 ",
                    /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Employee comment:" }),
                    " ",
                    kpi.comment
                  ] }) : /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
                    "No comment"
                  ] }) })
                ] }, kpi.id);
              }) })
            ] }, cat.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t pt-3", children: [
            /* @__PURE__ */ jsxs("h4", { className: "font-medium text-sm mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
              "Comments & Feedback"
            ] }),
            appraisal.comments.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-40 overflow-y-auto mb-3", children: appraisal.comments.map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-2 rounded-md text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: c.authorName }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.timestamp).toLocaleDateString() })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1", children: c.text })
            ] }, c.id)) }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(Textarea, { placeholder: "Add a comment or feedback...", value: commentText, onChange: (e) => setCommentText(e.target.value), className: "flex-1 min-h-[60px]" }) }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", className: "mt-2", onClick: () => handleAddComment(appraisal.id), disabled: !commentText.trim(), children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 mr-1" }),
              " Post Comment"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t pt-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm mb-2", children: "📋 Review Decision" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxs(Button, { className: "bg-green-600 hover:bg-green-700", onClick: () => handleApprove(appraisal.id), disabled: actionLoading, children: [
                /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 mr-1" }),
                " Approve"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => handleReject(appraisal.id), disabled: actionLoading, children: [
                /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-1" }),
                " Reject"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "border-yellow-500 text-yellow-600 hover:bg-yellow-50", onClick: () => handleRequestChanges(appraisal.id), disabled: actionLoading, children: [
                /* @__PURE__ */ jsx(Edit3, { className: "h-4 w-4 mr-1" }),
                " Request Changes"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: '💡 Use the "Post Comment" section above to provide feedback or reason for your decision.' })
          ] })
        ] })
      ] }, appraisal.id)) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "history", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Select, { value: filterDepartment, onValueChange: setFilterDepartment, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Department" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Departments" }),
              departments.map((d) => /* @__PURE__ */ jsx(SelectItem, { value: d, children: d }, d))
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Status" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Statuses" }),
              statuses.map((s) => /* @__PURE__ */ jsxs(SelectItem, { value: s, children: [
                s === "pending" && "⏳ Pending",
                s === "approved" && "✅ Approved",
                s === "rejected" && "❌ Rejected",
                s === "needs_revision" && "📝 Needs Revision"
              ] }, s))
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => loadAppraisals(), children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-1" }),
            " Refresh"
          ] })
        ] }),
        filteredAppraisals.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "No Appraisal History" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "No appraisals from your team match your filters." })
        ] }) : filteredAppraisals.slice(0, 50).map((appraisal) => /* @__PURE__ */ jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: appraisal.employeeName }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: appraisal.department }),
                getStatusBadge(appraisal.status)
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
                  new Date(appraisal.submittedAt).toLocaleDateString()
                ] }),
                /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1", children: appraisal.reviewerName && `Reviewed by: ${appraisal.reviewerName}` }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  "Period: ",
                  appraisal.period
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
              /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                setExpandedAppraisal(expandedAppraisal === appraisal.id ? null : appraisal.id);
              }, children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
                " Details"
              ] })
            ] })
          ] }),
          expandedAppraisal === appraisal.id && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Categories" }),
                appraisal.categories.map((cat) => {
                  const catScore = cat.kpis.reduce((sum, k) => {
                    const target = k.target || 1;
                    const actual = k.actual || 0;
                    return sum + (target > 0 ? actual / target : 0);
                  }, 0) / (cat.kpis.length || 1);
                  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm border-b pb-1 mt-1", children: [
                    /* @__PURE__ */ jsx("span", { children: cat.name }),
                    /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                      fmtNum(catScore * 100, 1),
                      "%"
                    ] })
                  ] }, cat.id);
                })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: "Comments" }),
                appraisal.comments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No comments." }) : appraisal.comments.map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-muted/30 p-2 rounded-md text-sm mt-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-medium", children: c.authorName }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.timestamp).toLocaleDateString() })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1", children: c.text })
                ] }, c.id))
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-3", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setExpandedAppraisal(null), children: "Close" }) })
          ] })
        ] }, appraisal.id))
      ] })
    ] })
  ] });
}
export {
  AppraisalsReviewPage as component
};
