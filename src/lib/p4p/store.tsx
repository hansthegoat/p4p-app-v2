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
  Notification,
  AppraisalComment,
  Category,
  KPI,
  KpiUpdateRequest,
  KpiDiffItem,
} from "./types";
import { newId } from "./defaults";
import { sendEmail } from "@/lib/email";
import {
  newAppraisalEmail,
  appraisalApprovedEmail,
  appraisalRejectedEmail,
  changesRequestedEmail,
  performanceTriggerEmail,
} from "@/lib/email-templates";
import {
  fetchAllEmployees,
  fetchAllTemplates,
  fetchAllMonthly,
  fetchAllAppraisals,
  upsertEmployeeDB,
  deleteEmployeeDB,
  bulkUpsertEmployees,
  upsertTemplate,
  upsertMonthlyPerformance,
  deleteMonthlyPerformance,
  upsertAppraisal,
  insertAppraisalComment,
  insertNotification,
  markNotificationReadDB,
  fetchAllKpiUpdateRequests,
  upsertKpiUpdateRequest,
} from "./supabase-data";

const LS_KEY = "p4p_state_v1";
const MONTHLY_KEY = "p4p_monthly_data";
const TEMPLATES_KEY = "p4p_kpi_templates";
const APPRAISALS_KEY = "p4p_appraisals";
const NOTIFICATIONS_KEY = "p4p_notifications";
const KPI_UPDATES_KEY = "p4p_kpi_update_requests";
const SYNC_FLAG_KEY = "p4p_synced_to_supabase";

// ============================================
// LOCALSTORAGE HELPERS
// ============================================

function loadMonthlyData(): MonthlyPerformance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MONTHLY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveMonthlyData(data: MonthlyPerformance[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(MONTHLY_KEY, JSON.stringify(data)); } catch {}
}

function loadTemplates(): Record<string, KPITemplate> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveTemplates(templates: Record<string, KPITemplate>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates)); } catch {}
}

function loadAppraisals(): AppraisalRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPRAISALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAppraisals(data: AppraisalRequest[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(APPRAISALS_KEY, JSON.stringify(data)); } catch {}
}

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveNotifications(data: Notification[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data)); } catch {}
}

function loadKpiUpdateRequests(): KpiUpdateRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KPI_UPDATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveKpiUpdateRequests(data: KpiUpdateRequest[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KPI_UPDATES_KEY, JSON.stringify(data)); } catch {}
}

// ============================================
// STATE TYPES
// ============================================

interface State {
  globals: Globals;
  grades: GradePoint[];
  employees: Employee[];
  monthlyData: MonthlyPerformance[];
  kpiTemplates: Record<string, KPITemplate>;
  appraisals: AppraisalRequest[];
  notifications: Notification[];
  kpiUpdateRequests: KpiUpdateRequest[];
}

interface Ctx extends State {
  isCloudSynced: boolean;
  isSyncing: boolean;

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

  hardDeleteEmployee: (id: string) => void;

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

  previewTemplateDiff: (department: string, role: string, template: KPITemplate) => Record<string, KpiDiffItem[]>;
  pushTemplateToEmployees: (department: string, role: string, template: KPITemplate) => Promise<{ affected: number; created: number }>;
  getKpiUpdateRequests: (employeeId: string) => KpiUpdateRequest[];
  getUnacknowledgedKpiUpdates: () => KpiUpdateRequest[];
  acknowledgeKpiUpdate: (id: string) => Promise<void>;
  commentKpiUpdate: (id: string, comment: string) => Promise<void>;

  syncToCloud: () => Promise<void>;
}

const C = createContext<Ctx | null>(null);

// ============================================
// LOAD INITIAL STATE
// ============================================

