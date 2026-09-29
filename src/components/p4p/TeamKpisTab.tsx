import { useMemo } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Edit3, Target, Layers } from "lucide-react";
import type { Employee } from "@/lib/p4p/types";
import { employeeNeedsKpis } from "@/lib/p4p/types";

interface Props {
  reports: Employee[];
  onEdit: (emp: Employee) => void;
}

export function TeamKpisTab({ reports, onEdit }: Props) {
  const { getMonthlyHistory } = useP4P();

  const rows = useMemo(() => {
    return reports.map((rep) => {
      const categories = rep.categories ?? [];
      const kpiCount = categories.reduce((s, c) => s + c.kpis.length, 0);
      const catCount = categories.length;
      return { employee: rep, kpiCount, catCount, latest, needsSetup: employeeNeedsKpis(rep) };
    });
  }, [reports, getMonthlyHistory]);

  if (reports.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No direct reports"
          description="You don't have anyone assigned to you yet."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Direct reports' KPIs</h3>
          <p className="text-xs text-muted-foreground">
            Click Edit to modify any employee's KPI structure. Changes apply immediately with your justification.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(({ employee, kpiCount, catCount, latest, needsSetup }) => (
          <Card key={employee.id} className="p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm">{employee.name}</span>
                    {needsSetup && (
                      <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                        Needs KPIs
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {employee.department} · {employee.role}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Layers className="h-3 w-3" />
                      {catCount} cat
                    </span>
                    <span className="text-border/60">·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      {kpiCount} KPIs
                    </span>
                    {latest > 0 && (
                      <>
                        <span className="text-border/60">·</span>
                        <span className="text-muted-foreground">
                          Current: <strong className="text-foreground">{(latest * 100).toFixed(1)}%</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={needsSetup ? "default" : "outline"}
                onClick={() => onEdit(employee)}
                className="gap-1.5 shrink-0"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {needsSetup ? "Set KPIs" : "Edit KPIs"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}