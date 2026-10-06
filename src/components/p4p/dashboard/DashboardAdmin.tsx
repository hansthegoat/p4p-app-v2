import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer } from "@/lib/motion";
import { showToast } from "@/lib/toast";
import { KpiUpdatesBanner } from "@/components/p4p/KpiUpdatesBanner";
import { NeedsAttention } from "@/components/p4p/NeedsAttention";
import { NotificationBell } from "@/components/p4p/NotificationBell";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  TrendingUp, Wallet, Users, UserCheck, DollarSign,
  Sparkles, Calendar, Award, AlertTriangle,
  Settings, Save, RefreshCw, Activity, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { COLOR_THEMES, CHART_PRIMARY_COLOR, TOOLTIP_STYLE } from "./shared";

/** Shape of the admin's editable global settings form. */
type GlobalsForm = {
  totalRevenue: number;
  p4pPercent: number;
  adjunctPercent: number;
  floor: number;
  cap: number;
  prorationOn: boolean;
  salesMultiplier: number;
};

/** Keys of GlobalsForm whose value is a number (i.e. rendered as <Input type="number">). */
type NumericGlobalsKey = Exclude<keyof GlobalsForm, "prorationOn">;

type GlobalsField = {
  key: NumericGlobalsKey;
  label: string;
  step?: string;
};

const GLOBAL_NUMERIC_FIELDS: GlobalsField[] = [
  { key: "totalRevenue", label: "Revenue (GHS)" },
  { key: "p4pPercent", label: "P4P %" },
  { key: "adjunctPercent", label: "Adjunct %" },
  { key: "floor", label: "Floor", step: "0.01" },
  { key: "cap", label: "Cap", step: "0.01" },
  { key: "salesMultiplier", label: "Sales Mult.", step: "0.01" },
];