function loadInitial(): State {
  if (typeof window === "undefined") {
    return {
      globals: DEFAULT_GLOBALS,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: {},
      appraisals: [],
      notifications: [],
      kpiUpdateRequests: [],
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
        notifications: loadNotifications(),
        kpiUpdateRequests: loadKpiUpdateRequests(),
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
    kpiUpdateRequests: loadKpiUpdateRequests(),
  };
}

// ============================================
// PROVIDER
// ============================================

export function P4PProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => loadInitial());
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ============================================
  // CLOUD FETCH + AUTH-STATE REFETCH
  // ============================================
  useEffect(() => {
    let cancelled = false;

    const refetchFromCloud = async () => {
      setIsSyncing(true);
      try {
        const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates] =
          await Promise.all([
            fetchAllEmployees(),
            fetchAllTemplates(),
            fetchAllMonthly(),
            fetchAllAppraisals(),
            fetchAllKpiUpdateRequests(),
          ]);

        if (cancelled) return;

        setState((s) => ({
          ...s,
          employees: cloudEmployees.length > 0 ? cloudEmployees : s.employees,
          kpiTemplates:
            Object.keys(cloudTemplates).length > 0 ? cloudTemplates : s.kpiTemplates,
          monthlyData: cloudMonthly.length > 0 ? cloudMonthly : s.monthlyData,
          appraisals: cloudAppraisals.length > 0 ? cloudAppraisals : s.appraisals,
          kpiUpdateRequests: cloudKpiUpdates,
        }));

        setIsCloudSynced(true);
      } catch (err) {
        console.error("Cloud refetch failed:", err);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    const initFromCloud = async () => {
      try {
        const { getCurrentUser } = await import("@/lib/supabase");
        const user = await getCurrentUser();
        if (!user) {
          console.log("⏳ Not logged in — using localStorage only");
          setIsCloudSynced(false);
          return;
        }
      } catch {
        return;
      }

      setIsSyncing(true);
      try {
        const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates] =
          await Promise.all([
            fetchAllEmployees(),
            fetchAllTemplates(),
            fetchAllMonthly(),
            fetchAllAppraisals(),
            fetchAllKpiUpdateRequests(),
          ]);

        if (cancelled) return;

        const localStorageHasData =
          state.employees.length > 0 &&
          state.employees.some((e) => !DEMO_EMPLOYEES.find((d) => d.id === e.id));
        const cloudHasData = cloudEmployees.length > 0;
        const alreadySynced = localStorage.getItem(SYNC_FLAG_KEY) === "true";

        if (!cloudHasData && localStorageHasData && !alreadySynced) {
          console.log("🚀 Migrating localStorage data to Supabase...");
          try {
            await bulkUpsertEmployees(state.employees);
            for (const key in state.kpiTemplates) {
              await upsertTemplate(state.kpiTemplates[key]);
            }
            for (const m of state.monthlyData) {
              await upsertMonthlyPerformance(m);
            }
            for (const a of state.appraisals) {
              await upsertAppraisal(a);
            }
            localStorage.setItem(SYNC_FLAG_KEY, "true");
            console.log("✅ Migration complete");
          } catch (err) {
            console.error("❌ Migration failed:", err);
          }
        }

        setState((s) => ({
          ...s,
          employees: cloudHasData ? cloudEmployees : s.employees,
          kpiTemplates:
            Object.keys(cloudTemplates).length > 0 ? cloudTemplates : s.kpiTemplates,
          monthlyData: cloudMonthly.length > 0 ? cloudMonthly : s.monthlyData,
          appraisals: cloudAppraisals.length > 0 ? cloudAppraisals : s.appraisals,
          kpiUpdateRequests: cloudKpiUpdates,
        }));

        setIsCloudSynced(true);
      } catch (err) {
        console.error("Cloud init failed:", err);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    initFromCloud();

    let subscription: { unsubscribe: () => void } | null = null;
    (async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("🔐 Signed in — refetching from cloud");
          refetchFromCloud();
        } else if (event === "SIGNED_OUT") {
          setIsCloudSynced(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          refetchFromCloud();
        }
      });
      subscription = data.subscription;
    })();

    return () => {
      cancelled = true;
      if (subscription) subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // CACHE WRITES
  // ============================================
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          globals: state.globals,
          grades: state.grades,
          employees: state.employees,
        })
      );
    } catch {}
    saveMonthlyData(state.monthlyData);
    saveTemplates(state.kpiTemplates);
    saveAppraisals(state.appraisals);
    saveNotifications(state.notifications);
    saveKpiUpdateRequests(state.kpiUpdateRequests);
  }, [state]);

  // ============================================
  // BASIC SETTERS
  // ============================================
  const setGlobals = useCallback(
    (g: Partial<Globals>) => setState((s) => ({ ...s, globals: { ...s.globals, ...g } })),
    []
  );

  const setGrades = useCallback(
    (grades: GradePoint[]) => setState((s) => ({ ...s, grades })),
    []
  );

  const resetGrades = useCallback(
    () => setState((s) => ({ ...s, grades: DEFAULT_GRADES })),
    []
  );

  const upsertEmployee = useCallback((e: Employee) => {
    setState((s) => {
      const exists = s.employees.some((x) => x.id === e.id);
      return {
        ...s,
        employees: exists
          ? s.employees.map((x) => (x.id === e.id ? e : x))
          : [...s.employees, e],
      };
    });
    upsertEmployeeDB(e).catch((err) => console.error("Cloud upsert employee failed:", err));
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) }));
    deleteEmployeeDB(id).catch((err) => console.error("Cloud remove employee failed:", err));
  }, []);

  const clearEmployees = useCallback(() => {
    setState((s) => ({ ...s, employees: [] }));
  }, []);

  const loadDemo = useCallback(() => {
    setState({
      globals: DEFAULT_GLOBALS,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: {},
      appraisals: [],
      notifications: [],
      kpiUpdateRequests: [],
    });
  }, []);

  const setEmployees = useCallback((list: Employee[]) => {
    setState((s) => ({ ...s, employees: list }));
    bulkUpsertEmployees(list).catch((err) =>
      console.error("Cloud bulk upsert failed:", err)
    );
  }, []);

  const hardDeleteEmployee = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      employees: s.employees.filter((e) => e.id !== id),
      monthlyData: s.monthlyData.filter((d) => d.employeeId !== id),
      appraisals: s.appraisals.filter((a) => a.employeeId !== id),
      notifications: s.notifications.filter((n) => n.userId !== id),
      kpiUpdateRequests: s.kpiUpdateRequests.filter((r) => r.employeeId !== id),
    }));
    deleteEmployeeDB(id).catch((err) => console.error("Cloud hard delete failed:", err));
  }, []);

  // ============================================
  // CALC
  // ============================================
  const calc = useMemo(
    () => calculate(state.employees, state.grades, state.globals),
    [state]
  );

  // ============================================
  // MONTHLY
  // ============================================
  const saveMonthlySnapshot = useCallback(
    (employeeId: string, year: number, month: number) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee || employee.isAdjunct) return;

      const result = calc.perEmployee[employeeId];
      if (!result) return;

      const snapshot: MonthlyPerformance = {
        year,
        month,
        employeeId,
        kpis: employee.kpis.map((k) => ({ ...k })),
        categories: employee.categories?.map((c) => ({
          ...c,
          kpis: c.kpis.map((k) => ({ ...k })),
        })),
        performanceMultiplier: result.performanceMultiplier,
        bonusEligible: result.bonus,
        createdAt: new Date().toISOString(),
      };

      setState((s) => {
        const existing = s.monthlyData.findIndex(
          (d) => d.employeeId === employeeId && d.year === year && d.month === month
        );
        const newData = [...s.monthlyData];
        if (existing >= 0) newData[existing] = snapshot;
        else newData.push(snapshot);
        return { ...s, monthlyData: newData };
      });

      upsertMonthlyPerformance(snapshot).catch((err) =>
        console.error("Cloud save monthly failed:", err)
      );
    },
    [state.employees, calc]
  );

  const getMonthlyHistory = useCallback(
    (employeeId: string): MonthlyPerformance[] =>
      state.monthlyData
        .filter((d) => d.employeeId === employeeId)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        }),
    [state.monthlyData]
  );

  const getPerformanceTrend = useCallback(
    (employeeId: string): PerformanceTrend | null => {
      const history = getMonthlyHistory(employeeId);
      if (history.length === 0) return null;

      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) return null;

      const months = history.map((d) => ({
        month: d.month,
        year: d.year,
        score: d.performanceMultiplier,
        multiplier: d.performanceMultiplier,
      }));

      const scores = months.map((m) => m.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const last = scores[scores.length - 1];

      let trendDirection: "improving" | "declining" | "stable" = "stable";
      if (scores.length >= 2) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg > firstAvg * 1.05) trendDirection = "improving";
        else if (secondAvg < firstAvg * 0.95) trendDirection = "declining";
      }

      const best = months.reduce((a, b) => (a.score > b.score ? a : b));
      const worst = months.reduce((a, b) => (a.score < b.score ? a : b));

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
    },
    [state.employees, getMonthlyHistory]
  );

  const getAllTrends = useCallback((): PerformanceTrend[] => {
    const trends: PerformanceTrend[] = [];
    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;
      const trend = getPerformanceTrend(emp.id);
      if (trend) trends.push(trend);
    }
    return trends;
  }, [state.employees, getPerformanceTrend]);

  const deleteMonthlyData = useCallback(
    (employeeId: string, year: number, month: number) => {
      setState((s) => ({
        ...s,
        monthlyData: s.monthlyData.filter(
          (d) => !(d.employeeId === employeeId && d.year === year && d.month === month)
        ),
      }));
      deleteMonthlyPerformance(employeeId, year, month).catch((err) =>
        console.error("Cloud delete monthly failed:", err)
      );
    },
    []
  );

  const getMonthData = useCallback(
    (year: number, month: number): MonthlyPerformance[] =>
      state.monthlyData.filter((d) => d.year === year && d.month === month),
    [state.monthlyData]
  );

  const getMonthlyStats = useCallback((): MonthlyStats => {
    const trends = getAllTrends();
    const avgMultiplier =
      trends.length > 0
        ? trends.reduce((sum, t) => sum + t.currentScore, 0) / trends.length
        : 0;

    const risingStars: string[] = [];
    const underachievers: string[] = [];

    for (const t of trends) {
      if (t.trendDirection === "improving" && t.currentScore > 1.0) risingStars.push(t.name);
      if (t.trendDirection === "declining" && t.currentScore < 0.7) underachievers.push(t.name);
    }

    let monthOverMonthChange = 0;
    if (trends.length > 0 && trends[0].months.length >= 2) {
      const lastMonth = trends[0].months[trends[0].months.length - 1];
      const prevMonth = trends[0].months[trends[0].months.length - 2];
      monthOverMonthChange =
        ((lastMonth.score - prevMonth.score) / prevMonth.score) * 100;
    }

    const monthSet = new Set<string>();
    for (const d of state.monthlyData) monthSet.add(`${d.year}-${d.month}`);
    const monthsWithData = Array.from(monthSet)
      .map((s) => {
        const [year, month] = s.split("-").map(Number);
        return { year, month };
      })
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

    return {
      totalEmployees: trends.length,
      avgMultiplier,
      risingStars,
      underachievers,
      monthOverMonthChange,
      monthsWithData,
    };
  }, [getAllTrends, state.monthlyData]);

  // ============================================
  // TRIGGERS
  // ============================================
  const detectTriggers = useCallback((): TriggerSummary => {
    const triggers: PerformanceTrigger[] = [];

    for (const emp of state.employees) {
      if (emp.isAdjunct) continue;

      const history = getMonthlyHistory(emp.id);
      if (history.length < 3) continue;

      const sorted = [...history].sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.month - b.month
      );

      const scores = sorted.map((d) => d.performanceMultiplier);
      const months = sorted.map((d) => ({
        month: d.month,
        year: d.year,
        score: d.performanceMultiplier,
      }));

      let decliningCount = 0;
      let prevScore = scores[0];
      for (let i = 1; i < scores.length; i++) {
        if (scores[i] < prevScore) decliningCount++;
        else decliningCount = 0;
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
          triggeredAt: new Date().toISOString(),
          monthsData: lastThree,
        });
      }

      const lastSix = months.slice(-6);
      if (lastSix.length === 6 && lastSix.every((m) => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "probation",
          severity: "danger",
          message: `📋 Probation Period: 6 consecutive months below 0.7 (avg: ${fmtNum(lastSix.reduce((s, m) => s + m.score, 0) / 6, 2)})`,
          triggeredAt: new Date().toISOString(),
          monthsData: lastSix,
        });
      }

      const lastNine = months.slice(-9);
      if (lastNine.length === 9 && lastNine.every((m) => m.score < 0.7)) {
        triggers.push({
          employeeId: emp.id,
          employeeName: emp.name,
          type: "management_action",
          severity: "critical",
          message: `🔴 Management Action Required: 9 consecutive months below 0.7 (avg: ${fmtNum(lastNine.reduce((s, m) => s + m.score, 0) / 9, 2)})`,
          triggeredAt: new Date().toISOString(),
          monthsData: lastNine,
        });
      }
    }

    return {
      pip: triggers.filter((t) => t.type === "pip"),
      probation: triggers.filter((t) => t.type === "probation"),
      managementAction: triggers.filter((t) => t.type === "management_action"),
      total: triggers.length,
    };
  }, [state.employees, getMonthlyHistory]);

  const getTriggersForEmployee = useCallback(
    (employeeId: string): PerformanceTrigger[] => {
      const all = detectTriggers();
      return [...all.pip, ...all.probation, ...all.managementAction].filter(
        (t) => t.employeeId === employeeId
      );
    },
    [detectTriggers]
  );

  // ============================================
  // TEMPLATES
  // ============================================
  const saveTemplate = useCallback((template: KPITemplate) => {
    const key = `${template.department}-${template.roleName}`;
    setState((s) => ({
      ...s,
      kpiTemplates: { ...s.kpiTemplates, [key]: template },
    }));
    upsertTemplate(template).catch((err) =>
      console.error("Cloud save template failed:", err)
    );
  }, []);

  const getTemplate = useCallback(
    (department: string, role: string): KPITemplate | undefined => {
      return state.kpiTemplates[`${department}-${role}`];
    },
    [state.kpiTemplates]
  );

  const getAllTemplates = useCallback(() => state.kpiTemplates, [state.kpiTemplates]);

  const applyTemplateToEmployees = useCallback(
    (department: string, role: string, template: KPITemplate): number => {
      const toUpdate = state.employees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      if (toUpdate.length === 0) return 0;

      const updatedEmployees = state.employees.map((emp) => {
        if (emp.department === department && emp.role === role && !emp.isAdjunct) {
          const newCategories = template.categories.map((cat) => ({
            id: cat.id || newId(),
            name: cat.name,
            weight: cat.weight,
            kpis: cat.kpis.map((k) => ({
              id: k.id || newId(),
              description: k.description,
              metric: k.metric,
              target: k.target,
              actual: 0,
              weight: k.weight || 0,
              measurementSource: k.measurementSource || "",
            })),
          }));
          return { ...emp, categories: newCategories, needsKpiSetup: false };
        }
        return emp;
      });

      setState((s) => ({ ...s, employees: updatedEmployees }));

      const affected = updatedEmployees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      bulkUpsertEmployees(affected).catch((err) =>
        console.error("Cloud apply template failed:", err)
      );

      return toUpdate.length;
    },
    [state.employees]
  );

  // ============================================
  // EMAIL HELPERS
  // ============================================
  const sendAppraisalNotification = useCallback(
    async (
      type: "submitted" | "approved" | "rejected" | "requested_changes",
      appraisal: AppraisalRequest,
      reason?: string
    ) => {
      try {
        const employee = state.employees.find((e) => e.id === appraisal.employeeId);
        if (!employee) return;

        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const emailData = {
          employeeName: employee.name,
          department: employee.department,
          role: employee.role,
          period: appraisal.period,
          overallPercent: appraisal.overallPercent,
          performanceBand: appraisal.performanceBand,
          baseUrl,
          reason,
        };

        let recipients: string[] = [];
        let subject = "";
        let html = "";

        if (type === "submitted") {
          const manager = employee.supervisorId
            ? state.employees.find((e) => e.id === employee.supervisorId)
            : null;
          if (manager?.email) recipients.push(manager.email);
          state.employees
            .filter((e) => e.roleType === "admin" || e.roleType === "hr")
            .forEach((e) => {
              if (e.email && !recipients.includes(e.email)) recipients.push(e.email);
            });
          subject = `New appraisal: ${employee.name} (${appraisal.period})`;
          html = newAppraisalEmail(emailData);
        } else {
          recipients.push(employee.email);
          if (type === "approved") {
            subject = `Appraisal approved: ${appraisal.period}`;
            html = appraisalApprovedEmail(emailData);
          } else if (type === "rejected") {
            subject = `Appraisal rejected: ${appraisal.period}`;
            html = appraisalRejectedEmail(emailData);
          } else if (type === "requested_changes") {
            subject = `Changes requested: ${appraisal.period}`;
            html = changesRequestedEmail(emailData);
          }
        }

        if (recipients.length > 0 && html) {
          await sendEmail({ to: recipients, subject, html });
        }
      } catch (err) {
        console.error("Email notification failed:", err);
      }
    },
    [state.employees]
  );

  // ============================================
  // APPRAISALS
  // ============================================
  const getPerformanceBand = (score: number): string => {
    if (score >= 1.2) return "Exceptional";
    if (score >= 1.0) return "Exceeds Expectations";
    if (score >= 0.8) return "Meets Expectations";
    if (score >= 0.6) return "Needs Improvement";
    return "Performance Improvement Plan";
  };

  const submitAppraisal = useCallback(
    (employeeId: string, period: string, year: number, month: number) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) return;

      let totalWeightedScore = 0;
      let totalWeight = 0;
      const categories = employee.categories || [];

      for (const cat of categories) {
        let catSum = 0;
        let kpiWeightTotal = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = kpi.actual || 0;
          const ratio = target > 0 ? actual / target : 0;
          const w = kpi.weight || 1;
          catSum += ratio * w;
          kpiWeightTotal += w;
        }
        const catScore = kpiWeightTotal > 0 ? catSum / kpiWeightTotal : 0;
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
        status: "pending",
        categories: categories.map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({ ...k })),
        })),
        overallScore,
        overallPercent,
        performanceBand: band,
        comments: [],
      };

      const notification: Notification = {
        id: newId(),
        userId: "manager",
        type: "appraisal_submitted",
        message: `${employee.name} submitted an appraisal for ${period}`,
        link: `/appraisals-review`,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        appraisals: [...s.appraisals, appraisal],
        notifications: [...s.notifications, notification],
      }));

      upsertAppraisal(appraisal).catch((err) =>
        console.error("Cloud submit appraisal failed:", err)
      );
      insertNotification(notification).catch((err) =>
        console.error("Cloud insert notification failed:", err)
      );

      sendAppraisalNotification("submitted", appraisal);
    },
    [state.employees, sendAppraisalNotification]
  );

  const saveKPIProof = useCallback(
    (
      employeeId: string,
      kpiId: string,
      fileData: {
        id: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize?: number;
      }
    ) => {
      let updatedEmp: Employee | null = null;
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
                proof: [
                  ...proof,
                  { ...fileData, uploadedAt: new Date().toISOString() },
                ],
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
          const updated = { ...emp, categories: updatedCategories };
          updatedEmp = updated;
          return updated;
        });
        return { ...s, employees: updatedEmployees };
      });
      if (updatedEmp) {
        upsertEmployeeDB(updatedEmp).catch((err) =>
          console.error("Cloud save proof failed:", err)
        );
      }
    },
    []
  );

  const saveKPIComment = useCallback(
    (employeeId: string, kpiId: string, comment: string) => {
      let updatedEmp: Employee | null = null;
      setState((s) => {
        const updatedEmployees = s.employees.map((emp) => {
          if (emp.id !== employeeId) return emp;
          const updatedCategories = (emp.categories || []).map((cat) => ({
            ...cat,
            kpis: cat.kpis.map((k) => {
              if (k.id !== kpiId) return k;
              return { ...k, comment, updatedAt: new Date().toISOString() };
            }),
          }));
          const updated = { ...emp, categories: updatedCategories };
          updatedEmp = updated;
          return updated;
        });
        return { ...s, employees: updatedEmployees };
      });
      if (updatedEmp) {
        upsertEmployeeDB(updatedEmp).catch((err) =>
          console.error("Cloud save comment failed:", err)
        );
      }
    },
    []
  );

  const triggerAfterApproval = useCallback(
    (employeeId: string) => {
      const allTriggers = detectTriggers();
      const employeeTriggers = [
        ...allTriggers.pip,
        ...allTriggers.probation,
        ...allTriggers.managementAction,
      ].filter((t) => t.employeeId === employeeId);

      if (employeeTriggers.length === 0) return;

      const newNotifications: Notification[] = employeeTriggers.map((t) => ({
        id: newId(),
        userId: employeeId,
        type:
          t.type === "pip"
            ? "trigger_pip"
            : t.type === "probation"
            ? "trigger_probation"
            : "trigger_management_action",
        message: t.message,
        link: "/employee",
        read: false,
        createdAt: new Date().toISOString(),
      }));

      setState((s) => ({
        ...s,
        notifications: [...s.notifications, ...newNotifications],
      }));

      for (const n of newNotifications) {
        insertNotification(n).catch((err) =>
          console.error("Cloud notification failed:", err)
        );
      }

      const employee = state.employees.find((e) => e.id === employeeId);
      if (employee) {
        const hrAdmins = state.employees
          .filter((e) => e.roleType === "admin" || e.roleType === "hr")
          .map((e) => e.email)
          .filter(Boolean);

        if (hrAdmins.length > 0) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          sendEmail({
            to: hrAdmins,
            subject: `Performance alert: ${employee.name}`,
            html: performanceTriggerEmail(
              employee.name,
              employee.department,
              employee.role,
              employeeTriggers.map((t) => ({ message: t.message })),
              baseUrl
            ),
          }).catch((err) => console.error("Trigger email failed:", err));
        }
      }
    },
    [detectTriggers, state.employees]
  );

  const approveAppraisal = useCallback(
    (id: string, reviewerId: string, reviewerName: string) => {
      let employeeId = "";
      let year = 0;
      let month = 0;
      let categories: Category[] = [];
      let appraisalToApprove: AppraisalRequest | null = null;

      setState((s) => {
        const updated = s.appraisals.map((a) => {
          if (a.id === id) {
            employeeId = a.employeeId;
            year = a.year ?? 0;
            month = a.month ?? 0;
            categories = a.categories;
            const approved: AppraisalRequest = {
              ...a,
              status: "approved" as const,
              reviewedAt: new Date().toISOString(),
              reviewerId,
              reviewerName,
            };
            appraisalToApprove = approved;
            return approved;
          }
          return a;
        });
        return { ...s, appraisals: updated };
      });

      if (!employeeId || !year || !month || !categories?.length) return;

      let totalWeightedScore = 0;
      let totalWeight = 0;
      for (const cat of categories) {
        let catSum = 0;
        let kpiWeightTotal = 0;
        for (const kpi of cat.kpis) {
          const target = kpi.target || 1;
          const actual = kpi.actual || 0;
          const ratio = target > 0 ? actual / target : 0;
          const w = kpi.weight || 1;
          catSum += ratio * w;
          kpiWeightTotal += w;
        }
        const catScore = kpiWeightTotal > 0 ? catSum / kpiWeightTotal : 0;
        const w = cat.weight / 100;
        totalWeightedScore += catScore * w;
        totalWeight += w;
      }
      const performanceMultiplier = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      const snapshot: MonthlyPerformance = {
        year,
        month,
        employeeId,
        kpis: [],
        categories: categories.map((cat) => ({
          ...cat,
          kpis: cat.kpis.map((k) => ({ ...k })),
        })),
        performanceMultiplier,
        bonusEligible: 0,
        createdAt: new Date().toISOString(),
      };

      setState((s) => {
        const filtered = s.monthlyData.filter(
          (d) => !(d.employeeId === employeeId && d.year === year && d.month === month)
        );
        const updatedEmployees = s.employees.map((emp) =>
          emp.id === employeeId
            ? {
                ...emp,
                categories: categories.map((cat) => ({
                  ...cat,
                  kpis: cat.kpis.map((k) => ({ ...k })),
                })),
              }
            : emp
        );
        return {
          ...s,
          monthlyData: [...filtered, snapshot],
          employees: updatedEmployees,
        };
      });

      upsertMonthlyPerformance(snapshot).catch((err) =>
        console.error("Cloud snapshot failed:", err)
      );
      if (appraisalToApprove) {
        upsertAppraisal(appraisalToApprove).catch((err) =>
          console.error("Cloud approve failed:", err)
        );
        sendAppraisalNotification("approved", appraisalToApprove);
      }

      setTimeout(() => triggerAfterApproval(employeeId), 100);
    },
    [triggerAfterApproval, sendAppraisalNotification]
  );

  const rejectAppraisal = useCallback(
    (id: string, reviewerId: string, reviewerName: string, reason: string) => {
      let appraisalToReject: AppraisalRequest | null = null;
      setState((s) => {
        const updated = s.appraisals.map((a) => {
          if (a.id === id) {
            const rejected: AppraisalRequest = {
              ...a,
              status: "rejected",
              reviewedAt: new Date().toISOString(),
              reviewerId,
              reviewerName,
              revisionReason: reason,
            };
            appraisalToReject = rejected;
            return rejected;
          }
          return a;
        });
        return { ...s, appraisals: updated };
      });
      if (appraisalToReject) {
        upsertAppraisal(appraisalToReject).catch((err) =>
          console.error("Cloud reject failed:", err)
        );
        sendAppraisalNotification("rejected", appraisalToReject, reason);
      }
    },
    [sendAppraisalNotification]
  );

  const requestChanges = useCallback(
    (id: string, reviewerId: string, reviewerName: string, reason: string) => {
      let appraisalToChange: AppraisalRequest | null = null;
      setState((s) => {
        const updated = s.appraisals.map((a) => {
          if (a.id === id) {
            const changed: AppraisalRequest = {
              ...a,
              status: "needs_revision",
              reviewedAt: new Date().toISOString(),
              reviewerId,
              reviewerName,
              revisionReason: reason,
            };
            appraisalToChange = changed;
            return changed;
          }
          return a;
        });
        return { ...s, appraisals: updated };
      });
      if (appraisalToChange) {
        upsertAppraisal(appraisalToChange).catch((err) =>
          console.error("Cloud request changes failed:", err)
        );
        sendAppraisalNotification("requested_changes", appraisalToChange, reason);
      }
    },
    [sendAppraisalNotification]
  );

  const getEmployeeAppraisals = useCallback(
    (employeeId: string): AppraisalRequest[] =>
      state.appraisals
        .filter((a) => a.employeeId === employeeId)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ),
    [state.appraisals]
  );

  const getPendingAppraisals = useCallback(
    (): AppraisalRequest[] =>
      state.appraisals
        .filter((a) => a.status === "pending")
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ),
    [state.appraisals]
  );

  const addAppraisalComment = useCallback(
    (appraisalId: string, authorId: string, authorName: string, text: string) => {
      const comment: AppraisalComment = {
        id: newId(),
        authorId,
        authorName,
        text,
        timestamp: new Date().toISOString(),
      };
      setState((s) => {
        const updated = s.appraisals.map((a) =>
          a.id === appraisalId ? { ...a, comments: [...a.comments, comment] } : a
        );
        return { ...s, appraisals: updated };
      });
      insertAppraisalComment(appraisalId, comment).catch((err) =>
        console.error("Cloud comment failed:", err)
      );
    },
    []
  );

  const getNotifications = useCallback(
    (userId: string): Notification[] =>
      state.notifications
        .filter((n) => n.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [state.notifications]
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    markNotificationReadDB(id).catch((err) =>
      console.error("Cloud mark read failed:", err)
    );
  }, []);

  // ============================================
  // KPI UPDATE REQUESTS
  // ============================================

  const computeScore = (categories: Category[]): number => {
    let totalWeighted = 0;
    let totalWeight = 0;
    for (const cat of categories) {
      let catSum = 0;
      let kpiWeightTotal = 0;
      for (const kpi of cat.kpis) {
        const target = kpi.target || 1;
        const actual = kpi.actual || 0;
        const ratio = target > 0 ? actual / target : 0;
        const w = kpi.weight || 1;
        catSum += ratio * w;
        kpiWeightTotal += w;
      }
      const catScore = kpiWeightTotal > 0 ? catSum / kpiWeightTotal : 0;
      const w = (cat.weight || 0) / 100;
      totalWeighted += catScore * w;
      totalWeight += w;
    }
    return totalWeight > 0 ? totalWeighted / totalWeight : 0;
  };

  const computeDiff = (
    existing: Category[],
    template: KPITemplate
  ): { diffs: KpiDiffItem[]; merged: Category[] } => {
    const diffs: KpiDiffItem[] = [];

    const existingByCatId = new Map(existing.map((c) => [c.id, c]));
    const existingByCatName = new Map(existing.map((c) => [c.name, c]));

    const mergedCategories: Category[] = [];
    const templateCatNames = new Set(template.categories.map((c) => c.name));

    for (const tCat of template.categories) {
      const existingCat =
        existingByCatId.get(tCat.id) || existingByCatName.get(tCat.name);

      if (!existingCat) {
        diffs.push({
          kind: "category_added",
          categoryName: tCat.name,
          after: tCat.weight,
        });
      } else if (existingCat.weight !== tCat.weight) {
        diffs.push({
          kind: "category_weight_changed",
          categoryName: tCat.name,
          before: existingCat.weight,
          after: tCat.weight,
        });
      }

      const existingKpisById = new Map(
        (existingCat?.kpis || []).map((k) => [k.id, k])
      );
      const existingKpisByDesc = new Map(
        (existingCat?.kpis || []).map((k) => [k.description, k])
      );

      const mergedKpis: KPI[] = [];
      const templateKpiDescs = new Set(tCat.kpis.map((k) => k.description));

      for (const tKpi of tCat.kpis) {
        const existingKpi =
          existingKpisById.get(tKpi.id) || existingKpisByDesc.get(tKpi.description);

        if (!existingKpi) {
          diffs.push({
            kind: "kpi_added",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            after: tKpi.target,
          });
          mergedKpis.push({
            id: tKpi.id,
            description: tKpi.description,
            metric: tKpi.metric,
            target: tKpi.target,
            actual: 0,
            weight: tKpi.weight ?? 0,
            measurementSource: tKpi.measurementSource || "",
          });
          continue;
        }

        if (existingKpi.target !== tKpi.target) {
          diffs.push({
            kind: "kpi_target_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.target,
            after: tKpi.target,
          });
        }
        if (existingKpi.metric !== tKpi.metric) {
          diffs.push({
            kind: "kpi_metric_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.metric,
            after: tKpi.metric,
          });
        }
        if ((existingKpi.weight ?? 0) !== (tKpi.weight ?? 0)) {
          diffs.push({
            kind: "kpi_weight_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.weight ?? 0,
            after: tKpi.weight ?? 0,
          });
        }

        mergedKpis.push({
          ...existingKpi,
          id: tKpi.id,
          description: tKpi.description,
          metric: tKpi.metric,
          target: tKpi.target,
          weight: tKpi.weight ?? existingKpi.weight ?? 0,
          measurementSource: tKpi.measurementSource || existingKpi.measurementSource,
          updatedAt: new Date().toISOString(),
        });
      }

      for (const oldKpi of existingCat?.kpis || []) {
        if (!templateKpiDescs.has(oldKpi.description)) {
          diffs.push({
            kind: "kpi_removed",
            categoryName: tCat.name,
            kpiDescription: oldKpi.description,
            before: oldKpi.target,
          });
        }
      }

      mergedCategories.push({
        id: tCat.id,
        name: tCat.name,
        weight: tCat.weight,
        kpis: mergedKpis,
      });
    }

    for (const oldCat of existing) {
      if (!templateCatNames.has(oldCat.name)) {
        diffs.push({
          kind: "category_removed",
          categoryName: oldCat.name,
          before: oldCat.weight,
        });
      }
    }

    return { diffs, merged: mergedCategories };
  };

  const previewTemplateDiff = useCallback(
    (department: string, role: string, template: KPITemplate) => {
      const affected = state.employees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );
      const result: Record<string, KpiDiffItem[]> = {};
      for (const emp of affected) {
        const { diffs } = computeDiff(emp.categories || [], template);
        if (diffs.length > 0) result[emp.id] = diffs;
      }
      return result;
    },
    [state.employees]
  );

  const pushTemplateToEmployees = useCallback(
    async (department: string, role: string, template: KPITemplate) => {
      const affected = state.employees.filter(
        (e) => e.department === department && e.role === role && !e.isAdjunct
      );

      const now = new Date().toISOString();
      const newRequests: KpiUpdateRequest[] = [];
      const newNotifications: Notification[] = [];
      const updatedEmployees: Employee[] = [];

      for (const emp of affected) {
        const existing = emp.categories || [];
        const { diffs, merged } = computeDiff(existing, template);
        if (diffs.length === 0) continue;

        const beforeScore = computeScore(existing);
        const afterScore = computeScore(merged);

        updatedEmployees.push({
          ...emp,
          categories: merged,
          needsKpiSetup: false,
        });

        const req: KpiUpdateRequest = {
          id: newId(),
          employeeId: emp.id,
          department,
          role,
          templateVersion: 1,
          diffs,
          proposedCategories: merged,
          beforeScore,
          afterScore,
          status: "unacknowledged",
          createdAt: now,
        };

        newRequests.push(req);

        newNotifications.push({
          id: newId(),
          userId: emp.id,
          type: "appraisal_needs_revision" as any,
          message: `Your KPIs were updated — ${diffs.length} change${diffs.length > 1 ? "s" : ""} to review`,
          link: "/kpi-updates",
          read: false,
          createdAt: now,
        });
      }

      setState((s) => ({
        ...s,
        employees: s.employees.map((emp) => {
          const found = updatedEmployees.find((u) => u.id === emp.id);
          return found || emp;
        }),
        kpiUpdateRequests: [...s.kpiUpdateRequests, ...newRequests],
        notifications: [...s.notifications, ...newNotifications],
      }));

      try {
        if (updatedEmployees.length > 0) {
          await bulkUpsertEmployees(updatedEmployees);
        }
        for (const req of newRequests) {
          await upsertKpiUpdateRequest(req);
        }
        for (const n of newNotifications) {
          await insertNotification(n);
        }
      } catch (err) {
        console.error("pushTemplateToEmployees persist error:", err);
      }

      return { affected: affected.length, created: newRequests.length };
    },
    [state.employees]
  );

  const getKpiUpdateRequests = useCallback(
    (employeeId: string): KpiUpdateRequest[] =>
      state.kpiUpdateRequests
        .filter((r) => r.employeeId === employeeId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [state.kpiUpdateRequests]
  );

  const getUnacknowledgedKpiUpdates = useCallback(
    (): KpiUpdateRequest[] =>
      state.kpiUpdateRequests.filter((r) => r.status === "unacknowledged"),
    [state.kpiUpdateRequests]
  );

  const acknowledgeKpiUpdate = useCallback(
    async (id: string) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === id);
      if (!req) return;

      const acknowledgedAt = new Date().toISOString();

      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
          r.id === id
            ? { ...r, status: "acknowledged" as const, acknowledgedAt }
            : r
        ),
      }));

      upsertKpiUpdateRequest({
        ...req,
        status: "acknowledged",
        acknowledgedAt,
      }).catch((err) =>
        console.error("acknowledgeKpiUpdate save failed:", err)
      );
    },
    [state.kpiUpdateRequests, state.employees]
  );

  const commentKpiUpdate = useCallback(
    async (id: string, comment: string) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === id);
      if (!req) return;

      const commentedAt = new Date().toISOString();

      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
          r.id === id
            ? { ...r, employeeComment: comment, commentedAt }
            : r
        ),
      }));

      upsertKpiUpdateRequest({
        ...req,
        employeeComment: comment,
        commentedAt,
      }).catch((err) => console.error("commentKpiUpdate save failed:", err));
    },
    [state.kpiUpdateRequests]
  );

  // ============================================
  // SYNC
  // ============================================
  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      await bulkUpsertEmployees(state.employees);
      for (const key in state.kpiTemplates) {
        await upsertTemplate(state.kpiTemplates[key]);
      }
      for (const m of state.monthlyData) {
        await upsertMonthlyPerformance(m);
      }
      for (const a of state.appraisals) {
        await upsertAppraisal(a);
      }
      for (const r of state.kpiUpdateRequests) {
        await upsertKpiUpdateRequest(r);
      }
      localStorage.setItem(SYNC_FLAG_KEY, "true");
      console.log("✅ Manual sync complete");
    } catch (err) {
      console.error("Manual sync failed:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [state]);

  // ============================================
  // VALUE
  // ============================================
  const value: Ctx = {
    ...state,
    isCloudSynced,
    isSyncing,
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
    triggerAfterApproval,
    previewTemplateDiff,
    pushTemplateToEmployees,
    getKpiUpdateRequests,
    getUnacknowledgedKpiUpdates,
    acknowledgeKpiUpdate,
    commentKpiUpdate,
    syncToCloud,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}