import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtGHSFull, fmtCompact, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/supabase";
import {
  TrendingUp, Wallet, Users, UserCheck, DollarSign,
  Sparkles, Target, Calendar, Award, AlertTriangle,
  Settings, Save, RefreshCw, Activity, PieChart,
  BarChart3, CheckCircle, Clock, Star, Eye, Zap,
  ArrowUpRight, ArrowDownRight, Info, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart as RePieChart, Pie, Cell, Legend
} from "recharts";
import { useUser } from "@/lib/p4p/user-context";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const COLORS = {
  primary: "hsl(221 70% 50%)",
  accent: "hsl(250 50% 58%)",
  success: "hsl(152 55% 42%)",
  warning: "hsl(38 75% 52%)",
  danger: "hsl(0 65% 55%)",
  slate: "hsl(215 25% 55%)",
  cyan: "hsl(189 70% 42%)",
  purple: "hsl(270 70% 55%)",
  pink: "hsl(330 70% 55%)",
  orange: "hsl(25 80% 55%)",
  teal: "hsl(170 70% 45%)",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.cyan,
  COLORS.pink,
  COLORS.orange,
  COLORS.teal,
];

const chartTooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,.10)",
};

function StatCard({ icon, label, value, accentColor, sub }: any) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <Card className="relative overflow-hidden border flex items-stretch h-full">
        <div className="w-1 shrink-0 rounded-l-xl" style={{ background: accentColor }} />
        <div className="flex flex-col flex-1 p-4 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground truncate">
              {label}
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: accentColor + "cc" }}>
              {icon}
            </div>
          </div>
          <div className="font-bold tracking-tight leading-none truncate mt-auto" style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.25rem)" }} title={value}>
            {value}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate min-h-[1rem]">
            {sub ?? ""}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { globals, setGlobals, calc, employees, monthlyData, getAllTrends, getMonthlyStats, getMonthlyHistory } = useP4P();
  const { role } = useUser();
  const isAdmin = role === 'admin' || role === 'hr';
  
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

  // Fetch current user for employee dashboard
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate({ to: "/login" });
          return;
        }
        const emp = employees.find(e => e.email === user.email);
        setEmployee(emp || null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setLoading(false);
      }
    };
    fetchUser();
  }, [employees, navigate]);

  // Monthly trend data (admin)
  const monthlyTrendData = useMemo(() => {
    const months = monthlyData
      .filter(d => !employees.find(e => e.id === d.employeeId)?.isAdjunct)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    const grouped: Record<string, { month: string; avg: number; count: number; total: number }> = {};
    for (const d of months) {
      const key = `${d.year}-${String(d.month).padStart(2, '0')}`;
      const label = `${new Date(d.year, d.month - 1, 1).toLocaleString('default', { month: 'short' })} ${d.year}`;
      if (!grouped[key]) grouped[key] = { month: label, avg: 0, count: 0, total: 0 };
      grouped[key].total += d.performanceMultiplier;
      grouped[key].count++;
    }
    return Object.values(grouped).map(g => ({
      month: g.month,
      avgMultiplier: g.total / g.count,
    }));
  }, [monthlyData, employees]);

  const handleSaveGlobals = () => {
    setSaving(true);
    setGlobals({
      totalRevenue: localGlobals.totalRevenue,
      p4pPercent: localGlobals.p4pPercent,
      adjunctPercent: localGlobals.adjunctPercent,
      floor: localGlobals.floor,
      cap: localGlobals.cap,
      prorationOn: localGlobals.prorationOn,
      salesMultiplier: localGlobals.salesMultiplier,
    });
    setTimeout(() => setSaving(false), 500);
  };

  const disabled = globals.totalRevenue <= 0;

  // ===== EMPLOYEE-SPECIFIC DATA =====
  const employeeHistory = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);

  const employeeTrend = useMemo(() => {
    if (!employee) return null;
    const history = getMonthlyHistory(employee.id);
    if (history.length === 0) return null;
    return history;
  }, [employee, getMonthlyHistory]);

  // Calculate category scores for the employee
  const categoryScores = useMemo(() => {
    if (!employee || !employee.categories) return [];
    const categories = employee.categories || [];
    const scores: any[] = [];
    
    for (const cat of categories) {
      let catSum = 0;
      let catCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        catSum += ratio;
        catCount++;
      }
      const catScore = catCount > 0 ? (catSum / catCount) * 100 : 0;
      scores.push({
        name: cat.name,
        score: catScore,
        weight: cat.weight,
        kpiCount: cat.kpis.length,
      });
    }
    return scores;
  }, [employee]);

  // Current month score
  const currentMonthScore = useMemo(() => {
    if (!employee) return 0;
    if (!employee.categories) return 0;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    for (const cat of employee.categories) {
      let catSum = 0;
      let catCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        catSum += ratio;
        catCount++;
      }
      const catScore = catCount > 0 ? catSum / catCount : 0;
      const weight = cat.weight / 100;
      totalWeightedScore += catScore * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  }, [employee]);

  // Bonus projection
  const estimatedBonus = useMemo(() => {
    if (!employee) return 0;
    const empCalc = calc.perEmployee[employee.id];
    if (!empCalc) return 0;
    return empCalc.bonus || 0;
  }, [employee, calc]);

  // Month-over-month change
  const monthOverMonthChange = useMemo(() => {
    if (employeeHistory.length < 2) return null;
    const sorted = [...employeeHistory].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (!last || !prev) return null;
    const change = ((last.performanceMultiplier - prev.performanceMultiplier) / prev.performanceMultiplier) * 100;
    return change;
  }, [employeeHistory]);

  // Year-to-date average
  const ytdAverage = useMemo(() => {
    if (employeeHistory.length === 0) return 0;
    const sum = employeeHistory.reduce((acc, d) => acc + d.performanceMultiplier, 0);
    return (sum / employeeHistory.length) * 100;
  }, [employeeHistory]);

  // Timeline data for employee chart
  const timelineData = useMemo(() => {
    if (employeeHistory.length === 0) return [];
    const sorted = [...employeeHistory].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    return sorted.slice(-12).map(d => ({
      month: `${new Date(d.year, d.month - 1, 1).toLocaleString('default', { month: 'short' })} ${d.year}`,
      score: d.performanceMultiplier * 100,
      multiplier: d.performanceMultiplier,
    }));
  }, [employeeHistory]);

  // KPI achievement breakdown
  const kpiAchievementData = useMemo(() => {
    if (!employee || !employee.categories) return [];
    const data: any[] = [];
    for (const cat of employee.categories) {
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const achievement = Math.min(100, ratio * 100);
        data.push({
          name: kpi.description,
          achievement: achievement,
          target: kpi.target,
          actual: kpi.actual,
          metric: kpi.metric,
          category: cat.name,
          status: achievement >= 100 ? 'Exceeded' : achievement >= 70 ? 'On Track' : achievement >= 50 ? 'At Risk' : 'Missed',
        });
      }
    }
    return data;
  }, [employee]);

  // KPI status pie data
  const kpiStatusData = useMemo(() => {
    const statuses = { Exceeded: 0, 'On Track': 0, 'At Risk': 0, Missed: 0 };
    for (const kpi of kpiAchievementData) {
      if (kpi.status === 'Exceeded') statuses.Exceeded++;
      else if (kpi.status === 'On Track') statuses['On Track']++;
      else if (kpi.status === 'At Risk') statuses['At Risk']++;
      else statuses.Missed++;
    }
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [kpiAchievementData]);

  // Get performance band
  const getBand = (score: number) => {
    if (score >= 120) return { label: "Exceptional", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Star };
    if (score >= 100) return { label: "Exceeds Expectations", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: TrendingUp };
    if (score >= 80) return { label: "Meets Expectations", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Target };
    if (score >= 60) return { label: "Needs Improvement", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: Clock };
    return { label: "Performance Improvement Plan", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle };
  };

  const band = getBand(currentMonthScore);
  const BandIcon = band.icon;

  // ===== EMPLOYEE LOADING =====
  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  // ===== ADMIN DASHBOARD =====
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> 
              P4P Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Live overview of pools, payouts, performance signals, and monthly trends.
            </p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-medium border flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {monthlyData.length > 0 ? `${monthlyData.length} data points` : 'No monthly data yet'}
          </div>
        </div>

        {/* ===== GLOBAL CONTROLS ===== */}
        <Card className="p-5 border-2 border-dashed border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Global P4P Settings</h3>
            <span className="text-xs text-muted-foreground ml-auto">Controls revenue, pool allocation, and thresholds</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            <div>
              <Label className="text-xs">Revenue (GHS)</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={localGlobals.totalRevenue}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, totalRevenue: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">P4P %</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={localGlobals.p4pPercent}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, p4pPercent: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Adjunct %</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={localGlobals.adjunctPercent}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, adjunctPercent: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Floor</Label>
              <Input
                type="number"
                step="0.01"
                className="h-8 text-sm"
                value={localGlobals.floor}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, floor: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Cap</Label>
              <Input
                type="number"
                step="0.01"
                className="h-8 text-sm"
                value={localGlobals.cap}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, cap: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Sales Multiplier</Label>
              <Input
                type="number"
                step="0.01"
                className="h-8 text-sm"
                value={localGlobals.salesMultiplier}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, salesMultiplier: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end">
              <Button 
                size="sm" 
                className="w-full h-8 flex items-center gap-1"
                onClick={handleSaveGlobals}
                disabled={saving}
              >
                {saving ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={localGlobals.prorationOn}
                onChange={(e) => setLocalGlobals(prev => ({ ...prev, prorationOn: e.target.checked }))}
                className="h-3.5 w-3.5"
              />
              Proration On
            </label>
            <span>P4P Pool: <strong className="text-primary">{fmtGHS(calc.totalPool)}</strong></span>
            <span>Employee Pool: <strong className="text-primary">{fmtGHS(calc.employeePool)}</strong></span>
          </div>
        </Card>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 items-stretch">
          <StatCard
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Revenue"
            value={fmtGHS(globals.totalRevenue)}
            accentColor={COLORS.primary}
            sub={`${globals.p4pPercent}% to P4P`}
          />
          <StatCard
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Total Pool"
            value={fmtGHS(calc.totalPool)}
            accentColor={COLORS.accent}
          />
          <StatCard
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Adjunct Pool"
            value={fmtGHS(calc.adjunctPool)}
            accentColor={COLORS.warning}
            sub={`${globals.adjunctPercent}% share`}
          />
          <StatCard
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Employee Pool"
            value={fmtGHS(calc.employeePool)}
            accentColor={COLORS.success}
          />
          <StatCard
            icon={<Users className="h-3.5 w-3.5" />}
            label="Headcount"
            value={`${calc.adjunctCount + calc.nonAdjunctCount}`}
            accentColor={COLORS.cyan}
            sub={`${calc.nonAdjunctCount} core / ${calc.adjunctCount} adjunct`}
          />
          <StatCard
            icon={<UserCheck className="h-3.5 w-3.5" />}
            label="Avg Bonus"
            value={fmtGHS(calc.avgBonus)}
            accentColor={COLORS.slate}
          />
        </div>

        {/* ===== ADMIN CHARTS ===== */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Monthly Performance Trend</h3>
              <span className="text-xs text-muted-foreground ml-auto">{monthlyTrendData.length} months</span>
            </div>
            <div className="h-44 sm:h-56">
              <ResponsiveContainer>
                <AreaChart data={monthlyTrendData} margin={{ left: 8 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 2]} fontSize={10} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [fmtNum(v, 2), "Avg Multiplier"]} />
                  <Area type="monotone" dataKey="avgMultiplier" stroke={COLORS.primary} strokeWidth={2} fill="url(#trendFill)" dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center flex flex-col justify-center">
              <div className="text-3xl font-bold text-primary">{trends.length}</div>
              <div className="text-xs text-muted-foreground">Tracked Employees</div>
            </Card>
            <Card className="p-4 text-center flex flex-col justify-center border-green-200 bg-green-50/50">
              <div className="text-3xl font-bold text-green-600">{fmtNum(stats.avgMultiplier, 2)}</div>
              <div className="text-xs text-green-600">Average Multiplier</div>
            </Card>
          </div>
        </div>

        {/* ===== ADMIN - Top Performers & Rising Stars ===== */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-5 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">P4P % of Revenue</h3>
            </div>
            <div className="h-44 sm:h-56 relative flex items-center justify-center">
              <div className="text-4xl font-bold text-primary">{globals.p4pPercent}%</div>
              <div className="absolute bottom-4 text-xs text-muted-foreground">of revenue</div>
            </div>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Top Performers</h3>
            </div>
            <div className="space-y-2">
              {trends
                .sort((a, b) => b.currentScore - a.currentScore)
                .slice(0, 5)
                .map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{t.months.length} months</span>
                      <span className="font-bold text-blue-600">{fmtNum(t.currentScore, 2)}</span>
                    </div>
                  </div>
                ))}
              {trends.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No performance data yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* ===== ADMIN - Rising Stars & Underachievers ===== */}
        <div className="grid md:grid-cols-2 gap-4">
          {stats.risingStars.length > 0 && (
            <Card className="p-4 border-green-200 bg-green-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-sm text-green-800">🌟 Rising Stars</h3>
                <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full ml-auto">
                  {stats.risingStars.length} employees
                </span>
              </div>
              <div className="space-y-2">
                {stats.risingStars.slice(0, 5).map((name, i) => (
                  <div key={i} className="flex items-center p-2 bg-white rounded-md border border-green-200">
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {stats.underachievers.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h3 className="font-semibold text-sm text-red-800">⚠️ Underachievers</h3>
                <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full ml-auto">
                  {stats.underachievers.length} employees
                </span>
              </div>
              <div className="space-y-2">
                {stats.underachievers.slice(0, 5).map((name, i) => (
                  <div key={i} className="flex items-center p-2 bg-white rounded-md border border-red-200">
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {disabled && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
            Total revenue is 0 — set a revenue value to enable calculations.
          </div>
        )}
        {calc.warnings.length > 0 && (
          <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-300">
            <div className="font-medium flex items-center gap-2">⚠️ Warnings</div>
            <ul className="list-disc list-inside">
              {calc.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ===== EMPLOYEE DASHBOARD (Personalised) =====
  if (!employee) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Employee Record</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Your profile is not linked to an employee record. Please contact HR.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> 
            My Performance Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {employee.name} · {employee.department} · {employee.role}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Current Score</div>
            <div className={`text-2xl font-bold ${band.color}`}>
              {fmtNum(currentMonthScore, 1)}%
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${band.bg} ${band.color} border flex items-center gap-1.5`}>
            <BandIcon className="h-4 w-4" />
            {band.label}
          </div>
        </div>
      </div>

      {/* Employee Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="h-3.5 w-3.5" />}
          label="Current Score"
          value={`${fmtNum(currentMonthScore, 1)}%`}
          accentColor={COLORS.primary}
          sub={monthOverMonthChange !== null ? `${monthOverMonthChange >= 0 ? '↑' : '↓'} ${Math.abs(monthOverMonthChange).toFixed(1)}% from last month` : 'No previous data'}
        />
        <StatCard
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="YTD Average"
          value={`${fmtNum(ytdAverage, 1)}%`}
          accentColor={COLORS.success}
          sub={`${employeeHistory.length} months tracked`}
        />
        <StatCard
          icon={<Wallet className="h-3.5 w-3.5" />}
          label="Est. Bonus"
          value={fmtGHS(estimatedBonus)}
          accentColor={COLORS.cyan}
          sub={`Based on current performance`}
        />
        <StatCard
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Months Tracked"
          value={`${employeeHistory.length}`}
          accentColor={COLORS.purple}
          sub={employeeHistory.length > 0 ? `${new Date().getFullYear()} - ${new Date().getMonth() + 1}` : 'Start your first submission'}
        />
      </div>

      {/* Employee Tabs */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <Zap className="h-4 w-4" /> Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Performance Trend (Last 12 Months)
              </h3>
              <Badge variant="outline" className="text-xs">
                {timelineData.length} months
              </Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="empTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 150]} fontSize={10} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${fmtNum(v, 1)}%`, "Score"]} />
                  <Area type="monotone" dataKey="score" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#empTrendFill)" dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Category Performance
              </h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryScores} layout="vertical" margin={{ left: 0 }}>
                    <XAxis type="number" domain={[0, 100]} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <Tooltip formatter={(v: number) => [`${fmtNum(v, 1)}%`, "Score"]} />
                    <Bar dataKey="score" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                KPI Status Breakdown
              </h3>
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={kpiStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {kpiStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {categoryScores.map((cat, idx) => {
              const status = cat.score >= 100 ? 'Exceeded' : cat.score >= 70 ? 'On Track' : cat.score >= 50 ? 'At Risk' : 'Missed';
              const color = status === 'Exceeded' ? COLORS.success : status === 'On Track' ? COLORS.primary : status === 'At Risk' ? COLORS.warning : COLORS.danger;
              
              return (
                <Card key={idx} className="p-4 border-l-4" style={{ borderLeftColor: color }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{cat.name}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        {cat.kpiCount} KPIs · Weight: {cat.weight}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color }}>
                        {fmtNum(cat.score, 1)}%
                      </div>
                      <Badge className="text-[10px]" variant={status === 'Exceeded' || status === 'On Track' ? 'default' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, cat.score)}%`, background: color }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="p-4 border-green-200 bg-green-50/50">
              <h3 className="font-semibold text-sm text-green-800 flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Strengths
              </h3>
              <div className="space-y-2">
                {kpiAchievementData
                  .filter(k => k.achievement >= 100)
                  .slice(0, 5)
                  .map((k, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded-md border border-green-200">
                      <span className="truncate">{k.name}</span>
                      <span className="font-bold text-green-600">{fmtNum(k.achievement, 0)}%</span>
                    </div>
                  ))}
                {kpiAchievementData.filter(k => k.achievement >= 100).length === 0 && (
                  <p className="text-sm text-muted-foreground">No exceeded KPIs yet. Keep pushing!</p>
                )}
              </div>
            </Card>

            {/* Areas for Improvement */}
            <Card className="p-4 border-red-200 bg-red-50/50">
              <h3 className="font-semibold text-sm text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {kpiAchievementData
                  .filter(k => k.achievement < 70)
                  .sort((a, b) => a.achievement - b.achievement)
                  .slice(0, 5)
                  .map((k, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded-md border border-red-200">
                      <span className="truncate">{k.name}</span>
                      <span className="font-bold text-red-600">{fmtNum(k.achievement, 0)}%</span>
                    </div>
                  ))}
                {kpiAchievementData.filter(k => k.achievement < 70).length === 0 && (
                  <p className="text-sm text-muted-foreground">All KPIs are on track! Great job! 🎉</p>
                )}
              </div>
            </Card>

            {/* Performance Summary */}
            <Card className="p-4 border-blue-200 bg-blue-50/50 md:col-span-2">
              <h3 className="font-semibold text-sm text-blue-800 flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-600" />
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-md border border-blue-200">
                  <div className="text-xs text-muted-foreground">Overall Status</div>
                  <div className="text-lg font-bold" style={{ color: band.color }}>
                    {band.label}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md border border-blue-200">
                  <div className="text-xs text-muted-foreground">KPIs on Target</div>
                  <div className="text-lg font-bold">
                    {kpiAchievementData.filter(k => k.achievement >= 70).length} / {kpiAchievementData.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {kpiAchievementData.length > 0 ? ((kpiAchievementData.filter(k => k.achievement >= 70).length / kpiAchievementData.length) * 100).toFixed(0) : 0}% success rate
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md border border-blue-200">
                  <div className="text-xs text-muted-foreground">Est. Bonus</div>
                  <div className="text-lg font-bold">{fmtGHS(estimatedBonus)}</div>
                  <div className="text-xs text-muted-foreground">Based on current performance</div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      {employeeHistory.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {employeeHistory.slice(-5).reverse().map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm border-b border-muted pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {new Date(h.year, h.month - 1, 1).toLocaleString('default', { month: 'long' })} {h.year}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-green-50 border-green-200 text-green-700">
                    ✅ Approved
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Multiplier: {fmtNum(h.performanceMultiplier, 2)}</span>
                  <span className="font-bold">{fmtNum(h.performanceMultiplier * 100, 1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}