// src/lib/p4p/admin-data.ts
// Super Admin queries — bypass the standard org-scoped fetches.
// RLS automatically restricts these to Super Admins only.

import { supabase } from "@/lib/supabase";

export interface OrgWithStats {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  employee_count: number;
}

export async function fetchAllOrgsWithStats(): Promise<OrgWithStats[]> {
  const { data: orgs, error: orgsError } = await supabase
    .from("orgs")
    .select("*")
    .order("created_at", { ascending: true });

  if (orgsError || !orgs) {
    console.error("fetchAllOrgsWithStats error:", orgsError);
    return [];
  }

  // Count employees per org
  const { data: employees } = await supabase
    .from("employees")
    .select("org_id");

  const counts: Record<string, number> = {};
  for (const e of employees || []) {
    counts[e.org_id] = (counts[e.org_id] || 0) + 1;
  }

  return orgs.map((o) => ({
    ...o,
    employee_count: counts[o.id] || 0,
  }));
}

export interface PlatformStats {
  totalOrgs: number;
  totalEmployees: number;
  totalActiveOrgs: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const { count: orgCount } = await supabase
    .from("orgs")
    .select("*", { count: "exact", head: true });

  const { count: activeOrgCount } = await supabase
    .from("orgs")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: employeeCount } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true });

  return {
    totalOrgs: orgCount || 0,
    totalActiveOrgs: activeOrgCount || 0,
    totalEmployees: employeeCount || 0,
  };
}

// ============================================================
// PHASE 3 — Tenant detail
// ============================================================

export interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface OrgEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  job_grade: string;
  role_type: "employee" | "hr";
  role_status: "pending" | "active" | "rejected";
  is_manager: boolean;
  supervisor_id: string | null;
  supervisor_name: string | null;
}

export interface OrgAuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
}

export async function fetchOrgById(orgId: string): Promise<OrgDetail | null> {
  const { data, error } = await supabase
    .from("orgs")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function fetchEmployeesForOrg(orgId: string): Promise<OrgEmployee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("id, name, email, department, role, job_grade, role_type, role_status, is_manager, supervisor_id, supervisor_name")
    .eq("org_id", orgId)
    .order("name");
  if (error || !data) {
    console.error("fetchEmployeesForOrg error:", error);
    return [];
  }
  return data as OrgEmployee[];
}

export async function fetchAuditLogForOrg(
  orgId: string,
  limit = 20
): Promise<OrgAuditEntry[]> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

// Internal helper — write an audit entry + notify the affected employee
async function writeAdminAudit(opts: {
  orgId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  notifyUserId?: string;
  notifyMessage?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Audit log
  await supabase.from("audit_log").insert({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    org_id: opts.orgId,
    user_id: user.id,
    action: opts.action,
    entity_type: opts.entityType,
    entity_id: opts.entityId,
    details: opts.details,
    created_at: new Date().toISOString(),
  });

  // Notification to the affected employee
  if (opts.notifyUserId && opts.notifyMessage) {
    await supabase.from("notifications").insert({
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      org_id: opts.orgId,
      user_id: opts.notifyUserId,
      type: "admin_action",
      message: opts.notifyMessage,
      link: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    });
  }
}

export async function promoteToHR(employee: OrgEmployee, orgId: string): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .update({ role_type: "hr" })
    .eq("id", employee.id);
  if (error) throw error;

  await writeAdminAudit({
    orgId,
    action: "promote_to_hr",
    entityType: "employee",
    entityId: employee.id,
    details: { name: employee.name, email: employee.email },
    notifyUserId: employee.id,
    notifyMessage: "You've been promoted to HR by a platform administrator.",
  });
}

export async function revokeHR(employee: OrgEmployee, orgId: string): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .update({ role_type: "employee" })
    .eq("id", employee.id);
  if (error) throw error;

  await writeAdminAudit({
    orgId,
    action: "revoke_hr",
    entityType: "employee",
    entityId: employee.id,
    details: { name: employee.name, email: employee.email },
    notifyUserId: employee.id,
    notifyMessage: "Your HR role has been revoked by a platform administrator.",
  });
}

export async function updateEmployeeProfile(
  employeeId: string,
  updates: { department?: string; role?: string; job_grade?: string },
  orgId: string,
  employeeName: string,
  employeeEmail: string
): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", employeeId);
  if (error) throw error;

  await writeAdminAudit({
    orgId,
    action: "update_employee_profile",
    entityType: "employee",
    entityId: employeeId,
    details: { name: employeeName, email: employeeEmail, ...updates },
  });
}

