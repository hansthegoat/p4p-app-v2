import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { BonusGate } from "@/components/p4p/BonusGate";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/supabase";
import { usePageTour } from "@/hooks/usePageTour";
import { PAGE_TOURS } from "@/lib/p4p/tours";
import {
  Calculator, Wallet, TrendingUp, Target, Award, DollarSign,
  Percent, Zap, Hash, Info, ChevronRight, Activity, Calendar,
  Users, Star, Building2, CircleDollarSign, Sparkles,
  Scale, HelpCircle, Lightbulb,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_app/my-calculation")({
  component: MyCalculationPage,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px",
};

function MyCalculationPage() {
  const navigate = useNavigate();
  const { employees, calc, globals, getMonthlyHistory } = useP4P();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) { navigate({ to: "/login" }); return; }
        const emp = employees.find((e) => e.email === user.email);
        setEmployee(emp || null);
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchUser();
  }, [employees, navigate]);

  const empCalc = useMemo(() => {
    if (!employee) return null;
    return calc.perEmployee[employee.id] || null;
  }, [employee, calc]);

  const history = useMemo(() => {
    if (!employee) return [];
    return getMonthlyHistory(employee.id);
  }, [employee, getMonthlyHistory]);

  const yearHistoryData = useMemo(() => {
    return history
      .filter((h) => h.year === selectedYear)
      .sort((a, b) => a.month - b.month)
      .map((h) => ({
        label: new Date(h.year, h.month - 1, 1).toLocaleString("default", { month: "short" }),
        multiplier: h.performanceMultiplier,
      }));
  }, [history, selectedYear]);

  const companyStats = useMemo(() => {
    const nonAdjunct = employees.filter((e) => !e.isAdjunct);
    const values = nonAdjunct.map((e) => calc.perEmployee[e.id]).filter(Boolean);
    const totalPoints = values.reduce((s, v) => s + (v?.gradePoints || 0), 0);
    const avgMultiplier = values.length > 0 ? values.reduce((s, v) => s + (v?.performanceMultiplier || 0), 0) / values.length : 0;
    return { totalEmployees: nonAdjunct.length, totalPoints, avgMultiplier };
  }, [employees, calc]);

  const potentialBonus = useMemo(() => {
    if (!empCalc) return 0;
    return empCalc.gradePoints * calc.valuePerUnit * empCalc.proration * empCalc.salesMult;
  }, [empCalc, calc]);

  const perfectBonus = useMemo(() => {
    if (!empCalc) return 0;
    return empCalc.gradePoints * calc.valuePerUnit * empCalc.proration * empCalc.salesMult * 1.2;
  }, [empCalc, calc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your calculation...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return <EmptyState icon={<Info className="h-6 w-6" />} title="No Employee Record" description="Your profile is not linked to an employee record. Please contact HR." />;
  }

  if (!empCalc) {
    return <EmptyState icon={<Calculator className="h-6 w-6" />} title="No Calculation Available" description="Your bonus calculation is not available yet. Please submit an appraisal first." />;
  }

  const getBand = (score: number) => {
    if (score >= 1.2) return { label: "Exceptional", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" };
    if (score >= 1.0) return { label: "Exceeds Expectations", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 0.8) return { label: "Meets Expectations", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
    if (score >= 0.6) return { label: "Needs Improvement", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    return { label: "Performance Improvement Plan", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/30" };
  };

  const band = getBand(empCalc.performanceMultiplier);
  const differenceToTarget = potentialBonus - empCalc.bonus;

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="My Calculation"
        description="Understand exactly how your bonus is calculated — from company revenue to your final payout."
        icon={<Calculator className="h-6 w-6" />}
        actions={
          <div className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 flex items-center gap-2 ${band.bg} ${band.color}`}>
            <Calculator className="h-4 w-4" /> <BonusGate value={empCalc.bonus} />
          </div>
        }
      />

      {/* Big bonus */}
      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20 overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                <DollarSign className="h-3.5 w-3.5" /> Your Current Bonus
              </div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight"><BonusGate value={empCalc.bonus} /></div>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className={`${band.bg} ${band.color} gap-1`}><TrendingUp className="h-3 w-3" />{band.label}</Badge>
                <span className="text-xs text-muted-foreground">Based on {fmtNum(empCalc.performanceMultiplier * 100, 0)}% KPI achievement</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background border border-border/60 min-w-[120px]">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Grade Points</div>
                <div className="text-lg font-bold mt-1">{fmtNum(empCalc.gradePoints, 1)}</div>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border/60 min-w-[120px]">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Multiplier</div>
                <div className="text-lg font-bold mt-1 text-blue-600 dark:text-blue-400">{fmtNum(empCalc.performanceMultiplier, 2)}</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Step 0 */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Step 0 · Where the Money Comes From" description="Before we calculate your bonus, here's the big picture" icon={<Building2 className="h-4 w-4" />}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your bonus is funded from a <strong className="text-foreground">shared pool</strong> that comes from company revenue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2"><Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /><span className="text-xs uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400">1. Company Revenue</span></div>
                <div className="text-lg font-bold">{fmtGHS(globals.totalRevenue)}</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /><span className="text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">2. P4P Pool ({globals.p4pPercent}%)</span></div>
                <div className="text-lg font-bold">{fmtGHS(calc.totalPool)}</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-purple-600 dark:text-purple-400" /><span className="text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">3. Your Share</span></div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400"><BonusGate value={empCalc.bonus} /></div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300"><strong>Why this matters:</strong> If the company makes more revenue, everyone's bonus grows.</p>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Step 1 */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Step 1 · Your Grade Points" description={`You're a Grade ${employee.jobGrade} (${employee.role})`} icon={<Award className="h-4 w-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400 mb-3">Your Points</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{fmtNum(empCalc.gradePoints, 1)}</span>
                <span className="text-sm text-muted-foreground">points</span>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">How You Compare</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Your points</span><span className="font-bold">{fmtNum(empCalc.gradePoints, 1)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Total company points</span><span className="font-bold">{fmtNum(companyStats.totalPoints, 0)}</span></div>
                <div className="h-px bg-border/60 my-1" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Your share of pool</span>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30">
                    {companyStats.totalPoints > 0 ? fmtNum((empCalc.gradePoints / companyStats.totalPoints) * 100, 2) : "0"}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Step 2 */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Step 2 · Value per Point" description="How much each of your points is worth in money" icon={<CircleDollarSign className="h-4 w-4" />}>
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2 text-center md:text-left">
                <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Employee Pool</div>
                <div className="text-2xl font-bold">{fmtGHS(calc.employeePool)}</div>
              </div>
              <div className="flex justify-center"><div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center"><span className="text-xl font-bold text-muted-foreground">÷</span></div></div>
              <div className="text-center md:text-left">
                <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Total Points</div>
                <div className="text-2xl font-bold">{fmtNum(companyStats.totalPoints, 0)}</div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-xs uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-400 mb-1">Value per Point</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmtGHS(calc.valuePerUnit)}</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Step 3 */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Step 3 · Your Performance Multiplier" description="This is where YOUR efforts change the outcome" icon={<TrendingUp className="h-4 w-4" />}>
          <div className={`p-5 rounded-xl ${band.bg} border-2`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Your Multiplier</div>
                <div className={`text-4xl font-bold ${band.color}`}>{fmtNum(empCalc.performanceMultiplier, 3)}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className={`${band.bg} ${band.color} gap-1`}>{band.label}</Badge>
                <span className="text-xs text-muted-foreground">Company avg: {fmtNum(companyStats.avgMultiplier, 2)}</span>
              </div>
            </div>
            <div className="w-full bg-background rounded-full h-3 overflow-hidden mb-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (empCalc.performanceMultiplier / 1.5) * 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-blue-500" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span><span>0.8 (Meets)</span><span>1.0 (Exceeds)</span><span>1.5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-muted-foreground" /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Per KPI</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">Actual ÷ Target</strong><br />Example: 85 ÷ 90 = 0.94</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex items-center gap-2 mb-2"><Percent className="h-4 w-4 text-muted-foreground" /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Per Category</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">Weighted by KPI weight<br />within each category</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex items-center gap-2 mb-2"><Scale className="h-4 w-4 text-muted-foreground" /><span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Overall</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">Weighted sum<br />of all categories</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-4">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-300"><strong>This is the part YOU control.</strong> Every KPI you hit above target increases your multiplier.</p>
          </div>
        </SectionCard>
      </motion.div>

      {/* Step 4: Category Breakdown */}
      {empCalc.categoryBreakdown && empCalc.categoryBreakdown.length > 0 && (
        <motion.div variants={fadeUp}>
          <SectionCard title="Your Category Breakdown" description="How each KPI category contributed to your multiplier" icon={<Target className="h-4 w-4" />}>
            <div className="space-y-3">
              {empCalc.categoryBreakdown.map((cat: any, i: number) => {
                const color = cat.categoryScore >= 1.0 ? "emerald" : cat.categoryScore >= 0.7 ? "blue" : cat.categoryScore >= 0.5 ? "amber" : "red";
                return (
                  <Card key={i} className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/20 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 flex items-center justify-center text-xs font-bold`}>{i + 1}</div>
                        <div>
                          <div className="text-sm font-semibold">{cat.categoryName}</div>
                          <div className="text-xs text-muted-foreground">Category weight {cat.categoryWeight}%</div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>{fmtNum(cat.categoryScore * 100, 1)}%</div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground pb-2 border-b border-border/30">
                        <div className="col-span-4">KPI Description</div>
                        <div className="col-span-2 text-center">Weight</div>
                        <div className="col-span-2 text-center">Target → Actual</div>
                        <div className="col-span-2 text-center">Ratio</div>
                        <div className="col-span-2 text-right">Achievement</div>
                      </div>
                      {cat.kpis.map((kpi: any, j: number) => (
                        <div key={j} className="grid grid-cols-12 gap-2 items-center text-xs py-2 border-b border-border/30 last:border-0">
                          <div className="col-span-12 md:col-span-4 font-medium break-words whitespace-normal">{kpi.description}</div>
                          <div className="col-span-3 md:col-span-2 text-center font-mono font-semibold">{kpi.weight}%</div>
                          <div className="col-span-4 md:col-span-2 text-center font-mono text-muted-foreground">{fmtNum(kpi.target)} → {fmtNum(kpi.actual)}</div>
                          <div className="col-span-2 md:col-span-2 text-center font-mono">×{fmtNum(kpi.ratio, 2)}</div>
                          <div className={`col-span-3 md:col-span-2 text-right font-semibold ${kpi.ratio >= 1 ? "text-emerald-600 dark:text-emerald-400" : kpi.ratio >= 0.7 ? "text-blue-600 dark:text-blue-400" : kpi.ratio >= 0.5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                            {fmtNum(kpi.ratio * 100, 1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* Final formula */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Putting It All Together" description="Your final formula" icon={<Calculator className="h-4 w-4" />}>
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-purple-500/30">
                <Award className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span className="font-mono font-bold">{fmtNum(empCalc.gradePoints, 1)}</span>
                <span className="text-[9px] text-muted-foreground">points</span>
              </div>
              <span className="text-muted-foreground font-bold">×</span>
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-blue-500/30">
                <CircleDollarSign className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono font-bold">{fmtGHS(calc.valuePerUnit)}</span>
                <span className="text-[9px] text-muted-foreground">per point</span>
              </div>
              <span className="text-muted-foreground font-bold">×</span>
              <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border ${empCalc.performanceMultiplier >= 1 ? "border-emerald-500/30" : "border-amber-500/30"}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="font-mono font-bold">{fmtNum(empCalc.performanceMultiplier, 3)}</span>
                <span className="text-[9px] text-muted-foreground">multiplier</span>
              </div>
              {globals.prorationOn && empCalc.proration !== 1 && (
                <>
                  <span className="text-muted-foreground font-bold">×</span>
                  <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-amber-500/30">
                    <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-mono font-bold">{fmtNum(empCalc.proration, 2)}</span>
                    <span className="text-[9px] text-muted-foreground">proration</span>
                  </div>
                </>
              )}
              {employee.isSalesRole && empCalc.salesMult !== 1 && (
                <>
                  <span className="text-muted-foreground font-bold">×</span>
                  <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-cyan-500/30">
                    <Zap className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span className="font-mono font-bold">{fmtNum(empCalc.salesMult, 2)}</span>
                    <span className="text-[9px] text-muted-foreground">sales</span>
                  </div>
                </>
              )}
              <span className="text-muted-foreground font-bold">=</span>
              <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500/15 border-2 border-emerald-500/40">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm"><BonusGate value={empCalc.bonus} /></span>
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400">your bonus</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* What If */}
      <motion.div variants={fadeUp}>
        <SectionCard title="What If You Improved?" description="See how changes to your performance would affect your bonus" icon={<Sparkles className="h-4 w-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Current</span>
              <div className="text-2xl font-bold mt-2"><BonusGate value={empCalc.bonus} /></div>
              <p className="text-xs text-muted-foreground mt-1">At {fmtNum(empCalc.performanceMultiplier * 100, 0)}% achievement</p>
            </div>
            <div className={`p-4 rounded-xl border ${empCalc.performanceMultiplier >= 1.0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20"}`}>
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">If You Hit Targets</span>
              <div className="text-2xl font-bold mt-2"><BonusGate value={potentialBonus} /></div>
              <p className={`text-xs mt-1 ${differenceToTarget > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                {differenceToTarget > 0 ? <><BonusGate value={differenceToTarget} /> more</> : "You're already there!"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <span className="text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400">Max Potential (120%)</span>
              <div className="text-2xl font-bold mt-2"><BonusGate value={perfectBonus} /></div>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">+<BonusGate value={perfectBonus - empCalc.bonus} /> more</p>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* History */}
      {yearHistoryData.length > 1 && (
        <motion.div variants={fadeUp}>
          <SectionCard title="Your Performance History" icon={<Activity className="h-4 w-4" />}
            action={<Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}><SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>}
            noPadding
          >
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearHistoryData}>
                  <defs><linearGradient id="myCalcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(221 70% 50%)" stopOpacity={0.35} /><stop offset="100%" stopColor="hsl(221 70% 50%)" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="label" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 2]} fontSize={11} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtNum(v, 2), "Multiplier"]} />
                  <Area type="monotone" dataKey="multiplier" stroke="hsl(221 70% 50%)" strokeWidth={2.5} fill="url(#myCalcGrad)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* Help */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"><HelpCircle className="h-4 w-4" /></div>
            <div>
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300">Questions About Your Calculation?</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-blue-800 dark:text-blue-400">
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0" /><span>Bonus is based on <strong>approved</strong> KPI data.</span></li>
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0" /><span>To improve, update KPIs on <strong>My Performance</strong>.</span></li>
                <li className="flex items-start gap-2"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0" /><span>Contact HR if your grade or points are incorrect.</span></li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}