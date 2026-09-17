import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/supabase";
import {
  CheckCircle, XCircle, Clock, AlertCircle, Eye, Calendar,
  User, FileText, MessageSquare, RefreshCw, Check, X, Edit3,
  Paperclip, Download, Users, FileQuestion, ClipboardCheck, Filter,
} from "lucide-react";

export const Route = createFileRoute("/_app/appraisals-review")({
  component: AppraisalsReviewPage,
});

function AppraisalsReviewPage() {
  const navigate = useNavigate();
  const {
    employees, getPendingAppraisals, getEmployeeAppraisals,
    approveAppraisal, rejectAppraisal, requestChanges, addAppraisalComment,
  } = useP4P();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [pendingAppraisals, setPendingAppraisals] = useState<any[]>([]);
  const [allAppraisals, setAllAppraisals] = useState<any[]>([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isManager, setIsManager] = useState(false);
  const [directReportIds, setDirectReportIds] = useState<string[]>([]);
  const [expandedAppraisal, setExpandedAppraisal] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate({ to: "/login" });
          return;
        }
        setUser(currentUser);
        const emp = employees.find((e) => e.email === currentUser.email);
        setCurrentEmployee(emp || null);
        setReviewerName(emp?.name || currentUser.email || "Reviewer");
        const isManagerUser = emp?.isManager === true;
        setIsManager(isManagerUser);
        const directReports = isManagerUser
          ? employees.filter((e) => e.supervisorId === emp?.id).map((e) => e.id)
          : [];
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

  const loadAppraisals = (directReports: string[] = directReportIds, isManagerUser: boolean = isManager) => {
    const pending = getPendingAppraisals();
    const filteredPending = isManagerUser
      ? pending.filter((a) => directReports.includes(a.employeeId))
      : pending;
    setPendingAppraisals(filteredPending);

    const all: any[] = [];
    const targetEmployees = isManagerUser ? directReports : employees.map((e) => e.id);
    for (const empId of targetEmployees) {
      all.push(...getEmployeeAppraisals(empId));
    }
    all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setAllAppraisals(all);
  };

  const handleApprove = (appraisalId: string) => {
    setActionLoading(true);
    approveAppraisal(appraisalId, user?.id || "reviewer", reviewerName);
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    showToast.success("Appraisal Approved", "The appraisal has been approved.");
  };

  const handleReject = (appraisalId: string) => {
    setActionLoading(true);
    rejectAppraisal(appraisalId, user?.id || "reviewer", reviewerName, "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    showToast.error("Appraisal Rejected", "The appraisal has been rejected.");
  };

  const handleRequestChanges = (appraisalId: string) => {
    setActionLoading(true);
    requestChanges(appraisalId, user?.id || "reviewer", reviewerName, "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setActionLoading(false);
    showToast.warning("Changes Requested", "Feedback sent to the employee.");
  };

  const handleAddComment = (appraisalId: string) => {
    if (!commentText.trim()) return;
    addAppraisalComment(appraisalId, user?.id || "reviewer", reviewerName, commentText);
    setCommentText("");
    loadAppraisals();
    showToast.success("Comment Posted", "Your comment has been added.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case "needs_revision":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"><Edit3 className="h-3 w-3" />Needs Revision</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 1.2) return "text-purple-600 dark:text-purple-400";
    if (score >= 1.0) return "text-emerald-600 dark:text-emerald-400";
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
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading appraisals...</p>
        </div>
      </div>
    );
  }

  if (!isManager && currentEmployee?.roleType !== "admin" && currentEmployee?.roleType !== "hr") {
    return <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="No Access" description="You don't have any direct reports to review." />;
  }
  if (isManager && directReportIds.length === 0) {
    return <EmptyState icon={<Users className="h-6 w-6" />} title="No Direct Reports" description="You don't have any employees assigned to you yet." />;
  }

  const approvedCount = allAppraisals.filter((a) => a.status === "approved").length;
  const rejectedCount = allAppraisals.filter((a) => a.status === "rejected").length;
  const revisionCount = allAppraisals.filter((a) => a.status === "needs_revision").length;

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      {/* 👈 ADDED data-tour wrapper */}
      <div data-tour="review-header">
      <PageHeader
        title="Review Appraisals"
        description={isManager ? `Review appraisals from your team (${directReportIds.length} direct reports)` : "Review and approve employee appraisal submissions."}
        icon={<ClipboardCheck className="h-6 w-6" />}
        actions={<Button variant="outline" size="sm" onClick={() => loadAppraisals()} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />
      </div>

      {/* 👈 ADDED data-tour */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="review-stats">
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={pendingAppraisals.length} accent="primary" size="large" pulse={pendingAppraisals.length > 0 ? "blue" : "none"} />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Approved" value={approvedCount} accent="success" size="large" />
        <StatCard icon={<Edit3 className="h-4 w-4" />} label="Needs Revision" value={revisionCount} accent="warning" size="large" />
        <StatCard icon={<XCircle className="h-4 w-4" />} label="Rejected" value={rejectedCount} accent="danger" size="large" />
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} data-tour="review-tabs">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="gap-2"><Clock className="h-4 w-4" /> Pending ({pendingAppraisals.length})</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><FileText className="h-4 w-4" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingAppraisals.length === 0 ? (
            <EmptyState icon={<CheckCircle className="h-6 w-6" />} title="All Caught Up!" description="No pending appraisals from your team." />
          ) : (
            pendingAppraisals.map((appraisal, idx) => {
              const isSelected = selectedAppraisal?.id === appraisal.id;
              return (
                <motion.div key={appraisal.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className={`overflow-hidden border-l-4 border-l-blue-500 transition-shadow ${isSelected ? "shadow-md" : ""}`}>
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3 className="font-semibold text-base">{appraisal.employeeName}</h3>
                            <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {appraisal.department}</span>
                            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {appraisal.role}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(appraisal.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(appraisal.overallScore)}`}>{fmtNum(appraisal.overallPercent, 1)}%</div>
                            <div className="text-xs text-muted-foreground">{appraisal.performanceBand}</div>
                          </div>
                          <Button size="sm" variant={isSelected ? "default" : "outline"} onClick={() => setSelectedAppraisal(isSelected ? null : appraisal)} className="gap-2">
                            {isSelected ? "Close" : <><Eye className="h-4 w-4" /> Review</>}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <div className="border-t border-border/50 p-5 space-y-5 bg-muted/20">
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> All KPIs with Inputs</h4>
                              <div className="space-y-3">
                                {appraisal.categories.map((cat: any) => (
                                  <Card key={cat.id} className="overflow-hidden">
                                    <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between border-b border-border/50">
                                      <span className="font-medium text-sm">{cat.name}</span>
                                      <span className="text-xs text-muted-foreground">Category Weight {cat.weight}%</span>
                                    </div>
                                    <div className="divide-y divide-border/50">
                                      {cat.kpis.map((kpi: any) => {
                                        const target = kpi.target || 1;
                                        const actual = kpi.actual || 0;
                                        const achievement = target > 0 ? (actual / target) * 100 : 0;
                                        const hasProof = kpi.proof && kpi.proof.length > 0;
                                        const hasComment = kpi.comment && kpi.comment.trim().length > 0;
                                        const achColor =
                                          achievement >= 100 ? "text-emerald-600 dark:text-emerald-400"
                                            : achievement >= 70 ? "text-blue-600 dark:text-blue-400"
                                            : achievement >= 50 ? "text-amber-600 dark:text-amber-400"
                                            : "text-red-600 dark:text-red-400";

                                        return (
                                          <div key={kpi.id} className="p-4">
                                            <div className="grid grid-cols-12 gap-3 items-start">
                                              <div className="col-span-12 md:col-span-4 min-w-0">
                                                <p className="text-sm font-medium text-foreground break-words whitespace-normal leading-relaxed">{kpi.description}</p>
                                              </div>
                                              <div className="col-span-4 md:col-span-2 text-xs text-muted-foreground">
                                                <div className="md:hidden text-[10px] uppercase tracking-wide font-semibold mb-0.5">Target</div>
                                                {fmtNum(kpi.target)} {kpi.metric}
                                              </div>
                                              <div className="col-span-4 md:col-span-2">
                                                <div className="md:hidden text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">Actual</div>
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{fmtNum(kpi.actual)} {kpi.metric}</span>
                                              </div>
                                              <div className="col-span-4 md:col-span-2">
                                                <div className="md:hidden text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">Weight</div>
                                                <span className="text-sm font-semibold">{kpi.weight || 0}%</span>
                                              </div>
                                              <div className="col-span-12 md:col-span-1 text-right">
                                                <div className="md:hidden text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">Score</div>
                                                <span className={`text-sm font-bold ${achColor}`}>{fmtNum(achievement, 1)}%</span>
                                              </div>
                                              <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1">
                                                {hasProof && (
                                                  <Badge variant="outline" className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5">
                                                    <Paperclip className="h-2.5 w-2.5" /> {kpi.proof.length}
                                                  </Badge>
                                                )}
                                                {hasComment && (
                                                  <Badge variant="outline" className="text-[10px] gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-1.5">
                                                    <MessageSquare className="h-2.5 w-2.5" />
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>

                                            {hasProof && (
                                              <div className="mt-3 flex flex-wrap gap-1.5">
                                                {kpi.proof.map((p: any) => (
                                                  <a key={p.id} href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md hover:bg-blue-500/20 flex items-center gap-1 transition-colors">
                                                    <Download className="h-3 w-3" /> {p.fileName}
                                                  </a>
                                                ))}
                                              </div>
                                            )}

                                            {hasComment && (
                                              <div className="mt-3 text-xs bg-muted/50 rounded-md p-2.5 border border-border/50">
                                                <span className="font-semibold text-foreground">Employee comment: </span>
                                                <span className="text-muted-foreground">{kpi.comment}</span>
                                              </div>
                                            )}

                                            {!hasProof && !hasComment && (
                                              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                                <FileQuestion className="h-3 w-3" /> No support file or comment provided
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>

                            <SectionCard title="Comments & Feedback" icon={<MessageSquare className="h-4 w-4" />}>
                              {appraisal.comments.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                                  {appraisal.comments.map((c: any) => (
                                    <div key={c.id} className="bg-muted/50 p-3 rounded-lg text-sm">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-semibold">{c.authorName}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-muted-foreground">{c.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Textarea placeholder="Add a comment or feedback..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 min-h-[70px] text-sm" />
                                <Button size="sm" onClick={() => handleAddComment(appraisal.id)} disabled={!commentText.trim()} className="gap-2 shrink-0 self-end sm:self-auto">
                                  <MessageSquare className="h-4 w-4" /> Post Comment
                                </Button>
                              </div>
                            </SectionCard>

                            <SectionCard title="Review Decision" description="Use Post Comment above to add feedback first if needed" icon={<ClipboardCheck className="h-4 w-4" />}>
                              <div className="flex flex-wrap gap-3">
                                <Button onClick={() => handleApprove(appraisal.id)} disabled={actionLoading} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20">
                                  <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button variant="destructive" onClick={() => handleReject(appraisal.id)} disabled={actionLoading} className="gap-2">
                                  <X className="h-4 w-4" /> Reject
                                </Button>
                                <Button variant="outline" className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20" onClick={() => handleRequestChanges(appraisal.id)} disabled={actionLoading}>
                                  <Edit3 className="h-4 w-4" /> Request Changes
                                </Button>
                              </div>
                            </SectionCard>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Filter className="h-4 w-4" /> Filters:</div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "pending" && "Pending"}
                      {s === "approved" && "Approved"}
                      {s === "rejected" && "Rejected"}
                      {s === "needs_revision" && "Needs Revision"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => loadAppraisals()} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            </div>
          </Card>

          {filteredAppraisals.length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No Appraisal History" description="No appraisals match your filters." />
          ) : (
            filteredAppraisals.slice(0, 50).map((appraisal, idx) => {
              const isExpanded = expandedAppraisal === appraisal.id;
              return (
                <motion.div key={appraisal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card className="overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 flex-wrap mb-1.5">
                            <span className="font-semibold">{appraisal.employeeName}</span>
                            <span className="text-sm text-muted-foreground">{appraisal.department}</span>
                            {getStatusBadge(appraisal.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(appraisal.submittedAt).toLocaleDateString()}</span>
                            {appraisal.reviewerName && <span>Reviewed by: {appraisal.reviewerName}</span>}
                            <span>Period: {appraisal.period}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getScoreColor(appraisal.overallScore)}`}>{fmtNum(appraisal.overallPercent, 1)}%</div>
                            <div className="text-xs text-muted-foreground">{appraisal.performanceBand}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setExpandedAppraisal(isExpanded ? null : appraisal.id)} className="gap-2">
                            <Eye className="h-4 w-4" /> {isExpanded ? "Hide" : "Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}