import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtGHSFull, fmtCompact, fmtNum } from "@/lib/p4p/calc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  TrendingUp, Wallet, Users, UserCheck, DollarSign,
  Activity, PieChart as PieIcon, BarChart3, Sparkles, Target,
  Star, AlertTriangle, Calendar, Award, TrendingDown
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

// Muted, professional palette — consistent with app design language
const COLORS = {
  primary:  "hsl(221 70% 50%)",
  accent:   "hsl(250 50% 58%)",
  success:  "hsl(152 55% 42%)",
  warning:  "hsl(38 75% 52%)",
  danger:   "hsl(0 65% 55%)",
  cyan:     "hsl(195 65% 46%)",
  slate:    "hsl(215 25% 55%)",
};

const POOL_COLORS = [COLORS.primary, COLORS.accent];
const BAR_COLORS  = [COLORS.primary, COLORS.cyan, COLORS.success, COLORS.warning, COLORS.slate, COLORS.accent];

// Subtle, non-gradient stat card with a coloured left accent bar
function StatCard({
  icon, label, value, accentColor, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor: string;
  sub?: string;
}) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <Card className="relative overflow-hidden border flex items-stretch h-full">
        {/* Left accent stripe */}
        <div className="w-1 shrink-0 rounded-l-xl" style={{ background: accentColor }} />
        <div className="flex flex-col flex-1 p-4 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground truncate">
              {label}
            </span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
              style={{ background: accentColor + "cc" }}
            >
              {icon}
            </div>
          </div>
          {/* Value — truncates gracefully if too long, shrinks font at xl */}
          <div
            className="font-bold tracking-tight leading-none truncate mt-auto"
            style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.25rem)" }}
            title={value}
          >
            {value}
          </div>
          {/* Reserve space for sub even when absent so cards stay same height */}
          <div className="text-[11px] text-muted-foreground mt-1 truncate min-h-[1rem]">
            {sub ?? ""}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Recharts tooltip renders outside the component tree, so CSS custom properties
// (hsl(var(--x))) don't resolve there. Use concrete values instead.
const chartTooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,.10)",
};

