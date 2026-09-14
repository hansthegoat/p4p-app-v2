// src/lib/p4p/supabase-data.ts
// All Supabase database operations for P4P

import { supabase } from "@/lib/supabase";
import { newId } from "./defaults";
import type {
  Employee,
  MonthlyPerformance,
  AppraisalRequest,
  Notification,
  KPITemplate,
} from "./types";

// ============================================
// EMPLOYEES
// ============================================

export async function fetchAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name");

  if (error) {
    console.error("fetchAllEmployees error:", error);
    throw error;
  }

  return (data || []).map(mapEmployeeFromDB);
}

export async function fetchEmployeeByAuthId(
  authId: string
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) {
    console.error("fetchEmployeeByAuthId error:", error);
    return null;
  }

  return data ? mapEmployeeFromDB(data) : null;
}

export async function fetchEmployeeByEmail(
  email: string
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("fetchEmployeeByEmail error:", error);
    return null;
  }

  return data ? mapEmployeeFromDB(data) : null;
}

export async function upsertEmployeeDB(emp: Employee): Promise<void> {
  const row = mapEmployeeToDB(emp);
  const { error } = await supabase
    .from("employees")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("upsertEmployee error:", error);
    throw error;
  }
}

export async function deleteEmployeeDB(id: string): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    console.error("deleteEmployee error:", error);
    throw error;
  }
}

export async function bulkUpsertEmployees(emps: Employee[]): Promise<void> {
  if (emps.length === 0) return;

  const rows = emps.map(mapEmployeeToDB);
  const { error } = await supabase
    .from("employees")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("bulkUpsertEmployees error:", error);
    throw error;
  }
}

// ============================================
// KPI TEMPLATES
// ============================================

export async function fetchAllTemplates(): Promise<Record<string, KPITemplate>> {
  const { data, error } = await supabase.from("kpi_templates").select("*");

  if (error) {
    console.error("fetchAllTemplates error:", error);
    return {};
  }

  const templates: Record<string, KPITemplate> = {};
  for (const row of data || []) {
    const key = `${row.department}-${row.role_name}`;
    templates[key] = {
      department: row.department,
      roleName: row.role_name,
      jobGrade: row.job_grade || "",
      categories: row.categories || [],
    };
  }
  return templates;
}

export async function upsertTemplate(template: KPITemplate): Promise<void> {
  const row = {
    id: `${template.department}-${template.roleName}`.replace(/\s+/g, "_"),
    department: template.department,
    role_name: template.roleName,
    job_grade: template.jobGrade,
    categories: template.categories,
  };

  const { error } = await supabase
    .from("kpi_templates")
    .upsert(row, { onConflict: "department,role_name" });

  if (error) {
    console.error("upsertTemplate error:", error);
    throw error;
  }
}

// ============================================
// MONTHLY PERFORMANCE
// ============================================

export async function fetchMonthlyForEmployee(
  employeeId: string
): Promise<MonthlyPerformance[]> {
  const { data, error } = await supabase
    .from("monthly_performance")
    .select("*")
    .eq("employee_id", employeeId)
    .order("year")
    .order("month");

  if (error) {
    console.error("fetchMonthlyForEmployee error:", error);
    return [];
  }

  return (data || []).map(mapMonthlyFromDB);
}

export async function fetchAllMonthly(): Promise<MonthlyPerformance[]> {
  const { data, error } = await supabase
    .from("monthly_performance")
    .select("*")
    .order("year")
    .order("month");

  if (error) {
    console.error("fetchAllMonthly error:", error);
    return [];
  }

  return (data || []).map(mapMonthlyFromDB);
}

export async function upsertMonthlyPerformance(
  data: MonthlyPerformance
): Promise<void> {
  const id = `${data.employeeId}_${data.year}_${data.month}`;
  const row = {
    id,
    employee_id: data.employeeId,
    year: data.year,
    month: data.month,
    performance_multiplier: data.performanceMultiplier,
    bonus_eligible: data.bonusEligible,
    categories: data.categories || null,
    kpis: data.kpis || null,
  };

  const { error } = await supabase
    .from("monthly_performance")
    .upsert(row, { onConflict: "employee_id,year,month" });

  if (error) {
    console.error("upsertMonthlyPerformance error:", error);
    throw error;
  }
}

