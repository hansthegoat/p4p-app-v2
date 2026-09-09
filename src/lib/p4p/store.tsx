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
  TriggerSummary,
  KPITemplate,
  AppraisalRequest,
  AppraisalPeriod,
  Notification,
  AppraisalComment,
  Category
} from "./types";
import { newId } from "./defaults";

const LS_KEY = "p4p_state_v1";
const MONTHLY_KEY = "p4p_monthly_data";
const TEMPLATES_KEY = "p4p_kpi_templates";
const APPRAISALS_KEY = "p4p_appraisals";
const NOTIFICATIONS_KEY = "p4p_notifications";
const EMPLOYEE_TEMPLATE_KEY = "p4p_employee_templates_applied";

// Helper functions
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

function loadTemplates(): Record<string, KPITemplate> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

function saveTemplates(templates: Record<string, KPITemplate>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {}
}

function loadAppraisals(): AppraisalRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPRAISALS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveAppraisals(data: AppraisalRequest[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPRAISALS_KEY, JSON.stringify(data));
  } catch {}
}

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

function saveNotifications(data: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
  } catch {}
}

interface State {
  globals: Globals;
  grades: GradePoint[];
  employees: Employee[];
  monthlyData: MonthlyPerformance[];
  kpiTemplates: Record<string, KPITemplate>;
  appraisals: AppraisalRequest[];
  notifications: Notification[];
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
  saveMonthlySnapshot: (employeeId: string, year: number, month: number) => void;
  getMonthlyHistory: (employeeId: string) => MonthlyPerformance[];
  getPerformanceTrend: (employeeId: string) => PerformanceTrend | null;
  getAllTrends: () => PerformanceTrend[];
  deleteMonthlyData: (employeeId: string, year: number, month: number) => void;
  getMonthData: (year: number, month: number) => MonthlyPerformance[];
  getMonthlyStats: () => MonthlyStats;
  detectTriggers: () => TriggerSummary;
  getTriggersForEmployee: (employeeId: string) => PerformanceTrigger[];
  saveTemplate: (template: KPITemplate) => void;
  getTemplate: (department: string, role: string) => KPITemplate | undefined;
  getAllTemplates: () => Record<string, KPITemplate>;
  applyTemplateToEmployees: (department: string, role: string, template: KPITemplate) => number;
  // NEW: Ensure all employees have their KPIs
  ensureAllEmployeesHaveKPIs: () => number;
  submitAppraisal: (employeeId: string, period: string, year: number, month: number) => void;
  approveAppraisal: (id: string, reviewerId: string, reviewerName: string) => void;
  rejectAppraisal: (id: string, reviewerId: string, reviewerName: string, reason: string) => void;
  requestChanges: (id: string, reviewerId: string, reviewerName: string, reason: string) => void;
  getEmployeeAppraisals: (employeeId: string) => AppraisalRequest[];
  getPendingAppraisals: () => AppraisalRequest[];
  addAppraisalComment: (appraisalId: string, authorId: string, authorName: string, text: string) => void;
  getNotifications: (userId: string) => Notification[];
  markNotificationRead: (id: string) => void;
  saveKPIProof: (employeeId: string, kpiId: string, fileData: { id: string; fileName: string; fileUrl: string; fileType: string; fileSize?: number }) => void;
  saveKPIComment: (employeeId: string, kpiId: string, comment: string) => void;
  triggerAfterApproval: (employeeId: string) => void;
}

const C = createContext<Ctx | null>(null);

function loadInitial(): State {
  if (typeof window === "undefined") {
    return {
      globals: DEFAULT_GLOBALS,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: loadTemplates(),
      appraisals: loadAppraisals(),
      notifications: loadNotifications(),
    };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure employees is an array
      let employees = Array.isArray(parsed.employees) ? parsed.employees : DEMO_EMPLOYEES;
      
      // Ensure every employee has categories (not just kpis)
      employees = employees.map(emp => {
        if (!emp.categories || emp.categories.length === 0) {
          // Try to find a template for this employee's department and role
          const templates = loadTemplates();
          const key = `${emp.department}-${emp.role}`;
          const template = templates[key];
          if (template) {
            const categories = template.categories.map(cat => ({
              id: newId(),
              name: cat.name,
              weight: cat.weight,
              kpis: cat.kpis.map(k => ({
                id: newId(),
                description: k.description,
                metric: k.metric,
                target: k.target,
                actual: 0,
                weight: 100,
                measurementSource: k.measurementSource || "",
              })),
            }));
            return { ...emp, categories };
          }
        }
        return emp;
      });
      
      return {
        globals: { ...DEFAULT_GLOBALS, ...parsed.globals },
        grades: parsed.grades?.length ? parsed.grades : DEFAULT_GRADES,
        employees,
        monthlyData: loadMonthlyData(),
        kpiTemplates: loadTemplates(),
        appraisals: loadAppraisals(),
        notifications: loadNotifications(),
      };
    }
  } catch {}
  return {
    globals: DEFAULT_GLOBALS,
    grades: DEFAULT_GRADES,
    employees: DEMO_EMPLOYEES,
    monthlyData: [],
    kpiTemplates: loadTemplates(),
    appraisals: loadAppraisals(),
    notifications: loadNotifications(),
  };
}

