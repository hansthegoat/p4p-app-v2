import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Users, UserPlus, Search, RefreshCw, CheckCircle, XCircle,
  Crown, UserMinus, UserCheck, Building2, Mail, Shield,
  ChevronRight, UserCog, Award,
} from "lucide-react";

export const Route = createFileRoute("/_app/supervisors")({
  component: SupervisorsPage,
});

function SupervisorsPage() {
  const { employees, upsertEmployee } = useP4P();
  const [search, setSearch] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("");
  const [editingSupervisor, setEditingSupervisor] = useState<string | null>(null);
  const [crownTarget, setCrownTarget] = useState<string | null>(null);

  const managers = useMemo(() => employees.filter((e) => e.isManager === true), [employees]);

  const employeesWithSupervisors = useMemo(
    () => employees.filter((e) => !e.isManager).sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employeesWithSupervisors;
    const t = search.toLowerCase();
    return employeesWithSupervisors.filter(
      (e) =>
        e.name.toLowerCase().includes(t) ||
        e.department.toLowerCase().includes(t) ||
        (e.supervisorName && e.supervisorName.toLowerCase().includes(t))
    );
  }, [employeesWithSupervisors, search]);

  const getSupervisorName = (id: string | undefined) => {
    if (!id) return "None";
    return employees.find((e) => e.id === id)?.name || "Unknown";
  };

  const handleAssignSupervisor = (employeeId: string, supervisorId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;
    const supervisor = employees.find((e) => e.id === supervisorId);

    upsertEmployee({
      ...employee,
      supervisorId: supervisorId || undefined,
      supervisorName: supervisor?.name || "",
    });

    setEditingSupervisor(null);
    setSelectedSupervisor("");
    showToast.success(
      supervisorId ? "Supervisor Assigned" : "Supervisor Removed",
      supervisorId ? `${employee.name} → ${supervisor?.name}` : `${employee.name} is now unassigned.`
    );
  };

  const confirmToggleManager = () => {
    if (!crownTarget) return;
    const employee = employees.find((e) => e.id === crownTarget);
    if (!employee) return;

    upsertEmployee({ ...employee, isManager: !employee.isManager });
    showToast.success(
      employee.isManager ? "Manager Status Removed" : "Manager Status Added",
      employee.name
    );
    setCrownTarget(null);
  };

  const totalEmployees = employees.filter((e) => !e.isManager).length;
  const assigned = employees.filter((e) => e.supervisorId && !e.isManager).length;
  const unassigned = totalEmployees - assigned;
  const totalManagers = managers.length;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* 👈 ADDED data-tour wrapper */}
      <div data-tour="supervisors-header">
        <PageHeader
          title="Supervisor Assignment"
          description="Assign managers to employees for appraisal reviews and team oversight."
          icon={<UserCog className="h-6 w-6" />}
          actions={
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />
      </div>

      {/* Stats — 👈 ADDED data-tour */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="supervisors-stats">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Employees"
          value={totalEmployees}
          accent="primary"
          size="large"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4" />}
          label="Assigned"
          value={assigned}
          sub={totalEmployees > 0 ? `${Math.round((assigned / totalEmployees) * 100)}% coverage` : undefined}
          accent="success"
          size="large"
        />
        <StatCard
          icon={<UserMinus className="h-4 w-4" />}
          label="Unassigned"
          value={unassigned}
          accent="warning"
          size="large"
          pulse={unassigned > 0 ? "amber" : "none"}
        />
        <StatCard
          icon={<Crown className="h-4 w-4" />}
          label="Managers"
          value={totalManagers}
          accent="purple"
          size="large"
        />
      </div>

      {/* Managers list — 👈 ADDED data-tour */}
      <motion.div variants={fadeUp} data-tour="supervisors-managers">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Crown className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Managers</h3>
                <p className="text-xs text-muted-foreground">{totalManagers} active managers</p>
              </div>
            </div>
          </div>

          {managers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No managers defined yet. Toggle the crown icon below to promote an employee.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {managers.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <Crown className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium">{m.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {m.department}</span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp}>
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or supervisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </Card>
      </motion.div>

      {/* Employee table — 👈 ADDED data-tour */}
      <motion.div variants={fadeUp} data-tour="supervisors-list">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Supervisor</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <EmptyState
                        icon={<Users className="h-6 w-6" />}
                        title={search ? "No matches" : "No employees"}
                        description={
                          search ? "Try a different search." : "Add employees first to assign supervisors."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp, idx) => {
                    const hasSupervisor = !!emp.supervisorId;
                    const isEditing = editingSupervisor === emp.id;

                    return (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        className="border-b border-border/50 hover:bg-accent/40 transition-colors"
                      >
                        {/* Employee */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{emp.name}</div>
                              {emp.email && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[140px]">{emp.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {emp.department || "—"}
                          </span>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <span className="text-sm">{emp.role || "—"}</span>
                        </TableCell>

                        {/* Supervisor */}
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-2 min-w-[200px]">
                              <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                                <SelectTrigger className="h-8 flex-1">
                                  <SelectValue placeholder="Select supervisor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {managers
                                    .filter((m) => m.id !== emp.id)
                                    .map((m) => (
                                      <SelectItem key={m.id} value={m.id}>
                                        {m.name} ({m.department})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="h-8 px-2 gap-1"
                                onClick={() => {
                                  if (!selectedSupervisor) {
                                    showToast.warning("Select Supervisor", "Please choose a supervisor.");
                                    return;
                                  }
                                  handleAssignSupervisor(
                                    emp.id,
                                    selectedSupervisor === "none" ? "" : selectedSupervisor
                                  );
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                onClick={() => {
                                  setEditingSupervisor(null);
                                  setSelectedSupervisor("");
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : hasSupervisor ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-sm font-medium">
                                {emp.supervisorName || getSupervisorName(emp.supervisorId)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <XCircle className="h-4 w-4 shrink-0" />
                              <span className="text-sm font-medium">Unassigned</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          {hasSupervisor ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
                              <CheckCircle className="h-3 w-3" /> Assigned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
                              <XCircle className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isEditing && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => {
                                  setEditingSupervisor(emp.id);
                                  setSelectedSupervisor(emp.supervisorId || "none");
                                }}
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                {hasSupervisor ? "Change" : "Assign"}
                              </Button>
                            )}
                            {hasSupervisor && !isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                onClick={() => handleAssignSupervisor(emp.id, "")}
                                title="Remove supervisor"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-8 w-8 p-0 ${
                                emp.isManager
                                  ? "text-amber-600 hover:bg-amber-500/10"
                                  : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
                              }`}
                              onClick={() => setCrownTarget(emp.id)}
                              title={emp.isManager ? "Remove as manager" : "Make manager"}
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>

      {/* How it works */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300">
                How Supervisor Assignment Works
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Click <strong>Assign</strong> next to an employee to set their supervisor.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Managers only see their <strong>direct reports</strong> in the appraisals review page.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Click the <strong>crown icon</strong> to promote or demote a manager.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                  Employees without a supervisor appear as <strong>Unassigned</strong>.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={!!crownTarget} onOpenChange={(open) => !open && setCrownTarget(null)}>
        <DialogContent className="max-w-sm p-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              {employees.find((employee) => employee.id === crownTarget)?.isManager
                ? "Remove manager status?"
                : "Promote to manager?"}
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              {employees.find((employee) => employee.id === crownTarget)?.isManager
                ? "They will no longer appear as a supervisor option for other employees."
                : "They will be able to be assigned as a supervisor to other employees."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setCrownTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmToggleManager}
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white"
            >
              <Crown className="h-3.5 w-3.5" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}