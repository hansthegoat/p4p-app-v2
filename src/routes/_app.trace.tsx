import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { ChevronDown, ChevronRight, Download, Search, User } from "lucide-react";

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

  // State for search and selected employee
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  // Filter employees by search term
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

  // Generate recommendation based on KPI ratios
  const getRecommendation = (kpis: { description: string; ratio: number }[]) => {
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
    rows.push(["Employee", "Name", "Grade", "Points", "Multiplier", "Proration", "SalesMult", "Weight", "Bonus"]);
    for (const e of nonAdjuncts) {
      const r = calc.perEmployee[e.id];
      if (!r) continue;
      rows.push(["Employee", e.name, e.jobGrade, String(r.gradePoints), String(r.performanceMultiplier),
        String(r.proration), String(r.salesMult), String(r.weight), String(r.bonus)]);
    }
    rows.push([]);
    rows.push(["Adjunct", "Name", "Bonus"]);
    for (const a of adjuncts) rows.push(["Adjunct", a.name, String(calc.perAdjunctBonus)]);
    exportCSV(rows, "p4p_calculation_log.csv");
  };

  const stat = (l: string, v: string) => (
    <div className="flex justify-between py-1 text-sm border-b last:border-0">
      <span className="text-muted-foreground">{l}</span><span className="font-mono">{v}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calculation Trace</h1>
          <p className="text-muted-foreground text-sm mt-1">Step-by-step breakdown of the bonus computation.</p>
        </div>
        <Button onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export Log</Button>
      </div>

      {/* Employee Search & Detailed View */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold text-lg">🔍 Employee Performance Insights</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedEmpId(null); // clear selected when search changes
            }}
            className="pl-8"
          />
        </div>

        {/* Search results list */}
        {searchTerm && filteredEmployees.length > 0 && (
          <div className="border rounded-md divide-y max-h-60 overflow-auto">
            {filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`w-full text-left p-2 hover:bg-muted/50 flex items-center gap-2 ${selectedEmpId === emp.id ? "bg-primary/10" : ""}`}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{emp.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{gradeMap.get(emp.jobGrade)?.name || emp.jobGrade}</span>
              </button>
            ))}
          </div>
        )}
        {searchTerm && filteredEmployees.length === 0 && (
          <p className="text-sm text-muted-foreground">No employees match your search.</p>
        )}

        {/* Selected employee details */}
        {selectedEmployee && selectedResult && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedEmployee.name}</h3>
              <p className="text-sm text-muted-foreground">{gradeMap.get(selectedEmployee.jobGrade)?.name || selectedEmployee.jobGrade}</p>
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

            {/* KPI Breakdown with Insights */}
            {selectedEmployee.kpis.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">📊 KPI Performance Details</p>
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
                    {getRecommendation(selectedEmployee.kpis.map(k => ({
                      description: k.description,
                      ratio: k.target > 0 ? k.actual / k.target : 0
                    })))}
                  </p>
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
        {stat("Total Revenue", fmtGHS(globals.totalRevenue))}
        {stat("P4P %", `${globals.p4pPercent}%`)}
        {stat("Total P4P Pool = Revenue × P4P%", fmtGHS(calc.totalPool))}
        {stat("Adjunct %", `${globals.adjunctPercent}%`)}
        {stat("Adjunct Pool = Total × Adjunct%", fmtGHS(calc.adjunctPool))}
        {stat("Employee Pool = Total × (1 − Adjunct%)", fmtGHS(calc.employeePool))}
        {stat("Sum of Weights (non-adjuncts)", fmtNum(calc.sumWeights, 4))}
        {stat("Value per Weight Unit = Pool / Sum", fmtGHS(calc.valuePerUnit))}
      </Section>

      <Section title={`Non-Adjunct Employees (${nonAdjuncts.length})`}>
        <div className="space-y-3">
          {nonAdjuncts.map((e) => {
            const r = calc.perEmployee[e.id];
            if (!r) return null;
            return (
              <div key={e.id} className="p-3 border rounded-md bg-muted/20">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{e.name} <span className="text-xs text-muted-foreground">({gradeMap.get(e.jobGrade)?.name || e.jobGrade})</span></div>
                  <div className="font-bold">{fmtGHS(r.bonus)}</div>
                </div>
                <div className="text-xs mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><span className="text-muted-foreground">Grade Pts:</span> {r.gradePoints}</div>
                  <div><span className="text-muted-foreground">Multiplier:</span> {fmtNum(r.performanceMultiplier, 3)}</div>
                  <div><span className="text-muted-foreground">Proration:</span> {fmtNum(r.proration, 3)}</div>
                  <div><span className="text-muted-foreground">Sales:</span> ×{r.salesMult}</div>
                  <div className="col-span-2 md:col-span-4">
                    <span className="text-muted-foreground">Weight:</span> {r.gradePoints} × {fmtNum(r.performanceMultiplier, 3)} × {fmtNum(r.proration, 2)} × {r.salesMult} = <span className="font-mono">{fmtNum(r.weight, 4)}</span>
                  </div>
                </div>
                {r.kpiBreakdown.length > 0 && (
                  <div className="text-xs mt-2 pt-2 border-t">
                    <span className="text-muted-foreground">KPIs: </span>
                    {r.kpiBreakdown.map((k, i) => (
                      <span key={i} className="mr-3">{k.description} ({fmtNum(k.ratio, 2)} ratio)</span>
                    ))}
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
              <span className="font-mono font-semibold">{fmtGHS(calc.perAdjunctBonus)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}