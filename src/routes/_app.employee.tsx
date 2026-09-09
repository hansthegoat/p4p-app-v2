import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, Target, AlertCircle, TrendingUp, 
  TrendingDown, Award, Clock, Star, Eye, Send, Upload, Paperclip, 
  File, X, MessageSquare, Info
} from "lucide-react";
import { getCurrentUser, uploadProofFile } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export const Route = createFileRoute("/_app/employee")({
  component: EmployeePortal,
});

function EmployeePortal() {
  const navigate = useNavigate();
  const { 
    employees, 
    setEmployees, 
    getMonthlyHistory, 
    submitAppraisal,
    saveKPIProof,
    saveKPIComment
  } = useP4P();

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [editingActuals, setEditingActuals] = useState<Record<string, number>>({});
  const [kpiComments, setKpiComments] = useState<Record<string, string>>({});
  const [kpiProofs, setKpiProofs] = useState<Record<string, any[]>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month'>('month');
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Get current period
  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let quarter = '';
    if (month <= 3) quarter = 'Q1';
    else if (month <= 6) quarter = 'Q2';
    else if (month <= 9) quarter = 'Q3';
    else quarter = 'Q4';
    return `${quarter} ${year}`;
  };

  // ===== MEMOIZED VALUES =====
  const yearData = useMemo(() => {
    if (!employee) return [];
    const history = getMonthlyHistory(employee.id);
    const yearHistory = history
      .filter(d => d.year === selectedYear)
      .sort((a, b) => a.month - b.month);
    return yearHistory;
  }, [employee, getMonthlyHistory, selectedYear]);

  const trendData = useMemo(() => {
    if (!employee) return [];
    const history = getMonthlyHistory(employee.id);
    const sorted = [...history].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    const last6 = sorted.slice(-6);
    return last6.map(d => ({
      month: `${d.month}/${d.year}`,
      score: d.performanceMultiplier,
      label: `${new Date(d.year, d.month - 1, 1).toLocaleString('default', { month: 'short' })} ${d.year}`,
    }));
  }, [employee, getMonthlyHistory]);

  const monthOverMonth = useMemo(() => {
    if (trendData.length < 2) return null;
    const last = trendData[trendData.length - 1].score;
    const prev = trendData[trendData.length - 2].score;
    if (prev === 0) return null;
    const change = ((last - prev) / prev) * 100;
    return change;
  }, [trendData]);

  const yearStats = useMemo(() => {
    if (yearData.length === 0) return null;
    const scores = yearData.map(d => d.performanceMultiplier);
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { best, worst, avg, count: scores.length };
  }, [yearData]);

  // ===== PERFORMANCE BAND =====
  const getPerformanceBand = (score: number) => {
    if (score >= 1.2) return { label: "Exceptional", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Star };
    if (score >= 1.0) return { label: "Exceeds Expectations", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: TrendingUp };
    if (score >= 0.8) return { label: "Meets Expectations", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Target };
    if (score >= 0.6) return { label: "Needs Improvement", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: Clock };
    return { label: "Performance Improvement Plan", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle };
  };

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const emp = employees.find(e => e.email === user.email);
        if (!emp) {
          setError("No employee record found for your email. Please contact HR.");
          setLoading(false);
          return;
        }

        setEmployee(emp);
        const now = new Date();
        setSelectedYear(now.getFullYear());
        setSelectedMonth(now.getMonth() + 1);
        setLoading(false);
      } catch (err) {
        setError("Failed to load your profile.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [employees, navigate]);

  // ===== LOAD DATA FOR SELECTED MONTH =====
  useEffect(() => {
    if (!employee || viewMode === 'year') {
      setSelectedSnapshot(null);
      return;
    }

    const history = getMonthlyHistory(employee.id);
    const snap = history.find(d => d.year === selectedYear && d.month === selectedMonth);
    setSelectedSnapshot(snap || null);

    // Get the KPI structure from the employee's template
    const categories = employee.categories || [];
    
    if (snap) {
      // Show the approved snapshot data (with its own proofs and comments)
      const actuals: Record<string, number> = {};
      const comments: Record<string, string> = {};
      const proofs: Record<string, any[]> = {};
      
      for (const cat of snap.categories || []) {
        for (const kpi of cat.kpis) {
          actuals[kpi.id] = kpi.actual || 0;
          comments[kpi.id] = kpi.comment || "";
          proofs[kpi.id] = kpi.proof || [];
        }
      }
      setEditingActuals(actuals);
      setKpiComments(comments);
      setKpiProofs(proofs);
    } else {
      // No snapshot exists - show EMPTY data (all zeros, no proofs, no comments)
      const emptyActuals: Record<string, number> = {};
      const emptyComments: Record<string, string> = {};
      const emptyProofs: Record<string, any[]> = {};
      
      for (const cat of categories) {
        for (const kpi of cat.kpis) {
          emptyActuals[kpi.id] = 0;
          emptyComments[kpi.id] = "";
          emptyProofs[kpi.id] = [];
        }
      }
      setEditingActuals(emptyActuals);
      setKpiComments(emptyComments);
      setKpiProofs(emptyProofs);
    }
  }, [employee, selectedYear, selectedMonth, getMonthlyHistory, viewMode]);

  // ===== LOADING STATE =====
  if (loading) {
    return <div className="p-8 text-center">Loading your profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/logout" })}>
          Logout
        </Button>
      </div>
    );
  }

  if (!employee) {
    return <div className="p-8 text-center">No employee data found.</div>;
  }

  // ===== HANDLERS =====
  const updateActual = (kpiId: string, value: number) => {
    setEditingActuals(prev => ({ ...prev, [kpiId]: value }));
  };

  const updateComment = (kpiId: string, value: string) => {
    setKpiComments(prev => ({ ...prev, [kpiId]: value }));
  };

  const handleFileUpload = async (kpiId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !employee) return;
    
    setUploadingFiles(prev => ({ ...prev, [kpiId]: true }));
    
    try {
      const uploadedFiles = [];
      for (const file of files) {
        const result = await uploadProofFile(employee.id, kpiId, file);
        if (result) {
          const fileData = {
            id: result.id,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            fileType: result.fileType,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          };
          uploadedFiles.push(fileData);
        }
      }
      
      // Update local state immediately
      setKpiProofs(prev => {
        const current = prev[kpiId] || [];
        return { ...prev, [kpiId]: [...current, ...uploadedFiles] };
      });
      
      // Also save to store so it persists
      for (const fileData of uploadedFiles) {
        saveKPIProof(employee.id, kpiId, fileData);
      }
      
      alert(`✅ ${uploadedFiles.length} file(s) uploaded successfully!`);
    } catch (err) {
      alert("❌ Failed to upload files. Please try again.");
    } finally {
      setUploadingFiles(prev => ({ ...prev, [kpiId]: false }));
      if (fileInputRefs.current[kpiId]) {
        fileInputRefs.current[kpiId]!.value = "";
      }
    }
  };

  const removeProof = (kpiId: string, proofId: string) => {
    // Remove from local state
    setKpiProofs(prev => ({
      ...prev,
      [kpiId]: (prev[kpiId] || []).filter((p: any) => p.id !== proofId),
    }));
    
    // Also remove from employee data
    if (!employee) return;
    const updatedEmployees = employees.map(emp => {
      if (emp.id !== employee.id) return emp;
      const updatedCategories = (emp.categories || []).map(cat => ({
        ...cat,
        kpis: cat.kpis.map(k => {
          if (k.id !== kpiId) return k;
          return {
            ...k,
            proof: (k.proof || []).filter((p: any) => p.id !== proofId),
          };
        })
      }));
      return { ...emp, categories: updatedCategories };
    });
    setEmployees(updatedEmployees);
  };

  // ===== SUBMIT FOR APPRAISAL =====
  const handleSubmitForAppraisal = () => {
    if (!employee) return;

    if (!employee.categories || employee.categories.length === 0) {
      alert("You don't have any KPIs to submit. Please contact HR.");
      return;
    }

    // Save the current data (actuals, comments, proofs) to the employee object
    const updatedEmployees = employees.map(emp => {
      if (emp.id !== employee.id) return emp;
      const updatedCategories = (emp.categories || []).map(cat => ({
        ...cat,
        kpis: cat.kpis.map(k => ({
          ...k,
          actual: editingActuals[k.id] !== undefined ? editingActuals[k.id] : 0,
          comment: kpiComments[k.id] !== undefined ? kpiComments[k.id] : "",
          proof: kpiProofs[k.id] || [],
          updatedAt: new Date().toISOString(),
        })),
      }));
      return { ...emp, categories: updatedCategories };
    });
    setEmployees(updatedEmployees);
    const updatedEmp = updatedEmployees.find(e => e.id === employee.id);
    if (updatedEmp) setEmployee(updatedEmp);

    const period = getCurrentPeriod();
    setSubmittingAppraisal(true);
    
    try {
      submitAppraisal(employee.id, period, selectedYear, selectedMonth);
      alert(`✅ Appraisal submitted for ${period} (${selectedMonth}/${selectedYear})! Your manager will review it.`);
    } catch (error: any) {
      alert(`❌ Failed to submit: ${error.message}`);
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  // ===== SCORE CALCULATION =====
  let displayCategories = employee.categories || [];
  let overallScore = 0;
  let overallPercent = 0;
  const categoryScores: { name: string; score: number; weight: number }[] = [];

  if (viewMode === 'year') {
    if (yearData.length > 0 && employee.categories) {
      const categoryAverages: Record<string, { total: number; count: number }> = {};
      for (const cat of employee.categories) {
        categoryAverages[cat.id] = { total: 0, count: 0 };
      }
      for (const snap of yearData) {
        if (snap.categories) {
          for (const snapCat of snap.categories) {
            const catId = snapCat.id;
            if (categoryAverages[catId]) {
              let catSum = 0;
              let catCount = 0;
              for (const kpi of snapCat.kpis) {
                const target = kpi.target || 1;
                const ratio = target > 0 ? kpi.actual / target : 0;
                catSum += ratio;
                catCount++;
              }
              const catScore = catCount > 0 ? catSum / catCount : 0;
              categoryAverages[catId].total += catScore;
              categoryAverages[catId].count++;
            }
          }
        }
      }
      let totalWeightedScore = 0;
      let totalWeight = 0;
      for (const cat of employee.categories) {
        const avg = categoryAverages[cat.id];
        const catScore = avg && avg.count > 0 ? avg.total / avg.count : 0;
        const weight = cat.weight / 100;
        categoryScores.push({ name: cat.name, score: catScore, weight: weight * 100 });
        totalWeightedScore += catScore * weight;
        totalWeight += weight;
      }
      overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      overallPercent = overallScore * 100;
    }
  } else {
    // For month view, use whatever data is currently in editingActuals
    const displayCats = employee.categories || [];
    displayCategories = displayCats;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    if (displayCats.length > 0) {
      for (const cat of displayCats) {
        let catSum = 0;
        let catCount = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = editingActuals[kpi.id] !== undefined ? editingActuals[kpi.id] : 0;
          const ratio = target > 0 ? actual / target : 0;
          catSum += ratio;
          catCount++;
        }
        const catScore = catCount > 0 ? catSum / catCount : 0;
        const weight = cat.weight / 100;
        categoryScores.push({ name: cat.name, score: catScore, weight: weight * 100 });
        totalWeightedScore += catScore * weight;
        totalWeight += weight;
      }
      overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      overallPercent = overallScore * 100;
    }
  }

  const band = getPerformanceBand(overallScore);
  const BandIcon = band.icon;

  const hasApprovedData = !!selectedSnapshot;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My KPI's</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {employee.name} · {employee.department} · {employee.role}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">
              {viewMode === 'year' ? `Year ${selectedYear} Average` : 'Overall Score'}
            </div>
            <div className={`text-2xl font-bold ${band.color}`}>
              {fmtNum(overallPercent, 1)}%
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${band.bg} ${band.color} border flex items-center gap-1.5`}>
            <BandIcon className="h-4 w-4" />
            {band.label}
          </div>
        </div>
      </div>

      {/* View Mode Toggle & Appraisal Submit */}
      <Card className="p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">View:</span>
          <div className="flex gap-1 bg-muted p-1 rounded-md">
            <Button
              size="sm"
              variant={viewMode === 'year' ? 'default' : 'ghost'}
              onClick={() => setViewMode('year')}
              className="text-xs h-7 px-3"
            >
              Year View
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              onClick={() => setViewMode('month')}
              className="text-xs h-7 px-3"
            >
              Monthly View
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'month' && (
            <>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <SelectItem key={m} value={String(m)}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {viewMode === 'year' && (
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <span className="text-xs text-muted-foreground">
            {viewMode === 'year' && yearData.length > 0 && `${yearData.length} months of data`}
            {viewMode === 'month' && selectedSnapshot ? `✅ Approved for ${selectedMonth}/${selectedYear}` : `📝 Not yet approved`}
          </span>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={handleSubmitForAppraisal}
          disabled={submittingAppraisal}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white h-8"
        >
          <Send className="h-3.5 w-3.5" />
          {submittingAppraisal ? "Submitting..." : `Submit for Appraisal (${getCurrentPeriod()})`}
        </Button>
      </Card>

      {/* Info Banner */}
      <Card className="p-3 border-blue-200 bg-blue-50/50 text-blue-700 text-sm flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          {hasApprovedData ? (
            <span>✅ This period has <strong>approved</strong> data. You can edit and resubmit for a new review. New approval will replace the old data.</span>
          ) : (
            <span>📝 Enter your actuals, add comments, and upload proof. Click <strong>"Submit for Appraisal"</strong> when ready. Data will only be saved after approval.</span>
          )}
        </div>
      </Card>

      {/* Year View: Summary Cards */}
      {viewMode === 'year' && yearData.length > 0 && yearStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <div className="text-xs text-muted-foreground">Months Tracked</div>
            <div className="text-xl font-bold">{yearStats.count}</div>
          </Card>
          <Card className="p-3 text-center border-green-200 bg-green-50/50">
            <div className="text-xs text-green-600">Best Month</div>
            <div className="text-xl font-bold text-green-600">{fmtNum(yearStats.best, 2)}</div>
          </Card>
          <Card className="p-3 text-center border-red-200 bg-red-50/50">
            <div className="text-xs text-red-600">Worst Month</div>
            <div className="text-xl font-bold text-red-600">{fmtNum(yearStats.worst, 2)}</div>
          </Card>
          <Card className="p-3 text-center border-blue-200 bg-blue-50/50">
            <div className="text-xs text-blue-600">Year Average</div>
            <div className="text-xl font-bold text-blue-600">{fmtNum(yearStats.avg, 2)}</div>
          </Card>
        </div>
      )}

      {/* Year View: Monthly Breakdown */}
      {viewMode === 'year' && yearData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">📊 Monthly Breakdown ({selectedYear})</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData.map(d => ({
                month: `${d.month}/${d.year}`,
                label: new Date(d.year, d.month - 1, 1).toLocaleString('default', { month: 'short' }),
                score: d.performanceMultiplier,
              }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 2]} fontSize={11} tickLine={false} width={28} />
                <Tooltip formatter={(v: number) => [fmtNum(v, 2), "Score"]} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Month View: Trend Chart */}
      {viewMode === 'month' && trendData.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">📈 Performance Trend</h3>
            <span className="text-xs text-muted-foreground">Last {trendData.length} months</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 2]} fontSize={11} tickLine={false} width={28} />
                <Tooltip formatter={(v: number) => [fmtNum(v, 2), "Score"]} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#trendGradient)"
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {monthOverMonth !== null && (
            <div className={`text-sm mt-2 text-center ${monthOverMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthOverMonth >= 0 ? '↑' : '↓'} {Math.abs(monthOverMonth).toFixed(1)}% from last month
            </div>
          )}
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xs text-muted-foreground">
            {viewMode === 'year' ? 'Year Average' : 'Overall Score'}
          </div>
          <div className={`text-2xl font-bold ${band.color}`}>{fmtNum(overallPercent, 1)}%</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-muted-foreground">Categories</div>
          <div className="text-2xl font-bold">{displayCategories.length || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-muted-foreground">KPIs Tracked</div>
          <div className="text-2xl font-bold">
            {displayCategories.reduce((sum, c) => sum + c.kpis.length, 0) || 0}
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xs text-muted-foreground">Performance Band</div>
          <div className={`text-sm font-semibold ${band.color} mt-1 flex items-center justify-center gap-1`}>
            <BandIcon className="h-4 w-4" />
            {band.label}
          </div>
          {viewMode === 'month' && monthOverMonth !== null && (
            <div className={`text-xs mt-1 ${monthOverMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthOverMonth >= 0 ? '↑' : '↓'} {Math.abs(monthOverMonth).toFixed(1)}% from last month
            </div>
          )}
        </Card>
      </div>

      {/* Weighted Categories */}
      {displayCategories.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" /> Weighted Categories
            <span className="text-xs text-muted-foreground font-normal ml-2">
              {viewMode === 'year' 
                ? `(Year ${selectedYear} Average)` 
                : hasApprovedData
                  ? `(Approved for ${selectedMonth}/${selectedYear})`
                  : `(Enter data for ${selectedMonth}/${selectedYear})`}
            </span>
          </h2>

          {displayCategories.map((category: any, idx: number) => {
            let catScore = 0;
            let totalKpiWeight = 0;
            const kpiDetails = category.kpis.map((kpi: any) => {
              const target = kpi.target || 0;
              const actual = editingActuals[kpi.id] !== undefined ? editingActuals[kpi.id] : 0;
              const comment = kpiComments[kpi.id] !== undefined ? kpiComments[kpi.id] : "";
              const proof = kpiProofs[kpi.id] || [];
              const ratio = target > 0 ? actual / target : 0;
              const achievement = ratio * 100;
              const weight = kpi.weight || 100;
              const hasProof = proof.length > 0;
              if (target > 0) {
                catScore += ratio * weight;
                totalKpiWeight += weight;
              }
              return { ...kpi, actual, achievement, ratio, comment, proof, hasProof };
            });

            const finalScore = totalKpiWeight > 0 ? (catScore / totalKpiWeight) * 100 : 0;
            const status = finalScore >= 100 ? 'exceeded' : finalScore >= 70 ? 'met' : finalScore >= 50 ? 'partial' : 'missed';

            return (
              <Card key={idx} className="p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">(Weight: {category.weight}%)</span>
                    {hasApprovedData && (
                      <Badge className="ml-2 bg-green-100 text-green-700 border-green-200 text-[10px]">✅ Approved</Badge>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${
                    status === 'exceeded' ? 'text-green-600' :
                    status === 'met' ? 'text-blue-600' :
                    status === 'partial' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {fmtNum(finalScore, 1)}%
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'exceeded' ? 'bg-green-500' :
                      status === 'met' ? 'bg-blue-500' :
                      status === 'partial' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, finalScore)}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {kpiDetails.map((kpi: any, kIdx: number) => {
                    const isUploading = uploadingFiles[kpi.id] || false;
                    
                    return (
                      <div key={kIdx} className="border-b border-muted pb-3 last:border-0">
                        {/* Row 1: KPI data + Actual input + Achievement */}
                        <div className="grid grid-cols-12 gap-2 text-xs items-center">
                          <div className="col-span-3 font-medium break-words whitespace-normal">
                            {kpi.description}
                          </div>
                          <div className="col-span-1 text-muted-foreground">
                            Target: {fmtNum(kpi.target)} {kpi.metric}
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              className="h-7 w-full text-xs p-1"
                              value={editingActuals[kpi.id] !== undefined ? editingActuals[kpi.id] : 0}
                              onChange={(e) => updateActual(kpi.id, Number(e.target.value))}
                            />
                          </div>
                          <div className="col-span-1 font-semibold">
                            {fmtNum(kpi.achievement, 1)}%
                          </div>
                          <div className="col-span-1 text-[10px] text-muted-foreground">
                            {kpi.metric}
                          </div>
                          <div className="col-span-1 text-[10px] text-muted-foreground truncate" title={kpi.measurementSource}>
                            {kpi.measurementSource || "—"}
                          </div>
                          <div className="col-span-1 text-center">
                            {kpi.hasProof && (
                              <span className="text-blue-500 text-[10px] flex items-center gap-0.5 justify-center">
                                <Paperclip className="h-3 w-3" />
                                {kpi.proof.length}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 text-center">
                            {kpi.comment && kpi.comment.trim().length > 0 && (
                              <span className="text-purple-500 text-[10px]">💬</span>
                            )}
                          </div>
                          <div className="col-span-1 text-right">
                            <input
                              type="file"
                              ref={(el) => { fileInputRefs.current[kpi.id] = el; }}
                              className="hidden"
                              multiple
                              onChange={(e) => handleFileUpload(kpi.id, e.target.files)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2"
                              onClick={() => fileInputRefs.current[kpi.id]?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <Upload className="h-3 w-3 mr-0.5" />
                              )}
                              Proof
                            </Button>
                          </div>
                        </div>

                        {/* Row 2: Comment input */}
                        <div className="grid grid-cols-12 gap-2 mt-1">
                          <div className="col-span-10">
                            <Input
                              type="text"
                              className="h-6 w-full text-xs p-1"
                              placeholder="Add a comment for this KPI..."
                              value={kpiComments[kpi.id] !== undefined ? kpiComments[kpi.id] : ""}
                              onChange={(e) => updateComment(kpi.id, e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 text-[10px] text-muted-foreground flex items-center">
                            {kpi.comment && kpi.comment.trim().length > 0 && (
                              <span className="text-purple-500">💬 Has comment</span>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Proof files preview (ONLY for this period) */}
                        {kpi.proof && kpi.proof.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {kpi.proof.map((p: any) => (
                              <div key={p.id} className="flex items-center gap-0.5 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px]">
                                <a
                                  href={p.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline truncate max-w-[120px]"
                                >
                                  <File className="h-3 w-3 inline mr-0.5" />
                                  {p.fileName}
                                </a>
                                <button
                                  onClick={() => removeProof(kpi.id, p.id)}
                                  className="text-red-500 hover:text-red-700 ml-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          No KPIs assigned yet. Please contact HR.
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span>Data will only be saved and appear on the dashboard after your manager <strong>approves</strong> your submission. You can edit and resubmit at any time.</span>
        </div>
        <Button 
          onClick={handleSubmitForAppraisal} 
          disabled={submittingAppraisal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="h-4 w-4" />
          {submittingAppraisal ? "Submitting..." : `Submit for Appraisal (${getCurrentPeriod()})`}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center -mt-2">
        💡 Select any month/year to enter or update data. Each period starts empty.
      </p>
    </div>
  );
}