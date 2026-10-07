import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_GLOBALS, DEFAULT_GRADES, DEFAULT_BONUS_CONFIG, DEMO_EMPLOYEES } from "./defaults";
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
  KpiUpdateComment,
  KpiRequest,
  BonusConfig,
} from "./types";
import { newId } from "./defaults";
import { sendEmail } from "@/lib/email";
import { supabase } from "@/lib/supabase";
import {
  newAppraisalEmail,
  appraisalApprovedEmail,
  appraisalRejectedEmail,
  changesRequestedEmail,
  performanceTriggerEmail,
  kpiUpdateEmail,
} from "@/lib/email-templates";
import {
  getCurrentOrgId,
  fetchAllEmployees,
  fetchAllTemplates,
  fetchAllMonthly,
  fetchAllAppraisals,
  fetchNotifications,
  fetchAllKpiRequests,
  upsertEmployeeDB,
  deleteEmployeeDB,
  bulkUpsertEmployees,
  upsertTemplate,
  upsertMonthlyPerformance,
  deleteMonthlyPerformance,
  upsertAppraisal,
  insertAppraisalComment,
  insertNotification,
  insertNotifications,
  markNotificationReadDB,
  fetchAllKpiUpdateRequests,
  upsertKpiUpdateRequest,
  upsertKpiRequest,
  fetchAppSettings,
  upsertAppSetting,
} from "./supabase-data";

// ============================================
// STATE TYPES
// ============================================

interface State {
  globals: Globals;
  bonusConfig: BonusConfig;
  grades: GradePoint[];
  employees: Employee[];
  monthlyData: MonthlyPerformance[];
  kpiTemplates: Record<string, KPITemplate>;
  appraisals: AppraisalRequest[];
  notifications: Notification[];
  kpiUpdateRequests: KpiUpdateRequest[];
  kpiRequests: KpiRequest[];
  bonusRevealed: boolean;
}

interface Ctx extends State {
  isCloudSynced: boolean;
  isSyncing: boolean;

  setGlobals: (g: Partial<Globals>) => void;
  saveBonusConfig: (config: BonusConfig) => Promise<void>;
  setGrades: (g: GradePoint[]) => void;
  resetGrades: () => void;
  upsertEmployee: (e: Employee) => void;
  clearEmployees: () => void;
  loadDemo: () => void;
  setEmployees: (list: Employee[]) => void;

  calc: CalcResult;

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

  hardDeleteEmployee: (id: string) => void;
  validateEmployeeRole: (employeeId: string, validatorName: string) => Promise<void>;
  rejectEmployeeRole: (employeeId: string, validatorName: string) => Promise<void>;

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
  setBonusRevealed: (value: boolean) => Promise<void>;
  refreshFromCloud: () => Promise<void>;

  submitKpiRequest: (employeeId: string, comment?: string) => Promise<{ id: string }>;
  getKpiRequests: () => KpiRequest[];
  getEmployeeKpiRequest: (employeeId: string) => KpiRequest | null;
  cancelKpiRequest: (id: string) => Promise<void>;

  getSupervisorPendingKpiUpdates: (supervisorId: string) => KpiUpdateRequest[];
  commentOnKpiUpdateRequest: (requestId: string, authorId: string, authorName: string, authorRole: "hr" | "supervisor", text: string) => Promise<void>;
  approveKpiUpdateAsSupervisor: (
    requestId: string,
    supervisorId: string,
    supervisorName: string,
    comment?: string,
    updateTemplate?: boolean
  ) => Promise<void>;
  revertTemplateUpdate: (requestId: string) => Promise<void>;
  rejectKpiUpdateAsSupervisor: (requestId: string, supervisorId: string, supervisorName: string, reason: string) => Promise<void>;
  getKpiUpdateComments: (requestId: string) => KpiUpdateComment[];

  supervisorUpdateEmployeeKpis: (
    employeeId: string,
    categories: Category[],
    justification: string
  ) => Promise<void>;
}

const C = createContext<Ctx | null>(null);

