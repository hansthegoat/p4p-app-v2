import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTour } from "@/hooks/usePageTour";
import { PAGE_TOURS } from "@/lib/p4p/tours";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { ExcelImportDialog } from "@/lib/p4p/ExcelImportDialog";
import { BulkExcelImportDialog } from "@/components/p4p/BulkExcelImportDialog";
import { exportTemplateToExcel, exportAllTemplatesToExcel } from "@/lib/p4p/excel";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import {
  Plus, Trash2, FolderPlus, Save,
  FileSpreadsheet, AlertTriangle, CheckCircle, Info, GripVertical,
  Layers, ListChecks, Building2, UserCog, Download, Upload,
} from "lucide-react";
import type { KPITemplate } from "@/lib/p4p/types";
import { newId } from "@/lib/p4p/defaults";
import {
  getDepartments,
  getRolesForDepartment,
  getTemplateByDepartmentAndRole,
} from "@/lib/p4p/kpi-templates";

export const Route = createFileRoute("/_app/kpi-framework")({
  component: KPIFrameworkPage,
});

const METRICS = ["%", "GHS", "$", "#", "ROI", "days", "hrs"];

interface PushPreviewEmployee {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  changeCount: number;
  beforeScore: number;
  afterScore: number;
  diffs: { kind: string; categoryName: string; kpiDescription?: string; before?: unknown; after?: unknown }[];
}

interface PushPreview {
  affectedCount: number;
  totalChanges: number;
  employees: PushPreviewEmployee[];
}

interface PushAllPreviewEmployee {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  changeCount: number;
}

interface PushAllPreview {
  templateCount: number;
  affectedCount: number;
  totalChanges: number;
  employees: PushAllPreviewEmployee[];
}

