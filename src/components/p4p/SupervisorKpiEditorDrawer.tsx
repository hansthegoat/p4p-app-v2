import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import {
  X, Save, Trash2, Plus, AlertTriangle, Layers, FolderPlus, GripVertical,
} from "lucide-react";
import type { Employee, Category, KPI } from "@/lib/p4p/types";
import { newId } from "@/lib/p4p/defaults";

const METRICS = ["%", "GHS", "$", "#", "ROI", "days", "hrs"];

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SupervisorKpiEditorDrawer({ employee, onClose, onSaved }: Props) {
  const { supervisorUpdateEmployeeKpis } = useP4P();
  const [draft, setDraft] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [justifyOpen, setJustifyOpen] = useState(false);
  const [justification, setJustification] = useState("");

  useEffect(() => {
    if (employee) {
      setDraft(JSON.parse(JSON.stringify(employee.categories || [])));
      setJustification("");
      setJustifyOpen(false);
    }
  }, [employee?.id]);

  const totalWeight = useMemo(
    () => draft.reduce((s, c) => s + (c.weight || 0), 0),
    [draft]
  );

  const hasChanges = useMemo(() => {
    if (!employee) return false;
    return JSON.stringify(draft) !== JSON.stringify(employee.categories || []);
  }, [draft, employee]);

  if (!employee) return null;

  const canSave = hasChanges && totalWeight === 100;

  const updateCategory = (catId: string, updates: Partial<Category>) => {
    setDraft((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updates } : c))
    );
  };

  const updateKpi = (catId: string, kpiId: string, updates: Partial<KPI>) => {
    setDraft((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              kpis: c.kpis.map((k) => (k.id === kpiId ? { ...k, ...updates } : k)),
            }
          : c
      )
    );
  };

  const addCategory = () => {
    setDraft((prev) => [
      ...prev,
      { id: newId(), name: "New Category", weight: 0, kpis: [] },
    ]);
  };

  const removeCategory = (catId: string) => {
    if (!confirm("Remove this category and all its KPIs?")) return;
    setDraft((prev) => prev.filter((c) => c.id !== catId));
  };

  const addKpi = (catId: string) => {
    setDraft((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              kpis: [
                ...c.kpis,
                {
                  id: newId(),
                  description: "New KPI",
                  metric: "%",
                  target: 0,
                  actual: 0,
                  weight: 0,
                },
              ],
            }
          : c
      )
    );
  };

  const removeKpi = (catId: string, kpiId: string) => {
    setDraft((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, kpis: c.kpis.filter((k) => k.id !== kpiId) }
          : c
      )
    );
  };

  const handleSaveClick = () => {
    if (!canSave) {
      if (totalWeight !== 100) {
        showToast.error("Invalid weights", `Category weights must sum to 100%. Currently ${totalWeight}%.`);
      }
      return;
    }
    setJustifyOpen(true);
  };

  const confirmSave = async () => {
    if (!justification.trim()) {
      showToast.warning("Justification required", "Please explain why you're making these changes.");
      return;
    }
    setSaving(true);
    try {
      await supervisorUpdateEmployeeKpis(employee.id, draft, justification.trim());
      showToast.success("KPIs updated", `${employee.name}'s KPIs have been saved.`);
      onSaved();
      onClose();
    } catch (err: any) {
      showToast.error("Could not save", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
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
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-3xl bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border/60">
              <div className="min-w-0">
                <h2 className="text-base font-semibold">Edit KPIs</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {employee.name} · {employee.department} · {employee.role}
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Weight banner */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  totalWeight === 100
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                }`}
              >
                <div className="text-xs font-semibold">
                  Category weights: <span className="font-mono">{totalWeight}%</span>
                </div>
                {totalWeight !== 100 && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    {totalWeight > 100 ? "Reduce by" : "Add"} {Math.abs(100 - totalWeight)}%
                  </div>
                )}
              </div>

              {/* Category list */}
              {draft.map((cat, idx) => (
                <div key={cat.id} className="rounded-lg border border-border overflow-hidden">
                  <div className="p-3 bg-muted/30 border-b border-border/50">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 flex items-center gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div className="col-span-7">
                        <Input
                          value={cat.name}
                          onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                          className="h-8 text-xs"
                          placeholder="Category name"
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <Input
                            type="number"
                            value={cat.weight}
                            onChange={(e) =>
                              updateCategory(cat.id, { weight: Number(e.target.value) })
                            }
                            className="h-8 text-xs font-mono pr-7"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeCategory(cat.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* KPI list */}
                  <div className="divide-y divide-border/50">
                    {cat.kpis.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No KPIs yet
                      </div>
                    ) : (
                      cat.kpis.map((kpi) => (
                        <div key={kpi.id} className="p-3 grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-5">
                            <AutoGrowTextarea
                              value={kpi.description}
                              onChange={(e) =>
                                updateKpi(cat.id, kpi.id, { description: e.target.value })
                              }
                              minRows={1}
                              maxRows={3}
                              className="text-xs"
                            />
                          </div>
                          <div className="col-span-2">
                            <select
                              value={kpi.metric}
                              onChange={(e) =>
                                updateKpi(cat.id, kpi.id, { metric: e.target.value })
                              }
                              className="h-8 w-full text-xs rounded-md border border-input bg-background px-2 font-mono"
                            >
                              {METRICS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={kpi.target}
                              onChange={(e) =>
                                updateKpi(cat.id, kpi.id, { target: Number(e.target.value) })
                              }
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              value={kpi.weight || 0}
                              onChange={(e) =>
                                updateKpi(cat.id, kpi.id, { weight: Number(e.target.value) })
                              }
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button
                              onClick={() => removeKpi(cat.id, kpi.id)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="p-2 bg-muted/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addKpi(cat.id)}
                        className="gap-1.5 text-xs h-7"
                      >
                        <Plus className="h-3 w-3" /> Add KPI
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addCategory}
                className="w-full gap-2 h-9"
              >
                <FolderPlus className="h-4 w-4" /> Add Category
              </Button>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border/60">
              {justifyOpen ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-blue-800 dark:text-blue-300">
                      Justification is required — the employee and HR will see it.
                    </div>
                  </div>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Why are you making these changes? (required)"
                    rows={3}
                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setJustifyOpen(false)}
                      disabled={saving}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={confirmSave}
                      disabled={saving || !justification.trim()}
                      className="flex-1 gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save & notify
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveClick}
                    disabled={!hasChanges}
                    className="flex-1 gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    Save changes
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}