// ============================================
// NOTIFICATION DEDUPE
// ============================================
// Prevents the same notification (same user, type, message) from being
// inserted more than once within a short window. Protects against
// double-click, race conditions, and fast re-triggers.
function dedupeNotifications(
  existing: Notification[],
  incoming: Notification[],
  windowMs: number = 5 * 60 * 1000
): Notification[] {
  const now = Date.now();

  // Build a set of "recent" keys already in state
  const recentKeys = new Set<string>();
  for (const n of existing) {
    const age = now - new Date(n.createdAt).getTime();
    if (age < windowMs) {
      recentKeys.add(`${n.userId}|${n.type}|${n.message}`);
    }
  }

  // Filter incoming, also removing duplicates within the incoming batch itself
  const result: Notification[] = [];
  const seen = new Set<string>();
  for (const n of incoming) {
    const key = `${n.userId}|${n.type}|${n.message}`;
    if (recentKeys.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(n);
  }

  return result;
}

// ============================================
// LOAD INITIAL STATE
// ============================================

function loadInitial(): State {
  return {
    globals: DEFAULT_GLOBALS,
    bonusConfig: DEFAULT_BONUS_CONFIG,
    grades: DEFAULT_GRADES,
    employees: [],
    monthlyData: [],
    kpiTemplates: {},
    appraisals: [],
    notifications: [],
    kpiUpdateRequests: [],
    kpiRequests: [],
    bonusRevealed: false,
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
        const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates, cloudKpiRequests, cloudSettings] =
          await Promise.all([
            fetchAllEmployees(),
            fetchAllTemplates(),
            fetchAllMonthly(),
            fetchAllAppraisals(),
            fetchAllKpiUpdateRequests(),
            fetchAllKpiRequests(),
            fetchAppSettings(),
          ]);

        if (cancelled) return;

        let cloudNotifications: Notification[] = [];
        try {
          const { getCurrentUser } = await import("@/lib/supabase");
          const user = await getCurrentUser();
          if (user) {
            const me = cloudEmployees.find((e) => e.authUserId === user.id);
            if (me) {
              cloudNotifications = await fetchNotifications(me.id);
            }
          }
        } catch {
          // Best-effort
        }

        if (cancelled) return;

        setState((s) => ({
          ...s,
          employees: cloudEmployees,
          kpiTemplates: cloudTemplates,
          monthlyData: cloudMonthly,
          appraisals: cloudAppraisals,
          notifications: cloudNotifications,
          kpiUpdateRequests: cloudKpiUpdates,
          kpiRequests: cloudKpiRequests,
          bonusRevealed: cloudSettings.bonus_revealed === true,
          bonusConfig: (cloudSettings.bonus_config as BonusConfig) ?? s.bonusConfig,
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
          setIsCloudSynced(false);
          return;
        }
      } catch {
        return;
      }

      setIsSyncing(true);
      try {
        const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates, cloudKpiRequests, cloudSettings] =
          await Promise.all([
            fetchAllEmployees(),
            fetchAllTemplates(),
            fetchAllMonthly(),
            fetchAllAppraisals(),
            fetchAllKpiUpdateRequests(),
            fetchAllKpiRequests(),
            fetchAppSettings(),
          ]);

        if (cancelled) return;

        let cloudNotifications: Notification[] = [];
        try {
          const { getCurrentUser } = await import("@/lib/supabase");
          const user = await getCurrentUser();
          if (user) {
            const me = cloudEmployees.find((e) => e.authUserId === user.id);
            if (me) {
              cloudNotifications = await fetchNotifications(me.id);
            }
          }
        } catch {
          // Best-effort
        }

        if (cancelled) return;

        setState((s) => ({
          ...s,
          employees: cloudEmployees,
          kpiTemplates: cloudTemplates,
          monthlyData: cloudMonthly,
          appraisals: cloudAppraisals,
          notifications: cloudNotifications,
          kpiUpdateRequests: cloudKpiUpdates,
          kpiRequests: cloudKpiRequests,
          bonusRevealed: cloudSettings.bonus_revealed === true,
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
          console.log("Signed in. Refetching from cloud.");
          refetchFromCloud();
        } else if (event === "SIGNED_OUT") {
          setIsCloudSynced(false);
          setIsSyncing(false);
          setState({
            globals: DEFAULT_GLOBALS,
            bonusConfig: DEFAULT_BONUS_CONFIG,
            grades: DEFAULT_GRADES,
            employees: [],
            monthlyData: [],
            kpiTemplates: {},
            appraisals: [],
            notifications: [],
            kpiUpdateRequests: [],
            kpiRequests: [],
            bonusRevealed: false,
          });
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


  const clearEmployees = useCallback(() => {
    setState((s) => ({ ...s, employees: [] }));
  }, []);

  const loadDemo = useCallback(() => {
    setState({
      globals: DEFAULT_GLOBALS,
      bonusConfig: DEFAULT_BONUS_CONFIG,
      grades: DEFAULT_GRADES,
      employees: DEMO_EMPLOYEES,
      monthlyData: [],
      kpiTemplates: {},
      appraisals: [],
      notifications: [],
      kpiUpdateRequests: [],
      kpiRequests: [],
      bonusRevealed: false,
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
      kpiRequests: s.kpiRequests.filter((r) => r.employeeId !== id),
    }));
    deleteEmployeeDB(id).catch((err) => console.error("Cloud hard delete failed:", err));
  }, []);

    const validateEmployeeRole = useCallback(
    async (employeeId: string, validatorName: string) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) throw new Error("Employee not found");
      if (employee.roleStatus !== "pending") {
        throw new Error("Employee is not awaiting validation");
      }

      const now = new Date().toISOString();
      const updatedEmployee: Employee = {
        ...employee,
        roleStatus: "active",
      };

      const notif: Notification = {
        id: newId(),
        userId: employee.id,
        type: "role_validated" as any,
        message: `${validatorName} confirmed your role. Welcome to P4P!`,
        link: "/dashboard",
        read: false,
        createdAt: now,
      };

      setState((s) => ({
        ...s,
        employees: s.employees.map((e) =>
          e.id === employeeId ? updatedEmployee : e
        ),
        notifications: [...s.notifications, notif],
      }));

      try {
        await upsertEmployeeDB(updatedEmployee);
        await insertNotification(notif);
      } catch (err) {
        console.error("validateEmployeeRole persist error:", err);
        throw err;
      }
    },
    [state.employees]
  );

  const rejectEmployeeRole = useCallback(
    async (employeeId: string, validatorName: string) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) throw new Error("Employee not found");
      if (employee.roleStatus !== "pending") {
        throw new Error("Employee is not awaiting validation");
      }

      const now = new Date().toISOString();
      const updatedEmployee: Employee = {
        ...employee,
        roleStatus: "rejected",
        isManager: false,
      };

      const notif: Notification = {
        id: newId(),
        userId: employee.id,
        type: "role_rejected" as any,
        message: `${validatorName} reviewed your role request. You've been set as an Employee. Contact HR if this is a mistake.`,
        link: "/profile",
        read: false,
        createdAt: now,
      };

      setState((s) => ({
        ...s,
        employees: s.employees.map((e) =>
          e.id === employeeId ? updatedEmployee : e
        ),
        notifications: [...s.notifications, notif],
      }));

      try {
        await upsertEmployeeDB(updatedEmployee);
        await insertNotification(notif);
      } catch (err) {
        console.error("rejectEmployeeRole persist error:", err);
        throw err;
      }
    },
    [state.employees]
  );

  // ============================================
  // CALC
  // ============================================
  const calc = useMemo(
    () => calculate(state.employees, state.grades, state.globals, state.bonusConfig),
    [state]
  );

  // ============================================
  // MONTHLY
  // ============================================

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
          message: `PIP Required: 3 consecutive months of declining performance (${lastThree.map((m) => fmtNum(m.score, 2)).join(" → ")})`,
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
          message: `Probation Period: 6 consecutive months below 0.7 (avg: ${fmtNum(lastSix.reduce((s, m) => s + m.score, 0) / 6, 2)})`,
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
          message: `Management Action Required: 9 consecutive months below 0.7 (avg: ${fmtNum(lastNine.reduce((s, m) => s + m.score, 0) / 9, 2)})`,
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
          const supervisor = employee.supervisorId
            ? state.employees.find((e) => e.id === employee.supervisorId)
            : null;
          if (supervisor?.email) recipients.push(supervisor.email);
          state.employees
            .filter((e) => e.roleType === "hr")
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

      // Block duplicate submissions for the same period (only if pending or approved)
      const existingActive = state.appraisals.find(
        (a) =>
          a.employeeId === employeeId &&
          a.year === year &&
          a.month === month &&
          (a.status === "pending" || a.status === "approved")
      );
      if (existingActive) {
        console.warn(
          `Active appraisal already exists for ${employeeId} ${year}-${month}`
        );
        return;
      }

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

      const recipients = new Map<string, Notification>();
      const now = new Date().toISOString();

      const supervisor = employee.supervisorId
        ? state.employees.find((e) => e.id === employee.supervisorId)
        : null;
      if (supervisor) {
        recipients.set(supervisor.id, {
          id: newId(),
          userId: supervisor.id,
          type: "appraisal_submitted",
          message: `${employee.name} submitted an appraisal for ${period}`,
          link: `/appraisals-review`,
          read: false,
          createdAt: now,
        });
      }

      state.employees
        .filter((e) => e.roleType === "hr")
        .forEach((hr) => {
          if (recipients.has(hr.id)) return;
          recipients.set(hr.id, {
            id: newId(),
            userId: hr.id,
            type: "appraisal_submitted",
            message: `${employee.name} submitted an appraisal for ${period}`,
            link: `/appraisals-review`,
            read: false,
            createdAt: now,
          });
        });

      const rawNotifs = Array.from(recipients.values());
      const newNotifs = dedupeNotifications(state.notifications, rawNotifs);

      setState((s) => ({
        ...s,
        appraisals: [...s.appraisals, appraisal],
        notifications: [...s.notifications, ...newNotifs],
      }));

      upsertAppraisal(appraisal).catch((err) =>
        console.error("Cloud submit appraisal failed:", err)
      );
      if (newNotifs.length > 0) {
        insertNotifications(newNotifs).catch((err) =>
          console.error("Cloud insert notifications failed:", err)
        );
      }

      sendAppraisalNotification("submitted", appraisal);
    },
    [state.employees, state.appraisals, state.notifications, sendAppraisalNotification]
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
          .filter((e) => e.roleType === "hr")
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
      } else {
        if (existingCat.weight !== tCat.weight) {
          diffs.push({
            kind: "category_weight_changed",
            categoryName: tCat.name,
            before: existingCat.weight,
            after: tCat.weight,
          });
        }
        if (
          existingByCatId.has(tCat.id) &&
          existingCat.name !== tCat.name
        ) {
          diffs.push({
            kind: "category_name_changed",
            categoryName: tCat.name,
            before: existingCat.name,
            after: tCat.name,
          });
        }
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

        if (
          existingKpisById.has(tKpi.id) &&
          existingKpi.description !== tKpi.description
        ) {
          diffs.push({
            kind: "kpi_description_changed",
            categoryName: tCat.name,
            kpiDescription: tKpi.description,
            before: existingKpi.description,
            after: tKpi.description,
          });
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
      let pushedBy: string | undefined;
      let pushedByName: string | undefined;
      let pusherEmployeeId: string | undefined;
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
          pushedBy = user.id;
          const me = state.employees.find(
            (e) => e.authUserId === user.id || e.email === user.email
          );
          pushedByName = me?.name || user.email || "HR";
          pusherEmployeeId = me?.id;
        }
      } catch {
        // Best-effort during push
      }

      // Exclude the pusher themselves from the affected list.
      // Anyone else — HR or not — is a legitimate target.
      const affected = state.employees.filter(
        (e) =>
          e.department === department &&
          e.role === role &&
          !e.isAdjunct &&
          e.id !== pusherEmployeeId
      );

      const now = new Date().toISOString();
      const newRequests: KpiUpdateRequest[] = [];
      const newNotifications: Notification[] = [];
      const updatedEmployees: Employee[] = [];
      const fulfilledKpiRequestIds: string[] = [];

      for (const emp of affected) {
        const existing = emp.categories || [];
        const { diffs, merged } = computeDiff(existing, template);
        if (diffs.length === 0) continue;

        const beforeScore = computeScore(existing);
        const afterScore = computeScore(merged);

        const supervisor = emp.supervisorId
          ? state.employees.find((e) => e.id === emp.supervisorId)
          : null;
        const needsSupervisorApproval = !!supervisor;

        const existingPending = needsSupervisorApproval
          ? state.kpiUpdateRequests.find(
              (r) =>
                r.employeeId === emp.id &&
                (r.status === "pending_supervisor_review" ||
                  r.status === "back_to_hr")
            )
          : null;

        if (!needsSupervisorApproval) {
          updatedEmployees.push({
            ...emp,
            categories: merged,
            needsKpiSetup: false,
          });
        }

        const pendingKpiReq = state.kpiRequests.find(
          (r) => r.employeeId === emp.id && r.status === "pending"
        );
        if (pendingKpiReq) {
          fulfilledKpiRequestIds.push(pendingKpiReq.id);
        }

        const req: KpiUpdateRequest = existingPending
          ? {
              ...existingPending,
              department,
              role,
              templateVersion: existingPending.templateVersion + 1,
              diffs,
              proposedCategories: merged,
              beforeScore,
              afterScore,
              status: "pending_supervisor_review",
              pushedBy,
              pushedByName,
            }
          : {
              id: newId(),
              employeeId: emp.id,
              department,
              role,
              templateVersion: 1,
              diffs,
              proposedCategories: merged,
              beforeScore,
              afterScore,
              status: needsSupervisorApproval
                ? "pending_supervisor_review"
                : "unacknowledged",
              createdAt: now,
              pushedBy,
              pushedByName,
              assignedSupervisorId: supervisor?.id,
              assignedSupervisorName: supervisor?.name,
              comments: [],
              templateUpdateRequested: false,
              templateUpdateApplied: false,
            };

        newRequests.push(req);

        if (needsSupervisorApproval && supervisor) {
          newNotifications.push({
            id: newId(),
            userId: supervisor.id,
            type: "kpi_update_pushed_supervisor" as any,
            message: `HR pushed KPI changes for ${emp.name}, review before it reaches them`,
            link: "/my-team",
            read: false,
            createdAt: now,
          });
          newNotifications.push({
            id: newId(),
            userId: emp.id,
            type: "kpi_update_pushed_fyi" as any,
            message: `HR proposed KPI updates, awaiting your supervisor's review`,
            link: "/employee",
            read: false,
            createdAt: now,
          });
        } else {
          newNotifications.push({
            id: newId(),
            userId: emp.id,
            type: "kpi_update_pushed_direct" as any,
            message: `Your KPIs were updated, ${diffs.length} change${diffs.length > 1 ? "s" : ""} to review`,
            link: "/kpi-updates",
            read: false,
            createdAt: now,
          });

          if (emp.email) {
            const baseUrl =
              typeof window !== "undefined" ? window.location.origin : "";
            sendEmail({
              to: [emp.email],
              subject: `Your KPIs were updated (${diffs.length} change${diffs.length > 1 ? "s" : ""})`,
              html: kpiUpdateEmail({
                employeeName: emp.name,
                department,
                role,
                changeCount: diffs.length,
                diffs,
                beforeScore,
                afterScore,
                baseUrl,
              }),
            }).catch((err) =>
              console.error("KPI update email failed for", emp.email, err)
            );
          }
        }
      }

      const fulfilledAt = new Date().toISOString();
      const dedupedNotifications = dedupeNotifications(
        state.notifications,
        newNotifications
      );

      setState((s) => {
        const existingIds = new Set(newRequests.map((r) => r.id));
        const otherRequests = s.kpiUpdateRequests.filter(
          (r) => !existingIds.has(r.id)
        );

        return {
          ...s,
          employees: s.employees.map((emp) => {
            const found = updatedEmployees.find((u) => u.id === emp.id);
            return found || emp;
          }),
          kpiUpdateRequests: [...otherRequests, ...newRequests],
          kpiRequests: s.kpiRequests.map((r) =>
            fulfilledKpiRequestIds.includes(r.id)
              ? { ...r, status: "fulfilled" as const, fulfilledAt }
              : r
          ),
          notifications: [...s.notifications, ...dedupedNotifications],
        };
      });

      try {
        if (updatedEmployees.length > 0) {
          await bulkUpsertEmployees(updatedEmployees);
        }
        for (const req of newRequests) {
          await upsertKpiUpdateRequest(req);
        }
        for (const id of fulfilledKpiRequestIds) {
          const req = state.kpiRequests.find((r) => r.id === id);
          if (req) {
            await upsertKpiRequest({
              ...req,
              status: "fulfilled",
              fulfilledAt,
            });
          }
        }
        for (const n of dedupedNotifications) {
          await insertNotification(n);
        }
      } catch (err) {
        console.error("pushTemplateToEmployees persist error:", err);
      }

      return { affected: affected.length, created: newRequests.length };
    },
    [state.employees, state.kpiRequests, state.kpiUpdateRequests]
  );

  const getKpiUpdateRequests = useCallback(
    (employeeId: string): KpiUpdateRequest[] =>
      state.kpiUpdateRequests
        .filter(
          (r) =>
            r.employeeId === employeeId &&
            r.status !== "pending_supervisor_review" &&
            r.status !== "back_to_hr" &&
            r.status !== "cancelled"
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [state.kpiUpdateRequests]
  );

  const getUnacknowledgedKpiUpdates = useCallback(
    (): KpiUpdateRequest[] =>
      state.kpiUpdateRequests.filter(
        (r) => r.status === "unacknowledged" || r.status === "acknowledged"
      ),
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
    [state.kpiUpdateRequests]
  );

  const commentKpiUpdate = useCallback(
    async (id: string, comment: string) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === id);
      if (!req) return;

      const commentedAt = new Date().toISOString();

      const threadComment: KpiUpdateComment = {
        id: newId(),
        authorId: req.employeeId,
        authorName: "Employee",
        authorRole: "employee",
        text: comment,
        timestamp: commentedAt,
      };

      const updatedComments = [...(req.comments || []), threadComment];

      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
          r.id === id
            ? {
                ...r,
                employeeComment: comment,
                commentedAt,
                comments: updatedComments,
              }
            : r
        ),
      }));

      upsertKpiUpdateRequest({
        ...req,
        employeeComment: comment,
        commentedAt,
        comments: updatedComments,
      }).catch((err) => console.error("commentKpiUpdate save failed:", err));
    },
    [state.kpiUpdateRequests]
  );

  // ============================================
  // KPI REQUESTS
  // ============================================

  const submitKpiRequest = useCallback(
    async (employeeId: string, comment?: string) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) throw new Error("Employee not found");

      const existing = state.kpiRequests.find(
        (r) => r.employeeId === employeeId && r.status === "pending"
      );
      if (existing) {
        return { id: existing.id };
      }

      const now = new Date().toISOString();
      const request: KpiRequest = {
        id: newId(),
        employeeId: employee.id,
        employeeName: employee.name,
        employeeEmail: employee.email || "",
        department: employee.department,
        role: employee.role,
        comment,
        status: "pending",
        createdAt: now,
      };

      const notifs: Notification[] = [];

      state.employees
        .filter((e) => e.roleType === "hr")
        .forEach((hr) => {
          notifs.push({
            id: newId(),
            userId: hr.id,
            type: "kpi_request_submitted" as any,
            message: `${employee.name} requested KPIs for ${employee.department} · ${employee.role}`,
            link: "/kpi-framework?view=requests",
            read: false,
            createdAt: now,
          });
        });

      if (employee.supervisorId) {
        notifs.push({
          id: newId(),
          userId: employee.supervisorId,
          type: "kpi_request_submitted" as any,
          message: `${employee.name} requested KPIs from HR (FYI)`,
          link: "/kpi-framework?view=requests",
          read: false,
          createdAt: now,
        });
      }

      const dedupedNotifs = dedupeNotifications(state.notifications, notifs);

      setState((s) => ({
        ...s,
        kpiRequests: [...s.kpiRequests, request],
        notifications: [...s.notifications, ...dedupedNotifs],
      }));

      upsertKpiRequest(request).catch((err) =>
        console.error("Cloud upsert kpi_request failed:", err)
      );

      if (dedupedNotifs.length > 0) {
        insertNotifications(dedupedNotifs).catch((err) =>
          console.error("KPI request notification failed:", err)
        );
      }

      return { id: request.id };
    },
    [state.employees, state.kpiRequests, state.notifications]
  );

  const getKpiRequests = useCallback(
    (): KpiRequest[] =>
      [...state.kpiRequests].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [state.kpiRequests]
  );

  const getEmployeeKpiRequest = useCallback(
    (employeeId: string): KpiRequest | null =>
      state.kpiRequests.find(
        (r) => r.employeeId === employeeId && r.status === "pending"
      ) || null,
    [state.kpiRequests]
  );

  const cancelKpiRequest = useCallback(
    async (id: string) => {
      const req = state.kpiRequests.find((r) => r.id === id);
      if (!req || req.status !== "pending") return;

      const now = new Date().toISOString();
      const updated: KpiRequest = {
        ...req,
        status: "cancelled",
        cancelledAt: now,
      };

      setState((s) => ({
        ...s,
        kpiRequests: s.kpiRequests.map((r) => (r.id === id ? updated : r)),
      }));

      upsertKpiRequest(updated).catch((err) =>
        console.error("Cloud cancel kpi_request failed:", err)
      );
    },
    [state.kpiRequests]
  );


  // ============================================
  // SUPERVISOR GATE
  // ============================================

  const getSupervisorPendingKpiUpdates = useCallback(
    (supervisorId: string): KpiUpdateRequest[] =>
      state.kpiUpdateRequests
        .filter((r) => {
          if (r.status !== "pending_supervisor_review") return false;
          const emp = state.employees.find((e) => e.id === r.employeeId);
          return emp?.supervisorId === supervisorId;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [state.kpiUpdateRequests, state.employees]
  );

  const commentOnKpiUpdateRequest = useCallback(
    async (
      requestId: string,
      authorId: string,
      authorName: string,
      authorRole: "hr" | "supervisor",
      text: string
    ) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === requestId);
      if (!req) return;

      const comment: KpiUpdateComment = {
        id: newId(),
        authorId,
        authorName,
        authorRole,
        text,
        timestamp: new Date().toISOString(),
      };

      const updatedComments = [...(req.comments || []), comment];
      let newStatus = req.status;
      if (authorRole === "supervisor" && req.status === "pending_supervisor_review") {
        newStatus = "back_to_hr";
      } else if (authorRole === "hr" && req.status === "back_to_hr") {
        newStatus = "pending_supervisor_review";
      }

      const updatedReq: KpiUpdateRequest = {
        ...req,
        comments: updatedComments,
        status: newStatus,
      };

      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
          r.id === requestId ? updatedReq : r
        ),
      }));

      upsertKpiUpdateRequest(updatedReq).catch((err) =>
        console.error("commentOnKpiUpdateRequest save failed:", err)
      );

      const notifs: Notification[] = [];
      if (authorRole === "supervisor" && req.pushedBy) {
        notifs.push({
          id: newId(),
          userId: req.pushedBy,
          type: "kpi_update_comment_supervisor" as any,
          message: `${authorName} commented on KPI changes for ${req.department} · ${req.role}`,
          link: "/my-team",
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (authorRole === "hr") {
        if (req.assignedSupervisorId) {
          notifs.push({
            id: newId(),
            userId: req.assignedSupervisorId,
            type: "kpi_update_comment_hr" as any,
            message: `HR replied on KPI changes for ${req.department} · ${req.role}`,
            link: "/my-team",
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (notifs.length > 0) {
        setState((s) => ({
          ...s,
          notifications: [...s.notifications, ...notifs],
        }));
        for (const n of notifs) {
          insertNotification(n).catch((err) =>
            console.error("KPI comment notification failed:", err)
          );
        }
      }
    },
    [state.kpiUpdateRequests]
  );

  const approveKpiUpdateAsSupervisor = useCallback(
    async (
      requestId: string,
      supervisorId: string,
      supervisorName: string,
      comment?: string,
      updateTemplate = false
    ) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === requestId);
      if (!req) throw new Error("Request not found");
      if (req.status !== "pending_supervisor_review" && req.status !== "back_to_hr") {
        throw new Error("Request already resolved or not awaiting supervisor");
      }

      const employee = state.employees.find((e) => e.id === req.employeeId);
      if (!employee) throw new Error("Employee not found");

      // Live authorization: only current supervisor (or HR) can approve
      const isCurrentSupervisor = employee.supervisorId === supervisorId;
      const isHR = state.employees.some(
        (e) => e.id === supervisorId && e.roleType === "hr"
      );
      if (!isCurrentSupervisor && !isHR) {
        throw new Error("You are not authorized to approve this request");
      }

      const now = new Date().toISOString();
      const revertUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      const updatedEmployee: Employee = {
        ...employee,
        categories: req.proposedCategories,
        needsKpiSetup: false,
      };

      const templateKey = `${req.department}-${req.role}`;
      const currentTemplate = updateTemplate ? state.kpiTemplates[templateKey] : undefined;
      const previousCategories = currentTemplate?.categories;

      const updatedReq: KpiUpdateRequest = {
        ...req,
        status: "unacknowledged",
        approvedBySupervisorAt: now,
        supervisorComment: comment,
        templateUpdateRequested: updateTemplate,
        templateUpdateApplied: updateTemplate,
        previousTemplate: updateTemplate ? previousCategories : undefined,
        canRevertUntil: updateTemplate ? revertUntil : undefined,
      };

      const newTemplate: KPITemplate | null = updateTemplate
        ? {
            department: req.department,
            roleName: req.role,
            jobGrade: currentTemplate?.jobGrade || "",
            categories: req.proposedCategories.map((cat) => ({
              id: cat.id,
              name: cat.name,
              weight: cat.weight,
              kpis: cat.kpis.map((k) => ({
                id: k.id,
                description: k.description,
                metric: k.metric,
                target: k.target,
                weight: k.weight ?? 0,
                measurementSource: k.measurementSource,
              })),
            })),
          }
        : null;

      const employeeNotif: Notification = {
        id: newId(),
        userId: employee.id,
        type: "kpi_update_approved" as any,
        message: `Your KPIs were updated, ${req.diffs.length} change${req.diffs.length === 1 ? "" : "s"} to review`,
        link: "/kpi-updates",
        read: false,
        createdAt: now,
      };

      const hrNotifs: Notification[] = state.employees
        .filter((e) => e.roleType === "hr")
        .filter((e) => e.id !== supervisorId)
        .map((hr) => ({
          id: newId(),
          userId: hr.id,
          type: "kpi_update_approved" as any,
          message: updateTemplate
            ? `${supervisorName} approved KPI changes for ${employee.name} AND updated the standard template for ${req.department} · ${req.role}`
            : `${supervisorName} approved KPI changes for ${employee.name}`,
          link: updateTemplate ? "/kpi-framework" : "/appraisals-review",
          read: false,
          createdAt: now,
        }));

      setState((s) => {
        const nextState: any = {
          ...s,
          employees: s.employees.map((e) =>
            e.id === employee.id ? updatedEmployee : e
          ),
          kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
            r.id === requestId ? updatedReq : r
          ),
          notifications: [...s.notifications, employeeNotif, ...hrNotifs],
        };

        if (newTemplate) {
          nextState.kpiTemplates = {
            ...s.kpiTemplates,
            [templateKey]: newTemplate,
          };
        }

        return nextState;
      });

      try {
        await upsertEmployeeDB(updatedEmployee);
        await upsertKpiUpdateRequest(updatedReq);
        await insertNotification(employeeNotif);
        for (const n of hrNotifs) {
          await insertNotification(n);
        }
        if (newTemplate) {
          await upsertTemplate(newTemplate);
        }
      } catch (err) {
        console.error("approveKpiUpdateAsSupervisor persist error:", err);
        throw err;
      }
    },
    [state.kpiUpdateRequests, state.employees, state.kpiTemplates]
  );

  const revertTemplateUpdate = useCallback(
    async (requestId: string) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === requestId);
      if (!req) throw new Error("Request not found");
      if (!req.updateTemplateApplied || !req.previousTemplate) {
        throw new Error("This request didn't update a template");
      }
      if (req.templateRevertedAt) {
        throw new Error("Already reverted");
      }
      if (req.canRevertUntil && new Date(req.canRevertUntil) < new Date()) {
        throw new Error("Revert window has expired");
      }

      const now = new Date().toISOString();
      const templateKey = `${req.department}-${req.role}`;
      const currentTemplate = state.kpiTemplates[templateKey];

      const revertedTemplate: KPITemplate = {
        department: req.department,
        roleName: req.role,
        jobGrade: currentTemplate?.jobGrade || "",
        categories: req.previousTemplate,
      };

      const updatedReq: KpiUpdateRequest = {
        ...req,
        templateRevertedAt: now,
      };

      const supervisorId = req.assignedSupervisorId;
      const notifs: Notification[] = [];
      if (supervisorId) {
        notifs.push({
          id: newId(),
          userId: supervisorId,
          type: "kpi_update_reverted" as any,
          message: `HR reverted the template update for ${req.department} · ${req.role}`,
          link: "/my-team",
          read: false,
          createdAt: now,
        });
      }

      setState((s) => ({
        ...s,
        kpiTemplates: {
          ...s.kpiTemplates,
          [templateKey]: revertedTemplate,
        },
        kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
          r.id === requestId ? updatedReq : r
        ),
        notifications: [...s.notifications, ...notifs],
      }));

      try {
        await upsertTemplate(revertedTemplate);
        await upsertKpiUpdateRequest(updatedReq);
        for (const n of notifs) {
          await insertNotification(n);
        }
      } catch (err) {
        console.error("revertTemplateUpdate persist error:", err);
        throw err;
      }
    },
    [state.kpiUpdateRequests, state.kpiTemplates]
  );

  const rejectKpiUpdateAsSupervisor = useCallback(
    async (
      requestId: string,
      supervisorId: string,
      supervisorName: string,
      reason: string
    ) => {
      const req = state.kpiUpdateRequests.find((r) => r.id === requestId);
      if (!req) throw new Error("Request not found");

      const now = new Date().toISOString();
      const updatedReq: KpiUpdateRequest = {
        ...req,
        status: "cancelled",
        rejectedBySupervisorAt: now,
        supervisorComment: reason,
      };

      const hrNotifs: Notification[] = state.employees
        .filter((e) => e.roleType === "hr")
        .map((hr) => ({
          id: newId(),
          userId: hr.id,
          type: "kpi_update_rejected" as any,
          message: `${supervisorName} rejected KPI changes for ${req.employeeId.slice(0, 8)}…: "${reason.slice(0, 60)}${reason.length > 60 ? "…" : ""}"`,
          link: "/appraisals-review",
          read: false,
          createdAt: now,
        }));

      setState((s) => ({
        ...s,
        kpiUpdateRequests: s.kpiUpdateRequests.map((r) =>
          r.id === requestId ? updatedReq : r
        ),
        notifications: [...s.notifications, ...hrNotifs],
      }));

      try {
        await upsertKpiUpdateRequest(updatedReq);
        for (const n of hrNotifs) {
          await insertNotification(n);
        }
      } catch (err) {
        console.error("rejectKpiUpdateAsSupervisor persist error:", err);
      }
    },
    [state.kpiUpdateRequests, state.employees]
  );

  // ============================================
  // SUPERVISOR DIRECT KPI EDIT
  // ============================================

  const supervisorUpdateEmployeeKpis = useCallback(
    async (employeeId: string, categories: Category[], justification: string) => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) throw new Error("Employee not found");

      const now = new Date().toISOString();

      const updatedEmployee: Employee = {
        ...employee,
        categories,
        needsKpiSetup: false,
      };

      const supervisor = employee.supervisorId
        ? state.employees.find((e) => e.id === employee.supervisorId)
        : null;

      const req: KpiUpdateRequest = {
        id: newId(),
        employeeId,
        department: employee.department,
        role: employee.role,
        templateVersion: 1,
        diffs: [
          {
            kind: "kpi_description_changed",
            categoryName: "Supervisor direct edit",
            kpiDescription: justification.slice(0, 80),
          },
        ],
        proposedCategories: categories,
        beforeScore: 0,
        afterScore: 0,
        status: "unacknowledged",
        createdAt: now,
        pushedBy: supervisor?.id,
        pushedByName: supervisor?.name || "Supervisor",
        assignedSupervisorId: supervisor?.id,
        assignedSupervisorName: supervisor?.name,
        approvedBySupervisorAt: now,
        supervisorComment: justification,
        comments: [
          {
            id: newId(),
            authorId: supervisor?.id || "supervisor",
            authorName: supervisor?.name || "Supervisor",
            authorRole: "supervisor",
            text: justification,
            timestamp: now,
          },
        ],
        templateUpdateRequested: false,
        templateUpdateApplied: false,
      };

      const employeeNotif: Notification = {
        id: newId(),
        userId: employeeId,
        type: "kpi_update_pushed_direct" as any,
        message: "Your KPIs were updated by your supervisor",
        link: "/kpi-updates",
        read: false,
        createdAt: now,
      };

      const hrNotifs: Notification[] = state.employees
        .filter((e) => e.roleType === "hr")
        .map((hr) => ({
          id: newId(),
          userId: hr.id,
          type: "kpi_update_pushed_direct" as any,
          message: `${supervisor?.name || "Supervisor"} updated KPIs for ${employee.name}`,
          link: "/appraisals-review",
          read: false,
          createdAt: now,
        }));

      setState((s) => ({
        ...s,
        employees: s.employees.map((e) =>
          e.id === employeeId ? updatedEmployee : e
        ),
        kpiUpdateRequests: [...s.kpiUpdateRequests, req],
        notifications: [...s.notifications, employeeNotif, ...hrNotifs],
      }));

      try {
        await upsertEmployeeDB(updatedEmployee);
        await upsertKpiUpdateRequest(req);
        await insertNotification(employeeNotif);
        for (const n of hrNotifs) {
          await insertNotification(n);
        }
      } catch (err) {
        console.error("supervisorUpdateEmployeeKpis persist error:", err);
        throw err;
      }
    },
    [state.employees]
  );

  const getKpiUpdateComments = useCallback(
    (requestId: string): KpiUpdateComment[] => {
      const req = state.kpiUpdateRequests.find((r) => r.id === requestId);
      return req?.comments || [];
    },
    [state.kpiUpdateRequests]
  );

  // ============================================
  // SYNC
  // ============================================
  const setBonusRevealed = useCallback(async (value: boolean) => {
    setState((s) => ({ ...s, bonusRevealed: value }));
    try {
      await upsertAppSetting("bonus_revealed", value);
    } catch (err) {
      console.error("setBonusRevealed persist failed:", err);
      setState((s) => ({ ...s, bonusRevealed: !value }));
      throw err;
    }
  }, []);

  const saveBonusConfig = useCallback(
    async (config: BonusConfig) => {
      const previous = state.bonusConfig;
      const previousGlobals = state.globals;

      // Optimistic update + mirror into legacy globals for pages that
      // still read them (e.g. Trace)
      setState((s) => ({
        ...s,
        bonusConfig: config,
        globals: {
          ...s.globals,
          totalRevenue: config.periodInputs.revenue ?? s.globals.totalRevenue,
          p4pPercent: config.revenuePercent,
          adjunctPercent: config.adjunctPercent,
          floor: config.floor,
          cap: config.cap,
          prorationOn: config.prorationOn,
          salesMultiplier: config.salesMultiplier,
        },
      }));

      try {
        await upsertAppSetting("bonus_config", config);

        // Audit entry (best-effort; does not block save on failure)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("audit_log").insert({
              id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              org_id: getCurrentOrgId(),
              user_id: user.id,
              action: "update_bonus_config",
              entity_type: "org",
              entity_id: getCurrentOrgId(),
              details: { sourceType: config.sourceType },
              created_at: new Date().toISOString(),
            });
          }
        } catch (auditErr) {
          console.warn("Audit log write failed (non-fatal):", auditErr);
        }
      } catch (err) {
        console.error("saveBonusConfig persist failed:", err);
        setState((s) => ({ ...s, bonusConfig: previous, globals: previousGlobals }));
        throw err;
      }
    },
    [state.bonusConfig, state.globals]
  );

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
      for (const r of state.kpiRequests) {
        await upsertKpiRequest(r);
      }
      console.log("Manual sync complete");
    } catch (err) {
      console.error("Manual sync failed:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [state]);

  const refreshFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [cloudEmployees, cloudTemplates, cloudMonthly, cloudAppraisals, cloudKpiUpdates, cloudKpiRequests, cloudSettings] =
        await Promise.all([
          fetchAllEmployees(),
          fetchAllTemplates(),
          fetchAllMonthly(),
          fetchAllAppraisals(),
          fetchAllKpiUpdateRequests(),
          fetchAllKpiRequests(),
          fetchAppSettings(),
        ]);

      let cloudNotifications: Notification[] = [];
      try {
        const { getCurrentUser } = await import("@/lib/supabase");
        const user = await getCurrentUser();
        if (user) {
          const me = cloudEmployees.find((e) => e.authUserId === user.id);
          if (me) {
            cloudNotifications = await fetchNotifications(me.id);
          }
        }
      } catch {
        // Best-effort
      }

      setState((s) => ({
        ...s,
        employees: cloudEmployees,
        kpiTemplates: cloudTemplates,
        monthlyData: cloudMonthly,
        appraisals: cloudAppraisals,
        notifications: cloudNotifications,
        kpiUpdateRequests: cloudKpiUpdates,
        kpiRequests: cloudKpiRequests,
        bonusRevealed: cloudSettings.bonus_revealed === true,
      }));

      setIsCloudSynced(true);
    } catch (err) {
      console.error("refreshFromCloud failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ============================================
  // VALUE
  // ============================================
  const value: Ctx = {
    ...state,
    isCloudSynced,
    isSyncing,
    setGlobals,
    saveBonusConfig,
    setGrades,
    resetGrades,
    upsertEmployee,
    clearEmployees,
    loadDemo,
    setEmployees,
    calc,
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
    hardDeleteEmployee,
    validateEmployeeRole,
    rejectEmployeeRole,
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

    getSupervisorPendingKpiUpdates,
    commentOnKpiUpdateRequest,
    approveKpiUpdateAsSupervisor,
    revertTemplateUpdate,
    rejectKpiUpdateAsSupervisor,
    getKpiUpdateComments,
    supervisorUpdateEmployeeKpis,

    submitKpiRequest,
    getKpiRequests,
    getEmployeeKpiRequest,
    cancelKpiRequest,
    syncToCloud,
    setBonusRevealed,
    refreshFromCloud,
  };

  if (typeof window !== "undefined" && import.meta.env.DEV) {
    (window as any).__p4p = value;
  }

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}