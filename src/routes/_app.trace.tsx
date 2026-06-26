import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtGHSFull, fmtNum } from "@/lib/p4p/calc";
import { ChevronDown, ChevronRight, Download, Search, User, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Target, Award } from "lucide-react";

export const Route = createFileRoute("/_app/trace")({
  component: TracePage,
});

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30">
        <span className="font-semibold">{title}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="p-4 pt-0 border-t">{children}</div>}
    </Card>
  );
}

function exportCSV(rows: string[][], name: string) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

function TracePage() {
  const { globals, employees, grades, calc } = useP4P();
  const gradeMap = new Map(grades.map((g) => [g.code, g]));

  const adjuncts = employees.filter((e) => e.isAdjunct);
  const nonAdjuncts = employees.filter((e) => !e.isAdjunct);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return nonAdjuncts;
    const term = searchTerm.toLowerCase();
    return nonAdjuncts.filter(e => e.name.toLowerCase().includes(term));
  }, [searchTerm, nonAdjuncts]);

  const selectedEmployee = useMemo(() => {
    if (!selectedEmpId) return null;
    return employees.find(e => e.id === selectedEmpId);
  }, [selectedEmpId, employees]);

  const selectedResult = selectedEmpId ? calc.perEmployee[selectedEmpId] : null;

  // Helper: Calculate performance from categories
  const calculatePerformance = (categories: any[]) => {
    if (!categories || categories.length === 0) return null;

    const categoryScores: { name: string; score: number; weight: number; kpis: any[]; status: string }[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const category of categories) {
      if (!category.kpis || category.kpis.length === 0) continue;

      const kpiDetails = category.kpis.map((k: any) => {
        const target = Number(k.target);
        const actual = Number(k.actual);
        const ratio = target > 0 ? actual / target : 0;
        const achievement = ratio * 100;
        return {
          description: k.description,
          target,
          actual,
          ratio,
          achievement,
          metric: k.metric || '%',
          status: achievement >= 100 ? 'exceeded' : achievement >= 70 ? 'met' : achievement >= 50 ? 'partial' : 'missed'
        };
      });

      const categoryScore = kpiDetails.reduce((sum: number, k: any) => sum + k.ratio, 0) / (kpiDetails.length || 1);
      const categoryWeight = category.weight || 0;
      
      const achievement = categoryScore * 100;
      const status = achievement >= 100 ? 'exceeded' : achievement >= 70 ? 'met' : achievement >= 50 ? 'partial' : 'missed';
      
      categoryScores.push({
        name: category.name,
        score: categoryScore,
        weight: categoryWeight,
        kpis: kpiDetails,
        status
      });

      totalWeightedScore += categoryScore * (categoryWeight / 100);
      totalWeight += categoryWeight / 100;
    }

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 1;
    const overallAchievement = overallScore * 100;
    const needsPIP = overallScore < 0.5;

    return { categoryScores, overallScore, overallAchievement, needsPIP };
  };

  // Generate recommendations
  const getRecommendations = (employee: any, result: any, perfData: any) => {
    const recs: { type: 'success' | 'warning' | 'danger' | 'info'; message: string }[] = [];

    if (!perfData) {
      recs.push({
        type: 'info',
        message: 'No categories or KPIs defined. Add weighted categories to track performance.'
      });
      return recs;
    }

    // PIP check
    if (perfData.needsPIP) {
      recs.push({
        type: 'danger',
        message: `⚠️ PERFORMANCE IMPROVEMENT PLAN (PIP) REQUIRED: Overall performance below 50% (${fmtNum(perfData.overallAchievement, 1)}%). Immediate intervention needed.`
      });
    }

    // Category-level insights
    for (const cat of perfData.categoryScores) {
      const achievement = cat.score * 100;
      if (achievement < 50) {
        recs.push({
          type: 'danger',
          message: `🔴 ${cat.name}: Critical performance (${fmtNum(achievement, 1)}%). Immediate attention required.`
        });
      } else if (achievement < 70) {
        recs.push({
          type: 'warning',
          message: `🟡 ${cat.name}: Below target (${fmtNum(achievement, 1)}%). Needs improvement.`
        });
      } else if (achievement >= 100) {
        recs.push({
          type: 'success',
          message: `🟢 ${cat.name}: Excellent performance (${fmtNum(achievement, 1)}%). Exceeded targets!`
        });
      }
    }

    // KPI-level insights
    if (perfData.categoryScores) {
      for (const cat of perfData.categoryScores) {
        for (const kpi of cat.kpis) {
          if (kpi.achievement < 50 && kpi.target > 0) {
            recs.push({
              type: 'danger',
              message: `📉 ${kpi.description}: Critical miss (${fmtNum(kpi.achievement, 1)}% of ${fmtNum(kpi.target)} ${kpi.metric})`
            });
          } else if (kpi.achievement >= 120 && kpi.target > 0) {
            recs.push({
              type: 'success',
              message: `📈 ${kpi.description}: Outstanding (${fmtNum(kpi.achievement, 1)}% of target)`
            });
          }
        }
      }
    }

    // Bonus insight
    if (result && result.bonus > 0) {
      const avgBonus = calc.totalPool / (nonAdjuncts.length || 1);
      const bonusRatio = result.bonus / avgBonus;
      if (bonusRatio > 1.5) {
        recs.push({
          type: 'success',
          message: `💰 Bonus: ${fmtGHS(result.bonus)} (${fmtNum((bonusRatio - 1) * 100, 0)}% above average) - Well deserved!`
        });
      } else if (bonusRatio < 0.5 && result.bonus > 0) {
        recs.push({
          type: 'warning',
          message: `💰 Bonus: ${fmtGHS(result.bonus)} (${fmtNum((1 - bonusRatio) * 100, 0)}% below average) - Consider performance improvement.`
        });
      }
    }

    if (recs.length === 0) {
      recs.push({
        type: 'info',
        message: '✅ All KPIs on track. Continue current focus.'
      });
    }

    return recs;
  };

  // Legacy KPI recommendation (for backward compatibility)
  const getLegacyRecommendation = (kpis: { description: string; ratio: number }[]) => {
    const low = kpis.filter(k => k.ratio < 0.8);
    const high = kpis.filter(k => k.ratio > 1.2);
    if (high.length > 0) {
      return `🌟 Strong performance on: ${high.map(h => h.description).join(", ")}. Maintain this momentum!`;
    }
    if (low.length > 0) {
      return `⚠️ Areas needing improvement: ${low.map(l => l.description).join(", ")}. Consider additional training, resource support, or revised targets.`;
    }
    return "✅ Performance is on track. Continue current focus.";
  };

  const handleExport = () => {
    const rows: string[][] = [["Section", "Field", "Value"]];
    rows.push(["Global", "Total Revenue", String(globals.totalRevenue)]);
    rows.push(["Global", "P4P %", String(globals.p4pPercent)]);
    rows.push(["Global", "Total Pool", String(calc.totalPool)]);
    rows.push(["Global", "Adjunct %", String(globals.adjunctPercent)]);
    rows.push(["Global", "Adjunct Pool", String(calc.adjunctPool)]);
    rows.push(["Global", "Employee Pool", String(calc.employeePool)]);
    rows.push(["Global", "Sum of Weights", String(calc.sumWeights)]);
    rows.push(["Global", "Value per Weight Unit", String(calc.valuePerUnit)]);
    rows.push([]);
    rows.push(["Employee", "Name", "Grade", "Points", "Multiplier", "Proration", "SalesMult", "Weight", "Bonus", "PIP"]);
    for (const e of nonAdjuncts) {
      const r = calc.perEmployee[e.id];
      if (!r) continue;
      const needsPIP = r.needsPIP ? "YES" : "NO";
      rows.push(["Employee", e.name, e.jobGrade, String(r.gradePoints), String(r.performanceMultiplier),
        String(r.proration), String(r.salesMult), String(r.weight), String(r.bonus), needsPIP]);
    }
    rows.push([]);
    rows.push(["Adjunct", "Name", "Bonus"]);
    for (const a of adjuncts) rows.push(["Adjunct", a.name, String(calc.perAdjunctBonus)]);
    exportCSV(rows, "p4p_calculation_log.csv");
  };

  const stat = (l: string, v: string, fullV?: string) => (
    <div className="flex justify-between py-1.5 text-sm border-b last:border-0 gap-4">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-mono whitespace-nowrap" title={fullV}>{v}</span>
    </div>
  );

  const perfData = selectedEmployee?.categories ? calculatePerformance(selectedEmployee.categories) : null;
  const recommendations = selectedEmployee && selectedResult ? getRecommendations(selectedEmployee, selectedResult, perfData) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calculation Trace</h1>
          <p className="text-muted-foreground text-sm mt-1">Step-by-step breakdown of the bonus computation with weighted category details.</p>
        </div>
        <Button onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export Log</Button>
      </div>

      {/* Employee Search & Detailed View */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">Employee Performance Insights</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedEmpId(null);
            }}
            className="pl-8"
          />
        </div>

        {searchTerm && filteredEmployees.length > 0 && (
          <div className="border rounded-md divide-y max-h-60 overflow-auto">
            {filteredEmployees.map((emp) => {
              const r = calc.perEmployee[emp.id];
              const needsPIP = r?.needsPIP;
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`w-full text-left p-2 hover:bg-muted/50 flex items-center gap-2 ${selectedEmpId === emp.id ? "bg-primary/10" : ""}`}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{emp.name}</span>
                  {needsPIP && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold animate-pulse">
                      ⚠️ PIP
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{gradeMap.get(emp.jobGrade)?.name || emp.jobGrade}</span>
                </button>
              );
            })}
          </div>
        )}
        {searchTerm && filteredEmployees.length === 0 && (
          <p className="text-sm text-muted-foreground">No employees match your search.</p>
        )}

        {/* Selected employee details */}
        {selectedEmployee && selectedResult && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedEmployee.name}</h3>
                <p className="text-sm text-muted-foreground">{gradeMap.get(selectedEmployee.jobGrade)?.name || selectedEmployee.jobGrade}</p>
              </div>
              {perfData?.needsPIP && (
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> PIP REQUIRED
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p><span className="font-medium">Grade points:</span> {selectedResult.gradePoints}</p>
                <p><span className="font-medium">Performance multiplier:</span> {fmtNum(selectedResult.performanceMultiplier, 3)}</p>
                <p><span className="font-medium">Pro‑ration factor:</span> {selectedResult.proration}</p>
                <p><span className="font-medium">Sales multiplier:</span> {selectedResult.salesMult}</p>
                <p><span className="font-medium">Weight:</span> {fmtNum(selectedResult.weight, 4)}</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-medium">Calculation:</span></p>
                <p className="text-xs text-muted-foreground break-words">
                  Weight = {selectedResult.gradePoints} × {fmtNum(selectedResult.performanceMultiplier, 3)} × {selectedResult.proration} × {selectedResult.salesMult} = {fmtNum(selectedResult.weight, 4)}
                </p>
                <p><span className="font-medium">Final bonus:</span> {fmtGHS(selectedResult.bonus)}</p>
                <p className="text-xs text-muted-foreground">
                  = Value per point × Weight = {fmtGHS(calc.valuePerUnit)} × {fmtNum(selectedResult.weight, 4)}
                </p>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN */}
            {perfData && perfData.categoryScores.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" /> Weighted Category Performance
                </p>
                <div className="space-y-3">
                  {perfData.categoryScores.map((cat, idx) => (
                    <div key={idx} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-medium">{cat.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">(Weight: {cat.weight}%)</span>
                        </div>
                        <div className={`text-sm font-semibold ${
                          cat.status === 'exceeded' ? 'text-green-600' : 
                          cat.status === 'met' ? 'text-blue-600' : 
                          cat.status === 'partial' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {fmtNum(cat.score * 100, 1)}%
                        </div>
                      </div>
                      <Progress value={Math.min(100, cat.score * 100)} className="h-2" />
                      <div className="mt-2 grid grid-cols-1 gap-1">
                        {cat.kpis.map((kpi, kIdx) => (
                          <div key={kIdx} className="grid grid-cols-5 gap-2 text-xs border-b border-muted pb-1 last:border-0">
                            <div className="col-span-2">{kpi.description}</div>
                            <div>Target: {fmtNum(kpi.target)} {kpi.metric}</div>
                            <div>Actual: {fmtNum(kpi.actual)} {kpi.metric}</div>
                            <div className={`font-semibold ${
                              kpi.achievement >= 100 ? 'text-green-600' : 
                              kpi.achievement >= 70 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {fmtNum(kpi.achievement, 1)}%
                              {kpi.achievement >= 100 && <CheckCircle className="h-3 w-3 inline ml-1" />}
                              {kpi.achievement < 50 && <AlertCircle className="h-3 w-3 inline ml-1" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Overall Score */}
                  <div className={`p-3 rounded-lg ${
                    perfData.needsPIP ? 'bg-red-50 border border-red-200' :
                    perfData.overallAchievement >= 100 ? 'bg-green-50 border border-green-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Performance Score</span>
                      <span className={`text-lg font-bold ${
                        perfData.needsPIP ? 'text-red-600' :
                        perfData.overallAchievement >= 100 ? 'text-green-600' :
                        'text-yellow-600'
                      }`}>
                        {fmtNum(perfData.overallAchievement, 1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(100, perfData.overallAchievement)} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            )}

            {/* LEGACY KPI BREAKDOWN (fallback) */}
            {(!perfData || perfData.categoryScores.length === 0) && selectedEmployee.kpis.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">KPI Performance Details (Legacy Mode)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border rounded-md">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">Metric</th>
                        <th className="p-2 text-right">Target</th>
                        <th className="p-2 text-right">Actual</th>
                        <th className="p-2 text-right">Ratio</th>
                        <th className="p-2 text-left">Insight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployee.kpis.map((kpi, idx) => {
                        const ratio = kpi.target > 0 ? kpi.actual / kpi.target : 0;
                        let insight = "";
                        if (ratio >= 1.2) insight = "✅ Excellent – exceeded";
                        else if (ratio >= 1.0) insight = "✔ Met target";
                        else if (ratio >= 0.8) insight = "⚠️ Slightly below";
                        else insight = "❌ Needs improvement";
                        return (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{kpi.description}</td>
                            <td className="p-2">{kpi.metric}</td>
                            <td className="p-2 text-right">{fmtNum(kpi.target)}</td>
                            <td className="p-2 text-right">{fmtNum(kpi.actual)}</td>
                            <td className="p-2 text-right font-mono">{fmtNum(ratio, 3)}</td>
                            <td className="p-2 text-xs text-muted-foreground">{insight}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-secondary/30 rounded-md">
                  <p className="font-medium text-sm">💡 Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    {getLegacyRecommendation(selectedEmployee.kpis.map(k => ({
                      description: k.description,
                      ratio: k.target > 0 ? k.actual / k.target : 0
                    })))}
                  </p>
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" /> Recommendations & Insights
                </p>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border ${
                        rec.type === 'success' ? 'border-green-200 bg-green-50' :
                        rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        rec.type === 'danger' ? 'border-red-200 bg-red-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {rec.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />}
                        {rec.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />}
                        {rec.type === 'danger' && <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
                        {rec.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                        <span className={`text-sm ${
                          rec.type === 'success' ? 'text-green-800' :
                          rec.type === 'warning' ? 'text-yellow-800' :
                          rec.type === 'danger' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          {rec.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {!selectedEmpId && searchTerm && filteredEmployees.length > 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">Click on an employee above to see details.</p>
        )}
        {!searchTerm && !selectedEmpId && (
          <p className="text-sm text-muted-foreground text-center py-2">Start typing an employee name to search.</p>
        )}
      </Card>

      <Section title="Global Calculation">
        {stat("Total Revenue", fmtGHS(globals.totalRevenue), fmtGHSFull(globals.totalRevenue))}
        {stat("P4P %", `${globals.p4pPercent}%`)}
        {stat("Total P4P Pool = Revenue × P4P%", fmtGHS(calc.totalPool), fmtGHSFull(calc.totalPool))}
        {stat("Adjunct %", `${globals.adjunctPercent}%`)}
        {stat("Adjunct Pool = Total × Adjunct%", fmtGHS(calc.adjunctPool), fmtGHSFull(calc.adjunctPool))}
        {stat("Employee Pool = Total × (1 − Adjunct%)", fmtGHS(calc.employeePool), fmtGHSFull(calc.employeePool))}
        {stat("Sum of Weights (non-adjuncts)", fmtNum(calc.sumWeights, 4))}
        {stat("Value per Weight Unit = Pool / Sum", fmtGHS(calc.valuePerUnit), fmtGHSFull(calc.valuePerUnit))}
        <div className="mt-3 p-3 bg-muted/30 rounded-md text-xs">
          <p className="font-medium text-muted-foreground">💡 How it works:</p>
          <p className="mt-1 text-muted-foreground">
            For each employee: <strong>Weight = Grade Points × Performance Multiplier × Proration × Sales Multiplier</strong>
          </p>
          <p className="text-muted-foreground">
            Then: <strong>Bonus = (Employee Pool / Sum of all Weights) × Employee's Weight</strong>
          </p>
        </div>
      </Section>

      <Section title={`Non-Adjunct Employees (${nonAdjuncts.length})`}>
        <div className="space-y-3">
          {nonAdjuncts.map((e) => {
            const r = calc.perEmployee[e.id];
            if (!r) return null;
            const needsPIP = r.needsPIP;
            const hasCategories = e.categories && e.categories.length > 0;
            
            return (
              <div key={e.id} className={`p-3 border rounded-md ${needsPIP ? 'border-red-300 bg-red-50/50' : 'bg-muted/20'}`}>
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {e.name} 
                    <span className="text-xs text-muted-foreground ml-2">({gradeMap.get(e.jobGrade)?.name || e.jobGrade})</span>
                    {needsPIP && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold animate-pulse">
                        ⚠️ PIP
                      </span>
                    )}
                    {hasCategories && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Categories
                      </span>
                    )}
                  </div>
                  <div className="font-bold whitespace-nowrap" title={fmtGHSFull(r.bonus)}>{fmtGHS(r.bonus)}</div>
                </div>
                <div className="text-xs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div><span className="text-muted-foreground">Grade Pts:</span> {r.gradePoints}</div>
                  <div><span className="text-muted-foreground">Multiplier:</span> {fmtNum(r.performanceMultiplier, 3)}</div>
                  <div><span className="text-muted-foreground">Proration:</span> {fmtNum(r.proration, 3)}</div>
                  <div><span className="text-muted-foreground">Sales:</span> ×{r.salesMult}</div>
                  <div className="col-span-2 sm:col-span-4 break-words">
                    <span className="text-muted-foreground">Weight:</span> {r.gradePoints} × {fmtNum(r.performanceMultiplier, 3)} × {fmtNum(r.proration, 2)} × {r.salesMult} = <span className="font-mono">{fmtNum(r.weight, 4)}</span>
                  </div>
                </div>
                
                {/* Show category breakdown if available */}
                {hasCategories && r.categoryBreakdown && r.categoryBreakdown.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Categories: </span>
                    {r.categoryBreakdown.map((cat, i) => (
                      <span key={i} className="text-xs mr-3">
                        {cat.categoryName} ({fmtNum(cat.categoryScore * 100, 0)}%)
                      </span>
                    ))}
                  </div>
                )}
                
                {r.kpiBreakdown.length > 0 && (
                  <div className="text-xs mt-2 pt-2 border-t">
                    <span className="text-muted-foreground">KPIs: </span>
                    {r.kpiBreakdown.map((k, i) => (
                      <span key={i} className="mr-3">{k.description} ({fmtNum(k.ratio, 2)} ratio)</span>
                    ))}
                  </div>
                )}
                
                {needsPIP && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ Performance below 50% - PIP required
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={`Adjuncts (${adjuncts.length})`}>
        {adjuncts.length === 0 && <p className="text-sm text-muted-foreground">No adjuncts.</p>}
        <div className="space-y-2">
          {adjuncts.map((a) => (
            <div key={a.id} className="flex justify-between p-3 border rounded-md">
              <span>{a.name}</span>
              <span className="font-mono font-semibold whitespace-nowrap" title={fmtGHSFull(calc.perAdjunctBonus)}>{fmtGHS(calc.perAdjunctBonus)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}