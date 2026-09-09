import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { 
  Upload, Download, Calendar, FileSpreadsheet, 
  TrendingUp, TrendingDown, Users, Award, AlertTriangle,
  ChevronDown, ChevronRight, Trash2, CheckCircle, XCircle,
  Database, Save, Target, RefreshCw
} from "lucide-react";
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";


// Example for employees route
beforeLoad: async () => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw redirect({ to: "/login" });
  // We'd need to check role, but we don't have access to store here easily.
  // Instead, we can rely on the layout's condition, but for extra security, we can redirect if role is not admin/hr.
  // We'll implement a simpler approach: on the client side, the layout already hides nav, but they can still type URL.
  // To truly protect, we can wrap the component with a check using the useUser hook inside the component and redirect.
}

export const Route = createFileRoute("/_app/monthly")({
  component: MonthlyPage,
});

// CSV/Excel Template
const TEMPLATE_CSV = `Employee Name,Employee ID,Category,Category Weight (%),KPI Description,KPI Metric,KPI Target,KPI Actual
Alice Johnson,emp1,Strategic,30,Revenue Growth,GHS,500000,600000
Alice Johnson,emp1,Strategic,30,CSAT Score,%,90,85
Alice Johnson,emp1,Strategic,30,Market Share,%,25,20
Alice Johnson,emp1,Operational,20,Process Efficiency,%,95,88
Bob Smith,emp2,Team Performance,40,Team Lead,%,100,90
Bob Smith,emp2,Team Performance,40,Projects Completed,#,12,10
Carol Davis,emp3,Project Delivery,50,Project completion,%,100,95
Carol Davis,emp3,Client Satisfaction,30,Client NPS,%,80,75`;

