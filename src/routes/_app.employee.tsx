import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { usePageTour } from "@/hooks/usePageTour";
import { PAGE_TOURS } from "@/lib/p4p/tours";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { getCurrentUser, uploadProofFile } from "@/lib/supabase";
import {
  Target, AlertCircle, TrendingUp, Clock, Star, Send, Upload,
  Paperclip, File, X, MessageSquare, Info, ChevronRight,
  CheckCircle, Calendar, Award, Activity, BarChart3, PieChart, Users,
  Sparkles, FileSpreadsheet, Mail,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/_app/employee")({
  component: EmployeePortal,
});

const COLORS = {
  primary: "hsl(221 70% 50%)",
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px",
};

type PulseColor = "red" | "amber" | "emerald" | "blue" | "purple" | "none";

function EmployeePortal() {
  const navigate = useNavigate();
  const {
    employees, setEmployees, getMonthlyHistory, submitAppraisal, saveKPIProof,
  } = useP4P();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [editingActuals, setEditingActuals] = useState<Record<string, number>>({});
  const [kpiComments, setKpiComments] = useState<Record<string, string>>({});
  const [kpiProofs, setKpiProofs] = useState<Record<string, any[]>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"year" | "month">("month");
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getCurrentPeriod = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
    return `${quarter} ${now.getFullYear()}`;
  };

  const yearData = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id)
      .filter((d) => d.year === selectedYear)
      .sort((a, b) => a.month - b.month);
  }, [employee, getMonthlyHistory, selectedYear]);

  const trendData = useMemo(() => {
    if (!employee) return [];
    const sorted = [...getMonthlyHistory(employee.id)].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    );
    return sorted.slice(-6).map((d) => ({
      month: `${d.month}/${d.year}`,
      score: d.performanceMultiplier,
      label: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", { month: "short" })}`,
    }));
  }, [employee, getMonthlyHistory]);

  const monthOverMonth = useMemo(() => {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1].score;
    const prev = trendData[trendData.length - 2].score;
    if (prev === 0) return null;
    return ((last - prev) / prev) * 100;
  }, [trendData]);

  const yearStats = useMemo(() => {
    if (yearData.length === 0) return null;
    const scores = yearData.map((d) => d.performanceMultiplier);
    return {
      best: Math.max(...scores),
      worst: Math.min(...scores),
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length,
    };
  }, [yearData]);

  const getPerformanceBand = (score: number) => {
    if (score >= 1.2) return {
      label: "Exceptional", full: "Exceptional Performer",
      color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/30",
      icon: Star, pulse: "purple" as PulseColor, accent: "purple" as const,
    };
    if (score >= 1.0) return {
      label: "Exceeds Expectations", full: "Exceeds Expectations",
      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: TrendingUp, pulse: "emerald" as PulseColor, accent: "success" as const,
    };
    if (score >= 0.8) return {
      label: "Meets Expectations", full: "Meets Expectations",
      color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/30",
      icon: Target, pulse: "blue" as PulseColor, accent: "primary" as const,
    };
    if (score >= 0.6) return {
      label: "Needs Improvement", full: "Needs Improvement",
      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30",
      icon: Clock, pulse: "amber" as PulseColor, accent: "warning" as const,
    };
    return {
      label: "PIP", full: "Performance Improvement Plan",
      color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/30",
      icon: AlertCircle, pulse: "red" as PulseColor, accent: "danger" as const,
    };
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) { navigate({ to: "/login" }); return; }
        const emp = employees.find((e) => e.email === user.email);
        if (!emp) {
          setError("No employee record found for your email. Please contact HR.");
          setLoading(false);
          return;
        }
        setEmployee(emp);
        setLoading(false);
      } catch {
        setError("Failed to load your profile.");
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);

  useEffect(() => {
    if (!employee || viewMode === "year") {
      setSelectedSnapshot(null);
      return;
    }
    const snap = getMonthlyHistory(employee.id).find(
      (d) => d.year === selectedYear && d.month === selectedMonth
    );
    setSelectedSnapshot(snap || null);

    const actuals: Record<string, number> = {};
    const comments: Record<string, string> = {};
    const proofs: Record<string, any[]> = {};

    if (snap) {
      for (const cat of snap.categories || []) {
        for (const kpi of cat.kpis) {
          actuals[kpi.id] = kpi.actual || 0;
          comments[kpi.id] = kpi.comment || "";
          proofs[kpi.id] = kpi.proof || [];
        }
      }
    } else {
      for (const cat of employee.categories || []) {
        for (const kpi of cat.kpis) {
          actuals[kpi.id] = 0;
          comments[kpi.id] = "";
          proofs[kpi.id] = [];
        }
      }
    }
    setEditingActuals(actuals);
    setKpiComments(comments);
    setKpiProofs(proofs);
  }, [employee, selectedYear, selectedMonth, getMonthlyHistory, viewMode]);

  const updateActual = (kpiId: string, value: number) =>
    setEditingActuals((prev) => ({ ...prev, [kpiId]: value }));

  const updateComment = (kpiId: string, value: string) =>
    setKpiComments((prev) => ({ ...prev, [kpiId]: value }));

  const handleFileUpload = async (kpiId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !employee) return;
    setUploadingFiles((prev) => ({ ...prev, [kpiId]: true }));
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadProofFile(employee.id, kpiId, file);
        if (result) {
          const fileData = {
            id: result.id,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            fileType: result.fileType,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          };
          uploaded.push(fileData);
          saveKPIProof(employee.id, kpiId, fileData);
        }
      }
      setKpiProofs((prev) => ({
        ...prev,
        [kpiId]: [...(prev[kpiId] || []), ...uploaded],
      }));
      showToast.success(`Uploaded ${uploaded.length} support file(s)`, "File(s) uploaded successfully.");
    } catch {
      showToast.error("Upload Failed", "Please try again.");
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [kpiId]: false }));
      if (fileInputRefs.current[kpiId]) fileInputRefs.current[kpiId]!.value = "";
    }
  };

  const removeProof = (kpiId: string, proofId: string) => {
    setKpiProofs((prev) => ({
      ...prev,
      [kpiId]: (prev[kpiId] || []).filter((p) => p.id !== proofId),
    }));
    if (!employee) return;
    setEmployees(
      employees.map((emp) => {
        if (emp.id !== employee.id) return emp;
        return {
          ...emp,
          categories: (emp.categories || []).map((cat) => ({
            ...cat,
            kpis: cat.kpis.map((k) => {
              if (k.id !== kpiId) return k;
              return { ...k, proof: (k.proof || []).filter((p: any) => p.id !== proofId) };
            }),
          })),
        };
      })
    );
  };

  const handleSubmitForAppraisal = () => {
    if (!employee) return;
    if (!employee.categories || employee.categories.length === 0) {
      showToast.warning("No KPIs", "You don't have any KPIs to submit yet.");
      return;
    }
    const updated = employees.map((emp) => {
      if (emp.id !== employee.id) return emp;
      return {
        ...emp,
        categories: (emp.categories || []).map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({
            ...k,
            actual: editingActuals[k.id] ?? 0,
            comment: kpiComments[k.id] ?? "",
            proof: kpiProofs[k.id] || [],
            updatedAt: new Date().toISOString(),
          })),
        })),
      };
    });
    setEmployees(updated);
    const refreshed = updated.find((e) => e.id === employee.id);
    if (refreshed) setEmployee(refreshed);

    const period = getCurrentPeriod();
    setSubmittingAppraisal(true);
    try {
      submitAppraisal(employee.id, period, selectedYear, selectedMonth);
      showToast.success("Appraisal Submitted!", `Submitted for ${period}.`);
    } catch (err: any) {
      showToast.error("Submission Failed", err.message);
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  let displayCategories = employee?.categories || [];
  let overallPercent = 0;

  if (employee) {
    if (viewMode === "year" && yearData.length > 0 && employee.categories) {
      const catAvg: Record<string, { total: number; count: number }> = {};
      employee.categories.forEach((c: any) => (catAvg[c.id] = { total: 0, count: 0 }));
      for (const snap of yearData) {
        for (const snapCat of snap.categories || []) {
          if (catAvg[snapCat.id]) {
            let sum = 0, count = 0;
            for (const kpi of snapCat.kpis) {
              const target = kpi.target || 1;
              sum += target > 0 ? kpi.actual / target : 0;
              count++;
            }
            catAvg[snapCat.id].total += count > 0 ? sum / count : 0;
            catAvg[snapCat.id].count++;
          }
        }
      }
      let tw = 0, twt = 0;
      for (const cat of employee.categories) {
        const avg = catAvg[cat.id];
        const score = avg && avg.count > 0 ? avg.total / avg.count : 0;
        const w = cat.weight / 100;
        tw += score * w;
        twt += w;
      }
      overallPercent = twt > 0 ? (tw / twt) * 100 : 0;
    } else {
      const cats = employee.categories || [];
      displayCategories = cats;
      let tw = 0, twt = 0;
      for (const cat of cats) {
        let weightedSum = 0;
        let totalKpiWeight = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = editingActuals[kpi.id] ?? 0;
          const ratio = target > 0 ? actual / target : 0;
          const weight = kpi.weight || 100;
          weightedSum += ratio * weight;
          totalKpiWeight += weight;
        }
        const score = totalKpiWeight > 0 ? weightedSum / totalKpiWeight : 0;
        const w = cat.weight / 100;
        tw += score * w;
        twt += w;
      }
      overallPercent = twt > 0 ? (tw / twt) * 100 : 0;
    }
  }

  const band = getPerformanceBand(overallPercent / 100);
  const BandIcon = band.icon;
  const hasApprovedData = !!selectedSnapshot;
  const hasNoKpis = !employee?.categories || employee.categories.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="Unable to load"
        description={error}
        action={<Button onClick={() => navigate({ to: "/logout" })}>Logout</Button>}
      />
    );
  }

  if (!employee) {
    return <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="No data found" />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      <PageHeader
        title="My KPIs"
        description={`${employee.name} · ${employee.department} · ${employee.role}`}
        icon={<Target className="h-6 w-6" />}
        actions={
          !hasNoKpis ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                  {viewMode === "year" ? `Year ${selectedYear} Avg` : "Overall Score"}
                </div>
                <div className={`text-3xl font-bold ${band.color}`}>
                  {fmtNum(overallPercent, 1)}%
                </div>
              </div>
              <div className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 flex items-center gap-2 ${band.bg} ${band.color} pulse-${band.pulse}`}>
                <BandIcon className="h-4 w-4" />
                {band.full}
              </div>
            </div>
          ) : undefined
        }
      />

      {hasNoKpis ? (
        <>
          <motion.div variants={fadeUp}>
            <Card className="p-8 bg-gradient-to-br from-amber-500/5 via-background to-background border-amber-500/20 overflow-hidden relative">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your KPIs Are Being Set Up</h2>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  HR is preparing your KPI framework for{" "}
                  <strong className="text-foreground">{employee.department}</strong> ·{" "}
                  <strong className="text-foreground">{employee.role}</strong>.
                  <br />
                  Your KPIs will appear here once they're assigned — usually within 1–2 business days.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Waiting for template assignment
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <SectionCard
              title="What Happens Next?"
              description="Steps to activate your KPI dashboard"
              icon={<Info className="h-4 w-4" />}
            >
              <div className="space-y-3">
                {[
                  { icon: Mail, title: "HR notified", desc: "HR/Admin has been notified that you need KPIs." },
                  { icon: FileSpreadsheet, title: "Template created", desc: "HR will set up a KPI template for your department and role." },
                  { icon: CheckCircle, title: "KPIs assigned", desc: "Your KPI dashboard will activate automatically." },
                  { icon: Send, title: "You can submit", desc: "Once KPIs appear, you can start entering data and submitting for review." },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Step {i + 1}</span>
                          <span>{step.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "year" | "month")}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="month" className="gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5" /> Monthly
                    </TabsTrigger>
                    <TabsTrigger value="year" className="gap-2 text-xs">
                      <BarChart3 className="h-3.5 w-3.5" /> Yearly
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                    <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {viewMode === "month" && (
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                      <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  {viewMode === "month" && (
                    hasApprovedData ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5">
                        <CheckCircle className="h-3 w-3" /> Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted gap-1.5">
                        <Clock className="h-3 w-3" /> Not submitted
                      </Badge>
                    )
                  )}
                  <Button
                    onClick={handleSubmitForAppraisal}
                    disabled={submittingAppraisal}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20"
                  >
                    {submittingAppraisal ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Submit for Appraisal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className={`p-4 flex items-start gap-3 ${hasApprovedData ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"}`}>
              {hasApprovedData ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              )}
              <p className={`text-xs leading-relaxed ${hasApprovedData ? "text-emerald-800 dark:text-emerald-300" : "text-blue-800 dark:text-blue-300"}`}>
                {hasApprovedData
                  ? "This period has approved data. You can edit and resubmit — new approval will replace the old data."
                  : "Enter your actuals, add comments, and upload support files. Click Submit for Appraisal when ready."}
              </p>
            </Card>
          </motion.div>

          {viewMode === "year" && yearStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Calendar className="h-4 w-4" />} label="Months Tracked" value={yearStats.count} accent="primary" size="large" />
              <StatCard icon={<Award className="h-4 w-4" />} label="Best Month" value={fmtNum(yearStats.best, 2)} accent="success" size="large" />
              <StatCard icon={<AlertCircle className="h-4 w-4" />} label="Worst Month" value={fmtNum(yearStats.worst, 2)} accent="danger" size="large" />
              <StatCard icon={<Activity className="h-4 w-4" />} label="Year Average" value={fmtNum(yearStats.avg, 2)} accent="info" size="large" />
            </div>
          ) : viewMode === "month" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Target className="h-4 w-4" />}
                label="Overall Score"
                value={`${fmtNum(overallPercent, 1)}%`}
                sub={monthOverMonth !== null ? `${monthOverMonth >= 0 ? "+" : ""}${monthOverMonth.toFixed(1)}% MoM` : "No data"}
                trend={monthOverMonth ?? undefined}
                accent="primary"
                size="large"
              />
              <StatCard icon={<PieChart className="h-4 w-4" />} label="Categories" value={displayCategories.length} accent="purple" size="large" />
              <StatCard icon={<Users className="h-4 w-4" />} label="Total KPIs" value={displayCategories.reduce((s, c) => s + c.kpis.length, 0)} accent="info" size="large" />
              <StatCard
                icon={<BandIcon className="h-4 w-4" />}
                label="Performance Status"
                value={band.label}
                sub={band.full}
                accent={band.accent}
                size="large"
                pulse={band.pulse}
              />
            </div>
          ) : null}

          {viewMode === "year" && yearData.length > 0 && (
            <SectionCard title={`Monthly Breakdown · ${selectedYear}`} description={`${yearData.length} months`} icon={<BarChart3 className="h-4 w-4" />} noPadding>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearData.map((d) => ({
                    label: new Date(d.year, d.month - 1, 1).toLocaleString("default", { month: "short" }),
                    score: d.performanceMultiplier,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="label" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 2]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtNum(v, 2), "Score"]} />
                    <Bar dataKey="score" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}

          {viewMode === "month" && trendData.length > 1 && (
            <SectionCard title="Performance Trend" description={`Last ${trendData.length} months`} icon={<Activity className="h-4 w-4" />} noPadding>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="label" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 2]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtNum(v, 2), "Score"]} />
                    <Area type="monotone" dataKey="score" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#trendGrad)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}

          {displayCategories.length > 0 && (
            <div className="space-y-4">
              {displayCategories.map((category: any, idx: number) => {
                let catScore = 0;
                let totalWeight = 0;
                const kpiDetails = category.kpis.map((kpi: any) => {
                  const target = kpi.target || 0;
                  const actual = editingActuals[kpi.id] ?? 0;
                  const comment = kpiComments[kpi.id] ?? "";
                  const proof = kpiProofs[kpi.id] || [];
                  const ratio = target > 0 ? actual / target : 0;
                  const achievement = ratio * 100;
                  const weight = kpi.weight || 0;
                  if (target > 0 && weight > 0) {
                    catScore += ratio * weight;
                    totalWeight += weight;
                  }
                  return { ...kpi, actual, achievement, comment, proof, weight };
                });

                const finalScore = totalWeight > 0 ? (catScore / totalWeight) * 100 : 0;
                const statusColor =
                  finalScore >= 100 ? "emerald"
                    : finalScore >= 70 ? "blue"
                    : finalScore >= 50 ? "amber"
                    : "red";

                return (
                  <motion.div key={idx} variants={fadeUp}>
                    <Card className="overflow-hidden">
                      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-${statusColor}-500/10 text-${statusColor}-600 dark:text-${statusColor}-400 flex items-center justify-center font-bold text-sm shrink-0`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base text-foreground truncate">
                              {category.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {category.kpis.length} KPIs · Category weight {category.weight}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {hasApprovedData && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[10px]">
                              <CheckCircle className="h-3 w-3" /> Approved
                            </Badge>
                          )}
                          <div className={`text-2xl font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>
                            {fmtNum(finalScore, 1)}%
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-muted h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, finalScore)}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full bg-${statusColor}-500`}
                        />
                      </div>

                      <div className="divide-y divide-border/50">
                        {kpiDetails.map((kpi: any) => {
                          const isUploading = uploadingFiles[kpi.id] || false;
                          const isExpanded = expandedKpi === kpi.id;
                          const achColor =
                            kpi.achievement >= 100 ? "text-emerald-600 dark:text-emerald-400"
                              : kpi.achievement >= 70 ? "text-blue-600 dark:text-blue-400"
                              : kpi.achievement >= 50 ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400";

                          return (
                            <div key={kpi.id} className="p-5 hover:bg-accent/30 transition-colors">
                              <div className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-12 sm:col-span-5 min-w-0">
                                  <p className="text-sm font-medium text-foreground break-words whitespace-normal leading-relaxed">
                                    {kpi.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                                    <span className="whitespace-nowrap">
                                      Target: <strong className="text-foreground">{fmtNum(kpi.target)} {kpi.metric}</strong>
                                    </span>
                                    <span className="text-border/60">·</span>
                                    <span className="whitespace-nowrap">
                                      Weight: <strong className="text-foreground">{kpi.weight}%</strong>
                                    </span>
                                    {kpi.measurementSource && (
                                      <>
                                        <span className="text-border/60">·</span>
                                        <span className="break-words whitespace-normal">
                                          Source: {kpi.measurementSource}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="col-span-4 sm:col-span-2">
                                  <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1 sm:hidden">
                                    Actual
                                  </label>
                                  <Input
                                    type="number"
                                    className="h-9 text-sm"
                                    value={editingActuals[kpi.id] ?? 0}
                                    onChange={(e) => updateActual(kpi.id, Number(e.target.value))}
                                  />
                                </div>

                                <div className="col-span-4 sm:col-span-1 text-center">
                                  <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1 sm:hidden">
                                    Score
                                  </label>
                                  <div className={`text-base font-bold ${achColor}`}>
                                    {fmtNum(kpi.achievement, 1)}%
                                  </div>
                                </div>

                                <div className="col-span-4 sm:col-span-2 flex items-center gap-1.5">
                                  {kpi.proof.length > 0 && (
                                    <Badge variant="outline" className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5">
                                      <Paperclip className="h-2.5 w-2.5" />
                                      {kpi.proof.length}
                                    </Badge>
                                  )}
                                  {kpi.comment && kpi.comment.trim().length > 0 && (
                                    <Badge variant="outline" className="text-[10px] gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-1.5">
                                      <MessageSquare className="h-2.5 w-2.5" />
                                    </Badge>
                                  )}
                                </div>

                                <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1.5">
                                  <input
                                    type="file"
                                    ref={(el) => { fileInputRefs.current[kpi.id] = el; }}
                                    className="hidden"
                                    multiple
                                    onChange={(e) => handleFileUpload(kpi.id, e.target.files)}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 text-xs"
                                    onClick={() => fileInputRefs.current[kpi.id]?.click()}
                                    disabled={isUploading}
                                  >
                                    {isUploading ? (
                                      <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    ) : (
                                      <Upload className="h-3 w-3" />
                                    )}
                                    <span className="hidden sm:inline">Support File</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setExpandedKpi(isExpanded ? null : kpi.id)}
                                  >
                                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                  </Button>
                                </div>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-4 mt-4 border-t border-border/50 space-y-3">
                                      <div>
                                        <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                                          <MessageSquare className="h-3 w-3" /> Comment
                                        </label>
                                        <Input
                                          type="text"
                                          className="h-9 text-sm"
                                          placeholder="Add a comment for this KPI..."
                                          value={kpiComments[kpi.id] ?? ""}
                                          onChange={(e) => updateComment(kpi.id, e.target.value)}
                                        />
                                      </div>

                                      {kpi.proof.length > 0 && (
                                        <div>
                                          <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                                            <Paperclip className="h-3 w-3" /> Support Files
                                          </label>
                                          <div className="flex flex-wrap gap-2">
                                            {kpi.proof.map((p: any) => (
                                              <div key={p.id} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1.5 rounded-lg text-xs">
                                                <File className="h-3 w-3 shrink-0" />
                                                <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[180px]">
                                                  {p.fileName}
                                                </a>
                                                <button onClick={() => removeProof(kpi.id, p.id)} className="text-red-500 hover:text-red-700 ml-0.5">
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.div variants={fadeUp}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
              <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Data saves only after manager approval. Submit any month/year — resubmit anytime.</span>
              </div>
              <Button
                onClick={handleSubmitForAppraisal}
                disabled={submittingAppraisal}
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20"
              >
                {submittingAppraisal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Appraisal ({getCurrentPeriod()})
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}