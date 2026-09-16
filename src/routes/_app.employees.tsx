import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageTour } from "@/hooks/usePageTour";
import { PAGE_TOURS } from "@/lib/p4p/tours";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Search, UserPlus, Trash2, Edit2, Upload, FileSpreadsheet,
  X, Users, Award, TrendingUp, AlertTriangle, Mail, Building2,
  AlertCircle,
} from "lucide-react";
import { EmployeeModal } from "@/components/p4p/EmployeeModal";
import { DeleteConfirmModal } from "@/components/p4p/DeleteConfirmModal";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const {
    employees,
    calc,
    clearEmployees,
    loadDemo,
    hardDeleteEmployee,
  } = useP4P();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);

  // ⭐ Exclude admins (they're operators, not employees)
  const realEmployees = employees.filter((e) => e.roleType !== "admin");

  const filteredEmployees = realEmployees.filter((emp) => {
    const s = search.toLowerCase();
    return (
      emp.name.toLowerCase().includes(s) ||
      emp.department.toLowerCase().includes(s) ||
      emp.role.toLowerCase().includes(s) ||
      (emp.email || "").toLowerCase().includes(s)
    );
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aScore = calc.perEmployee[a.id]?.performanceMultiplier || 0;
    const bScore = calc.perEmployee[b.id]?.performanceMultiplier || 0;
    return bScore - aScore;
  });

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    hardDeleteEmployee(employeeToDelete.id);
    showToast.success("Employee Removed", `${employeeToDelete.name} removed from app.`);
  };

  const handleClearAll = () => {
    if (confirm("⚠️ Delete ALL employees? This cannot be undone.")) {
      clearEmployees();
      showToast.success("All Cleared", "All employees have been removed.");
    }
  };

  const handleLoadDemo = () => {
    if (employees.length > 0 && !confirm("This will replace all current employees. Continue?")) return;
    loadDemo();
    showToast.success("Demo Loaded", "Demo employees have been loaded.");
  };

  const getMultiplierColor = (mult: number) => {
    if (mult >= 1.0) return "text-emerald-600 dark:text-emerald-400";
    if (mult >= 0.8) return "text-blue-600 dark:text-blue-400";
    if (mult >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const coreCount = realEmployees.filter((e) => !e.isAdjunct).length;
  const adjunctCount = realEmployees.filter((e) => e.isAdjunct).length;
  const managerCount = realEmployees.filter((e) => e.isManager).length;
  const needsKpiCount = realEmployees.filter((e) => e.needsKpiSetup).length;
  const avgMult =
    coreCount > 0
      ? realEmployees
          .filter((e) => !e.isAdjunct)
          .reduce((s, e) => s + (calc.perEmployee[e.id]?.performanceMultiplier || 0), 0) / coreCount
      : 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      <PageHeader
        title="Employees"
        description="Manage employee records, KPIs, supervisors, and performance data."
        icon={<Users className="h-6 w-6" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                setEditingEmployee(null);
                setModalOpen(true);
              }}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" /> Add Employee
            </Button>
            <Button size="sm" variant="outline" onClick={handleLoadDemo} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> Demo
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearAll} className="gap-2 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10">
              <X className="h-4 w-4" /> Clear All
            </Button>
          </div>
        }
      />

      {/* Alert banner for missing KPIs */}
      {needsKpiCount > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="p-4 bg-amber-500/5 border-amber-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {needsKpiCount} employee{needsKpiCount > 1 ? "s" : ""} need{needsKpiCount === 1 ? "s" : ""} KPIs assigned
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Open the employee, load a KPI template, and save.
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Employees"
          value={realEmployees.length}
          sub={`${coreCount} core · ${adjunctCount} adjunct`}
          accent="primary"
          size="large"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Managers"
          value={managerCount}
          accent="purple"
          size="large"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Multiplier"
          value={fmtNum(avgMult, 2)}
          accent="success"
          size="large"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Needs KPIs"
          value={needsKpiCount}
          accent={needsKpiCount > 0 ? "warning" : "default"}
          size="large"
          pulse={needsKpiCount > 0 ? "amber" : "none"}
        />
      </div>

      {/* Search */}
      <motion.div variants={fadeUp}>
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, department, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold text-center">Grade</TableHead>
                  <TableHead className="font-semibold text-center">Multiplier</TableHead>
                  <TableHead className="font-semibold text-center">Months</TableHead>
                  <TableHead className="font-semibold text-right">Bonus</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <EmptyState
                        icon={<Users className="h-6 w-6" />}
                        title={search ? "No matches found" : "No employees yet"}
                        description={
                          search
                            ? "Try a different search term."
                            : "Add your first employee or load demo data to get started."
                        }
                        action={
                          !search && (
                            <Button
                              onClick={() => {
                                setEditingEmployee(null);
                                setModalOpen(true);
                              }}
                              className="gap-2"
                            >
                              <UserPlus className="h-4 w-4" /> Add Employee
                            </Button>
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedEmployees.map((emp, idx) => {
                    const empCalc = calc.perEmployee[emp.id];
                    const mult = empCalc?.performanceMultiplier || 0;
                    const bonus = empCalc?.bonus || 0;

                    return (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        className="group hover:bg-accent/40 transition-colors border-b border-border/50"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm truncate">{emp.name}</span>
                                {emp.isSalesRole && (
                                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                                    Sales
                                  </Badge>
                                )}
                                {emp.isAdjunct && (
                                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                    Adjunct
                                  </Badge>
                                )}
                                {emp.isManager && (
                                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                    Manager
                                  </Badge>
                                )}
                                {emp.needsKpiSetup && (
                                  <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1">
                                    <AlertCircle className="h-2.5 w-2.5" />
                                    Needs KPIs
                                  </Badge>
                                )}
                              </div>
                              {emp.email && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[180px]">{emp.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {emp.department || "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm">{emp.role || "—"}</span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono text-xs">
                            {emp.jobGrade || "—"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          {emp.isAdjunct ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className={`font-bold text-sm ${getMultiplierColor(mult)}`}>
                              {fmtNum(mult, 2)}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="text-sm">{emp.isAdjunct ? "—" : emp.monthsWorked || 12}</span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                            {fmtGHS(bonus)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingEmployee(emp);
                                setModalOpen(true);
                              }}
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                              onClick={() => {
                                setEmployeeToDelete(emp);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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

      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />

      {deleteModalOpen && employeeToDelete && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setEmployeeToDelete(null);
          }}
          onConfirm={handleDeleteEmployee}
          employeeName={employeeToDelete.name}
          employeeEmail={employeeToDelete.email || "No email"}
        />
      )}
    </motion.div>
  );
}