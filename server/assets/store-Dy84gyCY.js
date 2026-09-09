import { jsx } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { D as DEFAULT_GRADES, a as DEMO_EMPLOYEES, b as DEFAULT_GLOBALS, n as newId } from "./router-ykR6owpd.js";
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
function fmtGHSFull(n) {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(v);
}
const fmtNum = (n, d = 2) => new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);
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
      let employees = Array.isArray(parsed.employees) ? parsed.employees : DEMO_EMPLOYEES;
      employees = employees.map((emp) => {
        if (!emp.categories || emp.categories.length === 0) {
          const templates = loadTemplates();
          const key = `${emp.department}-${emp.role}`;
          const template = templates[key];
          if (template) {
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
                weight: 100,
                measurementSource: k.measurementSource || ""
              }))
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
  const removeEmployee = useCallback((id) => setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) })), []);
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
  const ensureAllEmployeesHaveKPIs = useCallback(() => {
    const templates = state.kpiTemplates;
    let updatedCount = 0;
    const updatedEmployees = state.employees.map((emp) => {
      if (emp.isAdjunct) return emp;
      if (emp.categories && emp.categories.length > 0) {
        return emp;
      }
      const key = `${emp.department}-${emp.role}`;
      const template = templates[key];
      if (template) {
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
            weight: 100,
            measurementSource: k.measurementSource || ""
          }))
        }));
        updatedCount++;
        return { ...emp, categories };
      }
      return emp;
    });
    if (updatedCount > 0) {
      setState((s) => ({ ...s, employees: updatedEmployees }));
    }
    return updatedCount;
  }, [state.employees, state.kpiTemplates]);
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
  }, [state.employees]);
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
    }
  }, [detectTriggers]);
  const approveAppraisal = useCallback((id, reviewerId, reviewerName) => {
    let employeeId = "";
    let year = 0;
    let month = 0;
    let categories = [];
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === id) {
          employeeId = a.employeeId;
          year = a.year;
          month = a.month;
          categories = a.categories;
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
      setTimeout(() => triggerAfterApproval(employeeId), 100);
    }
  }, [triggerAfterApproval, state.employees]);
  const rejectAppraisal = useCallback((id, reviewerId, reviewerName, reason) => {
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === id) {
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
  }, []);
  const requestChanges = useCallback((id, reviewerId, reviewerName, reason) => {
    setState((s) => {
      const updated = s.appraisals.map((a) => {
        if (a.id === id) {
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
  }, []);
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
  const markNotificationRead = useCallback((id) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map(
        (n) => n.id === id ? { ...n, read: true } : n
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
    triggerAfterApproval
  };
  return /* @__PURE__ */ jsx(C.Provider, { value, children });
}
function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}
export {
  P4PProvider as P,
  fmtGHS as a,
  fmtGHSFull as b,
  fmtNum as f,
  useP4P as u
};
