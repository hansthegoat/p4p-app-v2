import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
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
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Upload, Download, Calendar, TrendingUp, Users, Award, AlertTriangle,
  ChevronRight, Trash2, CheckCircle, RefreshCw, Target, FileSpreadsheet,
  Activity, Zap, Clock, BarChart3, Pencil,
} from "lucide-react";

export const Route = createFileRoute("/_app/monthly")({
  component: MonthlyPage,
});

const TEMPLATE_CSV = `Employee Name,Employee ID,Category,Category Weight (%),KPI Description,KPI Metric,KPI Target,KPI Weight (%),KPI Actual
Alice Johnson,emp1,Strategic,30,Revenue Growth,GHS,500000,50,600000
Alice Johnson,emp1,Strategic,30,CSAT Score,%,90,50,85
Bob Smith,emp2,Team Performance,40,Team Lead,%,100,60,90
Bob Smith,emp2,Team Performance,40,Projects Completed,#,12,40,10`;

function MonthlyPage() {
  const {
    employees, monthlyData, saveMonthlySnapshot, getMonthlyHistory,
    getPerformanceTrend, getAllTrends, getMonthlyStats, deleteMonthlyData,
    setEmployees, detectTriggers, getTriggersForEmployee,
  } = useP4P();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingKPI, setEditingKPI] = useState<{
    employeeId: string; categoryId: string; kpiId: string;
    field: "target" | "actual"; value: number;
  } | null>(null);

  const startEditing = (employeeId: string, categoryId: string, kpiId: string, field: "target" | "actual", currentValue: number) => {
    setEditingKPI({ employeeId, categoryId, kpiId, field, value: currentValue });
  };

  const saveEdit = () => {
    if (!editingKPI) return;
    const updated = employees.map((emp) => {
      if (emp.id !== editingKPI.employeeId) return emp;
      return {
        ...emp,
        categories: (emp.categories || []).map((cat) => {
          if (cat.id !== editingKPI.categoryId) return cat;
          return { ...cat, kpis: cat.kpis.map((k) => k.id === editingKPI.kpiId ? { ...k, [editingKPI.field]: editingKPI.value } : k) };
        }),
      };
    });
    setEmployees(updated);
    const cy = new Date().getFullYear();
    const cm = new Date().getMonth() + 1;
    saveMonthlySnapshot(editingKPI.employeeId, cy, cm);
    setEditingKPI(null);
    showToast.success("KPI Updated", "Value saved.");
  };

  const stats = getMonthlyStats();
  const trends = getAllTrends();
  const monthsWithData = stats.monthsWithData || [];
  const hasDataForMonth = monthsWithData.some((m) => m.year === selectedYear && m.month === selectedMonth);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `monthly_template_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast.success("Template Downloaded", "CSV template ready to use.");
  };

  const refreshMonthlyData = () => {
    const cy = new Date().getFullYear();
    const cm = new Date().getMonth() + 1;
    let count = 0;
    for (const emp of employees) {
      if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) {
        saveMonthlySnapshot(emp.id, cy, cm);
        count++;
      }
    }
    showToast.success("Data Refreshed", `${count} employees updated.`);
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase();

    const processData = (data: any[]) => {
      try {
        const headers = Object.keys(data[0] || {});
        const required = ["Employee Name", "KPI Description", "KPI Target", "KPI Actual"];
        const missing = required.filter((r) => !headers.some((h) => h.trim() === r));
        if (missing.length > 0) throw new Error(`Missing columns: ${missing.join(", ")}`);

        const map = new Map<string, { name: string; categories: Map<string, { weight: number; kpis: any[] }> }>();
        for (const row of data) {
          const empName = row["Employee Name"]?.trim();
          const empId = row["Employee ID"]?.trim() || `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const category = row["Category"]?.trim() || "General";
          const categoryWeight = Number(row["Category Weight (%)"]) || 0;
          const kpiDesc = row["KPI Description"]?.trim();
          const kpiMetric = row["KPI Metric"]?.trim() || "%";
          const kpiTarget = Number(row["KPI Target"]);
          const kpiWeight = Number(row["KPI Weight (%)"]) || 0;
          const kpiActual = Number(row["KPI Actual"]);
          if (!empName || !kpiDesc || isNaN(kpiTarget) || isNaN(kpiActual)) continue;
          if (!map.has(empId)) map.set(empId, { name: empName, categories: new Map() });
          const emp = map.get(empId)!;
          if (!emp.categories.has(category)) emp.categories.set(category, { weight: categoryWeight, kpis: [] });
          emp.categories.get(category)!.kpis.push({ description: kpiDesc, metric: kpiMetric, target: kpiTarget, actual: kpiActual, weight: kpiWeight });
        }

        const updated = [...employees];
        let newCount = 0, updateCount = 0;
        for (const [empId, empData] of map) {
          const categories: any[] = [];
          for (const [catName, catData] of empData.categories) {
            categories.push({
              id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: catName, weight: catData.weight || 0,
              kpis: catData.kpis.map((k: any) => ({
                id: `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                description: k.description, metric: k.metric, target: k.target, actual: k.actual, weight: k.weight,
              })),
            });
          }
          const idx = updated.findIndex((e) => e.name === empData.name);
          if (idx >= 0) { updated[idx] = { ...updated[idx], categories, kpis: [] }; updateCount++; }
          else {
            updated.push({ id: empId, name: empData.name, email: "", jobGrade: "4", department: "", role: "", isAdjunct: false, isSalesRole: false, joinDate: new Date().toISOString().slice(0, 10), monthsWorked: 12, kpis: [], categories });
            newCount++;
          }
        }
        setEmployees(updated);
        for (const emp of updated) {
          if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) saveMonthlySnapshot(emp.id, selectedYear, selectedMonth);
        }
        showToast.success("Upload Complete", `${map.size} employees (${newCount} new, ${updateCount} updated).`);
      } catch (error: any) {
        showToast.error("Upload Failed", error.message);
      } finally { setIsUploading(false); }
    };

    if (ext === "csv") {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (result) => {
          if (result.data?.length > 0) processData(result.data);
          else { showToast.error("Upload Failed", "No data found"); setIsUploading(false); }
        },
        error: (err) => { showToast.error("Upload Failed", err.message); setIsUploading(false); },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          if (json?.length > 0) processData(json);
          else { showToast.error("Upload Failed", "No data found"); setIsUploading(false); }
        } catch (err: any) { showToast.error("Upload Failed", err.message); setIsUploading(false); }
      };
      reader.readAsArrayBuffer(file);
    } else { showToast.error("Upload Failed", "Use CSV or Excel (.xlsx)"); setIsUploading(false); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const allTriggers = useMemo(() => {
    try { return detectTriggers(); }
    catch { return { pip: [], probation: [], managementAction: [], total: 0 }; }
  }, [detectTriggers]);

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Monthly Performance"
        description="Upload CSV/Excel monthly data to track trends, identify rising stars, and flag underachievers."
        icon={<FileSpreadsheet className="h-6 w-6" />}
        actions={<Button variant="outline" size="sm" onClick={refreshMonthlyData} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />

      <motion.div variants={fadeUp}>
        <SectionCard
          title="Upload Monthly Data"
          description={`Target: ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("default", { month: "long", year: "numeric" })}`}
          icon={<Upload className="h-4 w-4" />}
          action={hasDataForMonth && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle className="h-3 w-3" /> Data exists</Badge>}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><Calendar className="h-3.5 w-3.5" /> Year</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><Calendar className="h-3.5 w-3.5" /> Month</Label>
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>{new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><Download className="h-3.5 w-3.5" /> Template</Label>
              <Button variant="outline" onClick={downloadTemplate} className="w-full h-10 gap-2"><Download className="h-4 w-4" /> Download CSV</Button>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5"><Upload className="h-3.5 w-3.5" /> Upload</Label>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file); }} />
              <Button onClick={() => fileRef.current?.click()} disabled={isUploading} className="w-full h-10 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20">
                {isUploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</> : <><Upload className="h-4 w-4" /> Choose File</>}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-0.5">
                <p className="font-semibold">Upload instructions</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Download the template CSV above</li>
                  <li>Fill in employee data (including KPI Weight %) for the selected month</li>
                  <li>KPI weights within each category must sum to 100%</li>
                  <li>Upload — data will be stored for the chosen period</li>
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Tracked Employees" value={stats.totalEmployees} accent="primary" size="large" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg Multiplier" value={fmtNum(stats.avgMultiplier, 2)} accent="info" size="large" />
        <StatCard icon={<Award className="h-4 w-4" />} label="Rising Stars" value={stats.risingStars.length} sub={stats.risingStars.slice(0, 2).join(", ") || "None yet"} accent="success" size="large" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Underachievers" value={stats.underachievers.length} sub={stats.underachievers.slice(0, 2).join(", ") || "None yet"} accent="danger" size="large" pulse={stats.underachievers.length > 0 ? "red" : "none"} />
      </div>

      {allTriggers.total > 0 && (
        <motion.div variants={fadeUp}>
          <SectionCard title="Performance Alerts & Triggers" description={`${allTriggers.total} alert${allTriggers.total > 1 ? "s" : ""} require${allTriggers.total === 1 ? "s" : ""} attention`} icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}>
            <div className="space-y-4">
              {allTriggers.pip.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Clock className="h-3.5 w-3.5" /></div>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">PIP Required</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">{allTriggers.pip.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {allTriggers.pip.map((t, i) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                        <span className="font-semibold text-amber-800 dark:text-amber-300">{t.employeeName}</span>
                        <span className="text-amber-700 dark:text-amber-400 ml-2">{t.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {allTriggers.probation.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center"><AlertTriangle className="h-3.5 w-3.5" /></div>
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Probation Period</span>
                    <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30">{allTriggers.probation.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {allTriggers.probation.map((t, i) => (
                      <div key={i} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs">
                        <span className="font-semibold text-orange-800 dark:text-orange-300">{t.employeeName}</span>
                        <span className="text-orange-700 dark:text-orange-400 ml-2">{t.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {allTriggers.managementAction.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center"><AlertTriangle className="h-3.5 w-3.5" /></div>
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">Management Action Required</span>
                    <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30">{allTriggers.managementAction.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {allTriggers.managementAction.map((t, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs">
                        <span className="font-semibold text-red-800 dark:text-red-300">{t.employeeName}</span>
                        <span className="text-red-700 dark:text-red-400 ml-2">{t.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>
      )}

      {monthsWithData.length > 0 && (
        <motion.div variants={fadeUp}>
          <SectionCard title="Available Months" description="Click a month to load it, or delete to remove its data" icon={<Calendar className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {monthsWithData.map((m) => {
                const isActive = selectedYear === m.year && selectedMonth === m.month;
                return (
                  <div key={`${m.year}-${m.month}`} className={`group flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-lg border transition-all ${isActive ? "bg-primary/10 border-primary/40 text-primary" : "bg-background border-border hover:bg-accent/50"}`}>
                    <button onClick={() => { setSelectedYear(m.year); setSelectedMonth(m.month); }} className="text-xs font-medium whitespace-nowrap">
                      {new Date(m.year, m.month - 1, 1).toLocaleString("default", { month: "short", year: "numeric" })}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete data for ${m.month}/${m.year}?`)) {
                          const data = monthlyData.filter((d) => d.year === m.year && d.month === m.month);
                          for (const d of data) deleteMonthlyData(d.employeeId, d.year, d.month);
                          showToast.success("Data Deleted", `${m.month}/${m.year} removed.`);
                        }
                      }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <SectionCard title="Employee Performance Trends" description="Click an employee to expand KPI details and edit values" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="space-y-2">
            {employees.filter((e) => !e.isAdjunct).length === 0 ? (
              <EmptyState icon={<Users className="h-6 w-6" />} title="No employees" description="Upload a file or add employees to start tracking." />
            ) : (
              employees.filter((e) => !e.isAdjunct).map((emp, idx) => {
                const trend = getPerformanceTrend(emp.id);
                const history = getMonthlyHistory(emp.id);
                const isExpanded = expandedEmployee === emp.id;
                const empTriggers = getTriggersForEmployee(emp.id);
                const hasMgmt = empTriggers.some((t) => t.type === "management_action");
                const hasProb = empTriggers.some((t) => t.type === "probation");
                const hasPip = empTriggers.some((t) => t.type === "pip");

                return (
                  <motion.div key={emp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 0.3) }} className="border border-border/60 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors text-left">
                      <div className="flex items-center gap-3 min-w-0 flex-wrap">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{emp.name}</span>
                            <Badge variant="outline" className="font-mono text-[10px]">{emp.jobGrade}</Badge>
                            {trend && (
                              <Badge variant="outline" className={`text-[10px] gap-1 ${trend.trendDirection === "improving" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : trend.trendDirection === "declining" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" : "bg-muted"}`}>
                                {trend.trendDirection === "improving" && "Improving"}
                                {trend.trendDirection === "declining" && "Declining"}
                                {trend.trendDirection === "stable" && "Stable"}
                              </Badge>
                            )}
                            {hasMgmt && <Badge className="bg-red-600 text-white text-[10px] gap-1 animate-pulse"><AlertTriangle className="h-2.5 w-2.5" />Mgmt Action</Badge>}
                            {hasProb && !hasMgmt && <Badge className="bg-orange-500 text-white text-[10px] gap-1"><AlertTriangle className="h-2.5 w-2.5" />Probation</Badge>}
                            {hasPip && !hasProb && !hasMgmt && <Badge className="bg-amber-500 text-white text-[10px] gap-1"><Clock className="h-2.5 w-2.5" />PIP</Badge>}
                          </div>
                          {history.length > 0 && <div className="text-xs text-muted-foreground mt-0.5">{history.length} month{history.length > 1 ? "s" : ""} of data</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {trend && (
                          <div className="text-right">
                            <div className="text-base font-bold text-foreground">{fmtNum(trend.currentScore, 2)}</div>
                            <div className="text-[10px] text-muted-foreground">current</div>
                          </div>
                        )}
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="p-4 border-t border-border/50 bg-muted/20">
                            {history.length === 0 ? (
                              <EmptyState icon={<Calendar className="h-6 w-6" />} title="No monthly data" description="Upload a file to start tracking this employee." />
                            ) : (
                              <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                  <Card className="p-3 bg-background">
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Current</div>
                                    <div className="text-lg font-bold mt-1">{trend ? fmtNum(trend.currentScore, 3) : "—"}</div>
                                  </Card>
                                  <Card className="p-3 bg-background">
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Average</div>
                                    <div className="text-lg font-bold mt-1">{trend ? fmtNum(trend.averageScore, 3) : "—"}</div>
                                  </Card>
                                  <Card className="p-3 bg-emerald-500/5 border-emerald-500/20">
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">Best</div>
                                    <div className="text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400">{trend ? fmtNum(trend.bestMonth.score, 3) : "—"}</div>
                                  </Card>
                                  <Card className="p-3 bg-red-500/5 border-red-500/20">
                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400">Worst</div>
                                    <div className="text-lg font-bold mt-1 text-red-600 dark:text-red-400">{trend ? fmtNum(trend.worstMonth.score, 3) : "—"}</div>
                                  </Card>
                                </div>

                                {emp.categories && emp.categories.length > 0 ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Target className="h-3.5 w-3.5" />
                                      <span>Weighted Category Performance</span>
                                      <Badge variant="outline" className="text-[10px] gap-1 bg-muted"><Pencil className="h-2.5 w-2.5" /> Click numbers to edit</Badge>
                                    </div>
                                    {emp.categories.map((category: any, catIdx: number) => {
                                      let catSum = 0;
                                      let totalW = 0;
                                      const kpiDetails = category.kpis.map((kpi: any) => {
                                        const target = Number(kpi.target) || 0;
                                        const actual = Number(kpi.actual) || 0;
                                        const ratio = target > 0 ? actual / target : 0;
                                        const weight = Number(kpi.weight) || 0;
                                        if (target > 0 && weight > 0) { catSum += ratio * weight; totalW += weight; }
                                        return { ...kpi, target, actual, ratio, weight, achievement: ratio * 100 };
                                      });
                                      const finalScore = totalW > 0 ? (catSum / totalW) * 100 : 0;
                                      const statusColor = finalScore >= 100 ? "emerald" : finalScore >= 70 ? "blue" : finalScore >= 50 ? "amber" : "red";

                                      return (
                                        <Card key={catIdx} className="overflow-hidden">
                                          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-muted/40 to-transparent">
                                            <div className="flex items-center gap-2">
                                              <span className="font-semibold text-sm">{category.name}</span>
                                              <Badge variant="outline" className="text-[10px]">Weight {category.weight}%</Badge>
                                            </div>
                                            <span className={`text-lg font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>{fmtNum(finalScore, 1)}%</span>
                                          </div>
                                          <div className="divide-y divide-border/50">
                                            {kpiDetails.map((kpi: any, kIdx: number) => {
                                              const isEditTarget = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "target";
                                              const isEditActual = editingKPI?.employeeId === emp.id && editingKPI?.categoryId === category.id && editingKPI?.kpiId === kpi.id && editingKPI?.field === "actual";

                                              return (
                                                <div key={kIdx} className="grid grid-cols-12 gap-3 items-center p-3 text-sm">
                                                  <div className="col-span-12 md:col-span-4"><span className="text-sm">{kpi.description}</span></div>
                                                  <div className="col-span-3 md:col-span-2 text-xs">
                                                    <span className="md:hidden text-[10px] uppercase block text-muted-foreground">Target</span>
                                                    {isEditTarget ? (
                                                      <Input type="number" className="h-7 text-xs" value={editingKPI?.value || 0} onChange={(e) => setEditingKPI((p) => p ? { ...p, value: Number(e.target.value) } : null)} onBlur={saveEdit} onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus />
                                                    ) : (
                                                      <button className="hover:bg-accent/50 rounded px-1.5 py-0.5 w-full text-left hover:text-primary transition-colors" onClick={() => startEditing(emp.id, category.id, kpi.id, "target", kpi.target)}>{fmtNum(kpi.target)} {kpi.metric}</button>
                                                    )}
                                                  </div>
                                                  <div className="col-span-3 md:col-span-2 text-xs">
                                                    <span className="md:hidden text-[10px] uppercase block text-muted-foreground">Actual</span>
                                                    {isEditActual ? (
                                                      <Input type="number" className="h-7 text-xs" value={editingKPI?.value || 0} onChange={(e) => setEditingKPI((p) => p ? { ...p, value: Number(e.target.value) } : null)} onBlur={saveEdit} onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus />
                                                    ) : (
                                                      <button className="hover:bg-accent/50 rounded px-1.5 py-0.5 w-full text-left hover:text-primary transition-colors" onClick={() => startEditing(emp.id, category.id, kpi.id, "actual", kpi.actual)}>{fmtNum(kpi.actual)} {kpi.metric}</button>
                                                    )}
                                                  </div>
                                                  <div className="col-span-3 md:col-span-2 text-xs">
                                                    <span className="md:hidden text-[10px] uppercase block text-muted-foreground">Weight</span>
                                                    <span className="font-semibold">{kpi.weight}%</span>
                                                  </div>
                                                  <div className="col-span-3 md:col-span-2 text-right">
                                                    <span className="md:hidden text-[10px] uppercase block text-muted-foreground">Score</span>
                                                    <span className={`font-bold text-sm ${kpi.achievement >= 100 ? "text-emerald-600 dark:text-emerald-400" : kpi.achievement >= 70 ? "text-blue-600 dark:text-blue-400" : kpi.achievement >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{fmtNum(kpi.achievement, 1)}%</span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <EmptyState icon={<Target className="h-6 w-6" />} title="No categories" description="This employee has no KPI categories assigned." />
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </SectionCard>
      </motion.div>
    </motion.div>
  );
}