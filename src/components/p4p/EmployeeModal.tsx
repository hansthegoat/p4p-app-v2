import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X, FolderPlus, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getTemplateForJobGrade } from "@/lib/p4p/kpi-templates";
import { useP4P } from "@/lib/p4p/store";
import { showToast } from "@/lib/toast";
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
    email: "",
    jobGrade: "4",
    department: "",
    role: "",
    isAdjunct: false,
    isSalesRole: false,
    joinDate: new Date().toISOString().slice(0, 10),
    monthsWorked: 12,
    kpis: [],
    categories: [],
    supervisorId: "",
    supervisorName: "",
    isManager: false,
    roleType: "employee",
  };
}

export function EmployeeModal({ open, onClose, employee }: Props) {
  const { grades, globals, upsertEmployee, employees } = useP4P();
  const [data, setData] = useState<Employee>(blank());

  useEffect(() => {
    if (open) {
      const emp = employee ? JSON.parse(JSON.stringify(employee)) : blank();
      if (!emp.categories) emp.categories = [];
      if (!emp.supervisorId) emp.supervisorId = "";
      if (!emp.supervisorName) emp.supervisorName = "";
      setData(emp);
    }
  }, [open, employee]);

  const setField = <K extends keyof Employee>(k: K, v: Employee[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    if (!data.jobGrade || data.isAdjunct) return;
    if (data.categories && data.categories.length > 0) return;
    const template = getTemplateForJobGrade(data.jobGrade);
    if (!template) return;
    const categories = template.categories.map((cat) => ({
      id: newId(),
      name: cat.name,
      weight: cat.weight,
      kpis: cat.kpis.map((k) => ({
        id: newId(),
        description: k.description,
        metric: k.metric,
        target: k.target,
        actual: 0,
        weight: k.weight || 0,
        measurementSource: k.measurementSource || "",
      })),
    }));
    setData((prev) => ({ ...prev, categories }));
  }, [data.jobGrade, data.isAdjunct]);

  const loadTemplate = () => {
    const template = getTemplateForJobGrade(data.jobGrade);
    if (!template) {
      showToast.warning("No Template", `No KPI template found for job grade "${data.jobGrade}"`);
      return;
    }
    const categories = template.categories.map((cat) => ({
      id: newId(),
      name: cat.name,
      weight: cat.weight,
      kpis: cat.kpis.map((k) => ({
        id: newId(),
        description: k.description,
        metric: k.metric,
        target: k.target,
        actual: 0,
        weight: k.weight || 0,
        measurementSource: k.measurementSource || "",
      })),
    }));
    setData((prev) => ({ ...prev, categories }));
    showToast.success("Template Loaded", `${template.categories.length} categories loaded.`);
  };

  const getWeightStats = (categories: Category[]) => {
    const total = categories.reduce((sum, c) => sum + c.weight, 0);
    const remaining = Math.max(0, 100 - total);
    return { total, remaining, isOver: total > 100, isComplete: total === 100 };
  };

  const getKpiWeightStats = (category: Category) => {
    const total = category.kpis.reduce((sum, k) => sum + (k.weight || 0), 0);
    return {
      total,
      isComplete: Math.abs(total - 100) < 0.01,
      isOver: total > 100,
    };
  };

  const addCategory = () => {
    const newCategory: Category = {
      id: newId(),
      name: `Category ${(data.categories || []).length + 1}`,
      weight: 0,
      kpis: [],
    };
    setData((d) => ({ ...d, categories: [...(d.categories || []), newCategory] }));
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

  const addKPI = (categoryId: string) => {
    const newKPI: KPI = {
      id: newId(),
      description: "New KPI",
      metric: "%",
      target: 0,
      actual: 0,
      weight: 0,
      measurementSource: "",
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
        c.id === categoryId ? { ...c, kpis: c.kpis.filter((k) => k.id !== kpiId) } : c
      ),
    }));
  };

  const updateKPI = (categoryId: string, kpiId: string, updates: Partial<KPI>) => {
    setData((d) => ({
      ...d,
      categories: (d.categories || []).map((c) =>
        c.id === categoryId
          ? { ...c, kpis: c.kpis.map((k) => (k.id === kpiId ? { ...k, ...updates } : k)) }
          : c
      ),
    }));
  };

  const save = () => {
    if (!data.name.trim()) {
      showToast.warning("Name Required", "Please enter the employee's name.");
      return;
    }
    const categories = data.categories || [];
    const stats = getWeightStats(categories);
    if (categories.length > 0 && !stats.isComplete) {
      showToast.error(
        "Category Weights Invalid",
        `Category weights must sum to 100%. Currently: ${stats.total}%.`
      );
      return;
    }
    for (const cat of categories) {
      const kpiStats = getKpiWeightStats(cat);
      if (cat.kpis.length > 0 && !kpiStats.isComplete) {
        showToast.error(
          "KPI Weights Invalid",
          `In "${cat.name}", KPI weights must sum to 100%. Currently: ${kpiStats.total}%.`
        );
        return;
      }
    }
    let supervisorName = data.supervisorName || "";
    if (data.supervisorId) {
      const supervisor = employees.find((e) => e.id === data.supervisorId);
      if (supervisor) supervisorName = supervisor.name;
    }
    upsertEmployee({
      ...data,
      email: data.email?.trim() || "",
      supervisorName,
      monthsWorked: Number(data.monthsWorked) || 0,
      kpis: data.isAdjunct ? [] : data.kpis,
      categories: data.isAdjunct ? [] : categories,
    });
    showToast.success("Employee Saved", `${data.name} has been saved.`);
    onClose();
  };

  const hasCategories = (data.categories || []).length > 0;
  const hasLegacyKPIs = data.kpis.length > 0;
  const weightStats = getWeightStats(data.categories || []);
  const hasTemplate = !!getTemplateForJobGrade(data.jobGrade);
  const managers = employees.filter((e) => e.isManager === true && e.id !== data.id);

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
            className="@container fixed right-0 top-0 bottom-0 w-full sm:w-[720px] lg:w-[900px] bg-background z-50 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10">
              <h2 className="text-lg font-semibold">
                {employee ? "Edit" : "Add"} Employee
              </h2>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={data.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" />
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={data.email || ""} onChange={(e) => setField("email", e.target.value)} placeholder="Email address" />
              </div>

              <div>
                <Label>Job Grade</Label>
                <Select value={data.jobGrade} onValueChange={(v) => setField("jobGrade", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.code} — {g.name} ({g.points})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <Input value={data.department || ""} onChange={(e) => setField("department", e.target.value)} placeholder="Department" />
              </div>

              <div>
                <Label>Role</Label>
                <Input value={data.role || ""} onChange={(e) => setField("role", e.target.value)} placeholder="Role (e.g., Senior Specialist)" />
              </div>

              <div>
                <Label>Supervisor/Manager</Label>
                <Select
                  value={data.supervisorId || "none"}
                  onValueChange={(v) => {
                    if (v === "none") {
                      setField("supervisorId", "");
                      setField("supervisorName", "");
                    } else {
                      const sup = employees.find((e) => e.id === v);
                      setField("supervisorId", v);
                      setField("supervisorName", sup?.name || "");
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select supervisor (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem key="none" value="none">None</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  checked={data.isManager || false}
                  onCheckedChange={(v) => setField("isManager", !!v)}
                />
                <Label className="text-sm cursor-pointer">This employee is a Manager/Supervisor</Label>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data.isAdjunct} onCheckedChange={(v) => setField("isAdjunct", !!v)} />
                  Is Adjunct?
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data.isSalesRole} onCheckedChange={(v) => setField("isSalesRole", !!v)} />
                  Is Sales Role?
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Join Date</Label>
                  <Input type="date" value={data.joinDate} onChange={(e) => setField("joinDate", e.target.value)} />
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

              {!data.isAdjunct && (
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-medium">Weighted Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {hasTemplate && (
                        <Button size="sm" variant="outline" onClick={loadTemplate}>
                          <FolderPlus className="h-4 w-4 mr-1" /> Load Template
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={addCategory}>
                        <Plus className="h-4 w-4 mr-1" /> Add Category
                      </Button>
                    </div>
                  </div>

                  {hasCategories && (
                    <div
                      className={`rounded-md p-3 mb-3 text-sm flex items-center gap-2 ${
                        weightStats.isOver
                          ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                          : weightStats.isComplete
                          ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {weightStats.isOver ? "⚠️ Over 100%! " : weightStats.isComplete ? "✅ Perfect! " : "📊 "}
                        Category Total: <strong>{weightStats.total}%</strong>
                        {!weightStats.isOver && !weightStats.isComplete && (
                          <> · Remaining: <strong>{weightStats.remaining}%</strong></>
                        )}
                      </span>
                    </div>
                  )}

                  {hasCategories ? (
                    <div className="space-y-4">
                      {(data.categories || []).map((category) => {
                        const kpiStats = getKpiWeightStats(category);
                        return (
                          <Card key={category.id} className="p-3 sm:p-4 border">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
                              <Input
                                value={category.name}
                                onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                                placeholder="Category name"
                                className="flex-1"
                              />
                              <div className="flex gap-2">
                                <div className="relative flex-1 sm:w-24">
                                  <Input
                                    type="number"
                                    value={category.weight}
                                    onChange={(e) => {
                                      const nw = Number(e.target.value);
                                      if (nw < 0) return;
                                      const others = (data.categories || []).filter((c) => c.id !== category.id);
                                      const otherTotal = others.reduce((s, c) => s + c.weight, 0);
                                      const maxAllowed = 100 - otherTotal;
                                      if (nw <= maxAllowed) {
                                        updateCategory(category.id, { weight: nw });
                                      } else {
                                        showToast.warning(
                                          "Weight Too High",
                                          `Only ${maxAllowed}% remaining.`
                                        );
                                      }
                                    }}
                                    placeholder="Weight %"
                                    className="pr-6"
                                    min={0}
                                    max={100}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => removeCategory(category.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {category.kpis.length > 0 && (
                              <div
                                className={`rounded-md px-3 py-2 mb-3 text-xs flex items-center gap-2 ${
                                  kpiStats.isOver
                                    ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                    : kpiStats.isComplete
                                    ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                }`}
                              >
                                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>
                                  {kpiStats.isOver ? "⚠️ KPI weights over 100%! " : kpiStats.isComplete ? "✅ KPI weights perfect! " : "📊 "}
                                  KPI Total: <strong>{kpiStats.total}%</strong>
                                  {!kpiStats.isOver && !kpiStats.isComplete && (
                                    <> · Need <strong>{100 - kpiStats.total}%</strong> more</>
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="space-y-3">
                              {category.kpis.map((kpi) => (
                                <div
                                  key={kpi.id}
                                  className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2"
                                >
                                  <div className="flex gap-2 items-start">
                                    <div className="flex-1 min-w-0">
                                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                        KPI Description
                                      </Label>
                                      <Textarea
                                        value={kpi.description}
                                        onChange={(e) => {
                                          updateKPI(category.id, kpi.id, { description: e.target.value });
                                          e.target.style.height = "auto";
                                          e.target.style.height = e.target.scrollHeight + "px";
                                        }}
                                        placeholder="e.g., 100% of quarterly sales target from enterprise accounts"
                                        rows={2}
                                        className="min-h-[60px] resize-none text-sm overflow-hidden"
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeKPI(category.id, kpi.id)}
                                      className="mt-5 h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 shrink-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-5 gap-2">
                                    <div className="min-w-0">
                                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Metric
                                      </Label>
                                      <Select value={kpi.metric} onValueChange={(v) => updateKPI(category.id, kpi.id, { metric: v })}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem key="%" value="%">%</SelectItem>
                                          <SelectItem key="GHS" value="GHS">GHS</SelectItem>
                                          <SelectItem key="#" value="#">#</SelectItem>
                                          <SelectItem key="hrs" value="hrs">hrs</SelectItem>
                                          <SelectItem key="days" value="days">days</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="min-w-0">
                                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Weight %
                                      </Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={kpi.weight || 0}
                                        onChange={(e) => updateKPI(category.id, kpi.id, { weight: Number(e.target.value) })}
                                        placeholder="0"
                                        className="h-9 font-mono"
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Target
                                      </Label>
                                      <Input
                                        type="number"
                                        value={kpi.target}
                                        onChange={(e) => updateKPI(category.id, kpi.id, { target: Number(e.target.value) })}
                                        placeholder="Target"
                                        className="h-9"
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Actual
                                      </Label>
                                      <Input
                                        type="number"
                                        value={kpi.actual}
                                        onChange={(e) => updateKPI(category.id, kpi.id, { actual: Number(e.target.value) })}
                                        placeholder="Actual"
                                        className="h-9"
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Source
                                      </Label>
                                      <Input
                                        value={kpi.measurementSource || ""}
                                        onChange={(e) => updateKPI(category.id, kpi.id, { measurementSource: e.target.value })}
                                        placeholder="e.g., CRM"
                                        className="h-9"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <Button size="sm" variant="outline" onClick={() => addKPI(category.id)} className="mt-2">
                                <Plus className="h-4 w-4 mr-1" /> Add KPI
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 bg-muted/40 rounded-md text-center">
                      No categories yet. Click "Add Category" or "Load Template" to start.
                    </div>
                  )}
                </div>
              )}

              {!data.isAdjunct && (
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Legacy KPIs (Simple List — optional)
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          kpis: [
                            ...d.kpis,
                            {
                              id: newId(),
                              description: "",
                              metric: "%",
                              target: 0,
                              actual: 0,
                              weight: 100,
                              measurementSource: "",
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Legacy KPI
                    </Button>
                  </div>

                  {hasLegacyKPIs ? (
                    <div className="space-y-3">
                      {data.kpis.map((k) => (
                        <div key={k.id} className="p-3 border rounded-md space-y-2 bg-card">
                          <div className="flex gap-2 items-start">
                            <Textarea
                              className="flex-1 min-h-[60px] resize-none text-sm"
                              rows={2}
                              placeholder="Description"
                              value={k.description}
                              onChange={(e) =>
                                setData((d) => ({
                                  ...d,
                                  kpis: d.kpis.map((x) => (x.id === k.id ? { ...x, description: e.target.value } : x)),
                                }))
                              }
                            />
                            <button
                              onClick={() =>
                                setData((d) => ({ ...d, kpis: d.kpis.filter((x) => x.id !== k.id) }))
                              }
                              className="p-2 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs">Metric</Label>
                              <Select
                                value={k.metric}
                                onValueChange={(v) =>
                                  setData((d) => ({
                                    ...d,
                                    kpis: d.kpis.map((x) => (x.id === k.id ? { ...x, metric: v } : x)),
                                  }))
                                }
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {["%", "GHS", "#", "hrs", "days"].map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
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
                                  setData((d) => ({
                                    ...d,
                                    kpis: d.kpis.map((x) => (x.id === k.id ? { ...x, target: Number(e.target.value) } : x)),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Actual</Label>
                              <Input
                                type="number"
                                value={k.actual}
                                onChange={(e) =>
                                  setData((d) => ({
                                    ...d,
                                    kpis: d.kpis.map((x) => (x.id === k.id ? { ...x, actual: Number(e.target.value) } : x)),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Source</Label>
                              <Input
                                value={k.measurementSource || ""}
                                onChange={(e) =>
                                  setData((d) => ({
                                    ...d,
                                    kpis: d.kpis.map((x) =>
                                      x.id === k.id ? { ...x, measurementSource: e.target.value } : x
                                    ),
                                  }))
                                }
                                placeholder="Measurement source"
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
                <Button onClick={save} className="flex-1" disabled={hasCategories && !weightStats.isComplete}>
                  Save
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}