// ============================================================
// PHASE 4 — Create Organization
// ============================================================

function generateInviteCode(): string {
  // 8 chars, URL-safe, unambiguous (no 0/O/1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function uuidv4(): string {
  // Works in non-secure contexts (crypto.randomUUID requires HTTPS/localhost).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface CreateOrgResult {
  orgId: string;
  inviteCode: string;
  inviteUrl: string;
}

export async function createOrgWithHR(params: {
  orgName: string;
  slug: string;
  hrName: string;
  hrEmail: string;
}): Promise<CreateOrgResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const cleanSlug = params.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const cleanEmail = params.hrEmail.trim().toLowerCase();

  if (!cleanSlug) throw new Error("Slug is required");
  if (!cleanEmail) throw new Error("HR email is required");

  // Slug collision check
  const { data: existing } = await supabase
    .from("orgs")
    .select("id")
    .eq("slug", cleanSlug)
    .maybeSingle();
  if (existing) throw new Error(`Slug "${cleanSlug}" is already in use.`);

  // Create the org
  const orgId = uuidv4();
  const { error: orgError } = await supabase.from("orgs").insert({
    id: orgId,
    name: params.orgName.trim(),
    slug: cleanSlug,
    is_active: true,
  });
  if (orgError) throw orgError;

  // Create the pending HR employee row
  const inviteCode = generateInviteCode();
  const { error: empError } = await supabase.from("employees").insert({
    id: `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    org_id: orgId,
    auth_id: null,
    name: params.hrName.trim(),
    email: cleanEmail,
    department: "Human Resources",
    role: "Head of Department",
    job_grade: "F",
    is_adjunct: false,
    is_sales_role: false,
    is_manager: true,
    role_type: "hr",
    role_status: "active",
    categories: [],
    kpis: [],
    needs_kpi_setup: true,
    invite_code: inviteCode,
    join_date: new Date().toISOString().slice(0, 10),
    months_worked: 12,
  });

  if (empError) {
    // Rollback the org if the employee creation failed
    await supabase.from("orgs").delete().eq("id", orgId);
    throw empError;
  }

  // Audit entry
  await supabase.from("audit_log").insert({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    org_id: orgId,
    user_id: user.id,
    action: "create_org",
    entity_type: "org",
    entity_id: orgId,
    details: {
      name: params.orgName.trim(),
      slug: cleanSlug,
      hr_name: params.hrName.trim(),
      hr_email: cleanEmail,
    },
    created_at: new Date().toISOString(),
  });

  // Build the invite URL. BASE_URL in Vite resolves to "/p4p-app-v2/" in
  // dev and "/" on Vercel — both handled correctly here.
  const base = typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "";
  const inviteUrl = `${base}register?invite=${inviteCode}`;

  return { orgId, inviteCode, inviteUrl };
}

// ============================================================
// PHASE 4b — Org lifecycle actions
// ============================================================

export async function toggleOrgActive(
  orgId: string,
  active: boolean,
  orgName: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("orgs")
    .update({ is_active: active })
    .eq("id", orgId);
  if (error) throw error;

  await supabase.from("audit_log").insert({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    org_id: orgId,
    user_id: user.id,
    action: active ? "activate_org" : "suspend_org",
    entity_type: "org",
    entity_id: orgId,
    details: { name: orgName },
    created_at: new Date().toISOString(),
  });
}

export async function deleteOrg(
  orgId: string,
  orgName: string,
  orgSlug: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Write an audit entry BEFORE deleting (cascade wipes it otherwise)
  // Park it under a null org_id so it survives.
  await supabase.from("audit_log").insert({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    org_id: null,
    user_id: user.id,
    action: "delete_org",
    entity_type: "org",
    entity_id: orgId,
    details: { name: orgName, slug: orgSlug },
    created_at: new Date().toISOString(),
  });

  const { error } = await supabase.from("orgs").delete().eq("id", orgId);
  if (error) throw error;
}

// ============================================================
// INVITE LOOKUP
// ============================================================

export interface InviteLookup {
  employee_id: string;
  org_id: string;
  invitee_name: string;
  invitee_email: string;
  org_name: string;
}

export async function lookupInvite(code: string): Promise<InviteLookup | null> {
  const { data, error } = await supabase.rpc("lookup_invite", { p_code: code });
  if (error || !data || data.length === 0) return null;
  return data[0];
}