export function P4PProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => loadInitial());

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
    saveTemplates(state.kpiTemplates);
    saveAppraisals(state.appraisals);
    saveNotifications(state.notifications);
  }, [state]);

  // ===== BASIC SETTERS =====
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
      monthlyData: [],
      kpiTemplates: {},
      appraisals: [],
      notifications: [],
    }), []);
  
  const setEmployees = useCallback((list: Employee[]) =>
    setState((s) => ({ ...s, employees: list })), []);

  // ===== NEW: Ensure all employees have KPIs =====
  const ensureAllEmployeesHaveKPIs = useCallback((): number => {
    const templates = state.kpiTemplates;
    let updatedCount = 0;
    
    const updatedEmployees = state.employees.map(emp => {
      // Skip adjunct employees
      if (emp.isAdjunct) return emp;
      
      // Check if employee already has categories
      if (emp.categories && emp.categories.length > 0) {
        return emp;
      }
      
      // Try to find a template for this employee
      const key = `${emp.department}-${emp.role}`;
      const template = templates[key];
      
      if (template) {
        const categories = template.categories.map(cat => ({
          id: newId(),
          name: cat.name,
          weight: cat.weight,
          kpis: cat.kpis.map(k => ({
            id: newId(),
            description: k.description,
            metric: k.metric,
            target: k.target,
            actual: 0,
            weight: 100,
            measurementSource: k.measurementSource || "",
          })),
        }));
        updatedCount++;
        return { ...emp, categories };
      }
      
      return emp;
    });
    
    if (updatedCount > 0) {
      setState(s => ({ ...s, employees: updatedEmployees }));
    }
    
    return updatedCount;
  }, [state.employees, state.kpiTemplates]);

  // ===== CALC =====
  const calc = useMemo(() => calculate(state.employees, state.grades, state.globals), [state]);

  // ===== MONTHLY FUNCTIONS =====
  const saveMonthlySnapshot = useCallback((employeeId: string, year: number, month: number) => {
    const employee = state.employees.find(e => e.id === employeeId);
    if (!employee || employee.isAdjunct) return;

    const result = calc.perEmployee[employeeId];
    if (!result) return;

    const existing = state.monthlyData.findIndex(
      d => d.employeeId === employeeId && d.year === year && d.month === month
    );

    const snapshot: MonthlyPerformance = {
      year,
      month,
      employeeId,
      kpis: employee.kpis.map(k => ({ ...k })),
      categories: employee.categories?.map(c => ({
        ...c,
        kpis: c.kpis.map(k => ({ ...k }))
      })),
      performanceMultiplier: result.performanceMultiplier,
      bonusEligible: result.bonus,
      createdAt: new Date().toISOString(),
    };

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

    let monthOverMonthChange = 0;
    if (trends.length > 0 && trends[0].months.length >= 2) {
      const lastMonth = trends[0].months[trends[0].months.length - 1];
      const prevMonth = trends[0].months[trends[0].months.length - 2];
      monthOverMonthChange = ((lastMonth.score - prevMonth.score) / prevMonth.score) * 100;
    }

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

  // ===== TRIGGERS =====
  const detectTriggers = useCallback((): TriggerSummary => {
    const triggers: PerformanceTrigger[] = [];

    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;

      const history = getMonthlyHistory(emp.id);
      if (history.length < 3) continue;

      const sorted = [...history].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      const scores = sorted.map(d => d.performanceMultiplier);
      const months = sorted.map(d => ({ month: d.month, year: d.year, score: d.performanceMultiplier }));

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
          type: 'pip',
          severity: 'warning',
          message: `⚠️ PIP Required: 3 consecutive months of declining performance (${lastThree.map(m => fmtNum(m.score, 2)).join(' → ')})`,
          triggeredAt: new Date().toISOString(),
          monthsData: lastThree
        });
      }

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

  // ===== TEMPLATE FUNCTIONS =====
  const saveTemplate = useCallback((template: KPITemplate) => {
    const key = `${template.department}-${template.roleName}`;
    setState(s => ({
      ...s,
      kpiTemplates: {
        ...s.kpiTemplates,
        [key]: template,
      }
    }));
  }, []);

  const getTemplate = useCallback((department: string, role: string): KPITemplate | undefined => {
    const key = `${department}-${role}`;
    return state.kpiTemplates[key];
  }, [state.kpiTemplates]);

  const getAllTemplates = useCallback(() => {
    return state.kpiTemplates;
  }, [state.kpiTemplates]);

  const applyTemplateToEmployees = useCallback((department: string, role: string, template: KPITemplate): number => {
    const employeesToUpdate = state.employees.filter(
      e => e.department === department && e.role === role && !e.isAdjunct
    );

    if (employeesToUpdate.length === 0) return 0;

    const updatedEmployees = state.employees.map(emp => {
      if (emp.department === department && emp.role === role && !emp.isAdjunct) {
        const newCategories = template.categories.map(cat => ({
          id: newId(),
          name: cat.name,
          weight: cat.weight,
          kpis: cat.kpis.map(k => ({
            id: newId(),
            description: k.description,
            metric: k.metric,
            target: k.target,
            actual: 0,
            weight: 100,
            measurementSource: k.measurementSource || "",
          })),
        }));
        return { ...emp, categories: newCategories };
      }
      return emp;
    });

    setState(prev => ({
      ...prev,
      employees: updatedEmployees,
    }));

    return employeesToUpdate.length;
  }, [state.employees]);

  // ===== APPRAISAL FUNCTIONS =====
  const getPerformanceBand = (score: number): string => {
    if (score >= 1.2) return "Exceptional";
    if (score >= 1.0) return "Exceeds Expectations";
    if (score >= 0.8) return "Meets Expectations";
    if (score >= 0.6) return "Needs Improvement";
    return "Performance Improvement Plan";
  };

  const submitAppraisal = useCallback((employeeId: string, period: string, year: number, month: number) => {
    const employee = state.employees.find(e => e.id === employeeId);
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

    const appraisal: AppraisalRequest = {
      id: newId(),
      employeeId,
      employeeName: employee.name,
      department: employee.department,
      role: employee.role,
      period,
      year,
      month,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      categories: categories.map(cat => ({
        ...cat,
        kpis: cat.kpis.map(k => ({ ...k }))
      })),
      overallScore,
      overallPercent,
      performanceBand: band,
      comments: [],
    };

    const notification: Notification = {
      id: newId(),
      userId: 'manager',
      type: 'appraisal_submitted',
      message: `${employee.name} submitted an appraisal for ${period}`,
      link: `/appraisals-review`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setState(s => ({
      ...s,
      appraisals: [...s.appraisals, appraisal],
      notifications: [...s.notifications, notification],
    }));
  }, [state.employees]);

  const saveKPIProof = useCallback((employeeId: string, kpiId: string, fileData: { 
    id: string; 
    fileName: string; 
    fileUrl: string; 
    fileType: string; 
    fileSize?: number 
  }) => {
    setState(s => {
      const updatedEmployees = s.employees.map(emp => {
        if (emp.id !== employeeId) return emp;
        const updatedCategories = (emp.categories || []).map(cat => ({
          ...cat,
          kpis: cat.kpis.map(k => {
            if (k.id !== kpiId) return k;
            const proof = k.proof || [];
            return {
              ...k,
              proof: [...proof, {
                ...fileData,
                uploadedAt: new Date().toISOString()
              }],
              updatedAt: new Date().toISOString()
            };
          })
        }));
        return { ...emp, categories: updatedCategories };
      });
      return { ...s, employees: updatedEmployees };
    });
  }, []);

  const saveKPIComment = useCallback((employeeId: string, kpiId: string, comment: string) => {
    setState(s => {
      const updatedEmployees = s.employees.map(emp => {
        if (emp.id !== employeeId) return emp;
        const updatedCategories = (emp.categories || []).map(cat => ({
          ...cat,
          kpis: cat.kpis.map(k => {
            if (k.id !== kpiId) return k;
            return {
              ...k,
              comment,
              updatedAt: new Date().toISOString()
            };
          })
        }));
        return { ...emp, categories: updatedCategories };
      });
      return { ...s, employees: updatedEmployees };
    });
  }, []);

  const triggerAfterApproval = useCallback((employeeId: string) => {
    const allTriggers = detectTriggers();
    const employeeTriggers = [
      ...allTriggers.pip,
      ...allTriggers.probation,
      ...allTriggers.managementAction
    ].filter(t => t.employeeId === employeeId);

    const newNotifications: Notification[] = employeeTriggers.map(t => ({
      id: newId(),
      userId: employeeId,
      type: t.type === 'pip' ? 'trigger_pip' : t.type === 'probation' ? 'trigger_probation' : 'trigger_management_action',
      message: t.message,
      link: '/employee',
      read: false,
      createdAt: new Date().toISOString()
    }));

    if (newNotifications.length > 0) {
      setState(s => ({
        ...s,
        notifications: [...s.notifications, ...newNotifications]
      }));
    }
  }, [detectTriggers]);

  const approveAppraisal = useCallback((id: string, reviewerId: string, reviewerName: string) => {
    let employeeId = '';
    let year = 0;
    let month = 0;
    let categories: Category[] = [];
    let appraisalToApprove: AppraisalRequest | null = null;
    
    setState(s => {
      const updated = s.appraisals.map(a => {
        if (a.id === id) {
          employeeId = a.employeeId;
          year = a.year;
          month = a.month;
          categories = a.categories;
          appraisalToApprove = a;
          return {
            ...a,
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewerId,
            reviewerName,
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });

    if (employeeId && year && month && categories && categories.length > 0) {
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
      const performanceMultiplier = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      const snapshot: MonthlyPerformance = {
        year,
        month,
        employeeId,
        kpis: [],
        categories: categories.map(cat => ({
          ...cat,
          kpis: cat.kpis.map(k => ({ ...k }))
        })),
        performanceMultiplier,
        bonusEligible: 0,
        createdAt: new Date().toISOString(),
      };

      setState(s => {
        const filtered = s.monthlyData.filter(d => !(d.employeeId === employeeId && d.year === year && d.month === month));
        return { ...s, monthlyData: [...filtered, snapshot] };
      });

      setState(s => {
        const updatedEmployees = s.employees.map(emp => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              categories: categories.map(cat => ({
                ...cat,
                kpis: cat.kpis.map(k => ({ ...k }))
              }))
            };
          }
          return emp;
        });
        return { ...s, employees: updatedEmployees };
      });

      setTimeout(() => triggerAfterApproval(employeeId), 100);
    }
  }, [triggerAfterApproval, state.employees]);

  const rejectAppraisal = useCallback((id: string, reviewerId: string, reviewerName: string, reason: string) => {
    setState(s => {
      const updated = s.appraisals.map(a => {
        if (a.id === id) {
          return {
            ...a,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewerId,
            reviewerName,
            revisionReason: reason,
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
  }, []);

  const requestChanges = useCallback((id: string, reviewerId: string, reviewerName: string, reason: string) => {
    setState(s => {
      const updated = s.appraisals.map(a => {
        if (a.id === id) {
          return {
            ...a,
            status: 'needs_revision',
            reviewedAt: new Date().toISOString(),
            reviewerId,
            reviewerName,
            revisionReason: reason,
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
  }, []);

  const getEmployeeAppraisals = useCallback((employeeId: string): AppraisalRequest[] => {
    return state.appraisals
      .filter(a => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [state.appraisals]);

  const getPendingAppraisals = useCallback((): AppraisalRequest[] => {
    return state.appraisals
      .filter(a => a.status === 'pending')
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [state.appraisals]);

  const addAppraisalComment = useCallback((appraisalId: string, authorId: string, authorName: string, text: string) => {
    const comment: AppraisalComment = {
      id: newId(),
      authorId,
      authorName,
      text,
      timestamp: new Date().toISOString(),
    };

    setState(s => {
      const updated = s.appraisals.map(a => {
        if (a.id === appraisalId) {
          return {
            ...a,
            comments: [...a.comments, comment],
          };
        }
        return a;
      });
      return { ...s, appraisals: updated };
    });
  }, []);

  const getNotifications = useCallback((userId: string): Notification[] => {
    return state.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.notifications]);

  const markNotificationRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  // ===== VALUE OBJECT =====
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
    ensureAllEmployeesHaveKPIs,
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
    triggerAfterApproval,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}