import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Calculator, Search, TrendingUp, Wallet, Users, Award,
  ChevronRight, ChevronDown, Target, DollarSign, Building2,
  Percent, ArrowRight, Info, Download, FileText, Activity,
  Zap, Hash, Star,
} from "lucide-react";

export const Route = createFileRoute("/_app/trace")({
  component: TracePage,
});

function TracePage() {
  const { employees, calc, globals, getPerformanceTrend } = useP4P();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department).filter(Boolean))],
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        if (emp.isAdjunct) return false;
        if (selectedDept !== "all" && emp.department !== selectedDept) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            emp.name.toLowerCase().includes(s) ||
            emp.department.toLowerCase().includes(s) ||
            emp.role.toLowerCase().includes(s)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const aCalc = calc.perEmployee[a.id];
        const bCalc = calc.perEmployee[b.id];
        return (bCalc?.bonus || 0) - (aCalc?.bonus || 0);
      });
  }, [employees, selectedDept, search, calc]);

  const stats = useMemo(() => {
    const values = filteredEmployees.map((e) => calc.perEmployee[e.id]);
    return {
      count: filteredEmployees.length,
      totalBonus: values.reduce((s, v) => s + (v?.bonus || 0), 0),
      avgMultiplier:
        values.length > 0
          ? values.reduce((s, v) => s + (v?.performanceMultiplier || 0), 0) / values.length
          : 0,
      totalPoints: values.reduce((s, v) => s + (v?.gradePoints || 0), 0),
    };
  }, [filteredEmployees, calc]);

  const exportTrace = () => {
    const rows: string[][] = [
      ["Employee", "Department", "Role", "Grade", "Points", "Multiplier", "Proration", "Sales Mult", "Weight", "Bonus"],
    ];
    for (const emp of filteredEmployees) {
      const c = calc.perEmployee[emp.id];
      if (!c) continue;
      rows.push([
        emp.name,
        emp.department,
        emp.role,
        emp.jobGrade,
        String(c.gradePoints),
        fmtNum(c.performanceMultiplier, 3),
        fmtNum(c.proration, 2),
        fmtNum(c.salesMult, 2),
        fmtNum(c.weight, 2),
        fmtNum(c.bonus, 2),
      ]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `calculation_trace_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast.success("Export Complete", "CSV downloaded.");
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      <PageHeader
        title="Calculation Trace"
        description="Full breakdown of how each employee's bonus is calculated — from grade points to final payout."
        icon={<Calculator className="h-6 w-6" />}
        actions={
          <Button variant="outline" size="sm" onClick={exportTrace} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Pool Overview */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 bg-gradient-to-r from-primary/5 via-background to-background border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Pool Breakdown</h3>
              <p className="text-xs text-muted-foreground">
                Revenue: {fmtGHS(globals.totalRevenue)} · P4P {globals.p4pPercent}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Total Pool
              </div>
              <div className="text-lg font-bold mt-1">{fmtGHS(calc.totalPool)}</div>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Employee Pool
              </div>
              <div className="text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {fmtGHS(calc.employeePool)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Value / Point
              </div>
              <div className="text-lg font-bold mt-1">
                {fmtGHS(calc.valuePerUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Adjunct Pool
              </div>
              <div className="text-lg font-bold mt-1 text-amber-600 dark:text-amber-400">
                {fmtGHS(calc.adjunctPool)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Employees Traced"
          value={stats.count}
          accent="primary"
          size="large"
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Bonus"
          value={fmtGHS(stats.totalBonus)}
          accent="success"
          size="large"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Multiplier"
          value={fmtNum(stats.avgMultiplier, 2)}
          accent="info"
          size="large"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Total Points"
          value={fmtNum(stats.totalPoints, 1)}
          accent="purple"
          size="large"
        />
      </div>

      {/* Filters */}
      <motion.div variants={fadeUp}>
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Search className="h-3.5 w-3.5" /> Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, department, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Building2 className="h-3.5 w-3.5" /> Department
              </Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Trace list */}
      <motion.div variants={fadeUp}>
        <SectionCard
          title="Employee Calculation Traces"
          description="Click any row to see the full breakdown"
          icon={<Activity className="h-4 w-4" />}
        >
          {filteredEmployees.length === 0 ? (
            <EmptyState
              icon={<Calculator className="h-6 w-6" />}
              title="No employees to trace"
              description="Add employees or adjust your filters to see calculations."
            />
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((emp, idx) => {
                const empCalc = calc.perEmployee[emp.id];
                if (!empCalc) return null;
                const isExpanded = expandedId === emp.id;

                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    className="border border-border/60 rounded-xl overflow-hidden"
                  >
                    {/* Row header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                      className="w-full p-4 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{emp.name}</span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              Grade {emp.jobGrade}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {emp.department} · {emp.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center hidden sm:block">
                          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                            Points
                          </div>
                          <div className="text-sm font-bold">{fmtNum(empCalc.gradePoints, 1)}</div>
                        </div>
                        <div className="text-center hidden sm:block">
                          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                            Mult.
                          </div>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {fmtNum(empCalc.performanceMultiplier, 2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                            Bonus
                          </div>
                          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {fmtGHS(empCalc.bonus)}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded trace */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 border-t border-border/50 bg-muted/20 space-y-5">
                            {/* Step 1: Base calculation */}
                            <TraceStep
                              step={1}
                              title="Grade & Weight"
                              icon={<Award className="h-3.5 w-3.5" />}
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <TraceStat
                                  label="Grade Points"
                                  value={fmtNum(empCalc.gradePoints, 1)}
                                  color="purple"
                                />
                                <TraceStat
                                  label="Weight"
                                  value={fmtNum(empCalc.weight, 1)}
                                  color="primary"
                                />
                                <TraceStat
                                  label="Sales Multiplier"
                                  value={`×${fmtNum(empCalc.salesMult, 2)}`}
                                  color="info"
                                  muted={!emp.isSalesRole}
                                />
                                <TraceStat
                                  label="Proration"
                                  value={`×${fmtNum(empCalc.proration, 2)}`}
                                  color="warning"
                                  muted={!globals.prorationOn}
                                />
                              </div>
                            </TraceStep>

                            {/* Step 2: Performance */}
                            <TraceStep
                              step={2}
                              title="Performance Multiplier"
                              icon={<TrendingUp className="h-3.5 w-3.5" />}
                            >
                              <div className="p-4 rounded-lg bg-background border border-border/60">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-muted-foreground">
                                    Calculated from KPI achievement
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={
                                      empCalc.performanceMultiplier >= 1.0
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                        : empCalc.performanceMultiplier >= 0.7
                                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                                        : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                                    }
                                  >
                                    {fmtNum(empCalc.performanceMultiplier, 3)}
                                  </Badge>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${Math.min(100, empCalc.performanceMultiplier * 100)}%`,
                                    }}
                                    transition={{ duration: 0.6 }}
                                    className={`h-full ${
                                      empCalc.performanceMultiplier >= 1.0
                                        ? "bg-emerald-500"
                                        : empCalc.performanceMultiplier >= 0.7
                                        ? "bg-blue-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                </div>
                              </div>
                            </TraceStep>

                            {/* Step 3: Category breakdown */}
                            {empCalc.categoryBreakdown && empCalc.categoryBreakdown.length > 0 && (
                              <TraceStep
                                step={3}
                                title="Category Breakdown"
                                icon={<Target className="h-3.5 w-3.5" />}
                              >
                                <div className="space-y-2">
                                  {empCalc.categoryBreakdown.map((cat: any, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 rounded-lg bg-background border border-border/60"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-primary" />
                                          <span className="text-sm font-medium">{cat.categoryName}</span>
                                          <Badge variant="outline" className="text-[10px]">
                                            Weight {cat.categoryWeight}%
                                          </Badge>
                                        </div>
                                        <span
                                          className={`text-sm font-bold ${
                                            cat.categoryScore >= 1.0
                                              ? "text-emerald-600 dark:text-emerald-400"
                                              : cat.categoryScore >= 0.7
                                              ? "text-blue-600 dark:text-blue-400"
                                              : "text-red-600 dark:text-red-400"
                                          }`}
                                        >
                                          {fmtNum(cat.categoryScore * 100, 1)}%
                                        </span>
                                      </div>
                                      <div className="space-y-1 mt-2 pl-4 border-l-2 border-border/40">
                                        {cat.kpis.map((kpi: any, j: number) => (
                                          <div
                                            key={j}
                                            className="grid grid-cols-12 gap-2 text-xs py-1"
                                          >
                                            <div className="col-span-6 text-muted-foreground truncate">
                                              {kpi.description}
                                            </div>
                                            <div className="col-span-2 text-center font-mono">
                                              {fmtNum(kpi.target)} → {fmtNum(kpi.actual)}
                                            </div>
                                            <div className="col-span-2 text-center font-mono">
                                              ×{fmtNum(kpi.ratio, 2)}
                                            </div>
                                            <div
                                              className={`col-span-2 text-right font-semibold ${
                                                kpi.ratio >= 1
                                                  ? "text-emerald-600 dark:text-emerald-400"
                                                  : kpi.ratio >= 0.7
                                                  ? "text-blue-600 dark:text-blue-400"
                                                  : "text-red-600 dark:text-red-400"
                                              }`}
                                            >
                                              {fmtNum(kpi.ratio * 100, 0)}%
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TraceStep>
                            )}

                            {/* Step 4: Final formula */}
                            <TraceStep
                              step={4}
                              title="Final Bonus Calculation"
                              icon={<Calculator className="h-3.5 w-3.5" />}
                            >
                              <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
                                <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                                  <span className="px-2 py-1 rounded-md bg-background border border-border font-mono">
                                    {fmtNum(empCalc.gradePoints, 1)} pts
                                  </span>
                                  <span className="text-muted-foreground">×</span>
                                  <span className="px-2 py-1 rounded-md bg-background border border-border font-mono">
                                    {fmtGHS(calc.valuePerUnit)}
                                  </span>
                                  <span className="text-muted-foreground">×</span>
                                  <span className="px-2 py-1 rounded-md bg-background border border-border font-mono">
                                    {fmtNum(empCalc.performanceMultiplier, 3)}
                                  </span>
                                  <span className="text-muted-foreground">×</span>
                                  <span className="px-2 py-1 rounded-md bg-background border border-border font-mono">
                                    {fmtNum(empCalc.proration, 2)}
                                  </span>
                                  <span className="text-muted-foreground">×</span>
                                  <span className="px-2 py-1 rounded-md bg-background border border-border font-mono">
                                    {fmtNum(empCalc.salesMult, 2)}
                                  </span>
                                  <span className="text-muted-foreground">=</span>
                                  <span className="px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                    {fmtGHS(empCalc.bonus)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Final bonus = Grade Points × Value per Point × Performance
                                  Multiplier × Proration × Sales Multiplier
                                </div>
                              </div>
                            </TraceStep>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* Info footer */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300">
                How the Calculation Works
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-blue-800 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <Hash className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Grade Points</strong> come from the employee's job grade.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Percent className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Value per Point</strong> = Employee Pool ÷ Total Grade Points across all employees.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Performance Multiplier</strong> = weighted KPI achievement.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Proration</strong> and <strong>Sales Multiplier</strong> adjust for partial-year service and sales-specific roles.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ===== Helper: Trace Step Card =====
function TraceStep({
  step,
  title,
  icon,
  children,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
          {step}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
      </div>
      <div className="ml-8">{children}</div>
    </div>
  );
}

// ===== Helper: Trace Stat =====
function TraceStat({
  label,
  value,
  color,
  muted = false,
}: {
  label: string;
  value: string;
  color: "primary" | "success" | "warning" | "danger" | "info" | "purple";
  muted?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        muted
          ? "bg-muted/30 border-border/40 opacity-60"
          : `bg-${color}-500/5 border-${color}-500/20`
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-base font-bold mt-1 font-mono ${
          muted ? "text-muted-foreground" : `text-${color}-600 dark:text-${color}-400`
        }`}
      >
        {value}
      </div>
    </div>
  );
}