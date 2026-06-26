import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X, FolderPlus, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useP4P } from "@/lib/p4p/store";
import type { Employee, KPI, Category } from "@/lib/p4p/types";
import { newId } from "@/lib/p4p/defaults";

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

function blank(): Employee {
  return {
    id: newId(),
    name: "",
    jobGrade: "4",
    isAdjunct: false,
    isSalesRole: false,
    joinDate: new Date().toISOString().slice(0, 10),
    monthsWorked: 12,
    kpis: [],
    categories: [],
  };
}

export function EmployeeModal({ open, onClose, employee }: Props) {
  const { grades, globals, upsertEmployee } = useP4P();
  const [data, setData] = useState<Employee>(blank());

  useEffect(() => {
    if (open) {
      const emp = employee ? JSON.parse(JSON.stringify(employee)) : blank();
      if (!emp.categories) emp.categories = [];
      setData(emp);
    }
  }, [open, employee]);

  const setField = <K extends keyof Employee>(k: K, v: Employee[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  // Calculate total weight and remaining
  const getWeightStats = (categories: Category[]) => {
    const total = categories.reduce((sum, c) => sum + c.weight, 0);
    const remaining = Math.max(0, 100 - total);
    return { total, remaining, isOver: total > 100, isComplete: total === 100 };
  };

  // Category functions
  const addCategory = () => {
    const newCategory: Category = {
      id: newId(),
      name: `Category ${(data.categories || []).length + 1}`,
      weight: 0,
      kpis: [],
    };
    setData((d) => ({
      ...d,
      categories: [...(d.categories || []), newCategory],
    }));
  };

  const removeCategory = (categoryId: string) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).filter((c) => c.id !== categoryId),
    }));
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map((c) =>
        c.id === categoryId ? { ...c, ...updates } : c
      ),
    }));
  };

  // KPI functions inside categories
  const addKPI = (categoryId: string) => {
    const newKPI: KPI = {
      id: newId(),
      description: "New KPI",
      metric: "%",
      target: 0,
      actual: 0,
      weight: 1,
    };
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map((c) =>
        c.id === categoryId ? { ...c, kpis: [...c.kpis, newKPI] } : c
      ),
    }));
  };

  const removeKPI = (categoryId: string, kpiId: string) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map((c) =>
        c.id === categoryId
          ? { ...c, kpis: c.kpis.filter((k) => k.id !== kpiId) }
          : c
      ),
    }));
  };

  const updateKPI = (categoryId: string, kpiId: string, updates: Partial<KPI>) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map((c) =>
        c.id === categoryId
          ? {
              ...c,
              kpis: c.kpis.map((k) => (k.id === kpiId ? { ...k, ...updates } : k)),
            }
          : c
      ),
    }));
  };

  // Legacy KPI functions
  const addLegacyKpi = () =>
    setData((d) => ({
      ...d,
      kpis: [
        ...d.kpis,
        { id: newId(), description: "", metric: "%", target: 0, actual: 0, weight: 1 },
      ],
    }));

  const updLegacyKpi = (id: string, patch: Partial<KPI>) =>
    setData((d) => ({
      ...d,
      kpis: d.kpis.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    }));

  const rmLegacyKpi = (id: string) =>
    setData((d) => ({
      ...d,
      kpis: d.kpis.filter((k) => k.id !== id),
    }));

  const save = () => {
    if (!data.name.trim()) return;
    
    const categories = data.categories || [];
    const stats = getWeightStats(categories);
    
    // Prevent saving if weights don't sum to 100%
    if (categories.length > 0 && !stats.isComplete) {
      alert(`Category weights must sum to 100%. Currently: ${stats.total}%. Please adjust.`);
      return;
    }
    
    upsertEmployee({
      ...data,
      monthsWorked: Number(data.monthsWorked) || 0,
      kpis: data.isAdjunct ? [] : data.kpis,
      categories: data.isAdjunct ? [] : categories,
    });
    onClose();
  };

  const hasCategories = (data.categories || []).length > 0;
  const hasLegacyKPIs = data.kpis.length > 0;
  const weightStats = getWeightStats(data.categories || []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[650px] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10">
              <h2 className="text-lg font-semibold">
                {employee ? "Edit" : "Add"} Employee
              </h2>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Basic Info */}
              <div>
                <Label>Name</Label>
                <Input
                  value={data.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div>
                <Label>Job Grade</Label>
                <Select
                  value={data.jobGrade}
                  onValueChange={(v) => setField("jobGrade", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.code} — {g.name} ({g.points})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={data.isAdjunct}
                    onCheckedChange={(v) => setField("isAdjunct", !!v)}
                  />
                  Is Adjunct?
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={data.isSalesRole}
                    onCheckedChange={(v) => setField("isSalesRole", !!v)}
                  />
                  Is Sales Role?
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Join Date</Label>
                  <Input
                    type="date"
                    value={data.joinDate}
                    onChange={(e) => setField("joinDate", e.target.value)}
                  />
                </div>
                {globals.prorationOn && (
                  <div>
                    <Label>Months Worked</Label>
                    <Input
                      type="number"
                      min={0}
                      max={12}
                      value={data.monthsWorked}
                      onChange={(e) => setField("monthsWorked", Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {/* Weighted Categories */}
              {!data.isAdjunct && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Weighted Categories</h3>
                    <Button size="sm" variant="outline" onClick={addCategory}>
                      <FolderPlus className="h-4 w-4 mr-1" /> Add Category
                    </Button>
                  </div>

                  {/* Weight Status Banner */}
                  {hasCategories && (
                    <div className={`rounded-md p-3 mb-3 text-sm flex items-center gap-2 ${
                      weightStats.isOver 
                        ? 'bg-red-50 border border-red-200 text-red-700' 
                        : weightStats.isComplete
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {weightStats.isOver ? (
                          <strong>⚠️ Over 100%!</strong>
                        ) : weightStats.isComplete ? (
                          <strong>✅ Perfect!</strong>
                        ) : (
                          <strong>📊 Assign weights</strong>
                        )}
                        {' '}
                        Total: <strong>{weightStats.total}%</strong>
                        {!weightStats.isOver && !weightStats.isComplete && (
                          <> · Remaining: <strong>{weightStats.remaining}%</strong></>
                        )}
                        {weightStats.isOver && (
                          <> · Reduce by <strong>{Math.abs(weightStats.remaining)}%</strong></>
                        )}
                      </span>
                    </div>
                  )}

                  {hasCategories ? (
                    <div className="space-y-4">
                      {(data.categories || []).map((category) => (
                        <Card key={category.id} className="p-4 border">
                          <div className="flex gap-3 mb-3">
                            <Input
                              value={category.name}
                              onChange={(e) =>
                                updateCategory(category.id, { name: e.target.value })
                              }
                              placeholder="Category name"
                              className="flex-1"
                            />
                            <div className="relative w-24">
                              <Input
                                type="number"
                                value={category.weight}
                                onChange={(e) => {
                                  const newWeight = Number(e.target.value);
                                  // Don't allow negative numbers
                                  if (newWeight < 0) return;
                                  
                                  // Check if this would exceed 100% total
                                  const otherCategories = (data.categories || []).filter(c => c.id !== category.id);
                                  const otherTotal = otherCategories.reduce((sum, c) => sum + c.weight, 0);
                                  const maxAllowed = 100 - otherTotal;
                                  
                                  if (newWeight <= maxAllowed) {
                                    updateCategory(category.id, { weight: newWeight });
                                  } else {
                                    alert(`Cannot set weight to ${newWeight}%. Only ${maxAllowed}% remaining.`);
                                  }
                                }}
                                placeholder="Weight %"
                                className="pr-6"
                                min={0}
                                max={100}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                %
                              </span>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {category.kpis.length} KPI(s) - All equally weighted
                          </div>

                          <div className="pl-4 space-y-2">
                            <div className="grid grid-cols-10 gap-2 text-xs font-medium text-muted-foreground">
                              <div className="col-span-4">KPI Description</div>
                              <div className="col-span-2">Metric</div>
                              <div className="col-span-2">Target</div>
                              <div className="col-span-2">Actual</div>
                            </div>

                            {category.kpis.map((kpi) => (
                              <div key={kpi.id} className="grid grid-cols-10 gap-2">
                                <Input
                                  value={kpi.description}
                                  onChange={(e) =>
                                    updateKPI(category.id, kpi.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="KPI name"
                                  className="col-span-4"
                                />
                                <Select
                                  value={kpi.metric}
                                  onValueChange={(v) =>
                                    updateKPI(category.id, kpi.id, { metric: v })
                                  }
                                >
                                  <SelectTrigger className="col-span-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="%">%</SelectItem>
                                    <SelectItem value="GHS">GHS</SelectItem>
                                    <SelectItem value="#">#</SelectItem>
                                    <SelectItem value="hrs">hrs</SelectItem>
                                    <SelectItem value="days">days</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={kpi.target}
                                  onChange={(e) =>
                                    updateKPI(category.id, kpi.id, {
                                      target: Number(e.target.value),
                                    })
                                  }
                                  className="col-span-2"
                                />
                                <Input
                                  type="number"
                                  value={kpi.actual}
                                  onChange={(e) =>
                                    updateKPI(category.id, kpi.id, {
                                      actual: Number(e.target.value),
                                    })
                                  }
                                  className="col-span-2"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeKPI(category.id, kpi.id)}
                                  className="col-span-1 px-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addKPI(category.id)}
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add KPI
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center">
                      No categories yet. Click "Add Category" to start.
                    </div>
                  )}
                </div>
              )}

              {/* Legacy KPIs */}
              {!data.isAdjunct && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Legacy KPIs (Simple List - optional)
                      <span className="ml-2 text-xs font-normal">
                        (only used if no categories)
                      </span>
                    </h3>
                    <Button size="sm" variant="outline" onClick={addLegacyKpi}>
                      <Plus className="h-4 w-4 mr-1" /> Add Legacy KPI
                    </Button>
                  </div>

                  {hasLegacyKPIs ? (
                    <div className="space-y-3">
                      {data.kpis.map((k) => (
                        <div key={k.id} className="p-3 border rounded-md space-y-2 bg-card">
                          <div className="flex gap-2 items-start">
                            <Input
                              className="flex-1"
                              placeholder="Description"
                              value={k.description}
                              onChange={(e) =>
                                updLegacyKpi(k.id, { description: e.target.value })
                              }
                            />
                            <button
                              onClick={() => rmLegacyKpi(k.id)}
                              className="p-2 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs">Metric</Label>
                              <Select
                                value={k.metric}
                                onValueChange={(v) => updLegacyKpi(k.id, { metric: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["%", "GHS", "#", "hrs", "days"].map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Target</Label>
                              <Input
                                type="number"
                                value={k.target}
                                onChange={(e) =>
                                  updLegacyKpi(k.id, { target: Number(e.target.value) })
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Actual</Label>
                              <Input
                                type="number"
                                value={k.actual}
                                onChange={(e) =>
                                  updLegacyKpi(k.id, { actual: Number(e.target.value) })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center">
                      No legacy KPIs. Use Weighted Categories above instead.
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-2 border-t">
                <Button 
                  onClick={save} 
                  className="flex-1"
                  disabled={hasCategories && !weightStats.isComplete}
                >
                  Save
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
              {hasCategories && !weightStats.isComplete && (
                <p className="text-xs text-red-500 -mt-2">
                  Please adjust weights to sum to 100% before saving.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}