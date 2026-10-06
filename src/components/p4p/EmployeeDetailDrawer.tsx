import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useP4P } from "@/lib/p4p/store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fmtNum } from "@/lib/p4p/calc";
import { X, Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Employee } from "@/lib/p4p/types";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeDetailDrawer({ employee, onClose }: Props) {
  const { getMonthlyHistory } = useP4P();
  if (!employee) return null;
  if (typeof document === "undefined") return null;

  const history = getMonthlyHistory(employee.id);
  const latest = history[history.length - 1]?.performanceMultiplier ?? 0;
  const prev = history[history.length - 2]?.performanceMultiplier ?? null;
  const mom = prev !== null && prev !== 0 ? ((latest - prev) / prev) * 100 : null;
  const categories = employee.categories ?? [];

  const band =
    latest >= 1.2
      ? { label: "Exceptional", color: "text-purple-600 dark:text-purple-400" }
      : latest >= 1.0
      ? { label: "Exceeds", color: "text-emerald-600 dark:text-emerald-400" }
      : latest >= 0.8
      ? { label: "Meets", color: "text-blue-600 dark:text-blue-400" }
      : latest >= 0.6
      ? { label: "Needs Improvement", color: "text-amber-600 dark:text-amber-400" }
      : { label: "PIP", color: "text-red-600 dark:text-red-400" };

  return createPortal(
    <AnimatePresence>
      {employee && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-start justify-between p-5 border-b border-border/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate">{employee.name}</h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {employee.department} · {employee.role}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Current Score
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${band.color}`}>
                    {(latest * 100).toFixed(1)}%
                  </div>
                  <Badge variant="outline" className={`text-[10px] mt-1.5 ${band.color}`}>
                    {band.label}
                  </Badge>
                </Card>
                <Card className="p-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    MoM Change
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {mom !== null && mom > 0.5 && <TrendingUp className="h-4 w-4 text-emerald-600" />}
                    {mom !== null && mom < -0.5 && <TrendingDown className="h-4 w-4 text-red-600" />}
                    {mom === null && <Minus className="h-4 w-4 text-muted-foreground" />}
                    <span
                      className={`text-lg font-bold ${
                        mom !== null && mom > 0.5
                          ? "text-emerald-600 dark:text-emerald-400"
                          : mom !== null && mom < -0.5
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {mom !== null ? `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}%` : "—"}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1.5">
                    {history.length} month{history.length === 1 ? "" : "s"} tracked
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  KPIs ({categories.reduce((s, c) => s + c.kpis.length, 0)})
                </h3>
                {categories.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">No KPIs assigned yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <Card key={cat.id} className="overflow-hidden">
                        <div className="px-3 py-2 bg-muted/30 border-b border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{cat.name}</span>
                            <Badge variant="outline" className="text-[10px] h-5">
                              Weight {cat.weight}%
                            </Badge>
                          </div>
                        </div>
                        <div className="divide-y divide-border/50">
                          {cat.kpis.map((kpi) => {
                            const ratio = kpi.target > 0 ? (kpi.actual || 0) / kpi.target : 0;
                            const pct = ratio * 100;
                            const color =
                              pct >= 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : pct >= 70
                                ? "text-blue-600 dark:text-blue-400"
                                : pct >= 50
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400";
                            return (
                              <div key={kpi.id} className="p-3">
                                <div className="text-xs font-medium truncate">{kpi.description}</div>
                                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                                  <span className="text-muted-foreground">
                                    {fmtNum(kpi.actual || 0)} / {fmtNum(kpi.target)} {kpi.metric}
                                  </span>
                                  <span className={`font-bold ${color}`}>{pct.toFixed(1)}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}