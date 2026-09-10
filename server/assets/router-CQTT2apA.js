import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster } from "sonner";
import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
const appCss = "/p4p-app-v2/assets/styles-CqtstgMN.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const DEFAULT_GRADES = [
  { code: "B", name: "President", points: 100 },
  { code: "C", name: "Executive President", points: 90 },
  { code: "D", name: "Senior Vice President", points: 80 },
  { code: "E", name: "Vice President", points: 70 },
  { code: "F", name: "Head of Department", points: 60 },
  { code: "G", name: "Line Manager/SBU Head", points: 55 },
  { code: "H", name: "Team Lead", points: 50 },
  { code: "1", name: "Senior Specialist", points: 45 },
  { code: "2", name: "Specialist", points: 40 },
  { code: "3", name: "Senior Analyst", points: 35 },
  { code: "4", name: "Analyst", points: 30 },
  { code: "5", name: "Senior Executive", points: 25 },
  { code: "6", name: "Executive", points: 20 },
  { code: "7", name: "Graduate Trainee", points: 15 },
  { code: "8", name: "NSS/Assistant", points: 10 },
  { code: "9", name: "Intern", points: 5 }
];
const DEFAULT_GLOBALS = {
  totalRevenue: 2e7,
  p4pPercent: 2.5,
  adjunctPercent: 10,
  floor: 0.5,
  cap: 1.5,
  prorationOn: false,
  salesMultiplier: 1.3
};
const id = () => Math.random().toString(36).slice(2, 10);
const newId = id;
const DEMO_EMPLOYEES = [
  {
    id: id(),
    name: "Jane Adjunct",
    jobGrade: "5",
    isAdjunct: true,
    isSalesRole: false,
    joinDate: "2025-01-01",
    monthsWorked: 12,
    kpis: [],
    categories: []
  },
  {
    id: id(),
    name: "John Adjunct",
    jobGrade: "6",
    isAdjunct: true,
    isSalesRole: false,
    joinDate: "2025-01-01",
    monthsWorked: 12,
    kpis: [],
    categories: []
  },
  {
    id: id(),
    name: "Alice Johnson",
    jobGrade: "G",
    isAdjunct: false,
    isSalesRole: true,
    joinDate: "2025-01-15",
    monthsWorked: 12,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Strategic Contribution",
        weight: 30,
        kpis: [
          { id: id(), description: "Revenue Growth", metric: "GHS", target: 5e5, actual: 6e5, weight: 40 },
          { id: id(), description: "CSAT Score", metric: "%", target: 90, actual: 85, weight: 30 },
          { id: id(), description: "Market Share", metric: "%", target: 25, actual: 20, weight: 30 }
        ]
      },
      {
        id: id(),
        name: "Operational Excellence",
        weight: 20,
        kpis: [
          { id: id(), description: "Process Efficiency", metric: "%", target: 95, actual: 88, weight: 100 }
        ]
      }
    ]
  },
  {
    id: id(),
    name: "Bob Smith",
    jobGrade: "4",
    isAdjunct: false,
    isSalesRole: false,
    joinDate: "2025-03-01",
    monthsWorked: 10,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Team Performance",
        weight: 40,
        kpis: [
          { id: id(), description: "Team Lead", metric: "%", target: 100, actual: 90, weight: 60 },
          { id: id(), description: "Projects Completed", metric: "#", target: 12, actual: 10, weight: 40 }
        ]
      }
    ]
  },
  {
    id: id(),
    name: "Carol Davis",
    jobGrade: "1",
    isAdjunct: false,
    isSalesRole: true,
    joinDate: "2025-02-10",
    monthsWorked: 11,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Project Delivery",
        weight: 50,
        kpis: [
          { id: id(), description: "Project completion", metric: "%", target: 100, actual: 95, weight: 100 }
        ]
      },
      {
        id: id(),
        name: "Client Satisfaction",
        weight: 30,
        kpis: [
          { id: id(), description: "Client NPS", metric: "%", target: 80, actual: 75, weight: 100 }
        ]
      }
    ]
  }
];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function performanceMultiplierFromCategories(categories, floor, cap) {
  if (!categories || categories.length === 0) return 1;
  let totalWeightedScore = 0;
  let totalWeight = 0;
  for (const category of categories) {
    if (!category.kpis || category.kpis.length === 0) continue;
    let categorySum = 0;
    let kpiCount = 0;
    for (const kpi of category.kpis) {
      const target = Number(kpi.target);
      const actual = Number(kpi.actual);
      if (!target || target <= 0) continue;
      const kpiScore = actual / target;
      const kpiWeight = kpi.weight || 1;
      categorySum += kpiScore * kpiWeight;
      kpiCount += kpiWeight;
    }
    if (kpiCount === 0) continue;
    const categoryScore = categorySum / kpiCount;
    const categoryWeight = category.weight || 0;
    totalWeightedScore += categoryScore * (categoryWeight / 100);
    totalWeight += categoryWeight / 100;
  }
  if (totalWeight === 0) return 1;
  const multiplier = totalWeightedScore / totalWeight;
  return clamp(multiplier, floor, cap);
}
function performanceMultiplier(kpis, floor, cap) {
  if (!kpis || kpis.length === 0) return 1;
  let sum = 0;
  let count = 0;
  for (const k of kpis) {
    const t = Number(k.target);
    const a = Number(k.actual);
    if (!t || t <= 0) continue;
    sum += a / t;
    count++;
  }
  if (count === 0) return 1;
  const ratio = sum / count;
  return clamp(ratio, floor, cap);
}
function calculate(employees, grades, g) {
  const warnings = [];
  const floor = Math.min(g.floor, g.cap);
  const cap = Math.max(g.floor, g.cap);
  if (g.floor > g.cap) warnings.push("Floor was greater than cap — values swapped.");
  const gradeMap = new Map(grades.map((x) => [x.code, x.points]));
  const totalPool = (Number(g.totalRevenue) || 0) * ((Number(g.p4pPercent) || 0) / 100);
  const adjFrac = clamp((Number(g.adjunctPercent) || 0) / 100, 0, 1);
  const adjunctPool = totalPool * adjFrac;
  const employeePool = totalPool * (1 - adjFrac);
  const adjuncts = employees.filter((e) => e.isAdjunct);
  const nonAdjuncts = employees.filter((e) => !e.isAdjunct);
  const perAdjunctBonus = adjuncts.length > 0 ? adjunctPool / adjuncts.length : 0;
  const perEmployee = {};
  const weights = [];
  for (const e of nonAdjuncts) {
    const gp = gradeMap.get(e.jobGrade) ?? 0;
    if (!gradeMap.has(e.jobGrade)) warnings.push(`${e.name}: unknown job grade "${e.jobGrade}".`);
    let pm;
    let kpiBreakdown = [];
    let categoryBreakdown;
    if (e.categories && e.categories.length > 0) {
      pm = performanceMultiplierFromCategories(e.categories, floor, cap);
      categoryBreakdown = e.categories.map((cat) => ({
        categoryName: cat.name,
        categoryWeight: cat.weight,
        kpis: (cat.kpis || []).map((k) => ({
          description: k.description,
          target: k.target,
          actual: k.actual,
          ratio: k.target > 0 ? k.actual / k.target : 0,
          weight: k.weight
        })),
        categoryScore: cat.kpis && cat.kpis.length > 0 ? cat.kpis.reduce((sum, k) => {
          const ratio = k.target > 0 ? k.actual / k.target : 0;
          const kpiWeight = k.weight || 1;
          return sum + ratio * kpiWeight;
        }, 0) / cat.kpis.reduce((sum, k) => sum + (k.weight || 1), 0) : 1
      }));
    } else if (e.kpis && e.kpis.length > 0) {
      pm = performanceMultiplier(e.kpis, floor, cap);
      kpiBreakdown = (e.kpis || []).map((k) => ({
        description: k.description,
        ratio: k.target > 0 ? k.actual / k.target : 0
      }));
    } else {
      pm = 1;
      if (!e.kpis || e.kpis.length === 0)
        warnings.push(`${e.name}: has no KPIs or Categories — multiplier defaults to 1.`);
    }
    let months = Number(e.monthsWorked);
    if (g.prorationOn && (!months || months <= 0)) {
      warnings.push(`${e.name}: months worked missing — defaulted to 12.`);
      months = 12;
    }
    const proration = g.prorationOn ? clamp(months / 12, 0, 1) : 1;
    const salesMult = e.isSalesRole ? Number(g.salesMultiplier) || 1 : 1;
    const weight = gp * pm * proration * salesMult;
    weights.push({
      id: e.id,
      weight,
      pm,
      proration,
      salesMult,
      gp,
      kpiBreakdown,
      categoryBreakdown
    });
  }
  const sumWeights = weights.reduce((s, w) => s + w.weight, 0);
  if (nonAdjuncts.length > 0 && sumWeights <= 0) warnings.push("Sum of weights is 0 — no bonuses can be distributed to non-adjuncts.");
  const valuePerUnit = sumWeights > 0 ? employeePool / sumWeights : 0;
  for (const w of weights) {
    perEmployee[w.id] = {
      performanceMultiplier: w.pm,
      proration: w.proration,
      salesMult: w.salesMult,
      gradePoints: w.gp,
      weight: w.weight,
      bonus: w.weight * valuePerUnit,
      kpiBreakdown: w.kpiBreakdown,
      categoryBreakdown: w.categoryBreakdown
    };
  }
  for (const a of adjuncts) {
    perEmployee[a.id] = {
      performanceMultiplier: 1,
      proration: 1,
      salesMult: 1,
      gradePoints: gradeMap.get(a.jobGrade) ?? 0,
      weight: 0,
      bonus: perAdjunctBonus,
      kpiBreakdown: [],
      categoryBreakdown: void 0
    };
  }
  const totalBonusPaid = (sumWeights > 0 ? employeePool : 0) + (adjuncts.length > 0 ? adjunctPool : 0);
  const avgBonus = employees.length > 0 ? totalBonusPaid / employees.length : 0;
  return {
    totalPool,
    adjunctPool,
    employeePool,
    perAdjunctBonus,
    sumWeights,
    valuePerUnit,
    nonAdjunctCount: nonAdjuncts.length,
    adjunctCount: adjuncts.length,
    perEmployee,
    avgBonus,
    warnings
  };
}
function fmtGHS(n) {
  const v = Number.isFinite(n) ? n : 0;
  if (Math.abs(v) >= 1e6) {
    const m = v / 1e6;
    return `GH₵ ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M`;
  }
  if (Math.abs(v) >= 1e3) {
    const k = v / 1e3;
    return `GH₵ ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(v);
}
const fmtNum = (n, d = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);
const SUPABASE_URL = "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZWZpZXF2YWFjbHhxYmJwZmNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwMTA3OCwiZXhwIjoyMDk4NTc3MDc4fQ.fvhXp4ft7UsH5mrzY7lA40coDQ0YA7lUSbnxsOL_gsw";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
if (!supabaseAdmin) {
  console.warn("⚠️ Supabase Admin client not initialized. Service role key missing.");
}
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
const uploadProofFile = async (employeeId, kpiId, file) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const fileExt = file.name.split(".").pop();
    const fileName = `${employeeId}/${kpiId}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("proof-files").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("proof-files").getPublicUrl(fileName);
    return {
      id: newId(),
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type
    };
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
const deleteSupabaseUser = async (userId) => {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: "Service role key not configured. Please check your .env file."
      };
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return {
        success: false,
        error: "Invalid user ID format. Please use the Supabase Auth user ID (UUID)."
      };
    }
    console.log("Deleting user from Supabase Auth:", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
    console.log("User deleted successfully:", userId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
};
const findUserByEmail = async (email) => {
  try {
    if (!supabaseAdmin) {
      console.warn("Admin client not available, cannot search users by email");
      return null;
    }
    console.log("Searching for user by email:", email);
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error("Error listing users:", error);
      return null;
    }
    const user = data?.users?.find((u) => u.email === email);
    if (user) {
      console.log("User found:", user.id);
      return { id: user.id, email: user.email };
    }
    console.log("User not found with email:", email);
    return null;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
};
const sendEmail = async (params) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: params
    });
    if (error) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};