export function DashboardAdmin() {
  const {
    globals, setGlobals, calc, employees, monthlyData,
    getAllTrends, getMonthlyStats,
    bonusRevealed, setBonusRevealed,
  } = useP4P();

  const prefersReducedMotion = useReducedMotion();

  const [localGlobals, setLocalGlobals] = useState<GlobalsForm>({
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

  const trendSummary = useMemo(() => {
    if (monthlyTrendData.length === 0) return "No monthly data yet.";
    const latest = monthlyTrendData[monthlyTrendData.length - 1];
    return `Monthly performance trend across ${monthlyTrendData.length} months. Latest (${latest.month}) average multiplier: ${fmtNum(latest.avgMultiplier, 2)}.`;
  }, [monthlyTrendData]);

  const handleSaveGlobals = () => {
    setSaving(true);
    setGlobals(localGlobals);
    setTimeout(() => setSaving(false), 500);
  };

  const handleNumericChange = (key: NumericGlobalsKey, raw: string) => {
    setLocalGlobals((prev) => ({ ...prev, [key]: Number(raw) }));
  };

  const disabled = globals.totalRevenue <= 0;

  const topPerformers = useMemo(
    () => [...trends].sort((a, b) => b.currentScore - a.currentScore).slice(0, 5),
    [trends],
  );

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      <KpiUpdatesBanner />

      <div data-tour="dashboard-header">
        <PageHeader
          title="P4P Dashboard"
          description="Live overview of pools, payouts, performance signals, and monthly trends."
          icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
          badge={<Badge variant="outline" className="gap-1.5"><Calendar className="h-3 w-3" aria-hidden="true" />{monthlyData.length} data points</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div data-tour="notifications">
                <NotificationBell />
              </div>
            </div>
          }
        />
      </div>

      <div data-tour="needs-attention">
        <NeedsAttention />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                bonusRevealed ? COLOR_THEMES.emerald.subtleBg + " " + COLOR_THEMES.emerald.text : COLOR_THEMES.amber.subtleBg + " " + COLOR_THEMES.amber.text
              }`}
            >
              {bonusRevealed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">
                Bonus visibility: {bonusRevealed ? "Revealed" : "Hidden"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {bonusRevealed
                  ? "Employees can see their bonus amounts."
                  : "Employees see a locked placeholder until you reveal."}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await setBonusRevealed(!bonusRevealed);
                showToast.success(
                  !bonusRevealed ? "Bonuses revealed" : "Bonuses hidden",
                  !bonusRevealed
                    ? "All employees can now see their amounts."
                    : "Employees see the locked placeholder again."
                );
              } catch (err: any) {
                showToast.error("Could not update", err.message);
              }
            }}
            className={`gap-2 ${
              bonusRevealed
                ? "bg-background border border-border text-foreground hover:bg-accent"
                : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white"
            }`}
          >
            {bonusRevealed ? "Hide bonuses" : "Reveal bonuses"}
          </Button>
        </div>
      </Card>

      <div data-tour="global-settings">
        <SectionCard
          title="Global P4P Settings"
          description="Controls revenue, pool allocation, and thresholds"
          icon={<Settings className="h-4 w-4" aria-hidden="true" />}
          action={<Button size="sm" onClick={handleSaveGlobals} disabled={saving} className="gap-1.5">{saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}Save</Button>}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {GLOBAL_NUMERIC_FIELDS.map((f) => {
              const inputId = `globals-${f.key}`;
              return (
                <div key={f.key}>
                  <Label htmlFor={inputId} className="text-xs text-muted-foreground">{f.label}</Label>
                  <Input
                    id={inputId}
                    type="number"
                    step={f.step}
                    className="mt-1 h-9"
                    value={localGlobals[f.key]}
                    onChange={(e) => handleNumericChange(f.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <label htmlFor="globals-prorationOn" className="flex items-center gap-2 cursor-pointer">
              <input
                id="globals-prorationOn"
                type="checkbox"
                checked={localGlobals.prorationOn}
                onChange={(e) => setLocalGlobals((prev) => ({ ...prev, prorationOn: e.target.checked }))}
                className="h-3.5 w-3.5 rounded accent-primary"
              />
              Proration On
            </label>
            <span className="ml-auto flex items-center gap-4">
              <span>P4P Pool: <strong className="text-foreground">{fmtGHS(calc.totalPool)}</strong></span>
              <span>Employee Pool: <strong className="text-foreground">{fmtGHS(calc.employeePool)}</strong></span>
            </span>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-tour="dashboard-stats">
        <StatCard icon={<DollarSign className="h-4 w-4" aria-hidden="true" />} label="Revenue" value={fmtGHS(globals.totalRevenue)} sub={`${globals.p4pPercent}% to P4P`} accent="primary" />
        <StatCard icon={<Wallet className="h-4 w-4" aria-hidden="true" />} label="Total Pool" value={fmtGHS(calc.totalPool)} accent="purple" />
        <StatCard icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />} label="Adjunct Pool" value={fmtGHS(calc.adjunctPool)} sub={`${globals.adjunctPercent}% share`} accent="warning" />
        <StatCard icon={<Wallet className="h-4 w-4" aria-hidden="true" />} label="Employee Pool" value={fmtGHS(calc.employeePool)} accent="success" />
        <StatCard icon={<Users className="h-4 w-4" aria-hidden="true" />} label="Headcount" value={calc.adjunctCount + calc.nonAdjunctCount} sub={`${calc.nonAdjunctCount} core · ${calc.adjunctCount} adjunct`} accent="info" />
        <StatCard icon={<UserCheck className="h-4 w-4" aria-hidden="true" />} label="Avg Bonus" value={fmtGHS(calc.avgBonus)} accent="default" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4" data-tour="dashboard-trend">
        <div className="lg:col-span-2">
          <SectionCard title="Monthly Performance Trend" description={`${monthlyTrendData.length} months tracked`} icon={<Activity className="h-4 w-4" aria-hidden="true" />} noPadding>
            <div
              role="img"
              aria-label={trendSummary}
              className="p-4 h-72"
            >
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} accessibilityLayer>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_PRIMARY_COLOR} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={CHART_PRIMARY_COLOR} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="month" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 2]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmtNum(v, 2), "Avg Multiplier"]} />
                    <Area type="monotone" dataKey="avgMultiplier" stroke={CHART_PRIMARY_COLOR} strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={<Activity className="h-6 w-6" aria-hidden="true" />} title="No monthly data yet" description="Upload monthly performance data to see trends." />
              )}
            </div>
          </SectionCard>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <StatCard icon={<Users className="h-4 w-4" aria-hidden="true" />} label="Tracked Employees" value={trends.length} accent="primary" />
          <StatCard icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />} label="Avg Multiplier" value={fmtNum(stats.avgMultiplier, 2)} accent="success" />
        </div>
      </div>

      <SectionCard title="Top Performers" description="Highest current performance multipliers" icon={<Award className="h-4 w-4" aria-hidden="true" />}>
        {topPerformers.length > 0 ? (
          <ol className="space-y-2" aria-label="Top performers by current score">
            {topPerformers.map((t, i) => (
              <motion.li
                key={t.employeeId}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors list-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">#{i + 1}</div>
                  <span className="font-medium text-sm truncate">
                    <span className="sr-only">{`Rank ${i + 1}: `}</span>
                    {t.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground">{t.months.length} months</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{fmtNum(t.currentScore, 2)}</span>
                </div>
              </motion.li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={<Award className="h-6 w-6" aria-hidden="true" />} title="No performers yet" description="Performance data will appear here once employees submit." />
        )}
      </SectionCard>

      {(stats.risingStars.length > 0 || stats.underachievers.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.risingStars.length > 0 && (
            <SectionCard title="Rising Stars" icon={<Award className="h-4 w-4 text-emerald-600" aria-hidden="true" />} action={<Badge variant="outline" className="text-emerald-600 border-emerald-500/30">{stats.risingStars.length}</Badge>}>
              <ul className="flex flex-wrap gap-2" aria-label="Rising stars">
                {stats.risingStars.slice(0, 8).map((name, i) => (
                  <motion.li
                    key={name}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : i * 0.04 }}
                    className="list-none"
                  >
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">{name}</Badge>
                  </motion.li>
                ))}
              </ul>
            </SectionCard>
          )}
          {stats.underachievers.length > 0 && (
            <SectionCard title="Underachievers" icon={<AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />} action={<Badge variant="outline" className="text-red-600 border-red-500/30">{stats.underachievers.length}</Badge>}>
              <ul className="flex flex-wrap gap-2" aria-label="Underachievers">
                {stats.underachievers.slice(0, 8).map((name, i) => (
                  <motion.li
                    key={name}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : i * 0.04 }}
                    className="list-none"
                  >
                    <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">{name}</Badge>
                  </motion.li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}

      {calc.warnings.length > 0 && (
        <Card className="p-4 bg-amber-500/5 border-amber-500/30" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
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
        <Card className="p-4 bg-red-500/5 border-red-500/30" role="alert">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            <span className="text-sm text-red-900 dark:text-red-300">Total revenue is 0 — set a revenue value to enable saving.</span>
          </div>
        </Card>
      )}
    </motion.div>
  );
}