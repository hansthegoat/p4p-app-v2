export interface KPI {
  id: string;
  description: string;
  metric: string; // GHS, %, #, etc
  target: number;
  actual: number;
  weight: number;
}

export interface Employee {
  id: string;
  name: string;
  jobGrade: string; // grade code
  isAdjunct: boolean;
  isSalesRole: boolean;
  joinDate: string; // ISO
  monthsWorked: number;
  kpis: KPI[];
}

export interface GradePoint {
  code: string;
  name: string;
  points: number;
}

export interface Globals {
  totalRevenue: number;
  p4pPercent: number;
  adjunctPercent: number;
  floor: number;
  cap: number;
  prorationOn: boolean;
  salesMultiplier: number;
}

export interface CalcResult {
  totalPool: number;
  adjunctPool: number;
  employeePool: number;
  perAdjunctBonus: number;
  sumWeights: number;
  valuePerUnit: number;
  nonAdjunctCount: number;
  adjunctCount: number;
  perEmployee: Record<string, {
    performanceMultiplier: number;
    proration: number;
    salesMult: number;
    gradePoints: number;
    weight: number;
    bonus: number;
    kpiBreakdown: { description: string; ratio: number; weight: number }[];
  }>;
  avgBonus: number;
  warnings: string[];
}
