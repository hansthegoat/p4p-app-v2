import type { CalcResult, Employee, GradePoint, Globals, KPI, Category } from "./types";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function performanceMultiplierFromCategories(
  categories: Category[], 
  floor: number, 
  cap: number
): number {
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

  const weights: { 
    id: string; 
    weight: number; 
    pm: number; 
    proration: number; 
    salesMult: number; 
    gp: number; 
    kpiBreakdown: any[];
    categoryBreakdown?: any[];
  }[] = [];
  
  for (const e of nonAdjuncts) {
    const gp = gradeMap.get(e.jobGrade) ?? 0;
    if (!gradeMap.has(e.jobGrade)) warnings.push(`${e.name}: unknown job grade "${e.jobGrade}".`);
    
    let pm: number;
    let kpiBreakdown: any[] = [];
    let categoryBreakdown: any[] | undefined;
    
    if (e.categories && e.categories.length > 0) {
      pm = performanceMultiplierFromCategories(e.categories, floor, cap);
      
      categoryBreakdown = e.categories.map(cat => ({
        categoryName: cat.name,
        categoryWeight: cat.weight,
        kpis: (cat.kpis || []).map(k => ({
          description: k.description,
          target: k.target,
          actual: k.actual,
          ratio: k.target > 0 ? k.actual / k.target : 0,
          weight: k.weight
        })),
        categoryScore: cat.kpis && cat.kpis.length > 0 
          ? cat.kpis.reduce((sum, k) => {
              const ratio = k.target > 0 ? k.actual / k.target : 0;
              const kpiWeight = k.weight || 1;
              return sum + ratio * kpiWeight;
            }, 0) / cat.kpis.reduce((sum, k) => sum + (k.weight || 1), 0)
          : 1
      }));
    } else if (e.kpis && e.kpis.length > 0) {
      pm = performanceMultiplier(e.kpis, floor, cap);
      kpiBreakdown = (e.kpis || []).map((k) => ({
        description: k.description,
        ratio: k.target > 0 ? k.actual / k.target : 0,
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
    const salesMult = e.isSalesRole ? (Number(g.salesMultiplier) || 1) : 1;
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
      categoryBreakdown: w.categoryBreakdown,
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
      categoryBreakdown: undefined,
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

export function fmtGHSFull(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(v);
}

export function fmtCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export const fmtNum = (n: number, d = 2) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(Number.isFinite(n) ? n : 0);