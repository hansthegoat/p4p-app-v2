import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, XCircle, Clock, AlertCircle, Eye, Send, 
  ChevronRight, Calendar, User, FileText, MessageSquare,
  RefreshCw, Plus
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";

export const Route = createFileRoute("/_app/appraisals")({
  component: AppraisalsPage,
});

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
  const [employee, setEmployee] = useState<any>(null);
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("");

  // Get current user and their appraisals
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const emp = employees.find(e => e.email === user.email);
        if (!emp) {
          setError("No employee record found.");
          setLoading(false);
          return;
        }

        setEmployee(emp);

        // Get employee's appraisals
        const empAppraisals = getEmployeeAppraisals(emp.id);
        setAppraisals(empAppraisals);

        // Get pending count for badge
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
    
    // Refresh appraisals
    const updated = getEmployeeAppraisals(employee.id);
    setAppraisals(updated);
    setPeriod("");
    alert(`✅ Appraisal submitted for ${period}!`);
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

  if (loading) {
    return <div className="p-8 text-center">Loading your appraisals...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/logout" })}>Logout</Button>
      </div>
    );
  }

  if (!employee) {
    return <div className="p-8 text-center">No employee record found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">📋 My Appraisals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            View your appraisal history and submit new requests for review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {pendingCount} pending
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const updated = getEmployeeAppraisals(employee.id);
              setAppraisals(updated);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Submit New Appraisal */}
      <Card className="p-4 border-dashed border-2 bg-muted/20">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium">Appraisal Period</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g., Q1 2025"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button 
                onClick={handleSubmitAppraisal} 
                disabled={submitting || !period.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit for Review
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your current KPI data will be submitted for manager review.
            </p>
          </div>
        </div>
      </Card>

      {/* Appraisal List */}
      {appraisals.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Appraisals Yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Submit your first appraisal above to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {appraisals.map((appraisal) => (
            <Card key={appraisal.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold">{appraisal.period}</h3>
                    {getStatusBadge(appraisal.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(appraisal.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {appraisal.employeeName}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {appraisal.categories.length} categories
                    </span>
                  </div>
                  {appraisal.revisionReason && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md mt-2">
                      📝 {appraisal.revisionReason}
                    </p>
                  )}
                  {appraisal.comments.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {appraisal.comments.length} comment(s)
                      </span>
                    </div>
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
                    onClick={() => setSelectedAppraisal(appraisal)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Details
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedAppraisal?.id === appraisal.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm">Categories</h4>
                      <div className="mt-2 space-y-1">
                        {appraisal.categories.map((cat: any) => (
                          <div key={cat.id} className="flex justify-between text-sm border-b pb-1">
                            <span>{cat.name}</span>
                            <span className="font-medium">
                              {fmtNum(
                                cat.kpis.reduce((sum: number, k: any) => {
                                  const target = k.target || 1;
                                  const actual = k.actual || 0;
                                  return sum + (target > 0 ? actual / target : 0);
                                }, 0) / (cat.kpis.length || 1) * 100,
                                1
                              )}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Comments</h4>
                      {appraisal.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-2">No comments yet.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
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
                      {appraisal.status === 'needs_revision' && (
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md mt-2">
                          💡 Edit your KPIs and resubmit for review.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedAppraisal(null)}>
                      Close
                    </Button>
                    {appraisal.status === 'needs_revision' && (
                      <Button 
                        size="sm" 
                        onClick={() => navigate({ to: "/employee" })}
                      >
                        Edit KPIs
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}