import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_GLOBALS, DEFAULT_GRADES, DEMO_EMPLOYEES } from "./defaults";
import { calculate } from "./calc";
import { fmtNum } from "./calc";
import type { 
  Employee, 
  GradePoint, 
  Globals, 
  CalcResult,
  MonthlyPerformance,
  PerformanceTrend,
  MonthlyStats,
  PerformanceTrigger,
  TriggerSummary
} from "./types";

const LS_KEY = "p4p_state_v1";
const MONTHLY_KEY = "p4p_monthly_data";

// Helper functions for monthly data
function loadMonthlyData(): MonthlyPerformance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MONTHLY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveMonthlyData(data: MonthlyPerformance[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MONTHLY_KEY, JSON.stringify(data));
  } catch {}
}

interface State {
  globals: Globals;
  grades: GradePoint[];
  employees: Employee[];
  monthlyData: MonthlyPerformance[];
}

interface Ctx extends State {
  setGlobals: (g: Partial<Globals>) => void;
  setGrades: (g: GradePoint[]) => void;
  resetGrades: () => void;
  upsertEmployee: (e: Employee) => void;
  removeEmployee: (id: string) => void;
  clearEmployees: () => void;
  loadDemo: () => void;
  setEmployees: (list: Employee[]) => void;
  calc: CalcResult;
  // Monthly functions
  saveMonthlySnapshot: (employeeId: string, year: number, month: number) => void;
  getMonthlyHistory: (employeeId: string) => MonthlyPerformance[];
  getPerformanceTrend: (employeeId: string) => PerformanceTrend | null;
  getAllTrends: () => PerformanceTrend[];
  deleteMonthlyData: (employeeId: string, year: number, month: number) => void;
  getMonthData: (year: number, month: number) => MonthlyPerformance[];
  getMonthlyStats: () => MonthlyStats;
  // Trigger functions
  detectTriggers: () => TriggerSummary;
  getTriggersForEmployee: (employeeId: string) => PerformanceTrigger[];
}

const C = createContext<Ctx | null>(null);

function loadInitial(): State {
  if (typeof window === "undefined") {
    return { 
      globals: DEFAULT_GLOBALS, 
      grades: DEFAULT_GRADES, 
      employees: DEMO_EMPLOYEES,
      monthlyData: []
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
      };
    }
  } catch {}
  return { 
    globals: DEFAULT_GLOBALS, 
    grades: DEFAULT_GRADES, 
    employees: DEMO_EMPLOYEES,
    monthlyData: []
  };
}

export function P4PProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => loadInitial());

  // hydrate from localStorage on client (in case SSR returned defaults)
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
    } catch {}
    saveMonthlyData(state.monthlyData);
  }, [state]);

  const setGlobals = useCallback((g: Partial<Globals>) =>
    setState((s) => ({ ...s, globals: { ...s.globals, ...g } })), []);
  const setGrades = useCallback((grades: GradePoint[]) =>
    setState((s) => ({ ...s, grades })), []);
  const resetGrades = useCallback(() =>
    setState((s) => ({ ...s, grades: DEFAULT_GRADES })), []);
  const upsertEmployee = useCallback((e: Employee) =>
    setState((s) => {
      const exists = s.employees.some((x) => x.id === e.id);
      return { ...s, employees: exists ? s.employees.map((x) => x.id === e.id ? e : x) : [...s.employees, e] };
    }), []);
  const removeEmployee = useCallback((id: string) =>
    setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) })), []);
  const clearEmployees = useCallback(() =>
    setState((s) => ({ ...s, employees: [] })), []);
  const loadDemo = useCallback(() =>
    setState({ 
      globals: DEFAULT_GLOBALS, 
      grades: DEFAULT_GRADES, 
      employees: DEMO_EMPLOYEES,
      monthlyData: []
    }), []);
  const setEmployees = useCallback((list: Employee[]) =>
    setState((s) => ({ ...s, employees: list })), []);

  const calc = useMemo(() => calculate(state.employees, state.grades, state.globals), [state]);

