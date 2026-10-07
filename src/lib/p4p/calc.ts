import type { CalcResult, Employee, GradePoint, Globals, BonusConfig, KPI, Category } from "./types";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Who participates in the bonus pool?
 * - Adjuncts: get a fixed adjunct bonus (separate pool)
 * - Employees + HR: get pool share based on grade points × multiplier
 * - Admins: system/developer accounts — NOT in the bonus calculation
 */
function isPayrollParticipant(e: Employee): boolean {
  return e.roleType !== "admin";
}

export function performanceMultiplierFromCategories(
  categories: Category[], 
  floor: number, 
  cap: number
): number {
  if (!categories || categories.length === 0) return 0;
  
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
  
  if (totalWeight === 0) return 0;
  
  const multiplier = totalWeightedScore / totalWeight;
  return clamp(multiplier, floor, cap);
}

export function performanceMultiplier(kpis: KPI[], floor: number, cap: number): number {
  if (!kpis || kpis.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const k of kpis) {
    const t = Number(k.target);
    const a = Number(k.actual);
    if (!t || t <= 0) continue;
    sum += a / t;
    count++;
  }
  if (count === 0) return 0;
  const ratio = sum / count;
  return clamp(ratio, floor, cap);
}
/**
 * Computes the total bonus pool from the bonus configuration.
 *
 * Supports three source types:
 *   - revenue_percent: revenue for the period × revenuePercent
 *   - profit_percent:  profit for the period  × profitPercent
 *   - fixed_amount:    a flat amount, ignoring period inputs
 *
 * An optional add-on (a fixed top-up) is added on top of the base.
 */
export function computeTotalPool(config: BonusConfig): number {
  let base = 0;

  switch (config.sourceType) {
    case "revenue_percent": {
      const revenue = config.periodInputs.revenue ?? 0;
      base = revenue * (config.revenuePercent / 100);
      break;
    }
    case "profit_percent": {
      const profit = config.periodInputs.profit ?? 0;
      base = profit * (config.profitPercent / 100);
      break;
    }
    case "fixed_amount": {
      base = config.fixedAmount;
      break;
    }
  }

  const addOn = config.addOn?.amount ?? 0;
  return base + addOn;
}

export function calculate(
  employees: Employee[],
  grades: GradePoint[],
  g: Globals,
  config?: BonusConfig,
): CalcResult {
  const warnings: string[] = [];

  // Prefer the new BonusConfig when provided. Fall back to legacy
  // Globals for backward compatibility until the store is migrated.
  const rawFloor = config ? config.floor : g.floor;
  const rawCap = config ? config.cap : g.cap;
  const floor = Math.min(rawFloor, rawCap);
  const cap = Math.max(rawFloor, rawCap);
  if (rawFloor > rawCap) warnings.push("Floor was greater than cap. Values swapped.");

  const gradeMap = new Map(grades.map((x) => [x.code, x.points]));

  const totalPool = config
    ? computeTotalPool(config)
    : (Number(g.totalRevenue) || 0) * ((Number(g.p4pPercent) || 0) / 100);

  const adjunctPercent = config ? config.adjunctPercent : g.adjunctPercent;
  const adjFrac = clamp((Number(adjunctPercent) || 0) / 100, 0, 1);
  const adjunctPool = totalPool * adjFrac;
  const employeePool = totalPool * (1 - adjFrac);

  // Exclude admins only — HR is a real employee and is included
  const participants = employees.filter(isPayrollParticipant);
  const excludedCount = employees.length - participants.length;

  const adjuncts = participants.filter((e) => e.isAdjunct);
  const nonAdjuncts = participants.filter((e) => !e.isAdjunct);

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
      // No KPIs = not yet measured = no bonus.
      // Previously defaulted to 1.0 which granted a full unearned share.
      pm = 0;
      warnings.push(`${e.name}: no KPIs assigned, bonus set to 0 until measured.`);
    }
    
    const prorationOn = config ? config.prorationOn : g.prorationOn;
    const salesMultiplierValue = config ? config.salesMultiplier : g.salesMultiplier;

    let months = Number(e.monthsWorked);
    if (prorationOn && (!months || months <= 0)) {
      warnings.push(`${e.name}: months worked missing. Defaulted to 12.`);
      months = 12;
    }
    const proration = prorationOn ? clamp(months / 12, 0, 1) : 1;
    const salesMult = e.isSalesRole ? (Number(salesMultiplierValue) || 1) : 1;
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
  if (nonAdjuncts.length > 0 && sumWeights <= 0) warnings.push("Sum of weights is 0, no bonuses can be distributed to non-adjuncts.");

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
  // Average is across participants only (HR + employees + adjuncts, NOT admins)
  const avgBonus = participants.length > 0 ? totalBonusPaid / participants.length : 0;

  if (excludedCount > 0) {
    // Informational — enable if you need to debug
    // console.log(`[calc] Excluded ${excludedCount} admin account${excludedCount === 1 ? "" : "s"} from bonus pool.`);
  }

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