export async function deleteMonthlyPerformance(
  employeeId: string,
  year: number,
  month: number
): Promise<void> {
  const { error } = await supabase
    .from("monthly_performance")
    .delete()
    .eq("employee_id", employeeId)
    .eq("year", year)
    .eq("month", month);

  if (error) {
    console.error("deleteMonthlyPerformance error:", error);
    throw error;
  }
}

// ============================================
// APPRAISALS
// ============================================

export async function fetchAllAppraisals(): Promise<AppraisalRequest[]> {
  const { data, error } = await supabase
    .from("appraisals")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("fetchAllAppraisals error:", error);
    return [];
  }

  const appraisals: AppraisalRequest[] = [];
  for (const row of data || []) {
    const comments = await fetchCommentsForAppraisal(row.id);
    appraisals.push(mapAppraisalFromDB(row, comments));
  }
  return appraisals;
}

export async function fetchAppraisalsForEmployee(
  employeeId: string
): Promise<AppraisalRequest[]> {
  const { data, error } = await supabase
    .from("appraisals")
    .select("*")
    .eq("employee_id", employeeId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("fetchAppraisalsForEmployee error:", error);
    return [];
  }

  const appraisals: AppraisalRequest[] = [];
  for (const row of data || []) {
    const comments = await fetchCommentsForAppraisal(row.id);
    appraisals.push(mapAppraisalFromDB(row, comments));
  }
  return appraisals;
}

export async function upsertAppraisal(
  appraisal: AppraisalRequest
): Promise<void> {
  const row = mapAppraisalToDB(appraisal);
  const { error } = await supabase
    .from("appraisals")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("upsertAppraisal error:", error);
    throw error;
  }
}

export async function fetchCommentsForAppraisal(
  appraisalId: string
): Promise<any[]> {
  const { data, error } = await supabase
    .from("appraisal_comments")
    .select("*")
    .eq("appraisal_id", appraisalId)
    .order("timestamp");

  if (error) {
    console.error("fetchCommentsForAppraisal error:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    text: row.text,
    timestamp: row.timestamp,
  }));
}

export async function insertAppraisalComment(
  appraisalId: string,
  comment: {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    timestamp: string;
  }
): Promise<void> {
  const { error } = await supabase.from("appraisal_comments").insert({
    id: comment.id,
    appraisal_id: appraisalId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    text: comment.text,
    timestamp: comment.timestamp,
  });

  if (error) {
    console.error("insertAppraisalComment error:", error);
    throw error;
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function fetchNotifications(
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchNotifications error:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    message: row.message,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  }));
}

export async function insertNotification(n: Notification): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    id: n.id,
    user_id: n.userId,
    type: n.type,
    message: n.message,
    link: n.link,
    read: n.read || false,
    created_at: n.createdAt,
  });

  if (error) {
    console.error("insertNotification error:", error);
    throw error;
  }
}

export async function markNotificationReadDB(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    console.error("markNotificationReadDB error:", error);
  }
}

// ============================================
// MAPPERS (DB row ↔ TypeScript object)
// ============================================

function mapEmployeeFromDB(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    authUserId: row.auth_id || undefined,
    department: row.department || "",
    role: row.role || "",
    jobGrade: row.job_grade || "4",
    isAdjunct: row.is_adjunct ?? false,
    isSalesRole: row.is_sales_role ?? false,
    isManager: row.is_manager ?? false,
    supervisorId: row.supervisor_id || "",
    supervisorName: row.supervisor_name || "",
    joinDate: row.join_date || new Date().toISOString().slice(0, 10),
    monthsWorked: row.months_worked ?? 12,
    roleType: (row.role_type as any) || "employee",
    categories: row.categories || [],
    kpis: row.kpis || [],
    needsKpiSetup: row.needs_kpi_setup ?? false,
  } as Employee & { needsKpiSetup?: boolean };
}

function mapEmployeeToDB(emp: Employee): any {
  return {
    id: emp.id,
    // ⭐ FIXED: was hard-coded null — this is what broke cross-device login
    auth_id: emp.authUserId || null,
    name: emp.name,
    email: emp.email,
    department: emp.department,
    role: emp.role,
    job_grade: emp.jobGrade,
    is_adjunct: emp.isAdjunct,
    is_sales_role: emp.isSalesRole,
    is_manager: emp.isManager,
    supervisor_id: emp.supervisorId || null,
    supervisor_name: emp.supervisorName || null,
    join_date: emp.joinDate,
    months_worked: emp.monthsWorked,
    role_type: emp.roleType || "employee",
    categories: emp.categories || [],
    kpis: emp.kpis || [],
    needs_kpi_setup: (emp as any).needsKpiSetup ?? false,
  };
}

