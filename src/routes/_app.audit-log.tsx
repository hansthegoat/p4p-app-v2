import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useP4P } from "@/lib/p4p/store";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ChevronDown, ChevronUp, History, CheckCircle, Clock,
} from "lucide-react";
import type { KpiDiffItem } from "@/lib/p4p/types";

export const Route = createFileRoute("/_app/audit-log")({
  component: AuditLogPage,
});

type Filter = "all" | "unacknowledged" | "acknowledged";

function AuditLogPage() {
  const p4p = useP4P();
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const all = [...p4p.kpiUpdateRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const filtered = filter === "all" ? all : all.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Every KPI change HR has pushed — who sent it, who received it, and whether they've acknowledged."
        icon={<History className="h-6 w-6" />}
        actions={
          <div className="flex gap-1 p-1 rounded-lg bg-muted border border-border">
            {(["all", "unacknowledged", "acknowledged"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors capitalize ${
                  filter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<History className="h-6 w-6" />}
            title="No KPI changes yet"
            description="Push a template from the KPI Framework page to see history here."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const emp = p4p.employees.find((e) => e.id === req.employeeId);
            const isOpen = expanded === req.id;
            const scoreDelta = (req.afterScore - req.beforeScore) * 100;
            const scoreUp = scoreDelta > 0.05;
            const scoreDown = scoreDelta < -0.05;

            return (
              <Card key={req.id} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : req.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-accent/20 transition-colors text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      req.status === "acknowledged"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {req.status === "acknowledged" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium">
                        {req.pushedByName || "HR"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        updated
                      </span>
                      <span className="text-[13px] font-medium">
                        {emp?.name || "Unknown employee"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {req.department} / {req.role}
                      {" · "}
                      {new Date(req.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {req.diffs.length} change{req.diffs.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  {req.beforeScore > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold shrink-0">
                      <span className="text-muted-foreground">
                        {(req.beforeScore * 100).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span
                        className={
                          scoreUp
                            ? "text-emerald-600"
                            : scoreDown
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {(req.afterScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 shrink-0 ${
                      req.status === "acknowledged"
                        ? "border-emerald-500/40 text-emerald-600"
                        : "border-amber-500/40 text-amber-600"
                    }`}
                  >
                    {req.status === "acknowledged" ? "Acknowledged" : "Pending"}
                  </Badge>

                  <div className="shrink-0 text-muted-foreground">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-2">
                    {req.diffs.map((d: KpiDiffItem, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-md bg-muted/30 border border-border/40"
                      >
                        <div className="text-[11px] font-medium">
                          {labelForDiffKind(d.kind)}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {d.categoryName}
                          {d.kpiDescription && ` · ${d.kpiDescription}`}
                        </div>
                        {(d.before !== undefined || d.after !== undefined) && (
                          <div className="text-[11px] mt-1 flex items-center gap-2">
                            {d.before !== undefined && (
                              <span className="text-muted-foreground line-through">
                                {String(d.before)}
                              </span>
                            )}
                            {d.after !== undefined && (
                              <span className="font-semibold">
                                {String(d.after)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {req.employeeComment && (
                      <div className="mt-3 p-3 rounded-md bg-blue-500/5 border border-blue-500/20">
                        <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
                          Employee comment
                        </div>
                        <p className="text-[12px]">{req.employeeComment}</p>
                      </div>
                    )}

                    {req.acknowledgedAt && (
                      <div className="text-[10px] text-muted-foreground pt-1">
                        Acknowledged{" "}
                        {new Date(req.acknowledgedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function labelForDiffKind(kind: string): string {
  switch (kind) {
    case "category_added": return "New category";
    case "category_removed": return "Category removed";
    case "category_weight_changed": return "Category weight changed";
    case "category_name_changed": return "Category renamed";
    case "kpi_added": return "New KPI";
    case "kpi_removed": return "KPI removed";
    case "kpi_target_changed": return "Target changed";
    case "kpi_metric_changed": return "Metric changed";
    case "kpi_weight_changed": return "KPI weight changed";
    case "kpi_description_changed": return "KPI renamed";
    default: return kind;
  }
}