function Dashboard() {
  const { 
    globals, 
    setGlobals, 
    calc, 
    employees, 
    grades,
    getMonthlyStats,
    getAllTrends,
    monthlyData,
    detectTriggers  // ADDED THIS
  } = useP4P();

  const trends = getAllTrends();
  const stats = getMonthlyStats();

  // Rising Stars (improving over time)
  const risingStars = useMemo(() => {
    return trends
      .filter(t => t.trendDirection === 'improving' && t.currentScore > 1.0)
      .sort((a, b) => (b.currentScore - b.averageScore) - (a.currentScore - a.averageScore))
      .slice(0, 5);
  }, [trends]);

  // Underachievers (declining)
  const underachievers = useMemo(() => {
    return trends
      .filter(t => t.trendDirection === 'declining' && t.currentScore < 0.7)
      .sort((a, b) => (a.currentScore - a.averageScore) - (b.currentScore - b.averageScore))
      .slice(0, 5);
  }, [trends]);

  // Performance distribution
  const performanceDistribution = useMemo(() => {
    const ranges = {
      'Excellent (≥1.2)': 0,
      'Good (1.0-1.2)': 0,
      'Average (0.8-1.0)': 0,
      'Below (0.5-0.8)': 0,
      'Critical (<0.5)': 0
    };
    for (const t of trends) {
      if (t.currentScore >= 1.2) ranges['Excellent (≥1.2)']++;
      else if (t.currentScore >= 1.0) ranges['Good (1.0-1.2)']++;
      else if (t.currentScore >= 0.8) ranges['Average (0.8-1.0)']++;
      else if (t.currentScore >= 0.5) ranges['Below (0.5-0.8)']++;
      else ranges['Critical (<0.5)']++;
    }
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [trends]);

  // Monthly trend data for chart
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
      employeeCount: g.count
    }));
  }, [monthlyData, employees]);

  const disabled = globals.totalRevenue <= 0;

  const poolData = useMemo(() => ([
    { name: "Employee Pool", value: calc.employeePool },
    { name: "Adjunct Pool",  value: calc.adjunctPool  },
  ]), [calc.employeePool, calc.adjunctPool]);

  const topEarners = useMemo(() => {
    return employees
      .map((e) => ({ name: e.name.split(" ")[0], bonus: calc.perEmployee[e.id]?.bonus ?? 0 }))
      .sort((a, b) => b.bonus - a.bonus)
      .slice(0, 6);
  }, [employees, calc]);

  const gradeDistribution = useMemo(() => {
    const map = new Map<string, { grade: string; count: number; totalBonus: number }>();
    for (const e of employees) {
      const k = e.jobGrade;
      const cur = map.get(k) ?? { grade: k, count: 0, totalBonus: 0 };
      cur.count += 1;
      cur.totalBonus += calc.perEmployee[e.id]?.bonus ?? 0;
      map.set(k, cur);
    }
    return Array.from(map.values()).sort((a, b) => a.grade.localeCompare(b.grade));
  }, [employees, calc, grades]);

  const radialData = [{ name: "P4P", value: globals.p4pPercent, fill: COLORS.primary }];

  // Get triggers - with error handling
  const triggers = useMemo(() => {
    try {
      return detectTriggers();
    } catch (error) {
      console.error("Error loading triggers:", error);
      return { pip: [], probation: [], managementAction: [], total: 0 };
    }
  }, [detectTriggers]);

  const hasTriggers = triggers.total > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> P4P Dashboard
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

      {/* Stat cards — 2 cols on sm, 3 on md, 6 on xl */}
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

      {/* Rising Stars & Underachievers */}
      {(risingStars.length > 0 || underachievers.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {risingStars.length > 0 && (
            <Card className="p-4 border-green-200 bg-green-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-sm text-green-800">🌟 Rising Stars</h3>
                <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full ml-auto">
                  {risingStars.length} employees
                </span>
              </div>
              <div className="space-y-2">
                {risingStars.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-md border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="text-xs text-green-600">📈 +{fmtNum((t.currentScore - t.averageScore) * 100, 0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{fmtNum(t.currentScore, 2)}</span>
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min(100, (t.currentScore / 2) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {underachievers.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h3 className="font-semibold text-sm text-red-800">⚠️ Underachievers</h3>
                <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full ml-auto">
                  {underachievers.length} employees
                </span>
              </div>
              <div className="space-y-2">
                {underachievers.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-md border border-red-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="text-xs text-red-600">📉 {fmtNum((t.averageScore - t.currentScore) * 100, 0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{fmtNum(t.currentScore, 2)}</span>
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${Math.min(100, (t.currentScore / 2) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Triggers Summary */}
      {hasTriggers && (
        <Card className="p-4 border-orange-200 bg-orange-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Performance Alerts</h3>
            </div>
            <span className="text-sm font-bold text-orange-700">{triggers.total} triggers</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center p-2 bg-yellow-100 rounded-md">
              <div className="text-sm font-bold text-yellow-700">{triggers.pip.length}</div>
              <div className="text-xs text-yellow-600">PIP Required</div>
            </div>
            <div className="text-center p-2 bg-orange-100 rounded-md">
              <div className="text-sm font-bold text-orange-700">{triggers.probation.length}</div>
              <div className="text-xs text-orange-600">Probation</div>
            </div>
            <div className="text-center p-2 bg-red-100 rounded-md">
              <div className="text-sm font-bold text-red-700">{triggers.managementAction.length}</div>
              <div className="text-xs text-red-600">Mgmt Action</div>
            </div>
          </div>
        </Card>
      )}

      {disabled && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          Total revenue is 0 — set a revenue value to enable calculations.
        </div>
      )}
      {calc.warnings.length > 0 && (
        <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm space-y-1 dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-300">
          <div className="font-medium flex items-center gap-2"><Activity className="h-4 w-4" /> Warnings</div>
          <ul className="list-disc list-inside">
            {calc.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Charts row 1 - Monthly Trend + Performance Distribution */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Monthly Trend Chart */}
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
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v: number) => [fmtNum(v, 2), "Avg Multiplier"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgMultiplier" 
                  stroke={COLORS.primary} 
                  strokeWidth={2} 
                  fill="url(#trendFill)" 
                  dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {monthlyTrendData.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-2">
              No monthly data yet. Upload data via the Monthly page.
            </div>
          )}
        </Card>

        {/* Performance Distribution */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Performance Distribution</h3>
            <span className="text-xs text-muted-foreground ml-auto">{trends.length} employees</span>
          </div>
          <div className="h-44 sm:h-56">
            <ResponsiveContainer>
              <BarChart data={performanceDistribution} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar 
                  dataKey="value" 
                  fill={COLORS.primary} 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 - Pool Split + Top Earners */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Pool Split</h3>
          </div>
          <div className="h-44 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={poolData}
                  dataKey="value"
                  innerRadius="38%"
                  outerRadius="60%"
                  paddingAngle={3}
                  cx="50%"
                  cy="50%"
                >
                  {poolData.map((_, i) => <Cell key={i} fill={POOL_COLORS[i]} stroke="none" />)}
                </Pie>
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v: number) => [fmtGHSFull(v), ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-2 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Total Pool</span>
            <span className="font-bold tabular-nums">{fmtGHS(calc.totalPool)}</span>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Top 6 Earners</h3>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer>
              <BarChart data={topEarners} margin={{ left: 8 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={COLORS.primary} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={COLORS.accent}  stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tickFormatter={fmtCompact} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v: number) => [fmtGHSFull(v), "Bonus"]}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                />
                <Bar dataKey="bonus" fill="url(#barFill)" radius={[6, 6, 0, 0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 3 - P4P % + Bonus by Grade */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">P4P % of Revenue</h3>
          </div>
          <div className="h-44 sm:h-56 relative">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={210} endAngle={-30}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-bold text-primary">{globals.p4pPercent}%</div>
              <div className="text-xs text-muted-foreground">of revenue</div>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Bonus by Job Grade</h3>
          </div>
          <div className="h-44 sm:h-56">
            <ResponsiveContainer>
              <AreaChart data={gradeDistribution} margin={{ left: 8 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="grade" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tickFormatter={fmtCompact} axisLine={false} tickLine={false} width={48} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v: number, n) => [n === "totalBonus" ? fmtGHSFull(v) : v, n === "totalBonus" ? "Total Bonus" : String(n)]}
                />
                <Area
                  type="monotone"
                  dataKey="totalBonus"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#areaFill)"
                  dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grade distribution chips */}
      {gradeDistribution.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Headcount by Grade
          </h3>
          <div className="flex flex-wrap gap-2">
            {gradeDistribution.map((g, i) => (
              <div key={g.grade} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} />
                <span className="text-sm font-medium">Grade {g.grade}</span>
                <span className="text-xs text-muted-foreground">
                  {g.count} ppl · {fmtGHS(g.totalBonus)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      {trends.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-primary">{trends.length}</div>
            <div className="text-xs text-muted-foreground">Tracked Employees</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-green-600">{fmtNum(stats.avgMultiplier, 2)}</div>
            <div className="text-xs text-muted-foreground">Average Multiplier</div>
          </Card>
          <Card className="p-3 text-center border-green-200 bg-green-50/50">
            <div className="text-xl font-bold text-green-700">{stats.risingStars.length}</div>
            <div className="text-xs text-green-600">Rising Stars</div>
          </Card>
          <Card className="p-3 text-center border-red-200 bg-red-50/50">
            <div className="text-xl font-bold text-red-700">{stats.underachievers.length}</div>
            <div className="text-xs text-red-600">Underachievers</div>
          </Card>
        </div>
      )}

      {/* Global Inputs */}
      <Card className="p-6 space-y-6">
        <h2 className="text-base font-semibold">Global Inputs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Total Actual Revenue (GHS)</Label>
            <Input
              type="number"
              value={globals.totalRevenue}
              onChange={(e) => setGlobals({ totalRevenue: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>P4P % of Revenue</Label>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                className="min-w-0 flex-1"
                type="number"
                step="0.1"
                value={globals.p4pPercent}
                onChange={(e) => setGlobals({ p4pPercent: Number(e.target.value) })}
              />
              <div className="flex gap-1 shrink-0">
                {[2, 2.5, 3].map((v) => (
                  <Button key={v} size="sm" variant="outline" onClick={() => setGlobals({ p4pPercent: v })}>
                    {v}%
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Adjunct % of P4P Pool</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={globals.adjunctPercent}
              onChange={(e) => setGlobals({ adjunctPercent: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>Sales Role Multiplier</Label>
            <Input
              type="number"
              step="0.1"
              value={globals.salesMultiplier}
              onChange={(e) => setGlobals({ salesMultiplier: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>
              Performance Multiplier Floor:{" "}
              <span className="font-mono">{fmtNum(globals.floor, 2)}</span>
            </Label>
            <Slider
              value={[globals.floor]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(v) => setGlobals({ floor: v[0] })}
            />
          </div>

          <div>
            <Label>
              Performance Multiplier Cap:{" "}
              <span className="font-mono">{fmtNum(globals.cap, 2)}</span>
            </Label>
            <Slider
              value={[globals.cap]}
              min={0.5}
              max={2}
              step={0.05}
              onValueChange={(v) => setGlobals({ cap: v[0] })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md md:col-span-2 bg-muted/20">
            <div>
              <Label className="mb-0">Pro-ration by months worked</Label>
              <p className="text-xs text-muted-foreground">When ON, bonuses scale by (months worked / 12).</p>
            </div>
            <Switch checked={globals.prorationOn} onCheckedChange={(v) => setGlobals({ prorationOn: v })} />
          </div>
        </div>
      </Card>
    </div>
  );
}