function mapMonthlyFromDB(row: any): MonthlyPerformance {
  return {
    year: row.year,
    month: row.month,
    employeeId: row.employee_id,
    kpis: row.kpis || [],
    categories: row.categories || undefined,
    performanceMultiplier: row.performance_multiplier,
    bonusEligible: row.bonus_eligible,
    createdAt: row.created_at,
  };
}

function mapAppraisalFromDB(row: any, comments: any[]): AppraisalRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    department: row.department,
    role: row.role,
    period: row.period,
    year: row.year,
    month: row.month,
    status: row.status,
    overallScore: row.overall_score,
    overallPercent: row.overall_percent,
    performanceBand: row.performance_band,
    categories: row.categories || [],
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    revisionReason: row.revision_reason,
    reviewerComment: row.reviewer_comment,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    comments,
  } as AppraisalRequest & { year?: number; month?: number };
}

function mapAppraisalToDB(a: AppraisalRequest): any {
  return {
    id: a.id,
    employee_id: a.employeeId,
    employee_name: a.employeeName,
    department: a.department,
    role: a.role,
    period: a.period,
    year: (a as any).year ?? null,
    month: (a as any).month ?? null,
    status: a.status,
    overall_score: a.overallScore,
    overall_percent: a.overallPercent,
    performance_band: a.performanceBand,
    categories: a.categories,
    reviewer_id: a.reviewerId || null,
    reviewer_name: a.reviewerName || null,
    reviewer_comment: (a as any).reviewerComment || null,
    revision_reason: a.revisionReason || null,
    submitted_at: a.submittedAt,
    reviewed_at: a.reviewedAt || null,
  };
}

// ============================================
// HELPERS
// ============================================

export async function generateEmployeeId(): Promise<string> {
  return newId();
}
// ============================================
// KPI UPDATE REQUESTS (Phase 1)
// ============================================

import type { KpiUpdateRequest } from "./types";

export async function fetchAllKpiUpdateRequests(): Promise<KpiUpdateRequest[]> {
  const { data, error } = await supabase
    .from("kpi_update_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchAllKpiUpdateRequests error:", error);
    return [];
  }

  return (data || []).map(mapKpiUpdateFromDB);
}

export async function fetchKpiUpdateRequestsForEmployee(
  employeeId: string
): Promise<KpiUpdateRequest[]> {
  const { data, error } = await supabase
    .from("kpi_update_requests")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchKpiUpdateRequestsForEmployee error:", error);
    return [];
  }

  return (data || []).map(mapKpiUpdateFromDB);
}

export async function upsertKpiUpdateRequest(
  req: KpiUpdateRequest
): Promise<void> {
  const row = mapKpiUpdateToDB(req);
  const { error } = await supabase
    .from("kpi_update_requests")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("upsertKpiUpdateRequest error:", error);
    throw error;
  }
}

function mapKpiUpdateFromDB(row: any): KpiUpdateRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    department: row.department,
    role: row.role,
    templateVersion: row.template_version ?? 1,
    diffs: row.diffs || [],
    proposedCategories: row.proposed_categories || [],
    beforeScore: Number(row.before_score ?? 0),
    afterScore: Number(row.after_score ?? 0),
    status: row.status,
    employeeComment: row.employee_comment || undefined,
    createdAt: row.created_at,
    acknowledgedAt: row.acknowledged_at || undefined,
    commentedAt: row.commented_at || undefined,
    pushedBy: row.pushed_by || undefined,
    pushedByName: row.pushed_by_name || undefined,
  };
}

function mapKpiUpdateToDB(req: KpiUpdateRequest): any {
  return {
    id: req.id,
    employee_id: req.employeeId,
    department: req.department,
    role: req.role,
    template_version: req.templateVersion,
    diffs: req.diffs,
    proposed_categories: req.proposedCategories,
    before_score: req.beforeScore,
    after_score: req.afterScore,
    status: req.status,
    employee_comment: req.employeeComment || null,
    created_at: req.createdAt,
    acknowledged_at: req.acknowledgedAt || null,
    commented_at: req.commentedAt || null,
    pushed_by: req.pushedBy || null,
    pushed_by_name: req.pushedByName || null,
  };
}