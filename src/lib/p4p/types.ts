// ============================================
// CORE TYPES
// ============================================

export interface KPI {
  id: string;
  description: string;
  metric: string;
  target: number;
  actual: number;
  weight: number;
  measurementSource?: string;
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

/**
 * Where did a given employee field's value come from?
 *
 * - "manual"             → entered by HR (default, editable)
 * - "external:<provider>" → synced from an HRMS or other integration
 *
 * When a field is external, it renders locked in the UI until HR
 * clicks Override. Overriding sets the source back to "manual".
 */
export type FieldSource = "manual" | `external:${string}`;

/**
 * Maps employee field names to their source.
 *
 * Missing keys are treated as "manual".
 * Example: { "department": "external:ao-hrms" }
 */
export type SourceConfig = Partial<Record<string, FieldSource>>;

export interface Employee {
  id: string;
  name: string;
  email: string;
  authUserId?: string;
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
  roleStatus?: 'pending' | 'active' | 'rejected';
  supervisorId?: string;
  supervisorName?: string;
  isManager?: boolean;
  needsKpiSetup?: boolean;
  /**
   * Where each field's value came from. Missing keys are "manual".
   * Only present when at least one field is externally synced.
   */
  sourceConfig?: SourceConfig;
}

/**
 * Single source of truth for "does this employee need KPIs?"
 * Use this everywhere instead of checking fields directly.
 */
export function employeeNeedsKpis(emp: {
  categories?: unknown[];
  needsKpiSetup?: boolean;
}): boolean {
  const hasCategories = (emp.categories?.length ?? 0) > 0;
  return !hasCategories;
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

// ============================================
// MONTHLY / TREND
// ============================================

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

// ============================================
// TRIGGERS
// ============================================

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

// ============================================
// KPI TEMPLATES
// ============================================

export interface KPIItem {
  id: string;
  description: string;
  metric: string;
  target: number;
  weight?: number;
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

// ============================================
// APPRAISALS
// ============================================

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
  year: number;
  month: number;
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

export interface AppraisalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  deadline: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

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

// ============================================
// UPLOADED FILES
// ============================================

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

// ============================================
// KPI REQUESTS (employee → HR)
// ============================================

export interface KpiRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  role: string;
  comment?: string;
  status: "pending" | "fulfilled" | "cancelled";
  createdAt: string;
  fulfilledAt?: string;
  cancelledAt?: string;
}

// ============================================
// KPI UPDATE REQUESTS
// ============================================

export type DiffKind =
  | "category_added"
  | "category_removed"
  | "category_weight_changed"
  | "category_name_changed"
  | "kpi_added"
  | "kpi_removed"
  | "kpi_target_changed"
  | "kpi_metric_changed"
  | "kpi_weight_changed"
  | "kpi_description_changed";

export interface KpiDiffItem {
  kind: DiffKind;
  categoryName: string;
  kpiDescription?: string;
  before?: unknown;
  after?: unknown;
}

export interface KpiUpdateComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "hr" | "supervisor" | "employee";
  text: string;
  timestamp: string;
}

export interface KpiUpdateRequest {
  id: string;
  employeeId: string;
  department: string;
  role: string;
  templateVersion: number;
  diffs: KpiDiffItem[];
  proposedCategories: Category[];
  beforeScore: number;
  afterScore: number;

  /**
   * Flow:
   * - pending_supervisor_review → HR pushed, waiting for supervisor
   * - back_to_hr               → supervisor commented, waiting for HR
   * - unacknowledged           → approved by supervisor, employee hasn't seen
   * - acknowledged             → employee acknowledged
   * - cancelled                → HR or supervisor cancelled
   */
  status:
    | "pending_supervisor_review"
    | "back_to_hr"
    | "unacknowledged"
    | "acknowledged"
    | "cancelled";

  employeeComment?: string;
  createdAt: string;
  acknowledgedAt?: string;
  commentedAt?: string;
  pushedBy?: string;
  pushedByName?: string;

  // Supervisor gate
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  approvedBySupervisorAt?: string;
  rejectedBySupervisorAt?: string;
  supervisorComment?: string;

  // Comment thread
  comments?: KpiUpdateComment[];

  // Template write-back (Stage 6)
  templateUpdateRequested?: boolean;
  templateUpdateApplied?: boolean;
  previousTemplate?: CategoryTemplate[];
  canRevertUntil?: string;
  templateRevertedAt?: string;
}
export type BonusSourceType =
  | "revenue_percent"
  | "profit_percent"
  | "fixed_amount";

export interface BonusConfig {
  /** Which source determines the total pool */
  sourceType: BonusSourceType;

  /** All three values stored so switching sources preserves what was typed */
  revenuePercent: number;
  profitPercent: number;
  fixedAmount: number;

  /** Optional fixed top-up added to the pool */
  addOn: { label: string; amount: number } | null;

  /** Distribution rules — same as the old Globals fields */
  adjunctPercent: number;
  floor: number;
  cap: number;
  prorationOn: boolean;
  salesMultiplier: number;

  /** Inputs HR updates each cycle */
  periodInputs: {
    revenue: number | null;
    profit: number | null;
  };
}