const saveMonthlySnapshot = useCallback((employeeId: string, year: number, month: number) => {
  const employee = state.employees.find(e => e.id === employeeId);
  if (!employee || employee.isAdjunct) return;

  const result = calc.perEmployee[employeeId];
  if (!result) return;

  // Check if already exists for this month
  const existing = state.monthlyData.findIndex(
    d => d.employeeId === employeeId && d.year === year && d.month === month
  );

  // FORCE SAVE with current KPI data - DEEP COPY with ALL values
  const snapshot: MonthlyPerformance = {
    year,
    month,
    employeeId,
    kpis: employee.kpis.map(k => ({ 
      id: k.id,
      description: k.description || '',
      metric: k.metric || '%',
      target: Number(k.target) || 0,
      actual: Number(k.actual) || 0,
      weight: Number(k.weight) || 1
    })),
    categories: employee.categories?.map(c => ({ 
      id: c.id,
      name: c.name || '',
      weight: Number(c.weight) || 0,
      kpis: c.kpis.map(k => ({ 
        id: k.id,
        description: k.description || '',
        metric: k.metric || '%',
        target: Number(k.target) || 0,
        actual: Number(k.actual) || 0,
        weight: Number(k.weight) || 100
      })) 
    })),
    performanceMultiplier: result.performanceMultiplier,
    bonusEligible: result.bonus,
    createdAt: new Date().toISOString(),
  };

  console.log('📊 SAVING MONTHLY SNAPSHOT FOR:', employee.name);
  console.log('  Categories:', snapshot.categories?.length || 0);
  console.log('  KPIs:', snapshot.categories?.flatMap(c => c.kpis).length || 0);
  console.log('  Sample KPI:', snapshot.categories?.[0]?.kpis?.[0]);

  setState(s => {
    const newData = [...s.monthlyData];
    if (existing >= 0) {
      newData[existing] = snapshot;
    } else {
      newData.push(snapshot);
    }
    return { ...s, monthlyData: newData };
  });
}, [state.employees, calc]);

  const getMonthlyHistory = useCallback((employeeId: string): MonthlyPerformance[] => {
    return state.monthlyData
      .filter(d => d.employeeId === employeeId)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
  }, [state.monthlyData]);

  const getPerformanceTrend = useCallback((employeeId: string): PerformanceTrend | null => {
    const history = getMonthlyHistory(employeeId);
    if (history.length === 0) return null;

    const employee = state.employees.find(e => e.id === employeeId);
    if (!employee) return null;

    const months = history.map(d => ({
      month: d.month,
      year: d.year,
      score: d.performanceMultiplier,
      multiplier: d.performanceMultiplier,
    }));

    const scores = months.map(m => m.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const last = scores[scores.length - 1];
    
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.05) trendDirection = 'improving';
      else if (secondAvg < firstAvg * 0.95) trendDirection = 'declining';
      else trendDirection = 'stable';
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
      trendDirection,
    };
  }, [state.employees, getMonthlyHistory]);

  const getAllTrends = useCallback((): PerformanceTrend[] => {
    const trends: PerformanceTrend[] = [];
    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;
      const trend = getPerformanceTrend(emp.id);
      if (trend) trends.push(trend);
    }
    return trends;
  }, [state.employees, getPerformanceTrend]);

  const deleteMonthlyData = useCallback((employeeId: string, year: number, month: number) => {
    setState(s => ({
      ...s,
      monthlyData: s.monthlyData.filter(
        d => !(d.employeeId === employeeId && d.year === year && d.month === month)
      ),
    }));
  }, []);

  const getMonthData = useCallback((year: number, month: number): MonthlyPerformance[] => {
    return state.monthlyData.filter(d => d.year === year && d.month === month);
  }, [state.monthlyData]);

  const getMonthlyStats = useCallback((): MonthlyStats => {
    const trends = getAllTrends();
    const avgMultiplier = trends.length > 0 
      ? trends.reduce((sum, t) => sum + t.currentScore, 0) / trends.length 
      : 0;
    
    const risingStars: string[] = [];
    const underachievers: string[] = [];
    
    for (const t of trends) {
      if (t.trendDirection === 'improving' && t.currentScore > 1.0) {
        risingStars.push(t.name);
      }
      if (t.trendDirection === 'declining' && t.currentScore < 0.7) {
        underachievers.push(t.name);
      }
    }

    // Calculate month-over-month change
    let monthOverMonthChange = 0;
    if (trends.length > 0 && trends[0].months.length >= 2) {
      const lastMonth = trends[0].months[trends[0].months.length - 1];
      const prevMonth = trends[0].months[trends[0].months.length - 2];
      monthOverMonthChange = ((lastMonth.score - prevMonth.score) / prevMonth.score) * 100;
    }

    // Get unique months with data
    const monthSet = new Set<string>();
    for (const d of state.monthlyData) {
      monthSet.add(`${d.year}-${d.month}`);
    }
    const monthsWithData = Array.from(monthSet).map(s => {
      const [year, month] = s.split('-').map(Number);
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
      monthsWithData,
    };
  }, [getAllTrends, state.monthlyData]);

  // ===== TRIGGER DETECTION FUNCTIONS =====

  const detectTriggers = useCallback((): TriggerSummary => {
    const triggers: PerformanceTrigger[] = [];

    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;

      const history = getMonthlyHistory(emp.id);
      if (history.length < 3) continue;

      // Sort by date (oldest to newest)
      const sorted = [...history].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      const scores = sorted.map(d => d.performanceMultiplier);
      const months = sorted.map(d => ({ month: d.month, year: d.year, score: d.performanceMultiplier }));

      // Check for 3 consecutive months of decline
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

      // Rule 1: 3 consecutive months declining = PIP
      if (decliningCount >= 3) {
        const lastThree = months.slice(-3);
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'pip',
          severity: 'warning',
          message: `⚠️ PIP Required: 3 consecutive months of declining performance (${lastThree.map(m => fmtNum(m.score, 2)).join(' → ')})`,
          triggeredAt: new Date().toISOString(),
          monthsData: lastThree
        });
      }

      // Rule 2: 6 consecutive months below 0.7 = Probation
      const lastSix = months.slice(-6);
      if (lastSix.length === 6 && lastSix.every(m => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'probation',
          severity: 'danger',
          message: `📋 Probation Period: 6 consecutive months below 0.7 multiplier (avg: ${fmtNum(lastSix.reduce((s, m) => s + m.score, 0) / 6, 2)})`,
          triggeredAt: new Date().toISOString(),
          monthsData: lastSix
        });
      }

      // Rule 3: 9 consecutive months below 0.7 = Management Action
      const lastNine = months.slice(-9);
      if (lastNine.length === 9 && lastNine.every(m => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'management_action',
          severity: 'critical',
          message: `🔴 Management Action Required: 9 consecutive months below 0.7 multiplier (avg: ${fmtNum(lastNine.reduce((s, m) => s + m.score, 0) / 9, 2)})`,
          triggeredAt: new Date().toISOString(),
          monthsData: lastNine
        });
      }
    }

    return {
      pip: triggers.filter(t => t.type === 'pip'),
      probation: triggers.filter(t => t.type === 'probation'),
      managementAction: triggers.filter(t => t.type === 'management_action'),
      total: triggers.length
    };
  }, [state.employees, getMonthlyHistory]);

  const getTriggersForEmployee = useCallback((employeeId: string): PerformanceTrigger[] => {
    const all = detectTriggers();
    return [
      ...all.pip,
      ...all.probation,
      ...all.managementAction
    ].filter(t => t.employeeId === employeeId);
  }, [detectTriggers]);

  const value: Ctx = {
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
    // Monthly functions
    saveMonthlySnapshot,
    getMonthlyHistory,
    getPerformanceTrend,
    getAllTrends,
    deleteMonthlyData,
    getMonthData,
    getMonthlyStats,
    // Trigger functions
    detectTriggers,
    getTriggersForEmployee,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}