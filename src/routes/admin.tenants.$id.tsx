import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchOrgById,
  fetchEmployeesForOrg,
  fetchAuditLogForOrg,
  promoteToHR,
  revokeHR,
  updateEmployeeProfile,
  toggleOrgActive,
  deleteOrg,
  type OrgDetail,
  type OrgEmployee,
  type OrgAuditEntry,
} from "@/lib/p4p/admin-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import { createPortal } from "react-dom";
import { getDepartments, DEFAULT_ROLES } from "@/lib/p4p/kpi-templates";
import { DEFAULT_GRADES } from "@/lib/p4p/defaults";
import {
  ArrowLeft, Building2, Users, Shield, ShieldOff, Pencil, X, History,
  AlertTriangle, Trash2, Power, PowerOff,
} from "lucide-react";

export const Route = createFileRoute("/admin/tenants/$id")({
  component: TenantDetail,
});

function TenantDetail() {
  const navigate = useNavigate();
  const params = useParams({ from: "/admin/tenants/$id" }) as { id: string };
  const orgId = params.id;

  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [audit, setAudit] = useState<OrgAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<OrgEmployee | null>(null);
  const [busyOrg, setBusyOrg] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [o, e, a] = await Promise.all([
        fetchOrgById(orgId),
        fetchEmployeesForOrg(orgId),
        fetchAuditLogForOrg(orgId, 20),
      ]);
      setOrg(o);
      setEmployees(e);
      setAudit(a);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handlePromote = async (emp: OrgEmployee) => {
    if (!confirm(`Promote ${emp.name} to HR for this org?`)) return;
    setBusyId(emp.id);
    try {
      await promoteToHR(emp, orgId);
      showToast.success("Promoted", `${emp.name} is now an HR.`);
      await reload();
    } catch (err: any) {
      showToast.error("Promote failed", err.message);
    } finally {
      setBusyId(null);
    }
  };

    const handleToggleActive = async () => {
    if (!org) return;
    const activating = !org.is_active;
    const msg = activating
      ? `Reactivate ${org.name}? Users will regain access.`
      : `Suspend ${org.name}? Users will lose access immediately. Data is preserved.`;
    if (!confirm(msg)) return;
    setBusyOrg(true);
    try {
      await toggleOrgActive(org.id, activating, org.name);
      showToast.success(
        activating ? "Org activated" : "Org suspended",
        `${org.name} has been ${activating ? "reactivated" : "suspended"}.`
      );
      await reload();
    } catch (err: any) {
      showToast.error("Action failed", err.message);
    } finally {
      setBusyOrg(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!org) return;
    setBusyOrg(true);
    try {
      await deleteOrg(org.id, org.name, org.slug);
      showToast.success("Org deleted", `${org.name} and all its data removed.`);
      navigate({ to: "/admin" });
    } catch (err: any) {
      showToast.error("Delete failed", err.message);
    } finally {
      setBusyOrg(false);
      setDeleteConfirmOpen(false);
    }
  };
  const handleRevoke = async (emp: OrgEmployee) => {
    if (!confirm(`Revoke HR from ${emp.name}?`)) return;
    setBusyId(emp.id);
    try {
      await revokeHR(emp, orgId);
      showToast.success("Revoked", `${emp.name} is now a regular employee.`);
      await reload();
    } catch (err: any) {
      showToast.error("Revoke failed", err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading tenant...</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground mb-4">Tenant not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/admin" })}>
          Back to console
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/admin" })}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-violet-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{org.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">{org.slug}</span>
              {" · "}
              Created {new Date(org.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Employees */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            Employees ({employees.length})
          </h2>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-2.5 font-semibold">Name</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Department</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Role</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Grade</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{emp.name}</div>
                      <div className="text-[11px] text-muted-foreground">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.role || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {emp.job_grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {emp.role_type === "hr" ? (
                        <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30 gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          HR
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Employee
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {emp.role_type === "hr" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevoke(emp)}
                            disabled={busyId === emp.id}
                            className="h-8 px-2.5 gap-1.5 text-[11.5px] text-red-600 hover:text-red-700 hover:bg-red-500/10"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Revoke HR
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePromote(emp)}
                            disabled={busyId === emp.id}
                            className="h-8 px-2.5 gap-1.5 text-[11.5px] text-violet-600 hover:text-violet-700 hover:bg-violet-500/10"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            Promote to HR
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing(emp)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Audit log */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            Recent admin actions
          </h2>
        </div>
        {audit.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No admin actions recorded yet.
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {audit.map((entry) => (
              <div key={entry.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[12.5px] text-foreground">
                    <span className="font-mono text-violet-600">{entry.action}</span>
                    {entry.details?.name && (
                      <span className="text-muted-foreground"> · {entry.details.name}</span>
                    )}
                    {entry.details?.email && (
                      <span className="text-muted-foreground/70"> ({entry.details.email})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Danger zone */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-base font-semibold text-foreground">
            Danger zone
          </h2>
        </div>
        <Card className="border-red-200 dark:border-red-900/40 overflow-hidden">
          <div className="p-5 flex items-center justify-between gap-4 flex-wrap border-b border-red-200 dark:border-red-900/40">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {org.is_active ? "Suspend organization" : "Reactivate organization"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {org.is_active
                  ? "Users lose access. Data is preserved. You can reactivate anytime."
                  : "Restore full access for all users in this org."}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleToggleActive}
              disabled={busyOrg}
              className="gap-1.5 shrink-0"
            >
              {org.is_active ? (
                <>
                  <PowerOff className="h-3.5 w-3.5" />
                  Suspend
                </>
              ) : (
                <>
                  <Power className="h-3.5 w-3.5" />
                  Reactivate
                </>
              )}
            </Button>
          </div>

          <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                Delete organization
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Permanently deletes this org and ALL its data: employees, KPIs, appraisals, notifications. Cannot be undone.
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={busyOrg}
              className="gap-1.5 shrink-0 border-red-300 text-red-700 hover:bg-red-500/10 hover:text-red-800 dark:border-red-900/60 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete org
            </Button>
          </div>
        </Card>
      </div>


      {/* Edit modal */}
      {editing && (
        <EditEmployeeModal
          employee={editing}
          orgId={orgId}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
          }}
        />
      )}

      {/* Delete modal */}
      {deleteConfirmOpen && org && (
        <DeleteOrgModal
          org={org}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteOrg}
        />
      )}
    </div>
  );
}

function DeleteOrgModal({
  org,
  onClose,
  onConfirm,
}: {
  org: OrgDetail;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = input.trim() === org.slug;

  const handleConfirm = async () => {
    if (!matches) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 shadow-2xl border-red-300 dark:border-red-900/40">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Delete {org.name}?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                This is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4 text-[12.5px] text-red-800 dark:text-red-300">
            All employees, KPIs, appraisals, notifications, and audit entries for
            this org will be deleted. This action is logged.
          </div>

          <div>
            <Label className="text-xs">
              Type the slug <span className="font-mono text-foreground">{org.slug}</span> to confirm
            </Label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={org.slug}
              className="mt-1.5 font-mono"
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 mt-5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={busy}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!matches || busy}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white disabled:opacity-40"
            >
              {busy ? "Deleting..." : "Delete permanently"}
            </Button>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  );
}

function EditEmployeeModal({
  employee,
  orgId,
  onClose,
  onSaved,
}: {
  employee: OrgEmployee;
  orgId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [department, setDepartment] = useState(employee.department || "");
  const [role, setRole] = useState(employee.role || "");
  const [jobGrade, setJobGrade] = useState(employee.job_grade || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmployeeProfile(
        employee.id,
        { department, role, job_grade: jobGrade },
        orgId,
        employee.name,
        employee.email
      );
      showToast.success("Updated", `${employee.name}'s profile updated.`);
      onSaved();
    } catch (err: any) {
      showToast.error("Update failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Edit employee
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {employee.name} · {employee.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {getDepartments().map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Job Grade</Label>
              <Select value={jobGrade} onValueChange={setJobGrade}>
                <SelectTrigger className="mt-1.5 font-mono">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_GRADES.map((g) => (
                    <SelectItem key={g.code} value={g.code} className="font-mono">
                      {g.code} — {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  );
}

