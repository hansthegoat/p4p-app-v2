import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/p4p/AnimatedNumber";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
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
import { getCurrentUser } from "@/lib/supabase";
import { useUser } from "@/lib/p4p/user-context";
import { staggerContainer, fadeUp, tabContent, cardHover } from "@/lib/motion";
import { KpiUpdatesBanner } from "@/components/p4p/KpiUpdatesBanner";
import { NeedsAttention } from "@/components/p4p/NeedsAttention";
import {
  TrendingUp, Wallet, Users, UserCheck, DollarSign,
  Sparkles, Target, Calendar, Award, AlertTriangle,
  Settings, Save, RefreshCw, Activity, PieChart,
  BarChart3, CheckCircle, Clock, Star, Zap, Info, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const COLORS = {
  primary: "hsl(221 70% 50%)",
  success: "hsl(152 55% 42%)",
  warning: "hsl(38 75% 52%)",
  danger: "hsl(0 65% 55%)",
  purple: "hsl(270 70% 55%)",
  cyan: "hsl(189 70% 42%)",
  pink: "hsl(330 70% 55%)",
};

const CHART_COLORS = [
  COLORS.success,
  COLORS.primary,
  COLORS.warning,
  COLORS.danger,
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px",
};

function Dashboard() {
  const navigate = useNavigate();
  const {
    globals, setGlobals, calc, employees, monthlyData,
    getAllTrends, getMonthlyStats, getMonthlyHistory,
  } = useP4P();
  const { role } = useUser();
  const isAdmin = role === "admin" || role === "hr";

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [localGlobals, setLocalGlobals] = useState({
    totalRevenue: globals.totalRevenue,
    p4pPercent: globals.p4pPercent,
    adjunctPercent: globals.adjunctPercent,
    floor: globals.floor,
    cap: globals.cap,
    prorationOn: globals.prorationOn,
    salesMultiplier: globals.salesMultiplier,
  });
  const [saving, setSaving] = useState(false);

  const trends = getAllTrends();
  const stats = getMonthlyStats();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) { navigate({ to: "/login" }); return; }
        const emp = employees.find((e) => e.email === user.email);
        setEmployee(emp || null);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);

  // ============ ADMIN: Monthly trend ============
  const monthlyTrendData = useMemo(() => {
    const months = monthlyData
      .filter((d) => !employees.find((e) => e.id === d.employeeId)?.isAdjunct)
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
    const grouped: Record<string, { month: string; total: number; count: number }> = {};
    for (const d of months) {
      const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
      const label = `${new Date(d.year, d.month - 1, 1).toLocaleString("default", { month: "short" })} ${d.year}`;
      if (!grouped[key]) grouped[key] = { month: label, total: 0, count: 0 };
      grouped[key].total += d.performanceMultiplier;
      grouped[key].count++;
    }
    return Object.values(grouped).map((g) => ({
      month: g.month,
      avgMultiplier: g.total / g.count,
    }));
  }, [monthlyData, employees]);

  const handleSaveGlobals = () => {
    setSaving(true);
    setGlobals(localGlobals);
    setTimeout(() => setSaving(false), 500);
  };

  const disabled = globals.totalRevenue <= 0;

  // ============ EMPLOYEE DATA ============
  const employeeHistory = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);

  const categoryScores = useMemo(() => {
    if (!employee?.categories) return [];
    return employee.categories.map((cat: any) => {
      let weightedSum = 0;
      let totalKpiWeight = 0;
      let kpiCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const weight = kpi.weight || 0;
        weightedSum += ratio * weight;
        totalKpiWeight += weight;
        kpiCount++;
      }
      const score = totalKpiWeight > 0 ? (weightedSum / totalKpiWeight) * 100 : 0;
      return {
        name: cat.name,
        score,
        weight: cat.weight,
        kpiCount,
        kpis: cat.kpis.map((k: any) => ({
          description: k.description,
          weight: k.weight || 0,
          metric: k.metric,
          target: k.target,
          actual: k.actual,
        })),
      };
    });
  }, [employee]);

  const currentMonthScore = useMemo(() => {
    if (!employee?.categories) return 0;
    let totalWeightedScore = 0;
    let totalCategoryWeight = 0;
    for (const cat of employee.categories) {
      let weightedSum = 0;
      let totalKpiWeight = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const weight = kpi.weight || 0;
        weightedSum += ratio * weight;
        totalKpiWeight += weight;
      }
      const catScore = totalKpiWeight > 0 ? weightedSum / totalKpiWeight : 0;
      const categoryWeight = cat.weight / 100;
      totalWeightedScore += catScore * categoryWeight;
      totalCategoryWeight += categoryWeight;
    }
    return totalCategoryWeight > 0 ? (totalWeightedScore / totalCategoryWeight) * 100 : 0;
  }, [employee]);

  const estimatedBonus = useMemo(() => {
    if (!employee) return 0;
    return calc.perEmployee[employee.id]?.bonus || 0;
  }, [employee, calc]);

  const monthOverMonthChange = useMemo(() => {
    if (employeeHistory.length < 2) return null;
    const sorted = [...employeeHistory].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    );
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (!last || !prev || prev.performanceMultiplier === 0) return null;
    return ((last.performanceMultiplier - prev.performanceMultiplier) / prev.performanceMultiplier) * 100;
  }, [employeeHistory]);

  const ytdAverage = useMemo(() => {
    if (employeeHistory.length === 0) return 0;
    return (employeeHistory.reduce((s, d) => s + d.performanceMultiplier, 0) / employeeHistory.length) * 100;
  }, [employeeHistory]);

  const timelineData = useMemo(() => {
    if (employeeHistory.length === 0) return [];
    return [...employeeHistory]
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
      .slice(-12)
      .map((d) => ({
        month: `${new Date(d.year, d.month - 1, 1).toLocaleString("default", { month: "short" })} ${d.year}`,
        score: d.performanceMultiplier * 100,
      }));
  }, [employeeHistory]);

  const kpiAchievementData = useMemo(() => {
    if (!employee?.categories) return [];
    const data: any[] = [];
    for (const cat of employee.categories) {
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const achievement = Math.min(100, ratio * 100);
        data.push({
          name: kpi.description,
          achievement,
          target: kpi.target,
          actual: kpi.actual,
          metric: kpi.metric,
          weight: kpi.weight || 0,
          category: cat.name,
          status: achievement >= 100 ? "Exceeded" : achievement >= 70 ? "On Track" : achievement >= 50 ? "At Risk" : "Missed",
        });
      }
    }
    return data;
  }, [employee]);

  const kpiStatusData = useMemo(() => {
    const statuses = { Exceeded: 0, "On Track": 0, "At Risk": 0, Missed: 0 };
    for (const k of kpiAchievementData) {
      if (k.status === "Exceeded") statuses.Exceeded++;
      else if (k.status === "On Track") statuses["On Track"]++;
      else if (k.status === "At Risk") statuses["At Risk"]++;
      else statuses.Missed++;
    }
    return Object.entries(statuses)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [kpiAchievementData]);

  const getBand = (score: number) => {
    if (score >= 120) return { label: "Exceptional", color: "text-purple-600 dark:text-purple-400", icon: Star };
    if (score >= 100) return { label: "Exceeds Expectations", color: "text-emerald-600 dark:text-emerald-400", icon: TrendingUp };
    if (score >= 80) return { label: "Meets Expectations", color: "text-blue-600 dark:text-blue-400", icon: Target };
    if (score >= 60) return { label: "Needs Improvement", color: "text-amber-600 dark:text-amber-400", icon: Clock };
    return { label: "Performance Improvement Plan", color: "text-red-600 dark:text-red-400", icon: AlertCircle };
  };

  const band = getBand(currentMonthScore);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
  if (isAdmin) {
    return (
      <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
        {/* ⭐ NEW — KPI updates banner (renders nothing if no pending) */}
        <KpiUpdatesBanner />

        <PageHeader
          title="P4P Dashboard"
          description="Live overview of pools, payouts, performance signals, and monthly trends."
          icon={<Sparkles className="h-6 w-6" />}
          badge={<Badge variant="outline" className="gap-1.5"><Calendar className="h-3 w-3" />{monthlyData.length} data points</Badge>}
        />

        <NeedsAttention />

        <SectionCard title="Global P4P Settings" description="Controls revenue, pool allocation, and thresholds" icon={<Settings className="h-4 w-4" />}
          action={<Button size="sm" onClick={handleSaveGlobals} disabled={saving} className="gap-1.5">{saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save</Button>}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: "totalRevenue", label: "Revenue (GHS)", step: undefined },
              { key: "p4pPercent", label: "P4P %", step: undefined },
              { key: "adjunctPercent", label: "Adjunct %", step: undefined },
              { key: "floor", label: "Floor", step: "0.01" },
              { key: "cap", label: "Cap", step: "0.01" },
              { key: "salesMultiplier", label: "Sales Mult.", step: "0.01" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input type="number" step={f.step} className="mt-1 h-9" value={(localGlobals as any)[f.key]} onChange={(e) => setLocalGlobals((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={localGlobals.prorationOn} onChange={(e) => setLocalGlobals((prev) => ({ ...prev, prorationOn: e.target.checked }))} className="h-3.5 w-3.5 rounded accent-primary" />
              Proration On
            </label>
            <span className="ml-auto flex items-center gap-4">
              <span>P4P Pool: <strong className="text-foreground">{fmtGHS(calc.totalPool)}</strong></span>
              <span>Employee Pool: <strong className="text-foreground">{fmtGHS(calc.employeePool)}</strong></span>
            </span>
          </div>
        </SectionCard>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<DollarSign className="h-4 w-4" />} label="Revenue" value={fmtGHS(globals.totalRevenue)} sub={`${globals.p4pPercent}% to P4P`} accent="primary" />
          <StatCard icon={<Wallet className="h-4 w-4" />} label="Total Pool" value={fmtGHS(calc.totalPool)} accent="purple" />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Adjunct Pool" value={fmtGHS(calc.adjunctPool)} sub={`${globals.adjunctPercent}% share`} accent="warning" />
          <StatCard icon={<Wallet className="h-4 w-4" />} label="Employee Pool" value={fmtGHS(calc.employeePool)} accent="success" />
          <StatCard icon={<Users className="h-4 w-4" />} label="Headcount" value={calc.adjunctCount + calc.nonAdjunctCount} sub={`${calc.nonAdjunctCount} core · ${calc.adjunctCount} adjunct`} accent="info" />
          <StatCard icon={<UserCheck className="h-4 w-4" />} label="Avg Bonus" value={fmtGHS(calc.avgBonus)} accent="default" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SectionCard title="Monthly Performance Trend" description={`${monthlyTrendData.length} months tracked`} icon={<Activity className="h-4 w-4" />} noPadding>
              <div className="p-4 h-72">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} /><stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 2]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtNum(v, 2), "Avg Multiplier"]} />
                      <Area type="monotone" dataKey="avgMultiplier" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<Activity className="h-6 w-6" />} title="No monthly data yet" description="Upload monthly performance data to see trends." />
                )}
              </div>
            </SectionCard>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <StatCard icon={<Users className="h-4 w-4" />} label="Tracked Employees" value={trends.length} accent="primary" />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg Multiplier" value={fmtNum(stats.avgMultiplier, 2)} accent="success" />
          </div>
        </div>

        <SectionCard title="Top Performers" description="Highest current performance multipliers" icon={<Award className="h-4 w-4" />}>
          {trends.length > 0 ? (
            <div className="space-y-2">
              {[...trends].sort((a, b) => b.currentScore - a.currentScore).slice(0, 5).map((t, i) => (
                <motion.div key={t.employeeId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">#{i + 1}</div>
                    <span className="font-medium text-sm truncate">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-muted-foreground">{t.months.length} months</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{fmtNum(t.currentScore, 2)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Award className="h-6 w-6" />} title="No performers yet" description="Performance data will appear here once employees submit." />
          )}
        </SectionCard>

        {(stats.risingStars.length > 0 || stats.underachievers.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4">
            {stats.risingStars.length > 0 && (
              <SectionCard title="Rising Stars" icon={<Award className="h-4 w-4 text-emerald-600" />} action={<Badge variant="outline" className="text-emerald-600 border-emerald-500/30">{stats.risingStars.length}</Badge>}>
                <div className="flex flex-wrap gap-2">
                  {stats.risingStars.slice(0, 8).map((name, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">{name}</Badge>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>
            )}
            {stats.underachievers.length > 0 && (
              <SectionCard title="Underachievers" icon={<AlertTriangle className="h-4 w-4 text-red-600" />} action={<Badge variant="outline" className="text-red-600 border-red-500/30">{stats.underachievers.length}</Badge>}>
                <div className="flex flex-wrap gap-2">
                  {stats.underachievers.slice(0, 8).map((name, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">{name}</Badge>
                    </motion.div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {calc.warnings.length > 0 && (
          <Card className="p-4 bg-amber-500/5 border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-amber-900 dark:text-amber-300">Warnings</div>
                <ul className="mt-1.5 space-y-1 text-xs text-amber-800 dark:text-amber-400">
                  {calc.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {disabled && (
          <Card className="p-4 bg-red-500/5 border-red-500/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-900 dark:text-red-300">Total revenue is 0 — set a revenue value to enable calculations.</span>
            </div>
          </Card>
        )}
      </motion.div>
    );
  }

  // ============ EMPLOYEE DASHBOARD ============
  if (!employee) {
    return <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="No Employee Record" description="Your profile is not linked to an employee record. Please contact HR." />;
  }

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      {/* ⭐ NEW — KPI updates banner (renders nothing if no pending) */}
      <KpiUpdatesBanner />

      <PageHeader
        title="My Performance"
        description={`${employee.name} · ${employee.department} · ${employee.role}`}
        icon={<Award className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Current Score</div>
              <div className={`text-xl font-bold ${band.color}`}>
                <AnimatedNumber value={currentMonthScore} decimals={1} suffix="%" />
              </div>
            </div>
            <Badge variant="outline" className={`px-3 py-1.5 ${band.color} border-current/30`}>
              <band.icon className="h-3.5 w-3.5 mr-1.5" />
              {band.label}
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Target className="h-4 w-4" />} label="Current Score" value={<AnimatedNumber value={currentMonthScore} decimals={1} suffix="%" />} sub={monthOverMonthChange !== null ? `${Math.abs(monthOverMonthChange).toFixed(1)}% from last month` : "No previous data"} trend={monthOverMonthChange ?? undefined} accent="primary" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="YTD Average" value={<AnimatedNumber value={ytdAverage} decimals={1} suffix="%" />} sub={`${employeeHistory.length} months tracked`} accent="success" />
        <StatCard icon={<Wallet className="h-4 w-4" />} label="Est. Bonus" value={<AnimatedNumber value={estimatedBonus} decimals={0} prefix="GHS " />} sub="Based on current performance" accent="info" />
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Months Tracked" value={employeeHistory.length} sub={employeeHistory.length > 0 ? `${new Date().getFullYear()}` : "Start your first submission"} accent="purple" />
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><PieChart className="h-4 w-4" /> Categories</TabsTrigger>
          <TabsTrigger value="insights" className="gap-2"><Zap className="h-4 w-4" /> Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <motion.div key="overview" variants={tabContent} initial="hidden" animate="show" className="space-y-4">
            <SectionCard title="Performance Trend" description="Last 12 months" icon={<Activity className="h-4 w-4" />} noPadding>
            <div className="p-4 h-72">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs><linearGradient id="empTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 150]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmtNum(v, 1)}%`, "Score"]} />
                    <Area type="monotone" dataKey="score" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#empTrend)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={<Activity className="h-6 w-6" />} title="No data yet" description="Submit your first appraisal to see your performance trend." />
              )}
            </div>
            </SectionCard>

            <div className="grid md:grid-cols-2 gap-4">
            <SectionCard title="Category Performance" description="Weighted scores" icon={<PieChart className="h-4 w-4" />} noPadding>
              <div className="p-4 h-64">
                {categoryScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryScores} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" fontSize={11} axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmtNum(v, 1)}%`, "Score"]} />
                      <Bar dataKey="score" fill={COLORS.primary} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<PieChart className="h-6 w-6" />} title="No categories" />
                )}
              </div>
            </SectionCard>

            <SectionCard title="KPI Status Breakdown" icon={<Target className="h-4 w-4" />} noPadding>
              <div className="p-4 h-64">
                {kpiStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={kpiStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={(entry: any) => `${entry.name} ${entry.value}`} labelLine={false}>
                        {kpiStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<Target className="h-6 w-6" />} title="No KPIs" />
                )}
              </div>
            </SectionCard>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <motion.div key="categories" variants={tabContent} initial="hidden" animate="show">
            {categoryScores.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {categoryScores.map((cat: any, i: number) => {
                const status = cat.score >= 100 ? "Exceeded" : cat.score >= 70 ? "On Track" : cat.score >= 50 ? "At Risk" : "Missed";
                const color = status === "Exceeded" ? "emerald" : status === "On Track" ? "blue" : status === "At Risk" ? "amber" : "red";
                const totalKpiWeight = cat.kpis.reduce((s: number, k: any) => s + (k.weight || 0), 0);
                return (
                  <motion.div key={i} variants={fadeUp} layout {...cardHover}>
                    <Card className={`p-5 border-l-4 border-l-${color}-500`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate">{cat.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat.kpiCount} KPIs · Category weight {cat.weight}%
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{fmtNum(cat.score, 1)}%</div>
                          <Badge variant="outline" className={`text-[10px] mt-1 text-${color}-600 border-${color}-500/30`}>{status}</Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5 mt-3 pt-3 border-t border-border/40">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                          <span>KPIs (weight within category)</span>
                          <span className={totalKpiWeight === 100 ? "text-emerald-600" : "text-amber-600"}>{totalKpiWeight}% total</span>
                        </div>
                        {cat.kpis.map((kpi: any, kIdx: number) => (
                          <div key={kIdx} className="flex items-center justify-between text-xs gap-2">
                            <span className="truncate text-muted-foreground">{kpi.description}</span>
                            <span className="font-mono font-semibold shrink-0 ml-2">{kpi.weight}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, cat.score)}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className={`h-full rounded-full bg-${color}-500`} />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            ) : (
              <EmptyState icon={<PieChart className="h-6 w-6" />} title="No categories yet" description="Categories will appear once you have KPIs assigned." />
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <motion.div key="insights" variants={tabContent} initial="hidden" animate="show" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
            <SectionCard title="Strengths" description="KPIs you've exceeded" icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}>
              <div className="space-y-2">
                {kpiAchievementData.filter((k) => k.achievement >= 100).slice(0, 5).map((k, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{k.name}</div>
                      <div className="text-[10px] text-muted-foreground">Weight {k.weight}%</div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{fmtNum(k.achievement, 0)}%</span>
                  </div>
                ))}
                {kpiAchievementData.filter((k) => k.achievement >= 100).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No exceeded KPIs yet. Keep pushing!</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Areas for Improvement" description="KPIs needing attention" icon={<AlertTriangle className="h-4 w-4 text-red-600" />}>
              <div className="space-y-2">
                {kpiAchievementData.filter((k) => k.achievement < 70).sort((a, b) => a.achievement - b.achievement).slice(0, 5).map((k, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{k.name}</div>
                      <div className="text-[10px] text-muted-foreground">Weight {k.weight}%</div>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400 shrink-0">{fmtNum(k.achievement, 0)}%</span>
                  </div>
                ))}
                {kpiAchievementData.filter((k) => k.achievement < 70).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">All KPIs are on track! 🎉</p>
                )}
              </div>
            </SectionCard>
            </div>

            <SectionCard title="Performance Summary" icon={<Info className="h-4 w-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Overall Status</div>
                <div className={`text-lg font-bold ${band.color}`}>{band.label}</div>
              </Card>
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="text-xs text-muted-foreground mb-1">KPIs on Target</div>
                <div className="text-lg font-bold">{kpiAchievementData.filter((k) => k.achievement >= 70).length} / {kpiAchievementData.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {kpiAchievementData.length > 0 ? Math.round((kpiAchievementData.filter((k) => k.achievement >= 70).length / kpiAchievementData.length) * 100) : 0}% success rate
                </div>
              </Card>
              <Card className="p-4 bg-muted/30 border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Est. Bonus</div>
                <div className="text-lg font-bold">{fmtGHS(estimatedBonus)}</div>
                <div className="text-xs text-muted-foreground mt-1">Based on current performance</div>
              </Card>
            </div>
            </SectionCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}