function KPIFrameworkPage() {
  const {
    getTemplate,
    saveTemplate,
    getAllTemplates,
    pushTemplateToEmployees,
    previewTemplateDiff,
    employees,
  } = useP4P();

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [pushing, setPushing] = useState(false);

  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushPreview, setPushPreview] = useState<PushPreview | null>(null);

  const [pushAllDialogOpen, setPushAllDialogOpen] = useState(false);
  const [pushAllPreview, setPushAllPreview] = useState<PushAllPreview | null>(null);
  const [pushingAll, setPushingAll] = useState(false);

  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const departments = getDepartments();
  const templates = getAllTemplates();

  const isSingleMode = !!selectedDept && !!selectedRole;

  useEffect(() => {
    if (selectedDept) setRoles(getRolesForDepartment(selectedDept));
  }, [selectedDept]);

  useEffect(() => {
    if (selectedDept && selectedRole) {
      const existing = getTemplate(selectedDept, selectedRole);
      if (existing) {
        setTemplate(JSON.parse(JSON.stringify(existing)));
        return;
      }
      const defaultTemplate = getTemplateByDepartmentAndRole(selectedDept, selectedRole);
      if (defaultTemplate) {
        setTemplate({
          jobGrade: defaultTemplate.jobGrade || "",
          roleName: defaultTemplate.roleName,
          department: defaultTemplate.department,
          categories: defaultTemplate.categories.map((cat: any) => ({
            id: cat.id || newId(),
            name: cat.name,
            weight: cat.weight,
            kpis: cat.kpis.map((k: any) => ({
              id: k.id || newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
              weight: k.weight || 0,
            })),
          })),
        });
        return;
      }
      setTemplate({
        jobGrade: "",
        roleName: selectedRole,
        department: selectedDept,
        categories: [],
      });
    } else {
      setTemplate(null);
    }
  }, [selectedDept, selectedRole, getTemplate]);

  const totalWeight = template?.categories?.reduce((s: number, c: any) => s + c.weight, 0) || 0;
  const totalKpis = template?.categories?.reduce((s: number, c: any) => s + c.kpis.length, 0) || 0;

  // ─── Category / KPI operations ────────────────────────────
  const addCategory = () => {
    setTemplate((t: any) => ({
      ...t,
      categories: [
        ...t.categories,
        { id: newId(), name: "New Category", weight: 0, kpis: [] },
      ],
    }));
  };

  const updateCategory = (catId: string, updates: any) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId ? { ...c, ...updates } : c
      ),
    }));
  };

  const removeCategory = (catId: string) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.filter((c: any) => c.id !== catId),
    }));
  };

  const addKPI = (catId: string) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId
          ? {
              ...c,
              kpis: [
                ...c.kpis,
                { id: newId(), description: "New KPI", metric: "%", target: 0, weight: 0 },
              ],
            }
          : c
      ),
    }));
  };

  const updateKPI = (catId: string, kpiId: string, updates: any) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId
          ? {
              ...c,
              kpis: c.kpis.map((k: any) =>
                k.id === kpiId ? { ...k, ...updates } : k
              ),
            }
          : c
      ),
    }));
  };

  const removeKPI = (catId: string, kpiId: string) => {
    setTemplate((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) =>
        c.id === catId
          ? { ...c, kpis: c.kpis.filter((k: any) => k.id !== kpiId) }
          : c
      ),
    }));
  };

  const validate = (): boolean => {
    if (!template || !selectedDept || !selectedRole) return false;
    if (totalWeight !== 100 && template.categories.length > 0) {
      showToast.error("Invalid Weights", `Category weights must sum to 100%. Currently: ${totalWeight}%.`);
      return false;
    }
    for (const cat of template.categories) {
      if (cat.kpis.length === 0) continue;
      const kpiWeight = cat.kpis.reduce((s: number, k: any) => s + (k.weight || 0), 0);
      if (Math.abs(kpiWeight - 100) > 0.01) {
        showToast.error(
          "Invalid KPI Weights",
          `In "${cat.name}", KPI weights must sum to 100%. Currently: ${kpiWeight}%.`
        );
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveTemplate(template);
    showToast.success("Template Saved", `${selectedDept} · ${selectedRole}`);
  };

  // ─── Export (context-aware) ───────────────────────────────
  const handleExport = () => {
    if (isSingleMode) {
      if (!template) return;
      exportTemplateToExcel(template, selectedDept, selectedRole);
      showToast.success("Downloaded", `${selectedDept} · ${selectedRole}`);
    } else {
      const all = getAllTemplates();
      const count = Object.keys(all).length;
      if (count === 0) {
        showToast.error("Nothing to export", "No templates have been saved yet.");
        return;
      }
      exportAllTemplatesToExcel(all);
      showToast.success("Downloaded", `${count} template${count === 1 ? "" : "s"} exported.`);
    }
  };

  // ─── Import (context-aware) ───────────────────────────────
  const handleImportClick = () => {
    if (isSingleMode) {
      setExcelImportOpen(true);
    } else {
      setBulkImportOpen(true);
    }
  };

  const handleImportApply = (imported: KPITemplate) => {
    setTemplate(imported);
    saveTemplate(imported);
    showToast.success("Imported from Excel", "Template loaded. Review and push when ready.");
  };

  const handleBulkApply = async (imported: KPITemplate[]) => {
    for (const t of imported) {
      saveTemplate(t);
    }
    showToast.success(
      `Imported ${imported.length} template${imported.length === 1 ? "" : "s"}`,
      "All KPIs saved. Review and push when ready."
    );
  };

  // ─── Push (context-aware) ─────────────────────────────────
  const handlePushClick = async () => {
    if (isSingleMode) {
      await handlePushSingle();
    } else {
      await handlePushAllPreview();
    }
  };

  const handlePushSingle = async () => {
    if (!validate()) return;
    if (!template || !selectedDept || !selectedRole) return;

    saveTemplate(template);
    await new Promise((r) => setTimeout(r, 50));

    const rawPreview = previewTemplateDiff(selectedDept, selectedRole, template);
    const affectedIds = Object.keys(rawPreview);

    if (affectedIds.length === 0) {
      showToast.success("No changes", "Every employee is already up to date.");
      return;
    }

    const enriched: PushPreviewEmployee[] = affectedIds.map((empId) => {
      const emp = employees.find((e) => e.id === empId);
      const diffs = rawPreview[empId];

      const existing = emp?.categories || [];
      let beforeSum = 0;
      let beforeW = 0;
      for (const cat of existing) {
        let catSum = 0;
        let kw = 0;
        for (const k of cat.kpis) {
          const ratio = (k.target || 1) > 0 ? (k.actual || 0) / (k.target || 1) : 0;
          const w = k.weight || 1;
          catSum += ratio * w;
          kw += w;
        }
        const catScore = kw > 0 ? catSum / kw : 0;
        const cw = (cat.weight || 0) / 100;
        beforeSum += catScore * cw;
        beforeW += cw;
      }
      const beforeScore = beforeW > 0 ? beforeSum / beforeW : 0;
      const afterScore = beforeScore;

      return {
        employeeId: empId,
        name: emp?.name || "Unknown",
        email: emp?.email || "",
        department: emp?.department || selectedDept,
        role: emp?.role || selectedRole,
        changeCount: diffs.length,
        beforeScore,
        afterScore,
        diffs,
      };
    });

    const totalChanges = enriched.reduce((s, e) => s + e.changeCount, 0);

    setPushPreview({
      affectedCount: enriched.length,
      totalChanges,
      employees: enriched,
    });
    setPushDialogOpen(true);
  };

  const confirmPushSingle = async () => {
    if (!template || !selectedDept || !selectedRole) return;
    setPushing(true);
    try {
      const result = await pushTemplateToEmployees(selectedDept, selectedRole, template);
      showToast.success(
        "Pushed",
        `${result.created} of ${result.affected} employee${result.affected > 1 ? "s" : ""} notified.`
      );
      setPushDialogOpen(false);
      setPushPreview(null);
    } catch (err: any) {
      showToast.error("Push failed", err.message || "Something went wrong.");
    } finally {
      setPushing(false);
    }
  };

  const handlePushAllPreview = async () => {
    const all = getAllTemplates();
    const keys = Object.keys(all);
    if (keys.length === 0) {
      showToast.error("No templates", "Save some templates first.");
      return;
    }

    const aggregated = new Map<string, PushAllPreviewEmployee>();
    let totalTemplates = 0;
    let totalChanges = 0;

    for (const key of keys) {
      const t = all[key];
      const rawPreview = previewTemplateDiff(t.department, t.roleName, t);
      const affectedIds = Object.keys(rawPreview);
      if (affectedIds.length === 0) continue;
      totalTemplates++;

      for (const empId of affectedIds) {
        const emp = employees.find((e) => e.id === empId);
        if (!emp) continue;
        const diffs = rawPreview[empId];
        totalChanges += diffs.length;
        aggregated.set(empId, {
          employeeId: empId,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          role: emp.role,
          changeCount: diffs.length,
        });
      }
    }

    if (aggregated.size === 0) {
      showToast.success("No changes", "Every employee is already up to date.");
      return;
    }

    setPushAllPreview({
      templateCount: totalTemplates,
      affectedCount: aggregated.size,
      totalChanges,
      employees: Array.from(aggregated.values()),
    });
    setPushAllDialogOpen(true);
  };

  const confirmPushAll = async () => {
    setPushingAll(true);
    try {
      const all = getAllTemplates();
      let totalCreated = 0;
      let templatesPushed = 0;
      for (const key of Object.keys(all)) {
        const t = all[key];
        const result = await pushTemplateToEmployees(t.department, t.roleName, t);
        totalCreated += result.created;
        if (result.created > 0) templatesPushed++;
      }
      showToast.success(
        "Pushed all",
        `${templatesPushed} template${templatesPushed === 1 ? "" : "s"} · ${totalCreated} employee${totalCreated === 1 ? "" : "s"} notified.`
      );
      setPushAllDialogOpen(false);
      setPushAllPreview(null);
    } catch (err: any) {
      showToast.error("Push failed", err.message || "Something went wrong.");
    } finally {
      setPushingAll(false);
    }
  };

  const weightStatus =
    totalWeight === 100
      ? { color: "emerald", label: "Complete", icon: CheckCircle }
      : totalWeight > 100
      ? { color: "red", label: "Over 100%", icon: AlertTriangle }
      : { color: "blue", label: `${100 - totalWeight}% remaining`, icon: Info };

  const WeightIcon = weightStatus.icon;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      <PageHeader
        title={isSingleMode ? `Editing: ${selectedDept} / ${selectedRole}` : "KPI Framework"}
        description={
          isSingleMode
            ? "Edit the template below, then save and push to employees."
            : "Bulk operations across every department and role. Pick a specific template below to edit it."
        }
        icon={<FileSpreadsheet className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              {isSingleMode ? "Export Template" : "Export All"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              className="gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              {isSingleMode ? "Import Template" : "Bulk Import"}
            </Button>

            {isSingleMode && template && (
              <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            )}

            <Button
              size="sm"
              onClick={handlePushClick}
              disabled={
                (isSingleMode && (pushing || totalWeight !== 100)) ||
                (!isSingleMode && pushingAll)
              }
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {isSingleMode ? "Push to Employees" : "Push All"}
            </Button>
          </div>
        }
      />

      {/* Department / Role selector */}
      <motion.div variants={fadeUp}>
        <Card className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Building2 className="h-3.5 w-3.5" /> Department
              </Label>
              <Select
                value={selectedDept}
                onValueChange={(v) => {
                  setSelectedDept(v);
                  setSelectedRole("");
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select department (or leave empty for bulk)" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d, i) => (
                    <SelectItem key={`dept-${i}-${d}`} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <UserCog className="h-3.5 w-3.5" /> Role
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedDept}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={selectedDept ? "Select role" : "Select department first"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r, i) => (
                    <SelectItem key={`role-${i}-${r}`} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">
                {isSingleMode ? "Template Status" : "Mode"}
              </Label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/30 text-sm">
                {isSingleMode && template ? (
                  <>
                    <Badge
                      variant="outline"
                      className={`bg-${weightStatus.color}-500/10 text-${weightStatus.color}-700 dark:text-${weightStatus.color}-400 border-${weightStatus.color}-500/30 gap-1 text-[10px] h-5`}
                    >
                      <WeightIcon className="h-3 w-3" />
                      {weightStatus.label}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      {template.categories.length} cat · {totalKpis} KPI
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Bulk mode — actions affect every template
                  </span>
                )}
              </div>
              {isSingleMode && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedRole("");
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground mt-1.5 underline"
                >
                  ← Back to bulk view
                </button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {isSingleMode && template ? (
        <div className="space-y-4">
          {template.categories.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card
                className={`p-4 flex items-center gap-3 bg-${weightStatus.color}-500/5 border-${weightStatus.color}-500/20`}
              >
                <WeightIcon className={`h-5 w-5 text-${weightStatus.color}-600 dark:text-${weightStatus.color}-400`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    Category Total Weight: {totalWeight}%
                    {totalWeight === 100 && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {totalWeight === 100
                      ? "Category weights balanced. Now ensure each category's KPI weights sum to 100%."
                      : totalWeight > 100
                      ? `Reduce category weights by ${totalWeight - 100}% to reach 100%.`
                      : `Add ${100 - totalWeight}% more to reach 100%.`}
                  </div>
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, totalWeight)}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full bg-${weightStatus.color}-500`}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Categories</h2>
              </div>
              <Button size="sm" variant="outline" onClick={addCategory} className="gap-2">
                <FolderPlus className="h-4 w-4" /> Add Category
              </Button>
            </div>
          </motion.div>

          {template.categories.length === 0 ? (
            <motion.div variants={fadeUp}>
              <Card>
                <EmptyState
                  icon={<Layers className="h-6 w-6" />}
                  title="No categories yet"
                  description="Add your first KPI category to start building this template."
                  action={
                    <Button onClick={addCategory} className="gap-2">
                      <FolderPlus className="h-4 w-4" /> Add Category
                    </Button>
                  }
                />
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {template.categories.map((cat: any, catIdx: number) => {
                const kpiWeight = cat.kpis.reduce((s: number, k: any) => s + (k.weight || 0), 0);
                const kpiWeightOk = Math.abs(kpiWeight - 100) < 0.01;
                const kpiWeightOver = kpiWeight > 100;

                return (
                  <motion.div key={cat.id} variants={fadeUp} layout>
                    <Card className="overflow-hidden">
                      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {catIdx + 1}
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                              Category Name
                            </Label>
                            <Input
                              value={cat.name}
                              onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                              placeholder="Category name"
                              className="mt-1 h-9 font-medium"
                            />
                          </div>
                          <div className="w-32">
                            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                              Category Weight %
                            </Label>
                            <Input
                              type="number"
                              value={cat.weight}
                              onChange={(e) =>
                                updateCategory(cat.id, { weight: Number(e.target.value) })
                              }
                              placeholder="0"
                              className="mt-1 h-9 font-mono"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 self-end"
                            onClick={() => removeCategory(cat.id)}
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {cat.kpis.length > 0 && (
                          <div
                            className={`mt-3 rounded-md px-3 py-2 text-[11px] flex items-center gap-2 ${
                              kpiWeightOver
                                ? "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : kpiWeightOk
                                ? "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                : "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            }`}
                          >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {kpiWeightOver ? "⚠️ KPI weights over 100%! " : kpiWeightOk ? "✅ KPI weights balanced. " : "📊 "}
                              KPI Total: <strong>{kpiWeight}%</strong>
                              {!kpiWeightOver && !kpiWeightOk && <> · Need <strong>{100 - kpiWeight}%</strong> more</>}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        {cat.kpis.length === 0 ? (
                          <div className="text-[11px] text-muted-foreground text-center py-6 border border-dashed border-border/50 rounded-lg">
                            No KPIs yet — add one below
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="hidden md:grid grid-cols-14 gap-3 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1">
                              <div className="col-span-5">KPI Description</div>
                              <div className="col-span-2">Metric</div>
                              <div className="col-span-2">Target</div>
                              <div className="col-span-2">Weight %</div>
                              <div className="col-span-3 text-right">Action</div>
                            </div>

                            {cat.kpis.map((kpi: any, kpiIdx: number) => (
                              <motion.div
                                key={kpi.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: kpiIdx * 0.03 }}
                                className="grid grid-cols-1 md:grid-cols-14 gap-3 items-center p-2 rounded-lg hover:bg-accent/30 transition-colors"
                              >
                                <div className="md:col-span-5">
                                  <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block">
                                    Description
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="hidden md:block h-4 w-4 text-muted-foreground/40 shrink-0" />
                                    <Input
                                      value={kpi.description}
                                      onChange={(e) =>
                                        updateKPI(cat.id, kpi.id, { description: e.target.value })
                                      }
                                      placeholder="KPI description"
                                      className="h-9"
                                    />
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                  <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block">
                                    Metric
                                  </Label>
                                  <Select
                                    value={kpi.metric}
                                    onValueChange={(v) => updateKPI(cat.id, kpi.id, { metric: v })}
                                  >
                                    <SelectTrigger className="h-9 font-mono">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {METRICS.map((m, i) => (
                                        <SelectItem key={`metric-${i}-${m}`} value={m}>{m}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="md:col-span-2">
                                  <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block">
                                    Target
                                  </Label>
                                  <Input
                                    type="number"
                                    value={kpi.target}
                                    onChange={(e) =>
                                      updateKPI(cat.id, kpi.id, { target: Number(e.target.value) })
                                    }
                                    className="h-9 font-mono"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground md:hidden mb-1 block">
                                    Weight %
                                  </Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={kpi.weight || 0}
                                    onChange={(e) =>
                                      updateKPI(cat.id, kpi.id, { weight: Number(e.target.value) })
                                    }
                                    placeholder="0"
                                    className="h-9 font-mono"
                                  />
                                </div>

                                <div className="md:col-span-3 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    onClick={() => removeKPI(cat.id, kpi.id)}
                                    title="Delete KPI"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addKPI(cat.id)}
                          className="gap-2 mt-2"
                        >
                          <Plus className="h-4 w-4" /> Add KPI to {cat.name}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {template.categories.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="p-4 flex flex-wrap items-center justify-between gap-3 bg-muted/30">
                <div className="flex items-center gap-3 text-sm">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-[13px]">
                    <strong className="text-foreground">{template.categories.length}</strong> categories ·{" "}
                    <strong className="text-foreground">{totalKpis}</strong> KPIs ·{" "}
                    <strong className={totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}>
                      {totalWeight}%
                    </strong>{" "}
                    category weight
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} variant="outline" className="gap-2">
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePushClick}
                    disabled={pushing || totalWeight !== 100}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Push to Employees
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div variants={fadeUp}>
          <Card>
            <EmptyState
              icon={<FileSpreadsheet className="h-6 w-6" />}
              title={isSingleMode ? "Loading template…" : "Bulk mode"}
              description={
                isSingleMode
                  ? "Loading the KPI template for this department and role."
                  : "Use the buttons above to export, import, or push all templates at once. Or pick a specific department and role to edit it."
              }
            />
          </Card>
        </motion.div>
      )}

      {/* Single push dialog */}
      <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4 text-primary" />
              Push KPI changes to employees?
            </DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              {pushPreview && (
                <>
                  Changes apply <strong className="text-foreground">immediately</strong> to{" "}
                  <strong className="text-foreground">{pushPreview.affectedCount}</strong>{" "}
                  {pushPreview.affectedCount === 1 ? "employee" : "employees"} —{" "}
                  <strong className="text-foreground">{pushPreview.totalChanges}</strong> total{" "}
                  {pushPreview.totalChanges === 1 ? "change" : "changes"}.
                  <br />
                  Each employee will be notified and can comment if they have concerns.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {pushPreview && (
            <div className="flex-1 overflow-y-auto -mx-5 px-5 py-1 space-y-2.5">
              {pushPreview.employees.map((emp) => (
                <Card key={emp.employeeId} className="p-3">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <div className="font-medium text-[13px] truncate">{emp.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{emp.email}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] h-5 px-1.5 font-medium"
                    >
                      {emp.changeCount} {emp.changeCount === 1 ? "change" : "changes"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {emp.diffs.slice(0, 5).map((d, i) => (
                      <div
                        key={i}
                        className="text-[11px] flex items-center gap-2 text-muted-foreground leading-relaxed"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        <span className="font-medium text-foreground shrink-0">
                          {labelForDiffKind(d.kind)}
                        </span>
                        {d.kpiDescription && (
                          <span className="truncate">· {d.kpiDescription}</span>
                        )}
                        {d.categoryName && !d.kpiDescription && (
                          <span className="truncate">· {d.categoryName}</span>
                        )}
                      </div>
                    ))}
                    {emp.diffs.length > 5 && (
                      <div className="text-[10px] text-muted-foreground pl-3 italic">
                        + {emp.diffs.length - 5} more change{emp.diffs.length - 5 === 1 ? "" : "s"}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter className="flex-row justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPushDialogOpen(false);
                setPushPreview(null);
              }}
              disabled={pushing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmPushSingle}
              disabled={pushing}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            >
              {pushing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Pushing…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Push changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Push All dialog */}
      <Dialog open={pushAllDialogOpen} onOpenChange={setPushAllDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4 text-primary" />
              Push all KPI changes to every employee?
            </DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              {pushAllPreview && (
                <>
                  <strong className="text-foreground">{pushAllPreview.templateCount}</strong> template
                  {pushAllPreview.templateCount === 1 ? "" : "s"} will be pushed to{" "}
                  <strong className="text-foreground">{pushAllPreview.affectedCount}</strong> employee
                  {pushAllPreview.affectedCount === 1 ? "" : "s"} —{" "}
                  <strong className="text-foreground">{pushAllPreview.totalChanges}</strong> total change
                  {pushAllPreview.totalChanges === 1 ? "" : "s"}.
                  <br />
                  Each employee will be notified and can comment if they have concerns.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {pushAllPreview && (
            <div className="flex-1 overflow-y-auto -mx-5 px-5 py-1 space-y-2">
              {pushAllPreview.employees.map((emp) => (
                <Card key={emp.employeeId} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-[13px] truncate">{emp.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {emp.email} · {emp.department} / {emp.role}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] h-5 px-1.5 font-medium"
                    >
                      {emp.changeCount} change{emp.changeCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter className="flex-row justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPushAllDialogOpen(false);
                setPushAllPreview(null);
              }}
              disabled={pushingAll}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmPushAll}
              disabled={pushingAll}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            >
              {pushingAll ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Pushing all…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Push all changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExcelImportDialog
        open={excelImportOpen}
        onOpenChange={setExcelImportOpen}
        department={selectedDept}
        role={selectedRole}
        onApply={handleImportApply}
      />

      <BulkExcelImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onApply={handleBulkApply}
      />
    </motion.div>
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