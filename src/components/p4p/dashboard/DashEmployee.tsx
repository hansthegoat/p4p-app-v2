import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/p4p/AnimatedNumber";
import { useP4P } from "@/lib/p4p/store";
import { fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp, tabContent, cardHover } from "@/lib/motion";
import { showToast } from "@/lib/toast";
import { KpiUpdatesBanner } from "@/components/p4p/KpiUpdatesBanner";
import { BonusGate } from "@/components/p4p/BonusGate";
import { DepartmentLeaderboard } from "@/components/p4p/DepartmentLeaderboard";
import { NotificationBell } from "@/components/p4p/NotificationBell";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  TrendingUp, Wallet, Target, Calendar, Award, AlertTriangle,
  RefreshCw, Activity, PieChart as PieChartIcon,
  BarChart3, CheckCircle, Clock, Zap, Info, AlertCircle, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell,
} from "recharts";
import {
  COLOR_THEMES, CHART_COLORS, CHART_PRIMARY_COLOR, TOOLTIP_STYLE,
  getBand, type ThemeKey, type P4PEmployee, type CategoryScore, type KpiAchievement,
} from "./shared";

type Props = { employee: P4PEmployee };

export function DashboardEmployee({ employee }: Props) {
  const {
    calc, getMonthlyHistory,
    submitKpiRequest, getEmployeeKpiRequest,
  } = useP4P();

  const prefersReducedMotion = useReducedMotion();

  const employeeHistory = useMemo(
    () => getMonthlyHistory(employee.id),
    [employee.id, getMonthlyHistory],
  );

  const categoryScores: CategoryScore[] = useMemo(() => {
    if (!employee.categories) return [];
    return employee.categories.map((cat) => {
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
        kpis: cat.kpis.map((k) => ({
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
    if (!employee.categories) return 0;
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

  const estimatedBonus = useMemo(
    () => calc.perEmployee[employee.id]?.bonus || 0,
    [employee.id, calc],
  );

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

  const timelineSummary = useMemo(() => {
    if (timelineData.length === 0) return "No performance data yet.";
    const latest = timelineData[timelineData.length - 1];
    return `Performance trend across ${timelineData.length} months. Latest (${latest.month}) score: ${fmtNum(latest.score, 1)}%.`;
  }, [timelineData]);

  const kpiAchievementData: KpiAchievement[] = useMemo(() => {
    if (!employee.categories) return [];
    const data: KpiAchievement[] = [];
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
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [kpiAchievementData]);

  const kpiStatusSummary = useMemo(() => {
    if (kpiStatusData.length === 0) return "No KPIs tracked.";
    return "KPI status breakdown: " + kpiStatusData.map((s) => `${s.name}: ${s.value}`).join(", ") + ".";
  }, [kpiStatusData]);

  const categorySummary = useMemo(() => {
    if (categoryScores.length === 0) return "No categories tracked.";
    return "Category performance: " + categoryScores.map((c) => `${c.name}: ${fmtNum(c.score, 1)} percent`).join(", ") + ".";
  }, [categoryScores]);

  const band = getBand(currentMonthScore);

  const hasNoKpis = (employee.categories?.length ?? 0) === 0;
  const pendingKpiRequest = getEmployeeKpiRequest(employee.id);
  const [requestingKpis, setRequestingKpis] = useState(false);

  const handleRequestKpis = async () => {
    setRequestingKpis(true);
    try {
      await submitKpiRequest(employee.id);
      showToast.success(
        "Request sent",
        "HR will be notified and assign your KPIs shortly."
      );
    } catch (err: any) {
      showToast.error("Could not send request", err.message || "Try again");
    } finally {
      setRequestingKpis(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      <KpiUpdatesBanner />

      {hasNoKpis && (
        <Card
          role="status"
          aria-live="polite"
          className={`p-4 border ${
            pendingKpiRequest
              ? "bg-blue-500/5 border-blue-500/30"
              : "bg-amber-500/5 border-amber-500/30"
          }`}
        >
          <div className="flex items-start gap-3 flex-wrap">
            <div
              aria-hidden="true"
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                pendingKpiRequest
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {pendingKpiRequest ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                {pendingKpiRequest
                  ? "KPI request pending"
                  : "Your KPIs haven't been assigned yet"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {pendingKpiRequest
                  ? `Request sent ${new Date(pendingKpiRequest.createdAt).toLocaleDateString()}. HR will assign them shortly.`
                  : "You can't be measured or earn bonus until HR assigns your KPIs. Send a request to let them know."}
              </div>
            </div>
            {!pendingKpiRequest && (
              <Button
                size="sm"
                onClick={handleRequestKpis}
                disabled={requestingKpis}
                className="gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shrink-0"
              >
                {requestingKpis ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Request KPIs from HR
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      )}

      <div data-tour="dashboard-header">
        <PageHeader
          title="My Performance"
          description={`${employee.name} · ${employee.department} · ${employee.role}`}
          icon={<Award className="h-6 w-6" aria-hidden="true" />}
          actions={
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Current Score</div>
                <div className={`text-xl font-bold ${band.color}`}>
                  <AnimatedNumber value={currentMonthScore} decimals={1} suffix="%" />
                </div>
              </div>
              <Badge variant="outline" className={`px-3 py-1.5 ${band.color} border-current/30`}>
                <band.icon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {band.label}
              </Badge>
              <ThemeToggle />
              <div data-tour="notifications" className="flex items-center">
                <NotificationBell />
              </div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div data-tour="kpi-score">
          <StatCard
            icon={<Target className="h-4 w-4" aria-hidden="true" />}
            label="Current Score"
            value={`${fmtNum(currentMonthScore, 1)}%`}
            sub={monthOverMonthChange !== null ? `${Math.abs(monthOverMonthChange).toFixed(1)}% from last month` : "No previous data"}
            trend={monthOverMonthChange ?? undefined}
            accent="primary"
          />
        </div>
        <StatCard icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />} label="YTD Average" value={<AnimatedNumber value={ytdAverage} decimals={1} suffix="%" />} sub={`${employeeHistory.length} months tracked`} accent="success" />
        <StatCard icon={<Wallet className="h-4 w-4" aria-hidden="true" />} label="Est. Bonus" value={<BonusGate value={estimatedBonus} compact />} sub="Based on current performance" accent="info" />
        <StatCard icon={<Calendar className="h-4 w-4" aria-hidden="true" />} label="Months Tracked" value={employeeHistory.length} sub={employeeHistory.length > 0 ? `${new Date().getFullYear()}` : "Start your first submission"} accent="purple" />
      </div>

      <div data-tour="dashboard-tabs">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Overview</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2"><PieChartIcon className="h-4 w-4" aria-hidden="true" /> Categories</TabsTrigger>
            <TabsTrigger value="insights" className="gap-2"><Zap className="h-4 w-4" aria-hidden="true" /> Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <motion.div key="overview" variants={tabContent} initial="hidden" animate="show" className="space-y-4">
              <SectionCard title="Performance Trend" description="Last 12 months" icon={<Activity className="h-4 w-4" aria-hidden="true" />} noPadding>
                <div role="img" aria-label={timelineSummary} className="p-4 h-72">
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData} accessibilityLayer>
                        <defs>
                          <linearGradient id="empTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_PRIMARY_COLOR} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={CHART_PRIMARY_COLOR} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 150]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${fmtNum(v, 1)}%`, "Score"]} />
                        <Area type="monotone" dataKey="score" stroke={CHART_PRIMARY_COLOR} strokeWidth={2.5} fill="url(#empTrend)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState icon={<Activity className="h-6 w-6" aria-hidden="true" />} title="No data yet" description="Submit your first appraisal to see your performance trend." />
                  )}
                </div>
              </SectionCard>

              <div className="grid md:grid-cols-2 gap-4">
                <SectionCard title="Category Performance" description="Weighted scores" icon={<PieChartIcon className="h-4 w-4" aria-hidden="true" />} noPadding>
                  <div role="img" aria-label={categorySummary} className="p-4 h-64">
                    {categoryScores.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryScores} layout="vertical" margin={{ left: 8, right: 16 }} accessibilityLayer>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" fontSize={11} axisLine={false} tickLine={false} width={90} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${fmtNum(v, 1)}%`, "Score"]} />
                          <Bar dataKey="score" fill={CHART_PRIMARY_COLOR} radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState icon={<PieChartIcon className="h-6 w-6" aria-hidden="true" />} title="No categories" />
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="KPI Status Breakdown" icon={<Target className="h-4 w-4" aria-hidden="true" />} noPadding>
                  <div role="img" aria-label={kpiStatusSummary} className="p-4 h-64">
                    {kpiStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart accessibilityLayer>
                          <Pie data={kpiStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={(entry: any) => `${entry.name} ${entry.value}`} labelLine={false}>
                            {kpiStatusData.map((_, i) => <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
                          </Pie>
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                        </RePieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState icon={<Target className="h-6 w-6" aria-hidden="true" />} title="No KPIs" />
                    )}
                  </div>
                </SectionCard>
              </div>

              <div data-tour="dashboard-leaderboard">
                <DepartmentLeaderboard />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <motion.div key="categories" variants={tabContent} initial="hidden" animate="show">
              {categoryScores.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {categoryScores.map((cat, i) => {
                    const key: ThemeKey = cat.score >= 100 ? "emerald" : cat.score >= 70 ? "blue" : cat.score >= 50 ? "amber" : "red";
                    const theme = COLOR_THEMES[key];
                    const statusText = cat.score >= 100 ? "Exceeded" : cat.score >= 70 ? "On Track" : cat.score >= 50 ? "At Risk" : "Missed";
                    const totalKpiWeight = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);

                    return (
                      <motion.div
                        key={cat.name || i}
                        variants={fadeUp}
                        layout={!prefersReducedMotion}
                        {...(prefersReducedMotion ? {} : cardHover)}
                      >
                        <Card className={`p-5 border-l-4 ${theme.border}`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm truncate">{cat.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {cat.kpiCount} KPIs · Category weight {cat.weight}%
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`text-2xl font-bold ${theme.text}`}>{fmtNum(cat.score, 1)}%</div>
                              <Badge variant="outline" className={`text-[10px] mt-1 ${theme.text} border-current/30`}>{statusText}</Badge>
                            </div>
                          </div>

                          <div className="space-y-1.5 mt-3 pt-3 border-t border-border/40">
                            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                              <span>KPIs (weight within category)</span>
                              <span className={totalKpiWeight === 100 ? "text-emerald-600" : "text-amber-600"}>{totalKpiWeight}% total</span>
                            </div>
                            {cat.kpis.map((kpi, kIdx) => (
                              <div key={kIdx} className="flex items-center justify-between text-xs gap-2">
                                <span className="truncate text-muted-foreground">{kpi.description}</span>
                                <span className="font-mono font-semibold shrink-0 ml-2">{kpi.weight}%</span>
                              </div>
                            ))}
                          </div>

                          <div
                            role="progressbar"
                            aria-valuenow={Math.min(100, Math.round(cat.score))}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${cat.name} score`}
                            className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-3"
                          >
                            <motion.div
                              initial={prefersReducedMotion ? false : { width: 0 }}
                              animate={{ width: `${Math.min(100, cat.score)}%` }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : i * 0.1 }}
                              className={`h-full rounded-full ${theme.bg}`}
                            />
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={<PieChartIcon className="h-6 w-6" aria-hidden="true" />} title="No categories yet" description="Categories will appear once you have KPIs assigned." />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <motion.div key="insights" variants={tabContent} initial="hidden" animate="show" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <SectionCard title="Strengths" description="KPIs you've exceeded" icon={<CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />}>
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

                <SectionCard title="Areas for Improvement" description="KPIs needing attention" icon={<AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />}>
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

              <SectionCard title="Performance Summary" icon={<Info className="h-4 w-4" aria-hidden="true" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="p-4 bg-muted/30 border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Overall Status</div>
                    <div className={`text-lg font-bold ${band.color}`}>{band.label}</div>
                  </Card>
                  <Card className="p-4 bg-muted/30 border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">KPIs on Target</div>
                    <div className="text-lg font-bold">
                      {kpiAchievementData.filter((k) => k.achievement >= 70).length} / {kpiAchievementData.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {kpiAchievementData.length > 0
                        ? Math.round((kpiAchievementData.filter((k) => k.achievement >= 70).length / kpiAchievementData.length) * 100)
                        : 0}% success rate
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/30 border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Est. Bonus</div>
                    <div className="text-lg font-bold"><BonusGate value={estimatedBonus} /></div>
                    <div className="text-xs text-muted-foreground mt-1">Based on current performance</div>
                  </Card>
                </div>
              </SectionCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}