function MonthlyPage() {
  const { 
    employees, 
    monthlyData, 
    saveMonthlySnapshot, 
    getMonthlyHistory, 
    getPerformanceTrend,
    getAllTrends,
    getMonthlyStats,
    deleteMonthlyData,
    calc,
    upsertEmployee,
    setEmployees,
    detectTriggers,
    getTriggersForEmployee
  } = useP4P();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [uploadStatus, setUploadStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ===== EDITING STATE =====
  const [editingKPI, setEditingKPI] = useState<{
    employeeId: string;
    categoryId: string;
    kpiId: string;
    field: 'target' | 'actual';
    value: number;
  } | null>(null);

  // ===== EDITING FUNCTIONS =====
  const startEditing = (employeeId: string, categoryId: string, kpiId: string, field: 'target' | 'actual', currentValue: number) => {
    setEditingKPI({
      employeeId,
      categoryId,
      kpiId,
      field,
      value: currentValue
    });
  };

  const saveEdit = () => {
    if (!editingKPI) return;

    // Find the employee and update the specific KPI
    const updatedEmployees = employees.map(emp => {
      if (emp.id !== editingKPI.employeeId) return emp;

      const updatedCategories = (emp.categories || []).map(cat => {
        if (cat.id !== editingKPI.categoryId) return cat;
        
        const updatedKpis = cat.kpis.map(k => {
          if (k.id !== editingKPI.kpiId) return k;
          return {
            ...k,
            [editingKPI.field]: editingKPI.value
          };
        });
        return { ...cat, kpis: updatedKpis };
      });

      return { ...emp, categories: updatedCategories };
    });

    setEmployees(updatedEmployees);

    // Save monthly snapshot for this employee
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    saveMonthlySnapshot(editingKPI.employeeId, currentYear, currentMonth);

    setEditingKPI(null);
    alert('✅ KPI updated successfully!');
  };

  const cancelEdit = () => {
    setEditingKPI(null);
  };

  const stats = getMonthlyStats();
  const trends = getAllTrends();
  const monthsWithData = stats.monthsWithData || [];

  // Check if data exists for selected month
  const hasDataForMonth = monthsWithData.some(m => m.year === selectedYear && m.month === selectedMonth);

  // Download template
  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `monthly_performance_template_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Force save all current employee data
  const refreshMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    let count = 0;
    for (const emp of employees) {
      if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) {
        saveMonthlySnapshot(emp.id, currentYear, currentMonth);
        count++;
      }
    }
    
    alert(`✅ Refreshed data for ${count} employees for ${currentMonth}/${currentYear}`);
  };

  // Handle file upload
  const handleUpload = (file: File) => {
    setIsUploading(true);
    setUploadStatus(null);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    const processData = (data: any[]) => {
      try {
        // Parse the uploaded data
        const headers = Object.keys(data[0] || {});
        const required = ["Employee Name", "KPI Description", "KPI Target", "KPI Actual"];
        const missing = required.filter(r => !headers.some(h => h.trim() === r));
        
        if (missing.length > 0) {
          throw new Error(`Missing columns: ${missing.join(", ")}`);
        }

        // Group by employee
        const employeeMap = new Map<string, { name: string; categories: Map<string, { weight: number; kpis: any[] }> }>();
        
        for (const row of data) {
          const empName = row["Employee Name"]?.trim();
          const empId = row["Employee ID"]?.trim() || `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const category = row["Category"]?.trim() || "General";
          const categoryWeight = Number(row["Category Weight (%)"]) || 0;
          const kpiDesc = row["KPI Description"]?.trim();
          const kpiMetric = row["KPI Metric"]?.trim() || "%";
          const kpiTarget = Number(row["KPI Target"]);
          const kpiActual = Number(row["KPI Actual"]);

          if (!empName || !kpiDesc || isNaN(kpiTarget) || isNaN(kpiActual)) continue;

          if (!employeeMap.has(empId)) {
            employeeMap.set(empId, { 
              name: empName, 
              categories: new Map() 
            });
          }

          const emp = employeeMap.get(empId)!;
          
          if (!emp.categories.has(category)) {
            emp.categories.set(category, { weight: categoryWeight, kpis: [] });
          }
          
          emp.categories.get(category)!.kpis.push({
            description: kpiDesc,
            metric: kpiMetric,
            target: kpiTarget,
            actual: kpiActual,
            weight: 100 // equal weight within category
          });
        }

        // Convert to Employee format and save
        const updatedEmployees = [...employees];
        let newCount = 0;
        let updateCount = 0;

        for (const [empId, empData] of employeeMap) {
          const categories: any[] = [];
          for (const [catName, catData] of empData.categories) {
            categories.push({
              id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: catName,
              weight: catData.weight || 0,
              kpis: catData.kpis.map((k: any) => ({
                id: `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                description: k.description,
                metric: k.metric,
                target: k.target,
                actual: k.actual,
                weight: 100
              }))
            });
          }

          // Find if employee exists
          const existingIdx = updatedEmployees.findIndex(e => e.name === empData.name);
          if (existingIdx >= 0) {
            // Update existing employee
            updatedEmployees[existingIdx] = {
              ...updatedEmployees[existingIdx],
              categories: categories,
              kpis: [] // Clear legacy KPIs when using categories
            };
            updateCount++;
          } else {
            // Create new employee
            updatedEmployees.push({
              id: empId,
              name: empData.name,
              jobGrade: "4",
              isAdjunct: false,
              isSalesRole: false,
              joinDate: new Date().toISOString().slice(0, 10),
              monthsWorked: 12,
              kpis: [],
              categories: categories
            });
            newCount++;
          }
        }

        // Update employees in store
        setEmployees(updatedEmployees);

        // Save monthly snapshot for all employees
        for (const emp of updatedEmployees) {
          if (!emp.isAdjunct && emp.categories && emp.categories.length > 0) {
            saveMonthlySnapshot(emp.id, selectedYear, selectedMonth);
          }
        }

        setUploadStatus({ 
          ok: true, 
          msg: `✅ Uploaded ${employeeMap.size} employees (${newCount} new, ${updateCount} updated) for ${selectedMonth}/${selectedYear}` 
        });
        
      } catch (error: any) {
        setUploadStatus({ ok: false, msg: error.message || "Failed to process file" });
      } finally {
        setIsUploading(false);
      }
    };

    // Parse based on file type
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            processData(result.data);
          } else {
            setUploadStatus({ ok: false, msg: "No data found in file" });
            setIsUploading(false);
          }
        },
        error: (err) => {
          setUploadStatus({ ok: false, msg: err.message });
          setIsUploading(false);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          if (jsonData && jsonData.length > 0) {
            processData(jsonData);
          } else {
            setUploadStatus({ ok: false, msg: "No data found in file" });
            setIsUploading(false);
          }
        } catch (err: any) {
          setUploadStatus({ ok: false, msg: err.message });
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus({ ok: false, msg: "Unsupported file format. Please use CSV or Excel (.xlsx)" });
      setIsUploading(false);
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  // Export data for a specific month
  const exportMonthData = (year: number, month: number) => {
    const monthData = monthlyData.filter(d => d.year === year && d.month === month);
    if (monthData.length === 0) {
      alert(`No data found for ${month}/${year}`);
      return;
    }

    const rows: string[][] = [
      ["Employee", "Category", "KPI", "Metric", "Target", "Actual", "Achievement %", "Multiplier"]
    ];

    for (const d of monthData) {
      const emp = employees.find(e => e.id === d.employeeId);
      if (!emp) continue;
      
      if (d.categories) {
        for (const cat of d.categories) {
          for (const kpi of cat.kpis) {
            const achievement = kpi.target > 0 ? (kpi.actual / kpi.target) * 100 : 0;
            rows.push([
              emp.name,
              cat.name,
              kpi.description,
              kpi.metric,
              String(kpi.target),
              String(kpi.actual),
              fmtNum(achievement, 1),
              fmtNum(d.performanceMultiplier, 3)
            ]);
          }
        }
      }
    }

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `monthly_data_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Get triggers for display
  const allTriggers = useMemo(() => {
    try {
      return detectTriggers();
    } catch (e) {
      return { pip: [], probation: [], managementAction: [], total: 0 };
    }
  }, [detectTriggers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Monthly Performance Upload</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload monthly performance data via CSV/Excel to track trends and identify rising stars.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" /> Upload Monthly Data
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Year</Label>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Month</Label>
            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={downloadTemplate} className="flex-1">
              <Download className="h-4 w-4 mr-1" /> Template
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileRef.current?.click()}
              className="flex-1"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshMonthlyData}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <input 
              ref={fileRef} 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              hidden 
              onChange={(e) => { 
                const file = e.target.files?.[0]; 
                if (file) handleUpload(file); 
              }} 
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          <p className="font-medium">📋 Upload Instructions:</p>
          <ul className="list-disc list-inside text-xs space-y-1 mt-1">
            <li>Download the template CSV file above</li>
            <li>Fill in employee performance data for the selected month</li>
            <li>Upload the file - it will be stored for {selectedMonth}/{selectedYear}</li>
            <li>Data is automatically saved and used for trend analysis</li>
          </ul>
        </div>

        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md text-sm ${uploadStatus.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {uploadStatus.msg}
          </div>
        )}

        {hasDataForMonth && (
          <div className="mt-3 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Data already exists for {selectedMonth}/{selectedYear}. Uploading will replace it.
          </div>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> Tracked Employees
          </div>
          <div className="text-2xl font-bold">{stats.totalEmployees}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Average Multiplier
          </div>
          <div className="text-2xl font-bold">{fmtNum(stats.avgMultiplier, 2)}</div>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Award className="h-4 w-4" /> Rising Stars
          </div>
          <div className="text-lg font-bold text-green-700">{stats.risingStars.length}</div>
          <div className="text-xs text-green-600 truncate">
            {stats.risingStars.join(", ") || "None yet"}
          </div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" /> Underachievers
          </div>
          <div className="text-lg font-bold text-red-700">{stats.underachievers.length}</div>
          <div className="text-xs text-red-600 truncate">
            {stats.underachievers.join(", ") || "None yet"}
          </div>
        </Card>
      </div>

      {/* TRIGGERS SECTION */}
      {allTriggers.total > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" /> Performance Alerts & Triggers
          </h3>
          
          {/* PIP */}
          {allTriggers.pip.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-yellow-700 mb-2">⚠️ PIP Required ({allTriggers.pip.length})</h4>
              <div className="space-y-2">
                {allTriggers.pip.map((t, i) => (
                  <div key={i} className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                    <span className="font-medium">{t.employeeName}</span>
                    <span className="text-xs text-yellow-700 ml-2">{t.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Probation */}
          {allTriggers.probation.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-orange-700 mb-2">📋 Probation Period ({allTriggers.probation.length})</h4>
              <div className="space-y-2">
                {allTriggers.probation.map((t, i) => (
                  <div key={i} className="p-2 bg-orange-50 border border-orange-200 rounded-md text-sm">
                    <span className="font-medium">{t.employeeName}</span>
                    <span className="text-xs text-orange-700 ml-2">{t.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Management Action */}
          {allTriggers.managementAction.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">🔴 Management Action Required ({allTriggers.managementAction.length})</h4>
              <div className="space-y-2">
                {allTriggers.managementAction.map((t, i) => (
                  <div key={i} className="p-2 bg-red-50 border border-red-200 rounded-md text-sm">
                    <span className="font-medium">{t.employeeName}</span>
                    <span className="text-xs text-red-700 ml-2">{t.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Month Selector for Viewing */}
      {monthsWithData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">📅 Available Months</h3>
          <div className="flex flex-wrap gap-2">
            {monthsWithData.map((m) => (
              <Button
                key={`${m.year}-${m.month}`}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedYear(m.year);
                  setSelectedMonth(m.month);
                }}
              >
                <Calendar className="h-3 w-3" />
                {new Date(m.year, m.month - 1, 1).toLocaleString('default', { month: 'short' })} {m.year}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete data for ${m.month}/${m.year}?`)) {
                      const monthData = monthlyData.filter(d => d.year === m.year && d.month === m.month);
                      for (const d of monthData) {
                        deleteMonthlyData(d.employeeId, d.year, d.month);
                      }
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Employee Trend List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">📈 Employee Performance Trends</h3>
        <div className="space-y-3">
          {employees.filter(e => !e.isAdjunct).map((emp) => {
            const trend = getPerformanceTrend(emp.id);
            const history = getMonthlyHistory(emp.id);
            const isExpanded = expandedEmployee === emp.id;
            
            // Check for triggers
            const empTriggers = getTriggersForEmployee(emp.id);
            const hasManagement = empTriggers.some(t => t.type === 'management_action');
            const hasProbation = empTriggers.some(t => t.type === 'probation');
            const hasPIP = empTriggers.some(t => t.type === 'pip');
            
            return (
              <div key={emp.id} className="border rounded-md overflow-hidden">
                <button
                  onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/30 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-xs text-muted-foreground">{emp.jobGrade}</span>
                    {trend && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        trend.trendDirection === 'improving' ? 'bg-green-100 text-green-700' :
                        trend.trendDirection === 'declining' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {trend.trendDirection === 'improving' && '📈 Improving'}
                        {trend.trendDirection === 'declining' && '📉 Declining'}
                        {trend.trendDirection === 'stable' && '➖ Stable'}
                      </span>
                    )}
                    {hasManagement && (
                      <span className="ml-1 text-xs px-2 py-0.5 bg-red-700 text-white rounded-full font-bold animate-pulse">
                        🔴 Mgmt Action
                      </span>
                    )}
                    {hasProbation && !hasManagement && (
                      <span className="ml-1 text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full font-bold">
                        📋 Probation
                      </span>
                    )}
                    {hasPIP && !hasProbation && !hasManagement && (
                      <span className="ml-1 text-xs px-2 py-0.5 bg-yellow-500 text-white rounded-full font-bold">
                        ⚠️ PIP
                      </span>
                    )}
                    {history.length === 0 && (
                      <span className="text-xs text-muted-foreground">No data yet</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {trend && (
                      <span className="text-sm font-bold">
                        {fmtNum(trend.currentScore, 2)}
                      </span>
                    )}
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded details - WITH EDITABLE KPIs */}
                {isExpanded && (
                  <div className="p-4 border-t bg-muted/10">
                    {history.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No monthly data yet. Upload a file to start tracking.</p>
                    ) : (
                      <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-white p-3 rounded-md border">
                            <div className="text-xs text-muted-foreground">Current Score</div>
                            <div className="text-lg font-bold">{trend ? fmtNum(trend.currentScore, 3) : '—'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md border">
                            <div className="text-xs text-muted-foreground">Average</div>
                            <div className="text-lg font-bold">{trend ? fmtNum(trend.averageScore, 3) : '—'}</div>
                          </div>
                          <div className="bg-white p-3 rounded-md border">
                            <div className="text-xs text-muted-foreground">Best Month</div>
                            <div className="text-lg font-bold">
                              {trend ? `${fmtNum(trend.bestMonth.score, 3)} (${trend.bestMonth.month}/${trend.bestMonth.year})` : '—'}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-md border">
                            <div className="text-xs text-muted-foreground">Worst Month</div>
                            <div className="text-lg font-bold">
                              {trend ? `${fmtNum(trend.worstMonth.score, 3)} (${trend.worstMonth.month}/${trend.worstMonth.year})` : '—'}
                            </div>
                          </div>
                        </div>

                        {/* WEIGHTED CATEGORY PERFORMANCE - WITH EDITABLE KPIs */}
                        {emp.categories && emp.categories.length > 0 ? (
                          <div className="space-y-3 mb-4">
                            <p className="font-medium text-sm flex items-center gap-2">
                              <Target className="h-4 w-4" /> Weighted Category Performance <span className="text-xs text-muted-foreground font-normal">(click numbers to edit)</span>
                            </p>
                            <div className="space-y-3">
                              {emp.categories.map((category, catIdx) => {
                                // Calculate category score from current KPI values
                                let categoryScore = 0;
                                let totalKpiWeight = 0;
                                let kpiDetails: any[] = [];

                                if (category.kpis && category.kpis.length > 0) {
                                  for (const kpi of category.kpis) {
                                    const target = Number(kpi.target) || 0;
                                    const actual = Number(kpi.actual) || 0;
                                    const ratio = target > 0 ? actual / target : 0;
                                    const achievement = ratio * 100;
                                    const weight = Number(kpi.weight) || 100;
                                    
                                    kpiDetails.push({
                                      id: kpi.id,
                                      description: kpi.description,
                                      target,
                                      actual,
                                      ratio,
                                      achievement,
                                      metric: kpi.metric || '%'
                                    });
                                    
                                    if (target > 0) {
                                      categoryScore += ratio * weight;
                                      totalKpiWeight += weight;
                                    }
                                  }
                                }

                                const finalScore = totalKpiWeight > 0 ? (categoryScore / totalKpiWeight) * 100 : 0;
                                const catStatus = finalScore >= 100 ? 'exceeded' : finalScore >= 70 ? 'met' : finalScore >= 50 ? 'partial' : 'missed';

                                return (
                                  <div key={catIdx} className="border rounded-md p-3 bg-white">
                                    <div className="flex items-center justify-between mb-1">
                                      <div>
                                        <span className="font-medium">{category.name}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">(Weight: {category.weight}%)</span>
                                      </div>
                                      <div className={`text-sm font-semibold ${
                                        catStatus === 'exceeded' ? 'text-green-600' : 
                                        catStatus === 'met' ? 'text-blue-600' : 
                                        catStatus === 'partial' ? 'text-yellow-600' : 
                                        'text-red-600'
                                      }`}>
                                        {fmtNum(finalScore, 1)}%
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          catStatus === 'exceeded' ? 'bg-green-500' : 
                                          catStatus === 'met' ? 'bg-blue-500' : 
                                          catStatus === 'partial' ? 'bg-yellow-500' : 
                                          'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(100, finalScore)}%` }}
                                      />
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 gap-1">
                                      {kpiDetails.length > 0 ? (
                                        kpiDetails.map((kpi, kIdx) => {
                                          const isEditingTarget = editingKPI?.employeeId === emp.id && 
                                                                 editingKPI?.categoryId === category.id && 
                                                                 editingKPI?.kpiId === kpi.id && 
                                                                 editingKPI?.field === 'target';
                                          const isEditingActual = editingKPI?.employeeId === emp.id && 
                                                                 editingKPI?.categoryId === category.id && 
                                                                 editingKPI?.kpiId === kpi.id && 
                                                                 editingKPI?.field === 'actual';

                                          return (
                                            <div key={kIdx} className="grid grid-cols-6 gap-2 text-xs border-b border-muted pb-1 last:border-0 items-center">
                                              <div className="col-span-2">{kpi.description}</div>
                                              
                                              {/* Target - Editable */}
                                              <div className="col-span-1">
                                                {isEditingTarget ? (
                                                  <Input
                                                    type="number"
                                                    className="h-6 w-full text-xs p-1"
                                                    value={editingKPI?.value || 0}
                                                    onChange={(e) => setEditingKPI(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                                                    onBlur={saveEdit}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                    autoFocus
                                                  />
                                                ) : (
                                                  <button 
                                                    className="hover:bg-muted/30 rounded px-1 py-0.5 w-full text-left hover:text-blue-600 transition-colors"
                                                    onClick={() => startEditing(emp.id, category.id, kpi.id, 'target', kpi.target)}
                                                  >
                                                    {fmtNum(kpi.target)} {kpi.metric}
                                                  </button>
                                                )}
                                              </div>
                                              
                                              {/* Actual - Editable */}
                                              <div className="col-span-1">
                                                {isEditingActual ? (
                                                  <Input
                                                    type="number"
                                                    className="h-6 w-full text-xs p-1"
                                                    value={editingKPI?.value || 0}
                                                    onChange={(e) => setEditingKPI(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                                                    onBlur={saveEdit}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                    autoFocus
                                                  />
                                                ) : (
                                                  <button 
                                                    className="hover:bg-muted/30 rounded px-1 py-0.5 w-full text-left hover:text-blue-600 transition-colors"
                                                    onClick={() => startEditing(emp.id, category.id, kpi.id, 'actual', kpi.actual)}
                                                  >
                                                    {fmtNum(kpi.actual)} {kpi.metric}
                                                  </button>
                                                )}
                                              </div>
                                              
                                              {/* Achievement */}
                                              <div className={`col-span-1 font-semibold ${
                                                kpi.achievement >= 100 ? 'text-green-600' : 
                                                kpi.achievement >= 70 ? 'text-yellow-600' : 
                                                'text-red-600'
                                              }`}>
                                                {fmtNum(kpi.achievement, 1)}%
                                                {kpi.achievement >= 100 && ' ✅'}
                                                {kpi.achievement < 50 && ' ⚠️'}
                                              </div>

                                              {/* Edit indicator */}
                                              <div className="col-span-1 text-right">
                                                {isEditingTarget || isEditingActual ? (
                                                  <span className="text-blue-500 text-[10px]">editing...</span>
                                                ) : (
                                                  <span className="text-[10px] text-muted-foreground">✎ click</span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="text-xs text-muted-foreground">No KPI data available</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Overall Score */}
                              {trend && (
                                <div className={`p-3 rounded-lg ${
                                  trend.currentScore < 0.5 ? 'bg-red-50 border border-red-200' :
                                  trend.currentScore >= 1.0 ? 'bg-green-50 border border-green-200' :
                                  'bg-yellow-50 border border-yellow-200'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Overall Performance Score</span>
                                    <span className={`text-lg font-bold ${
                                      trend.currentScore < 0.5 ? 'text-red-600' :
                                      trend.currentScore >= 1.0 ? 'text-green-600' :
                                      'text-yellow-600'
                                    }`}>
                                      {fmtNum(trend.currentScore * 100, 1)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        trend.currentScore < 0.5 ? 'bg-red-500' :
                                        trend.currentScore >= 1.0 ? 'bg-green-500' :
                                        'bg-yellow-500'
                                      }`}
                                      style={{ width: `${Math.min(100, trend.currentScore * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Fallback: Monthly History table (if no categories)
                          <div className="space-y-2">
                            <p className="font-medium text-sm">📊 Monthly History</p>
                            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                              <div className="col-span-2">Month</div>
                              <div className="col-span-2">Year</div>
                              <div className="col-span-3">Multiplier</div>
                              <div className="col-span-3">Bonus</div>
                              <div className="col-span-2">Actions</div>
                            </div>
                            {history.map((h, idx) => (
                              <div key={idx} className="grid grid-cols-6 md:grid-cols-12 gap-2 text-sm border-b border-muted py-2">
                                <div className="col-span-2">{h.month}</div>
                                <div className="col-span-2">{h.year}</div>
                                <div className="col-span-3 font-mono">{fmtNum(h.performanceMultiplier, 3)}</div>
                                <div className="col-span-3 font-mono">{fmtGHS(h.bonusEligible)}</div>
                                <div className="col-span-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      if (confirm(`Delete ${h.month}/${h.year} data?`)) {
                                        deleteMonthlyData(emp.id, h.year, h.month);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {employees.filter(e => !e.isAdjunct).length === 0 && (
            <p className="text-center text-muted-foreground py-8">No non-adjunct employees found. Upload a file to add employees.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
