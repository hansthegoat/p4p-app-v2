export interface KPI {
  id: string;
  description: string;
  metric: string;
  target: number;
  actual: number;
  weight: number;
  measurementSource?: string;
  // ===== NEW FIELDS =====
  proof?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    uploadedAt: string;
  }[];
  comment?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  weight: number;
  kpis: KPI[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  jobGrade: string;
  department: string;
  role: string;
  isAdjunct: boolean;
  isSalesRole: boolean;
  joinDate: string;
  monthsWorked: number;
  kpis: KPI[];
  categories?: Category[];
  roleType?: 'employee' | 'hr' | 'admin';
  supervisorId?: string;
  supervisorName?: string;
  isManager?: boolean;
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
    categoryBreakdown?: {
      categoryName: string;
      categoryWeight: number;
      kpis: { description: string; target: number; actual: number; ratio: number; weight: number }[];
      categoryScore: number;
    }[];
  }>;
  avgBonus: number;
  warnings: string[];
}

export interface MonthlyUpload {
  id: string;
  year: number;
  month: number;
  uploadedAt: string;
  fileName: string;
  data: MonthlyEmployeeData[];
}

export interface MonthlyEmployeeData {
  employeeId: string;
  employeeName: string;
  kpis: {
    description: string;
    metric: string;
    target: number;
    actual: number;
  }[];
  categories?: {
    name: string;
    weight: number;
    kpis: {
      description: string;
      metric: string;
      target: number;
      actual: number;
    }[];
  }[];
}

export interface MonthlyPerformance {
  year: number;
  month: number;
  employeeId: string;
  kpis: KPI[];
  categories?: Category[];
  performanceMultiplier: number;
  bonusEligible: number;
  createdAt: string;
}

export interface PerformanceTrend {
  employeeId: string;
  name: string;
  months: {
    month: number;
    year: number;
    score: number;
    multiplier: number;
  }[];
  currentScore: number;
  averageScore: number;
  bestMonth: { month: number; year: number; score: number };
  worstMonth: { month: number; year: number; score: number };
  trendDirection: 'improving' | 'declining' | 'stable';
}

export interface MonthlyStats {
  totalEmployees: number;
  avgMultiplier: number;
  risingStars: string[];
  underachievers: string[];
  monthOverMonthChange: number;
  monthsWithData: { year: number; month: number }[];
}

export interface PerformanceTrigger {
  employeeId: string;
  employeeName: string;
  type: 'pip' | 'probation' | 'management_action';
  severity: 'warning' | 'danger' | 'critical';
  message: string;
  triggeredAt: string;
  monthsData: { month: number; year: number; score: number }[];
}

export interface TriggerSummary {
  pip: PerformanceTrigger[];
  probation: PerformanceTrigger[];
  managementAction: PerformanceTrigger[];
  total: number;
}

export interface KPIItem {
  id: string;
  description: string;
  metric: string;
  target: number;
  maxScore?: number;
  measurementSource?: string;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  weight: number;
  kpis: KPIItem[];
}

export interface KPITemplate {
  jobGrade: string;
  roleName: string;
  department: string;
  categories: CategoryTemplate[];
}

export interface AppraisalComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface AppraisalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  period: string;
  submittedAt: string;
  reviewedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  categories: Category[];
  overallScore: number;
  overallPercent: number;
  performanceBand: string;
  comments: AppraisalComment[];
  reviewerId?: string;
  reviewerName?: string;
  revisionReason?: string;
  // NOTE: reviewerComment has been removed - use comments instead
}

export interface AppraisalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  deadline: string;
}
export interface AppraisalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  period: string;          // e.g., "Q1 2025" (optional, can be derived)
  year: number;            // NEW
  month: number;           // NEW
  submittedAt: string;
  reviewedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  categories: Category[];
  overallScore: number;
  overallPercent: number;
  performanceBand: string;
  comments: AppraisalComment[];
  reviewerId?: string;
  reviewerName?: string;
  revisionReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 
    | 'appraisal_submitted'
    | 'appraisal_approved'
    | 'appraisal_rejected'
    | 'appraisal_needs_revision'
    | 'new_comment'
    | 'trigger_pip'
    | 'trigger_probation'
    | 'trigger_management_action';
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy: string;
  kpiId: string;
}