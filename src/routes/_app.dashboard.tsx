import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
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
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const COLORS = {
  primary: "hsl(221 83% 53%)",
  accent: "hsl(280 75% 60%)",
  success: "hsl(152 76% 44%)",
  warning: "hsl(38 92% 55%)",
  danger: "hsl(0 84% 60%)",
  cyan: "hsl(190 85% 50%)",
  pink: "hsl(330 80% 60%)",
};

const POOL_COLORS = [COLORS.primary, COLORS.accent];
const BAR_COLORS = [COLORS.primary, COLORS.cyan, COLORS.success, COLORS.warning, COLORS.pink, COLORS.accent];

function StatCard({
  icon, label, value, gradient, sub,
}: { icon: React.ReactNode; label: string; value: string; gradient: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
    >
      <Card className="relative overflow-hidden border-0 text-white shadow-lg">
        <div className={`absolute inset-0 ${gradient}`} />
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-white/80">{label}</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {sub && <div className="text-xs text-white/75 mt-1">{sub}</div>}
        </div>
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const { globals, setGlobals, calc, employees, grades } = useP4P();
  const disabled = globals.totalRevenue <= 0;

  const poolData = useMemo(() => ([
    { name: "Employee Pool", value: calc.employeePool },
    { name: "Adjunct Pool", value: calc.adjunctPool },
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

  const utilisation = calc.totalPool > 0
    ? Math.min(100, (calc.totalPool / (globals.totalRevenue || 1)) * 100 * 20) // scaled for visual
    : 0;

  const radialData = [{ name: "P4P", value: globals.p4pPercent, fill: COLORS.accent }];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> P4P Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Live overview of pools, payouts and performance signals.</p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
          {employees.length} employees tracked
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenue" value={fmtGHS(globals.totalRevenue)}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-700" sub={`${globals.p4pPercent}% to P4P`} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Pool" value={fmtGHS(calc.totalPool)}
          gradient="bg-gradient-to-br from-fuchsia-500 to-purple-700" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Adjunct Pool" value={fmtGHS(calc.adjunctPool)}
          gradient="bg-gradient-to-br from-amber-400 to-orange-600" sub={`${globals.adjunctPercent}% share`} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Employee Pool" value={fmtGHS(calc.employeePool)}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-700" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Headcount" value={`${calc.adjunctCount + calc.nonAdjunctCount}`}
          gradient="bg-gradient-to-br from-cyan-400 to-sky-700" sub={`${calc.nonAdjunctCount} core / ${calc.adjunctCount} adjunct`} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Avg Bonus" value={fmtGHS(calc.avgBonus)}
          gradient="bg-gradient-to-br from-rose-500 to-pink-700" />
      </div>

      {disabled && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          Total revenue is 0 — set a revenue value to enable calculations.
        </div>
      )}
      {calc.warnings.length > 0 && (
        <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm space-y-1">
          <div className="font-medium flex items-center gap-2"><Activity className="h-4 w-4" /> Warnings</div>
          <ul className="list-disc list-inside">{calc.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Pool Split</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={poolData} dataKey="value" innerRadius={70} outerRadius={105} paddingAngle={3}>
                  {poolData.map((_, i) => <Cell key={i} fill={POOL_COLORS[i]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtGHS(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-44 pointer-events-none">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-bold text-lg">{fmtGHS(calc.totalPool)}</div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Top 6 Earners</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topEarners}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                    <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtGHS(v)} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                <Bar dataKey="bonus" fill="url(#barFill)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">P4P % of Revenue</h3>
          </div>
          <div className="h-56 relative">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={210} endAngle={-30}>
                <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "hsl(var(--muted))" }} />
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
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={gradeDistribution}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="grade" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number, n) => n === "totalBonus" ? fmtGHS(v) : v} />
                <Area type="monotone" dataKey="totalBonus" stroke={COLORS.success} strokeWidth={2} fill="url(#areaFill)" />
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
              <div key={g.grade} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} />
                <span className="text-sm font-medium">Grade {g.grade}</span>
                <span className="text-xs text-muted-foreground">{g.count} ppl · {fmtGHS(g.totalBonus)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Global Inputs */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold">Global Inputs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Total Actual Revenue (GHS)</Label>
            <Input type="number" value={globals.totalRevenue}
              onChange={(e) => setGlobals({ totalRevenue: Number(e.target.value) })} />
          </div>

          <div>
            <Label>P4P % of Revenue</Label>
            <div className="flex gap-2 items-center">
              <Input type="number" step="0.1" value={globals.p4pPercent}
                onChange={(e) => setGlobals({ p4pPercent: Number(e.target.value) })} />
              {[2, 2.5, 3].map((v) => (
                <Button key={v} size="sm" variant="outline" onClick={() => setGlobals({ p4pPercent: v })}>
                  {v}%
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Adjunct % of P4P Pool</Label>
            <Input type="number" min={0} max={100} value={globals.adjunctPercent}
              onChange={(e) => setGlobals({ adjunctPercent: Number(e.target.value) })} />
          </div>

          <div>
            <Label>Sales Role Multiplier</Label>
            <Input type="number" step="0.1" value={globals.salesMultiplier}
              onChange={(e) => setGlobals({ salesMultiplier: Number(e.target.value) })} />
          </div>

          <div>
            <Label>Performance Multiplier Floor: <span className="font-mono">{fmtNum(globals.floor, 2)}</span></Label>
            <Slider value={[globals.floor]} min={0} max={1} step={0.05}
              onValueChange={(v) => setGlobals({ floor: v[0] })} />
          </div>

          <div>
            <Label>Performance Multiplier Cap: <span className="font-mono">{fmtNum(globals.cap, 2)}</span></Label>
            <Slider value={[globals.cap]} min={0.5} max={2} step={0.05}
              onValueChange={(v) => setGlobals({ cap: v[0] })} />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md md:col-span-2">
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