const LS_KEY = "p4p_state_v1";
const MONTHLY_KEY = "p4p_monthly_data";
const TEMPLATES_KEY = "p4p_kpi_templates";
const APPRAISALS_KEY = "p4p_appraisals";
const NOTIFICATIONS_KEY = "p4p_notifications";
function loadMonthlyData() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MONTHLY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
  }
  return [];
}
function saveMonthlyData(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MONTHLY_KEY, JSON.stringify(data));
  } catch {
  }
}
function loadTemplates() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
  }
  return {};
}
function saveTemplates(templates) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
  }
}
function loadAppraisals() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPRAISALS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
  }
  return [];
}
function saveAppraisals(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPRAISALS_KEY, JSON.stringify(data));
  } catch {
  }
}
function loadNotifications() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
  }
  return [];
}
function saveNotifications(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
  } catch {
  }
}
const C = createContext(null);
function loadInitial() {
  if (typeof window === "undefined") {
    return {
      globals: DEFAULT_GLOBALS,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: loadTemplates(),
      appraisals: loadAppraisals(),
      notifications: loadNotifications()
    };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        globals: { ...DEFAULT_GLOBALS, ...parsed.globals },
        grades: parsed.grades?.length ? parsed.grades : DEFAULT_GRADES,
        employees: Array.isArray(parsed.employees) ? parsed.employees : DEMO_EMPLOYEES,
        monthlyData: loadMonthlyData(),
        kpiTemplates: loadTemplates(),
        appraisals: loadAppraisals(),
        notifications: loadNotifications()
      };
    }
  } catch {
  }
  return {
    globals: DEFAULT_GLOBALS,
    grades: DEFAULT_GRADES,
    employees: DEMO_EMPLOYEES,
    monthlyData: [],
    kpiTemplates: loadTemplates(),
    appraisals: loadAppraisals(),
    notifications: loadNotifications()
  };
}
function P4PProvider({ children }) {
  const [state, setState] = useState(() => loadInitial());
  useEffect(() => {
    setState(loadInitial());
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        globals: state.globals,
        grades: state.grades,
        employees: state.employees
      }));
    } catch {
    }
    saveMonthlyData(state.monthlyData);
    saveTemplates(state.kpiTemplates);
    saveAppraisals(state.appraisals);
    saveNotifications(state.notifications);
  }, [state]);
  const setGlobals = useCallback((g) => setState((s) => ({ ...s, globals: { ...s.globals, ...g } })), []);
  const setGrades = useCallback((grades) => setState((s) => ({ ...s, grades })), []);
  const resetGrades = useCallback(() => setState((s) => ({ ...s, grades: DEFAULT_GRADES })), []);
  const upsertEmployee = useCallback((e) => setState((s) => {
    const exists = s.employees.some((x) => x.id === e.id);
    return { ...s, employees: exists ? s.employees.map((x) => x.id === e.id ? e : x) : [...s.employees, e] };
  }), []);
  const removeEmployee = useCallback((id2) => setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id2) })), []);
  const clearEmployees = useCallback(() => setState((s) => ({ ...s, employees: [] })), []);
  const loadDemo = useCallback(() => setState({
    globals: DEFAULT_GLOBALS,
    grades: DEFAULT_GRADES,
    employees: DEMO_EMPLOYEES,
    monthlyData: [],
    kpiTemplates: {},
    appraisals: [],
    notifications: []
  }), []);
  const setEmployees = useCallback((list) => setState((s) => ({ ...s, employees: list })), []);
  const calc = useMemo(() => calculate(state.employees, state.grades, state.globals), [state]);
  const saveMonthlySnapshot = useCallback((employeeId, year, month) => {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee || employee.isAdjunct) return;
    const result = calc.perEmployee[employeeId];
    if (!result) return;
    const existing = state.monthlyData.findIndex(
      (d) => d.employeeId === employeeId && d.year === year && d.month === month
    );
    const snapshot = {
      year,
      month,
      employeeId,
      kpis: employee.kpis.map((k) => ({ ...k })),
      categories: employee.categories?.map((c) => ({
        ...c,
        kpis: c.kpis.map((k) => ({ ...k }))
      })),
      performanceMultiplier: result.performanceMultiplier,
      bonusEligible: result.bonus,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setState((s) => {
      const newData = [...s.monthlyData];
      if (existing >= 0) {
        newData[existing] = snapshot;
      } else {
        newData.push(snapshot);
      }
      return { ...s, monthlyData: newData };
    });
  }, [state.employees, calc]);
  const getMonthlyHistory = useCallback((employeeId) => {
    return state.monthlyData.filter((d) => d.employeeId === employeeId).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [state.monthlyData]);
  const getPerformanceTrend = useCallback((employeeId) => {
    const history = getMonthlyHistory(employeeId);
    if (history.length === 0) return null;
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee) return null;
    const months = history.map((d) => ({
      month: d.month,
      year: d.year,
      score: d.performanceMultiplier,
      multiplier: d.performanceMultiplier
    }));
    const scores = months.map((m) => m.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const last = scores[scores.length - 1];
    let trendDirection = "stable";
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (secondAvg > firstAvg * 1.05) trendDirection = "improving";
      else if (secondAvg < firstAvg * 0.95) trendDirection = "declining";
      else trendDirection = "stable";
    }
    const best = months.reduce((a, b) => a.score > b.score ? a : b);
    const worst = months.reduce((a, b) => a.score < b.score ? a : b);
    return {
      employeeId,
      name: employee.name,
      months,
      currentScore: last,
      averageScore: avg,
      bestMonth: { month: best.month, year: best.year, score: best.score },
      worstMonth: { month: worst.month, year: worst.year, score: worst.score },
      trendDirection
    };
  }, [state.employees, getMonthlyHistory]);
  const getAllTrends = useCallback(() => {
    const trends = [];
    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;
      const trend = getPerformanceTrend(emp.id);
      if (trend) trends.push(trend);
    }
    return trends;
  }, [state.employees, getPerformanceTrend]);
  const deleteMonthlyData = useCallback((employeeId, year, month) => {
    setState((s) => ({
      ...s,
      monthlyData: s.monthlyData.filter(
        (d) => !(d.employeeId === employeeId && d.year === year && d.month === month)
      )
    }));
  }, []);
  const getMonthData = useCallback((year, month) => {
    return state.monthlyData.filter((d) => d.year === year && d.month === month);
  }, [state.monthlyData]);
  const getMonthlyStats = useCallback(() => {
    const trends = getAllTrends();
    const avgMultiplier = trends.length > 0 ? trends.reduce((sum, t) => sum + t.currentScore, 0) / trends.length : 0;
    const risingStars = [];
    const underachievers = [];
    for (const t of trends) {
      if (t.trendDirection === "improving" && t.currentScore > 1) {
        risingStars.push(t.name);
      }
      if (t.trendDirection === "declining" && t.currentScore < 0.7) {
        underachievers.push(t.name);
      }
    }
    let monthOverMonthChange = 0;
    if (trends.length > 0 && trends[0].months.length >= 2) {
      const lastMonth = trends[0].months[trends[0].months.length - 1];
      const prevMonth = trends[0].months[trends[0].months.length - 2];
      monthOverMonthChange = (lastMonth.score - prevMonth.score) / prevMonth.score * 100;
    }
    const monthSet = /* @__PURE__ */ new Set();
    for (const d of state.monthlyData) {
      monthSet.add(`${d.year}-${d.month}`);
    }
    const monthsWithData = Array.from(monthSet).map((s) => {
      const [year, month] = s.split("-").map(Number);
      return { year, month };
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    return {
      totalEmployees: trends.length,
      avgMultiplier,
      risingStars,
      underachievers,
      monthOverMonthChange,
      monthsWithData
    };
  }, [getAllTrends, state.monthlyData]);
  const detectTriggers = useCallback(() => {
    const triggers = [];
    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;
      const history = getMonthlyHistory(emp.id);
      if (history.length < 3) continue;
      const sorted = [...history].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      const scores = sorted.map((d) => d.performanceMultiplier);
      const months = sorted.map((d) => ({ month: d.month, year: d.year, score: d.performanceMultiplier }));
      let decliningCount = 0;
      let prevScore = scores[0];
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] < prevScore) {
          decliningCount++;
        } else {
          decliningCount = 0;
        }
        prevScore = scores[i];
      }
      if (decliningCount >= 3) {
        const lastThree = months.slice(-3);
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "pip",
          severity: "warning",
          message: `⚠️ PIP Required: 3 consecutive months of declining performance (${lastThree.map((m) => fmtNum(m.score, 2)).join(" → ")})`,
          triggeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          monthsData: lastThree
        });
      }
      const lastSix = months.slice(-6);
      if (lastSix.length === 6 && lastSix.every((m) => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "probation",
          severity: "danger",
          message: `📋 Probation Period: 6 consecutive months below 0.7 multiplier (avg: ${fmtNum(lastSix.reduce((s, m) => s + m.score, 0) / 6, 2)})`,
          triggeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          monthsData: lastSix
        });
      }
      const lastNine = months.slice(-9);
      if (lastNine.length === 9 && lastNine.every((m) => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "management_action",
          severity: "critical",
          message: `🔴 Management Action Required: 9 consecutive months below 0.7 multiplier (avg: ${fmtNum(lastNine.reduce((s, m) => s + m.score, 0) / 9, 2)})`,
          triggeredAt: (/* @__PURE__ */ new Date()).toISOString(),
          monthsData: lastNine
        });
      }
    }
    return {
      pip: triggers.filter((t) => t.type === "pip"),
      probation: triggers.filter((t) => t.type === "probation"),
      managementAction: triggers.filter((t) => t.type === "management_action"),
      total: triggers.length
    };
  }, [state.employees, getMonthlyHistory]);
  const getTriggersForEmployee = useCallback((employeeId) => {
    const all = detectTriggers();
    return [
      ...all.pip,
      ...all.probation,
      ...all.managementAction
    ].filter((t) => t.employeeId === employeeId);
  }, [detectTriggers]);
  const saveTemplate = useCallback((template) => {
    const key = `${template.department}-${template.roleName}`;
    setState((s) => ({
      ...s,
      kpiTemplates: {
        ...s.kpiTemplates,
        [key]: template
      }
    }));
  }, []);
  const getTemplate = useCallback((department, role) => {
    const key = `${department}-${role}`;
    return state.kpiTemplates[key];
  }, [state.kpiTemplates]);
  const getAllTemplates = useCallback(() => {
    return state.kpiTemplates;
  }, [state.kpiTemplates]);
  const applyTemplateToEmployees = useCallback((department, role, template) => {
    const employeesToUpdate = state.employees.filter(
      (e) => e.department === department && e.role === role && !e.isAdjunct
    );
    if (employeesToUpdate.length === 0) return 0;
    const updatedEmployees = state.employees.map((emp) => {
      if (emp.department === department && emp.role === role && !emp.isAdjunct) {
        const newCategories = template.categories.map((cat) => ({
          id: newId(),
          name: cat.name,
          weight: cat.weight,
          kpis: cat.kpis.map((k) => ({
            id: newId(),
            description: k.description,
            metric: k.metric,
            target: k.target,
            actual: 0,
            weight: 100,
            measurementSource: k.measurementSource || ""
          }))
        }));
        return { ...emp, categories: newCategories };
      }
      return emp;
    });
    setState((prev) => ({
      ...prev,
      employees: updatedEmployees
    }));
    return employeesToUpdate.length;
  }, [state.employees]);
  const hardDeleteEmployee = useCallback((id2) => {
    setState((s) => ({
      ...s,
      employees: s.employees.filter((e) => e.id !== id2),
      monthlyData: s.monthlyData.filter((d) => d.employeeId !== id2),
      appraisals: s.appraisals.filter((a) => a.employeeId !== id2),
      notifications: s.notifications.filter((n) => n.userId !== id2)
    }));
  }, []);
  const getManagerEmails = useCallback((employee) => {
    const emails = [];
    if (employee.supervisorId) {
      const manager = state.employees.find((e) => e.id === employee.supervisorId);
      if (manager?.email) emails.push(manager.email);
    }
    const hrAdmins = state.employees.filter((e) => e.roleType === "admin" || e.roleType === "hr");
    hrAdmins.forEach((e) => {
      if (e.email && !emails.includes(e.email)) emails.push(e.email);
    });
    return emails;
  }, [state.employees]);
  const sendAppraisalNotification = useCallback(async (type, appraisal, reason) => {
    try {
      const employee = state.employees.find((e) => e.id === appraisal.employeeId);
      if (!employee) return;
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      let recipients = [];
      let subject = "";
      let html = "";
      if (type === "submitted") {
        recipients = getManagerEmails(employee);
        subject = `📋 New Appraisal Submitted: ${employee.name} (${appraisal.period})`;
        html = `
          <h2>New Appraisal Submitted</h2>
          <p><strong>Employee:</strong> ${employee.name}</p>
          <p><strong>Department:</strong> ${employee.department}</p>
          <p><strong>Role:</strong> ${employee.role}</p>
          <p><strong>Period:</strong> ${appraisal.period}</p>
          <p><strong>Overall Score:</strong> ${fmtNum(appraisal.overallPercent, 1)}%</p>
          <p><strong>Performance Band:</strong> ${appraisal.performanceBand}</p>
          <hr>
          <p><a href="${baseUrl}/appraisals-review">Click here to review</a></p>
        `;
      } else if (type === "approved") {
        recipients = [employee.email];
        subject = `✅ Appraisal Approved: ${appraisal.period}`;
        html = `
          <h2>Your Appraisal Has Been Approved!</h2>
          <p><strong>Period:</strong> ${appraisal.period}</p>
          <p><strong>Overall Score:</strong> ${fmtNum(appraisal.overallPercent, 1)}%</p>
          <p><strong>Performance Band:</strong> ${appraisal.performanceBand}</p>
          ${appraisal.reviewerComment ? `<p><strong>Reviewer Feedback:</strong> ${appraisal.reviewerComment}</p>` : ""}
          <hr>
          <p><a href="${baseUrl}/employee">View your dashboard</a></p>
        `;
      } else if (type === "rejected") {
        recipients = [employee.email];
        subject = `❌ Appraisal Rejected: ${appraisal.period}`;
        html = `
          <h2>Your Appraisal Was Rejected</h2>
          <p><strong>Period:</strong> ${appraisal.period}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <hr>
          <p>Please contact your manager for more details.</p>
          <p><a href="${baseUrl}/employee">Go to dashboard</a></p>
        `;
      } else if (type === "requested_changes") {
        recipients = [employee.email];
        subject = `📝 Changes Requested for Appraisal: ${appraisal.period}`;
        html = `
          <h2>Changes Requested for Your Appraisal</h2>
          <p><strong>Period:</strong> ${appraisal.period}</p>
          ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ""}
          <hr>
          <p>Please update your KPI data and resubmit.</p>
          <p><a href="${baseUrl}/employee">Edit and resubmit</a></p>
        `;
      }
      if (recipients.length > 0 && recipients[0]) {
        await sendEmail({ to: recipients, subject, html });
        console.log("Email sent successfully for", type, "to", recipients);
      }
    } catch (error) {
      console.error("Email notification failed:", error);
    }
  }, [state.employees, getManagerEmails]);
  const getPerformanceBand = (score) => {
    if (score >= 1.2) return "Exceptional";
    if (score >= 1) return "Exceeds Expectations";
    if (score >= 0.8) return "Meets Expectations";
    if (score >= 0.6) return "Needs Improvement";
    return "Performance Improvement Plan";
  };
  const submitAppraisal = useCallback((employeeId, period, year, month) => {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee) return;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const categories = employee.categories || [];
    for (const cat of categories) {
      let catSum = 0;
      let catCount = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        catSum += ratio;
        catCount++;
      }
      const catScore = catCount > 0 ? catSum / catCount : 0;
      const weight = cat.weight / 100;
      totalWeightedScore += catScore * weight;
      totalWeight += weight;
    }
    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const overallPercent = overallScore * 100;
    const band = getPerformanceBand(overallScore);
    const appraisal = {
      id: newId(),
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      role: employee.role,
      period,
      year,
      month,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending",
      categories: categories.map((cat) => ({
        ...cat,
        kpis: cat.kpis.map((k) => ({ ...k }))
      })),
      overallScore,
      overallPercent,
      performanceBand: band,
      comments: []
    };
    const notification = {
      id: newId(),
      userId: "manager",
      type: "appraisal_submitted",
      message: `${employee.name} submitted an appraisal for ${period}`,
      link: `/appraisals-review`,
      read: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setState((s) => ({
      ...s,
      appraisals: [...s.appraisals, appraisal],
      notifications: [...s.notifications, notification]
    }));
    sendAppraisalNotification("submitted", appraisal);
  }, [state.employees, sendAppraisalNotification]);
  const saveKPIProof = useCallback((employeeId, kpiId, fileData) => {
    setState((s) => {
      const updatedEmployees = s.employees.map((emp) => {
        if (emp.id !== employeeId) return emp;
        const updatedCategories = (emp.categories || []).map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => {
            if (k.id !== kpiId) return k;
            const proof = k.proof || [];
            return {
              ...k,
              proof: [...proof, {
                ...fileData,
                uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
              }],
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
          })
        }));
        return { ...emp, categories: updatedCategories };
      });
      return { ...s, employees: updatedEmployees };
    });
  }, []);
  const saveKPIComment = useCallback((employeeId, kpiId, comment) => {
    setState((s) => {
      const updatedEmployees = s.employees.map((emp) => {
        if (emp.id !== employeeId) return emp;
        const updatedCategories = (emp.categories || []).map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => {
            if (k.id !== kpiId) return k;
            return {
              ...k,
              comment,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
          })
        }));
        return { ...emp, categories: updatedCategories };
      });
      return { ...s, employees: updatedEmployees };
    });
  }, []);
  const triggerAfterApproval = useCallback((employeeId) => {
    const allTriggers = detectTriggers();
    const employeeTriggers = [
      ...allTriggers.pip,
      ...allTriggers.probation,
      ...allTriggers.managementAction
    ].filter((t) => t.employeeId === employeeId);
    const newNotifications = employeeTriggers.map((t) => ({
      id: newId(),
      userId: employeeId,
      type: t.type === "pip" ? "trigger_pip" : t.type === "probation" ? "trigger_probation" : "trigger_management_action",
      message: t.message,
      link: "/employee",
      read: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    if (newNotifications.length > 0) {
      setState((s) => ({
        ...s,
        notifications: [...s.notifications, ...newNotifications]
      }));
      const employee = state.employees.find((e) => e.id === employeeId);
      if (employee) {
        const hrAdmins = state.employees.filter((e) => e.roleType === "admin" || e.roleType === "hr").map((e) => e.email);
        if (hrAdmins.length > 0) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          sendEmail({
            to: hrAdmins,
            subject: `⚠️ Performance Alert: ${employee.name}`,
            html: `
              <h2>Performance Alert</h2>
              <p><strong>Employee:</strong> ${employee.name}</p>
              <p><strong>Department:</strong> ${employee.department}</p>
              <p><strong>Role:</strong> ${employee.role}</p>
              <hr>
              <h3>Triggers Detected:</h3>
              <ul>
                ${employeeTriggers.map((t) => `<li>${t.message}</li>`).join("")}
              </ul>
              <p><a href="${baseUrl}/employees">View employee</a></p>
            `
          }).catch((err) => console.error("Trigger email failed:", err));
        }
      }
    }
  }, [detectTriggers, state.employees]);
  const approveAppraisal = useCallback((id2, reviewerId, reviewerName) => {
    let employeeId = "";
    let year = 0;
    let month = 0;
    let categories = [];
    let appraisalToApprove = null;
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === id2) {
          employeeId = a.employeeId;
          year = a.year;
          month = a.month;
          categories = a.categories;
          appraisalToApprove = a;
          return {
            ...a,
            status: "approved",
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
            reviewerId,
            reviewerName
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
    if (employeeId && year && month && categories && categories.length > 0 && appraisalToApprove) {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      for (const cat of categories) {
        let catSum = 0;
        let catCount = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = kpi.actual || 0;
          const ratio = target > 0 ? actual / target : 0;
          catSum += ratio;
          catCount++;
        }
        const catScore = catCount > 0 ? catSum / catCount : 0;
        const weight = cat.weight / 100;
        totalWeightedScore += catScore * weight;
        totalWeight += weight;
      }
      const performanceMultiplier2 = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const snapshot = {
        year,
        month,
        employeeId,
        kpis: [],
        categories: categories.map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({ ...k }))
        })),
        performanceMultiplier: performanceMultiplier2,
        bonusEligible: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setState((s) => {
        const filtered = s.monthlyData.filter((d) => !(d.employeeId === employeeId && d.year === year && d.month === month));
        return { ...s, monthlyData: [...filtered, snapshot] };
      });
      setState((s) => {
        const updatedEmployees = s.employees.map((emp) => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              categories: categories.map((cat) => ({
                ...cat,
                kpis: cat.kpis.map((k) => ({ ...k }))
              }))
            };
          }
          return emp;
        });
        return { ...s, employees: updatedEmployees };
      });
      sendAppraisalNotification("approved", appraisalToApprove);
      setTimeout(() => triggerAfterApproval(employeeId), 100);
    }
  }, [triggerAfterApproval, state.employees, sendAppraisalNotification]);
  const rejectAppraisal = useCallback((id2, reviewerId, reviewerName, reason) => {
    let appraisalToReject = null;
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === id2) {
          appraisalToReject = a;
          return {
            ...a,
            status: "rejected",
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
            reviewerId,
            reviewerName,
            revisionReason: reason
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
    if (appraisalToReject) {
      sendAppraisalNotification("rejected", appraisalToReject, reason);
    }
  }, [sendAppraisalNotification]);
  const requestChanges = useCallback((id2, reviewerId, reviewerName, reason) => {
    let appraisalToChange = null;
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === id2) {
          appraisalToChange = a;
          return {
            ...a,
            status: "needs_revision",
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
            reviewerId,
            reviewerName,
            revisionReason: reason
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
    if (appraisalToChange) {
      sendAppraisalNotification("requested_changes", appraisalToChange, reason);
    }
  }, [sendAppraisalNotification]);
  const getEmployeeAppraisals = useCallback((employeeId) => {
    return state.appraisals.filter((a) => a.employeeId === employeeId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [state.appraisals]);
  const getPendingAppraisals = useCallback(() => {
    return state.appraisals.filter((a) => a.status === "pending").sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [state.appraisals]);
  const addAppraisalComment = useCallback((appraisalId, authorId, authorName, text) => {
    const comment = {
      id: newId(),
      authorId,
      authorName,
      text,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === appraisalId) {
          return {
            ...a,
            comments: [...a.comments, comment]
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
  }, []);
  const getNotifications = useCallback((userId) => {
    return state.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.notifications]);
  const markNotificationRead = useCallback((id2) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map(
        (n) => n.id === id2 ? { ...n, read: true } : n
      )
    }));
  }, []);
  const value = {
    ...state,
    setGlobals,
    setGrades,
    resetGrades,
    upsertEmployee,
    removeEmployee,
    clearEmployees,
    loadDemo,
    setEmployees,
    calc,
    saveMonthlySnapshot,
    getMonthlyHistory,
    getPerformanceTrend,
    getAllTrends,
    deleteMonthlyData,
    getMonthData,
    getMonthlyStats,
    detectTriggers,
    getTriggersForEmployee,
    saveTemplate,
    getTemplate,
    getAllTemplates,
    applyTemplateToEmployees,
    hardDeleteEmployee,
    submitAppraisal,
    approveAppraisal,
    rejectAppraisal,
    requestChanges,
    getEmployeeAppraisals,
    getPendingAppraisals,
    addAppraisalComment,
    getNotifications,
    markNotificationRead,
    saveKPIProof,
    saveKPIComment,
    triggerAfterApproval
  };
  return /* @__PURE__ */ jsx(C.Provider, { value, children });
}
function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}
const ADMIN_EMAIL = "dts6@aoholdings.net";
const UserContext = createContext({
  user: null,
  employee: null,
  role: null,
  loading: true
});
const UserProvider = ({ children }) => {
  const { employees } = useP4P();
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const emp = employees.find((e) => e.email === u.email);
          setEmployee(emp || null);
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const emp = employees.find((e) => e.email === session.user.email);
        setEmployee(emp || null);
      } else {
        setUser(null);
        setEmployee(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [employees]);
  const role = user?.email === ADMIN_EMAIL ? "admin" : employee?.role || null;
  return /* @__PURE__ */ jsx(UserContext.Provider, { value: { user, employee, role, loading }, children });
};
const useUser = () => useContext(UserContext);
const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null
});
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "p4p-theme"
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return localStorage.getItem(storageKey) || defaultTheme;
  });
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let effectiveTheme = "light";
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveTheme = theme;
    }
    root.classList.add(effectiveTheme);
  }, [theme]);
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);
  const setThemeWithTransition = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.add("theme-transition");
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newTheme);
    }
    setTheme(newTheme);
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 400);
  };
  const value = {
    theme,
    setTheme: setThemeWithTransition
  };
  return /* @__PURE__ */ jsx(ThemeProviderContext.Provider, { value, children });
}
function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
const Route$f = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "P4P Bonus Calculator" },
      {
        name: "description",
        content: "Calculate and trace pay-for-performance bonus grades and traces for employees."
      },
      { name: "author", content: "Iddo Adu Gyamfi" },
      { property: "og:title", content: "P4P Bonus Calculator" },
      {
        property: "og:description",
        content: "Calculate and trace pay-for-performance bonus grades and traces for employees."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('p4p-theme') || 'system';
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    root.classList.add(systemTheme);
                  } else {
                    root.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$f.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: "system", storageKey: "p4p-theme", children: /* @__PURE__ */ jsx(P4PProvider, { children: /* @__PURE__ */ jsxs(UserProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", richColors: true, closeButton: true, theme: "system" })
  ] }) }) }) });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const $$splitComponentImporter$e = () => import("./register-VW9JlmRX.js");
