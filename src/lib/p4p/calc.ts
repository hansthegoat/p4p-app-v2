import type { CalcResult, Employee, GradePoint, Globals, KPI } from "./types";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Updated: simple average of actual/target, no manual weights
export function performanceMultiplier(kpis: KPI[], floor: number, cap: number): number {
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

export function calculate(
  employees: Employee[],
  grades: GradePoint[],
  g: Globals,
): CalcResult {
  const warnings: string[] = [];
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

  const perEmployee: CalcResult["perEmployee"] = {};

  // First pass: weights (no user weight, only grade, performance multiplier, proration, sales)
  const weights: { id: string; weight: number; pm: number; proration: number; salesMult: number; gp: number; kpiBreakdown: any[] }[] = [];
  for (const e of nonAdjuncts) {
    const gp = gradeMap.get(e.jobGrade) ?? 0;
    if (!gradeMap.has(e.jobGrade)) warnings.push(`${e.name}: unknown job grade "${e.jobGrade}".`);
    if (!e.kpis || e.kpis.length === 0) warnings.push(`${e.name}: has no KPIs — multiplier defaults to 1.`);
    const pm = performanceMultiplier(e.kpis, floor, cap);
    let months = Number(e.monthsWorked);
    if (g.prorationOn && (!months || months <= 0)) {
      warnings.push(`${e.name}: months worked missing — defaulted to 12.`);
      months = 12;
    }
    const proration = g.prorationOn ? clamp(months / 12, 0, 1) : 1;
    const salesMult = e.isSalesRole ? (Number(g.salesMultiplier) || 1) : 1;
    const weight = gp * pm * proration * salesMult;
    // KPI breakdown now excludes weight field
    const kpiBreakdown = (e.kpis || []).map((k) => ({
      description: k.description,
      ratio: k.target > 0 ? k.actual / k.target : 0,
    }));
    weights.push({ id: e.id, weight, pm, proration, salesMult, gp, kpiBreakdown });
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
    };
  }
  for (const a of adjuncts) {
    perEmployee[a.id] = {
      performanceMultiplier: 1, proration: 1, salesMult: 1,
      gradePoints: gradeMap.get(a.jobGrade) ?? 0,
      weight: 0, bonus: perAdjunctBonus, kpiBreakdown: [],
    };
  }

  const totalBonusPaid = (sumWeights > 0 ? employeePool : 0) + (adjuncts.length > 0 ? adjunctPool : 0);
  const avgBonus = employees.length > 0 ? totalBonusPaid / employees.length : 0;

  return {
    totalPool, adjunctPool, employeePool, perAdjunctBonus, sumWeights, valuePerUnit,
    nonAdjunctCount: nonAdjuncts.length, adjunctCount: adjuncts.length,
    perEmployee, avgBonus, warnings,
  };
}

/** Format a GHS amount with compact K/M suffixes for large values */
export function fmtGHS(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  if (Math.abs(v) >= 1_000_000) {
    const m = v / 1_000_000;
    return `GH₵ ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M`;
  }
  if (Math.abs(v) >= 1_000) {
    const k = v / 1_000;
    return `GH₵ ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(v);
}

/** Format a plain number with compact K/M suffixes */
export function fmtGHSFull(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(v);
}

/** Compact axis tick formatter — used in charts */
export function fmtCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export const fmtNum = (n: number, d = 2) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);