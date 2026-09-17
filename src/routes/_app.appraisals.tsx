import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/supabase";
import {
  CheckCircle, XCircle, Clock, AlertCircle, Eye, Send, Calendar,
  User, FileText, MessageSquare, RefreshCw, Edit3, ClipboardCheck,
  Award, ChevronRight, Target, Info,
} from "lucide-react";

export const Route = createFileRoute("/_app/appraisals")({
  component: AppraisalsPage,
});

function AppraisalsPage() {
  const navigate = useNavigate();
  const { employees, getEmployeeAppraisals, submitAppraisal, getPendingAppraisals } = useP4P();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("");

  const getCurrentPeriod = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
    return `${quarter} ${now.getFullYear()}`;
  };

  useEffect(() => { setPeriod(getCurrentPeriod()); }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) { navigate({ to: "/login" }); return; }
        const emp = employees.find((e) => e.email === user.email);
        if (!emp) { setError("No employee record found."); setLoading(false); return; }
        setEmployee(emp);
        setAppraisals(getEmployeeAppraisals(emp.id));
        setPendingCount(getPendingAppraisals().length);
        setLoading(false);
      } catch { setError("Failed to load data."); setLoading(false); }
    };
    fetchData();
  }, [employees, navigate, getEmployeeAppraisals, getPendingAppraisals]);

  const handleSubmitAppraisal = () => {
    if (!employee || !period.trim()) {
      showToast.warning("Missing Period", "Please enter a period (e.g., Q1 2025).");
      return;
    }
    setSubmitting(true);
    const now = new Date();
    try {
      submitAppraisal(employee.id, period, now.getFullYear(), now.getMonth() + 1);
      const updated = getEmployeeAppraisals(employee.id);
      setAppraisals(updated);
      showToast.success("Appraisal Submitted", `Submitted for ${period}.`);
      setPeriod(getCurrentPeriod());
    } catch (err: any) {
      showToast.error("Submission Failed", err.message);
    } finally { setSubmitting(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case "needs_revision": return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"><Edit3 className="h-3 w-3" />Needs Revision</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 1.2) return "text-purple-600 dark:text-purple-400";
    if (score >= 1.0) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 0.8) return "text-blue-600 dark:text-blue-400";
    if (score >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your appraisals...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="Unable to load" description={error || "No employee record found."} action={<Button onClick={() => navigate({ to: "/logout" })}>Logout</Button>} />;
  }

  const approvedCount = appraisals.filter((a) => a.status === "approved").length;
  const rejectedCount = appraisals.filter((a) => a.status === "rejected").length;
  const revisionCount = appraisals.filter((a) => a.status === "needs_revision").length;
  const pendingAppraisals = appraisals.filter((a) => a.status === "pending");

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      {/* 👈 ADDED data-tour wrapper */}
      <div data-tour="appraisals-header">
      <PageHeader
        title="My Appraisals"
        description="Submit your KPIs for review and track approval status."
        icon={<ClipboardCheck className="h-6 w-6" />}
        badge={pendingCount > 0 ? <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"><Clock className="h-3 w-3" />{pendingCount} pending</Badge> : undefined}
        actions={<Button variant="outline" size="sm" onClick={() => { setAppraisals(getEmployeeAppraisals(employee.id)); showToast.success("Refreshed", "Appraisal list updated."); }} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />
      </div>
      {/* 👈 ADDED data-tour */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="appraisals-stats">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Total Appraisals" value={appraisals.length} accent="primary" size="large" />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Approved" value={approvedCount} accent="success" size="large" />
        <StatCard icon={<Edit3 className="h-4 w-4" />} label="Needs Revision" value={revisionCount} accent="warning" size="large" />
        <StatCard icon={<XCircle className="h-4 w-4" />} label="Rejected" value={rejectedCount} accent="danger" size="large" />
      </div>

      <motion.div variants={fadeUp} data-tour="appraisals-submit">
        <SectionCard title="Submit New Appraisal" description="Your current KPI data will be sent to your manager for review" icon={<Send className="h-4 w-4" />}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Period</Label>
              <Input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g., Q1 2025" className="h-10" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSubmitAppraisal} disabled={submitting || !period.trim()} className="h-10 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20">
                {submitting ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting</> : <><Send className="h-4 w-4" /> Submit for Review</>}
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Your current KPI data will be submitted for manager review. You can resubmit anytime.</span>
          </div>
        </SectionCard>
      </motion.div>

      <Tabs defaultValue="all" className="w-full" data-tour="appraisals-list">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" className="gap-2"><FileText className="h-4 w-4" /> All ({appraisals.length})</TabsTrigger>
          <TabsTrigger value="pending" className="gap-2"><Clock className="h-4 w-4" /> Pending ({pendingAppraisals.length})</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><Award className="h-4 w-4" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {appraisals.length === 0 ? (
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No appraisals yet" description="Submit your first appraisal above to get started." />
          ) : (
            appraisals.map((appraisal, idx) => (
              <AppraisalCard key={appraisal.id} appraisal={appraisal} idx={idx} isSelected={selectedAppraisal?.id === appraisal.id} onSelect={() => setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal)} getStatusBadge={getStatusBadge} getScoreColor={getScoreColor} onEditKpis={() => navigate({ to: "/employee" })} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingAppraisals.length === 0 ? (
            <EmptyState icon={<CheckCircle className="h-6 w-6" />} title="All Caught Up!" description="You have no pending appraisals. Great work!" />
          ) : (
            pendingAppraisals.map((appraisal, idx) => (
              <AppraisalCard key={appraisal.id} appraisal={appraisal} idx={idx} isSelected={selectedAppraisal?.id === appraisal.id} onSelect={() => setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal)} getStatusBadge={getStatusBadge} getScoreColor={getScoreColor} onEditKpis={() => navigate({ to: "/employee" })} />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          {appraisals.filter((a) => a.status !== "pending").length === 0 ? (
            <EmptyState icon={<Award className="h-6 w-6" />} title="No history yet" description="Approved and reviewed appraisals will appear here." />
          ) : (
            appraisals.filter((a) => a.status !== "pending").map((appraisal, idx) => (
              <AppraisalCard key={appraisal.id} appraisal={appraisal} idx={idx} isSelected={selectedAppraisal?.id === appraisal.id} onSelect={() => setSelectedAppraisal(selectedAppraisal?.id === appraisal.id ? null : appraisal)} getStatusBadge={getStatusBadge} getScoreColor={getScoreColor} onEditKpis={() => navigate({ to: "/employee" })} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function AppraisalCard({ appraisal, idx, isSelected, onSelect, getStatusBadge, getScoreColor, onEditKpis }: {
  appraisal: any; idx: number; isSelected: boolean; onSelect: () => void;
  getStatusBadge: (s: string) => any; getScoreColor: (s: number) => string; onEditKpis: () => void;
}) {
  const isPending = appraisal.status === "pending";
  const needsRevision = appraisal.status === "needs_revision";
  const isApproved = appraisal.status === "approved";
  const isRejected = appraisal.status === "rejected";
  const borderColor = isApproved ? "border-l-emerald-500" : isRejected ? "border-l-red-500" : needsRevision ? "border-l-amber-500" : "border-l-blue-500";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
      <Card className={`overflow-hidden border-l-4 ${borderColor} transition-shadow ${isSelected ? "shadow-md" : ""}`}>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h3 className="font-semibold text-base">{appraisal.period}</h3>
                {getStatusBadge(appraisal.status)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(appraisal.submittedAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{appraisal.employeeName}</span>
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{appraisal.categories.length} categories</span>
                {appraisal.comments?.length > 0 && <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />{appraisal.comments.length} comment(s)</span>}
              </div>
              {appraisal.revisionReason && (
                <div className="mt-3 text-xs bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 rounded-md p-2.5">
                  <div className="font-semibold mb-0.5">Feedback:</div>
                  <div>{appraisal.revisionReason}</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(appraisal.overallScore)}`}>{fmtNum(appraisal.overallPercent, 1)}%</div>
                <div className="text-xs text-muted-foreground">{appraisal.performanceBand}</div>
              </div>
              <Button size="sm" variant={isSelected ? "default" : "outline"} onClick={onSelect} className="gap-2">
                <Eye className="h-4 w-4" /> {isSelected ? "Hide" : "Details"}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="border-t border-border/50 p-5 space-y-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-muted-foreground" /><h4 className="font-semibold text-sm">Categories</h4></div>
                    <div className="space-y-2">
                      {appraisal.categories.map((cat: any) => {
                        const catScore = cat.kpis.reduce((sum: number, k: any) => {
                          const target = k.target || 1;
                          const actual = k.actual || 0;
                          return sum + (target > 0 ? actual / target : 0);
                        }, 0) / (cat.kpis.length || 1);
                        const pct = catScore * 100;
                        const color = pct >= 100 ? "emerald" : pct >= 70 ? "blue" : pct >= 50 ? "amber" : "red";
                        return (
                          <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/60">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full bg-${color}-500 shrink-0`} />
                              <span className="text-sm truncate">{cat.name}</span>
                              <Badge variant="outline" className="text-[10px]">{cat.kpis.length} KPIs</Badge>
                            </div>
                            <span className={`font-semibold text-sm text-${color}-600 dark:text-${color}-400 shrink-0 ml-2`}>{fmtNum(pct, 1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3"><MessageSquare className="h-4 w-4 text-muted-foreground" /><h4 className="font-semibold text-sm">Comments</h4></div>
                    {appraisal.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-3 rounded-lg bg-background border border-border/60">No comments yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {appraisal.comments.map((c: any) => (
                          <div key={c.id} className="p-3 rounded-lg bg-background border border-border/60 text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold">{c.authorName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-muted-foreground text-xs">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    {needsRevision && <><Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" /><span>Your manager has requested changes. Edit your KPIs and resubmit.</span></>}
                    {isPending && <><Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" /><span>Awaiting manager review.</span></>}
                    {isApproved && <><CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" /><span>Approved and saved as official data for this period.</span></>}
                    {isRejected && <><XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-600" /><span>This appraisal was rejected. Please contact your manager.</span></>}
                  </div>
                  {needsRevision && (
                    <Button size="sm" onClick={onEditKpis} className="gap-2"><Edit3 className="h-4 w-4" /> Edit KPIs & Resubmit</Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}