const Route$e = createFileRoute("/register")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./login-UYkPfWUn.js");
const Route$d = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_app-DgMraUUe.js");
const Route$c = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./index-BTU5dmpx.js");
const Route$b = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("p4p_logged_in") === "1";
    throw redirect({
      to: ok ? "/dashboard" : "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./_app.trace-BugGpvbj.js");
const Route$a = createFileRoute("/_app/trace")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_app.supervisors-D7fW_P1K.js");
const Route$9 = createFileRoute("/_app/supervisors")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./_app.my-calculation-BNUxGyf-.js");
const Route$8 = createFileRoute("/_app/my-calculation")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_app.monthly-l-tewB01.js");
const Route$7 = createFileRoute("/_app/monthly")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_app.kpi-framework-DLNEB_5V.js");
const Route$6 = createFileRoute("/_app/kpi-framework")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_app.grades-DnYwJBXF.js");
const Route$5 = createFileRoute("/_app/grades")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_app.employees-DeLgMK2r.js");
const Route$4 = createFileRoute("/_app/employees")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_app.employee-BlrJA77u.js");
const Route$3 = createFileRoute("/_app/employee")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_app.dashboard-Dhdrx4Gk.js");
const Route$2 = createFileRoute("/_app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_app.appraisals-review-Be0k6M8U.js");
const Route$1 = createFileRoute("/_app/appraisals-review")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_app.appraisals-mtakMHE2.js");
const Route = createFileRoute("/_app/appraisals")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const RegisterRoute = Route$e.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$f
});
const LoginRoute = Route$d.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$f
});
const AppRoute = Route$c.update({
  id: "/_app",
  getParentRoute: () => Route$f
});
const IndexRoute = Route$b.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$f
});
const AppTraceRoute = Route$a.update({
  id: "/trace",
  path: "/trace",
  getParentRoute: () => AppRoute
});
const AppSupervisorsRoute = Route$9.update({
  id: "/supervisors",
  path: "/supervisors",
  getParentRoute: () => AppRoute
});
const AppMyCalculationRoute = Route$8.update({
  id: "/my-calculation",
  path: "/my-calculation",
  getParentRoute: () => AppRoute
});
const AppMonthlyRoute = Route$7.update({
  id: "/monthly",
  path: "/monthly",
  getParentRoute: () => AppRoute
});
const AppKpiFrameworkRoute = Route$6.update({
  id: "/kpi-framework",
  path: "/kpi-framework",
  getParentRoute: () => AppRoute
});
const AppGradesRoute = Route$5.update({
  id: "/grades",
  path: "/grades",
  getParentRoute: () => AppRoute
});
const AppEmployeesRoute = Route$4.update({
  id: "/employees",
  path: "/employees",
  getParentRoute: () => AppRoute
});
const AppEmployeeRoute = Route$3.update({
  id: "/employee",
  path: "/employee",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppAppraisalsReviewRoute = Route$1.update({
  id: "/appraisals-review",
  path: "/appraisals-review",
  getParentRoute: () => AppRoute
});
const AppAppraisalsRoute = Route.update({
  id: "/appraisals",
  path: "/appraisals",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAppraisalsRoute,
  AppAppraisalsReviewRoute,
  AppDashboardRoute,
  AppEmployeeRoute,
  AppEmployeesRoute,
  AppGradesRoute,
  AppKpiFrameworkRoute,
  AppMonthlyRoute,
  AppMyCalculationRoute,
  AppSupervisorsRoute,
  AppTraceRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute,
  RegisterRoute
};
const routeTree = Route$f._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  P4PProvider as P,
  useTheme as a,
  useUser as b,
  fmtNum as c,
  findUserByEmail as d,
  deleteSupabaseUser as e,
  fmtGHS as f,
  getCurrentUser as g,
  uploadProofFile as h,
  newId as n,
  router as r,
  supabase as s,
  useP4P as u
};
