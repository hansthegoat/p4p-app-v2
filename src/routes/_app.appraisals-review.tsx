import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle, XCircle, Clock, AlertCircle, Eye,
  Calendar, User, FileText, MessageSquare,
  RefreshCw, Check, X, Edit3, Paperclip, Download, Users, FileQuestion
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

export const Route = createFileRoute("/_app/appraisals-review")({
  component: AppraisalsReviewPage,
});

function AppraisalsReviewPage() {
  const navigate = useNavigate();
  const {
    employees,
    getPendingAppraisals,
    getEmployeeAppraisals,
    approveAppraisal,
    rejectAppraisal,
    requestChanges,
    addAppraisalComment,
  } = useP4P();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [pendingAppraisals, setPendingAppraisals] = useState<any[]>([]);
  const [allAppraisals, setAllAppraisals] = useState<any[]>([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [rejectReason, setRejectReason] = useState("");
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

        const emp = employees.find(e => e.email === currentUser.email);
        setCurrentEmployee(emp || null);
        setReviewerName(emp?.name || currentUser.email || "Reviewer");

        const isManagerUser = emp?.isManager === true;
        setIsManager(isManagerUser);

        const directReports = isManagerUser 
          ? employees.filter(e => e.supervisorId === emp?.id).map(e => e.id)
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
      ? pending.filter(a => directReports.includes(a.employeeId))
      : pending;
    setPendingAppraisals(filteredPending);

    let all: any[] = [];
    const targetEmployees = isManagerUser ? directReports : employees.map(e => e.id);
    for (const empId of targetEmployees) {
      const empAppraisals = getEmployeeAppraisals(empId);
      all.push(...empAppraisals);
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
    rejectAppraisal(appraisalId, user?.id || "reviewer", reviewerName, rejectReason || "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setRejectReason("");
    setActionLoading(false);
    showToast.error("Appraisal Rejected", "The appraisal has been rejected.");
  };

  const handleRequestChanges = (appraisalId: string) => {
    setActionLoading(true);
    requestChanges(appraisalId, user?.id || "reviewer", reviewerName, rejectReason || "");
    loadAppraisals();
    setSelectedAppraisal(null);
    setRejectReason("");
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
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">✅ Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">❌ Rejected</Badge>;
      case 'needs_revision':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">📝 Needs Revision</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">⏳ Pending</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 1.2) return "text-purple-600";
    if (score >= 1.0) return "text-green-600";
    if (score >= 0.8) return "text-blue-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredAppraisals = allAppraisals.filter(a => {
    if (filterDepartment !== "all" && a.department !== filterDepartment) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const departments = [...new Set(allAppraisals.map(a => a.department))];
  const statuses = ["pending", "approved", "rejected", "needs_revision"];

  if (loading) {
    return <div className="p-8 text-center">Loading appraisals...</div>;
  }

  if (!isManager && currentEmployee?.roleType !== 'admin' && currentEmployee?.roleType !== 'hr') {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Access</h3>
        <p className="text-muted-foreground text-sm mt-1">
          You don't have any direct reports to review.
        </p>
      </div>
    );
  }

  if (isManager && directReportIds.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Direct Reports</h3>
        <p className="text-muted-foreground text-sm mt-1">
          You don't have any employees assigned to you yet. 
          Contact your admin to assign team members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">📋 Review Appraisals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isManager 
              ? `Review appraisals from your team (${directReportIds.length} direct reports)`
              : 'Review and approve employee appraisal submissions.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadAppraisals()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center border-blue-200 bg-blue-50/50">
          <div className="text-2xl font-bold text-blue-600">{pendingAppraisals.length}</div>
          <div className="text-xs text-blue-600">Pending</div>
        </Card>
        <Card className="p-4 text-center border-green-200 bg-green-50/50">
          <div className="text-2xl font-bold text-green-600">
            {allAppraisals.filter(a => a.status === 'approved').length}
          </div>
          <div className="text-xs text-green-600">Approved</div>
        </Card>
        <Card className="p-4 text-center border-yellow-200 bg-yellow-50/50">
          <div className="text-2xl font-bold text-yellow-600">
            {allAppraisals.filter(a => a.status === 'needs_revision').length}
          </div>
          <div className="text-xs text-yellow-600">Needs Revision</div>
        </Card>
        <Card className="p-4 text-center border-red-200 bg-red-50/50">
          <div className="text-2xl font-bold text-red-600">
            {allAppraisals.filter(a => a.status === 'rejected').length}
          </div>
          <div className="text-xs text-red-600">Rejected</div>
        </Card>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            ⏳ Pending ({pendingAppraisals.length})
          </TabsTrigger>
          <TabsTrigger value="history">📊 History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingAppraisals.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">All Caught Up!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                No pending appraisals from your team.
              </p>
            </Card>
          ) : (
            pendingAppraisals.map((appraisal) => (
              <Card key={appraisal.id} className="p-4 border-l-4 border-l-blue-500">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">{appraisal.employeeName}</h3>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">⏳ Pending</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {appraisal.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {appraisal.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(appraisal.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(appraisal.overallScore)}`}>
                        {fmtNum(appraisal.overallPercent, 1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{appraisal.performanceBand}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedAppraisal(
                          selectedAppraisal?.id === appraisal.id ? null : appraisal
                        );
                      }}
                    >
                      {selectedAppraisal?.id === appraisal.id ? "Close" : "Review"}
                    </Button>
                  </div>
                </div>

                {selectedAppraisal?.id === appraisal.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        All KPIs with Inputs
                      </h4>
                      <div className="space-y-4">
                        {appraisal.categories.map((cat: any) => (
                          <div key={cat.id} className="border rounded-md overflow-hidden">
                            <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                              <span className="font-medium text-sm">{cat.name}</span>
                              <span className="text-xs text-muted-foreground">Weight: {cat.weight}%</span>
                            </div>
                            <div className="p-3 space-y-3">
                              {cat.kpis.map((kpi: any) => {
                                const target = kpi.target || 1;
                                const actual = kpi.actual || 0;
                                const ratio = target > 0 ? actual / target : 0;
                                const achievement = ratio * 100;
                                const hasProof = kpi.proof && kpi.proof.length > 0;
                                const hasComment = kpi.comment && kpi.comment.trim().length > 0;

                                return (
                                  <div key={kpi.id} className="bg-white rounded-md border p-3">
                                    <div className="grid grid-cols-12 gap-2 text-sm items-start">
                                      <div className="col-span-5 font-medium break-words whitespace-normal">
                                        {kpi.description}
                                      </div>
                                      <div className="col-span-2 text-muted-foreground text-xs">
                                        Target: {fmtNum(kpi.target)} {kpi.metric}
                                      </div>
                                      <div className="col-span-2 font-semibold text-blue-600 text-xs">
                                        Actual: {fmtNum(kpi.actual)} {kpi.metric}
                                      </div>
                                      <div className={`col-span-2 font-bold text-xs ${
                                        achievement >= 100 ? 'text-green-600' :
                                        achievement >= 70 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {fmtNum(achievement, 1)}%
                                      </div>
                                      <div className="col-span-1 text-right">
                                        {hasProof && (
                                          <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px] px-1.5 py-0">
                                            <Paperclip className="h-3 w-3 mr-0.5" />
                                            {kpi.proof.length}
                                          </Badge>
                                        )}
                                        {hasComment && (
                                          <Badge variant="outline" className="text-purple-600 border-purple-200 text-[10px] px-1.5 py-0 ml-1">
                                            <MessageSquare className="h-3 w-3 mr-0.5" />
                                            💬
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {hasProof && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {kpi.proof.map((p: any) => (
                                          <a
                                            key={p.id}
                                            href={p.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 flex items-center gap-1 transition-colors"
                                          >
                                            <Download className="h-3 w-3" />
                                            {p.fileName}
                                          </a>
                                        ))}
                                      </div>
                                    )}

                                    {hasComment && (
                                      <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                                        💬 <span className="font-medium">Employee comment:</span> {kpi.comment}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments & Feedback
                      </h4>
                      {appraisal.comments.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                          {appraisal.comments.map((c: any) => (
                            <div key={c.id} className="bg-muted/30 p-2 rounded-md text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">{c.authorName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(c.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a comment or feedback..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 min-h-[60px]"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleAddComment(appraisal.id)}
                        disabled={!commentText.trim()}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" /> Post Comment
                      </Button>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium text-sm mb-2">📋 Review Decision</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(appraisal.id)}
                          disabled={actionLoading}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(appraisal.id)}
                          disabled={actionLoading}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button
                          variant="outline"
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          onClick={() => handleRequestChanges(appraisal.id)}
                          disabled={actionLoading}
                        >
                          <Edit3 className="h-4 w-4 mr-1" /> Request Changes
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Use the "Post Comment" section above to provide feedback or reason for your decision.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'pending' && '⏳ Pending'}
                    {s === 'approved' && '✅ Approved'}
                    {s === 'rejected' && '❌ Rejected'}
                    {s === 'needs_revision' && '📝 Needs Revision'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => loadAppraisals()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>

          {filteredAppraisals.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Appraisal History</h3>
              <p className="text-muted-foreground text-sm mt-1">
                No appraisals from your team match your filters.
              </p>
            </Card>
          ) : (
            filteredAppraisals.slice(0, 50).map((appraisal) => (
              <Card key={appraisal.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">{appraisal.employeeName}</span>
                      <span className="text-sm text-muted-foreground">{appraisal.department}</span>
                      {getStatusBadge(appraisal.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(appraisal.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        {appraisal.reviewerName && `Reviewed by: ${appraisal.reviewerName}`}
                      </span>
                      <span className="flex items-center gap-1">
                        Period: {appraisal.period}
                      </span>
                    </div>
                    {appraisal.revisionReason && (
                      <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md mt-2">
                        📝 {appraisal.revisionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(appraisal.overallScore)}`}>
                        {fmtNum(appraisal.overallPercent, 1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{appraisal.performanceBand}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setExpandedAppraisal(
                          expandedAppraisal === appraisal.id ? null : appraisal.id
                        );
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </div>
                </div>

                {expandedAppraisal === appraisal.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm">Categories</h4>
                        {appraisal.categories.map((cat: any) => {
                          const catScore = cat.kpis.reduce((sum: number, k: any) => {
                            const target = k.target || 1;
                            const actual = k.actual || 0;
                            return sum + (target > 0 ? actual / target : 0);
                          }, 0) / (cat.kpis.length || 1);
                          return (
                            <div key={cat.id} className="flex justify-between text-sm border-b pb-1 mt-1">
                              <span>{cat.name}</span>
                              <span className="font-medium">{fmtNum(catScore * 100, 1)}%</span>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Comments</h4>
                        {appraisal.comments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No comments.</p>
                        ) : (
                          appraisal.comments.map((c: any) => (
                            <div key={c.id} className="bg-muted/30 p-2 rounded-md text-sm mt-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{c.authorName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(c.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="outline" onClick={() => setExpandedAppraisal(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}