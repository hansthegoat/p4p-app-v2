import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS, fmtNum } from "@/lib/p4p/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, UserPlus, Trash2, Edit2, 
  Upload, FileSpreadsheet, X
} from "lucide-react";
import { EmployeeModal } from "@/components/p4p/EmployeeModal";
import { DeleteConfirmModal } from "@/components/p4p/DeleteConfirmModal";
import { deleteSupabaseUser, findUserByEmail } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const { 
    employees, 
    calc, 
    removeEmployee, 
    clearEmployees, 
    loadDemo, 
    hardDeleteEmployee,
    getPerformanceTrend 
  } = useP4P();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"company" | "individual">("company");

  const filteredEmployees = employees.filter(emp => {
    if (emp.isAdjunct) return false;
    const searchLower = search.toLowerCase();
    return (
      emp.name.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower) ||
      emp.role.toLowerCase().includes(searchLower)
    );
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aCalc = calc.perEmployee[a.id];
    const bCalc = calc.perEmployee[b.id];
    const aScore = aCalc?.performanceMultiplier || 0;
    const bScore = bCalc?.performanceMultiplier || 0;
    return bScore - aScore;
  });

  // ===== HANDLE DELETE =====
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      if (!employeeToDelete.authUserId) {
        console.log("No authUserId found, trying to find by email:", employeeToDelete.email);
        
        try {
          const foundUser = await findUserByEmail(employeeToDelete.email);
          
          if (foundUser) {
            const { success, error } = await deleteSupabaseUser(foundUser.id);
            if (!success) {
              console.error("Error deleting user:", error);
              hardDeleteEmployee(employeeToDelete.id);
              showToast.warning("Partial Deletion", `${employeeToDelete.name} removed from app, but could not delete from Supabase Auth. Please manually delete them.`);
              return;
            }
            hardDeleteEmployee(employeeToDelete.id);
            showToast.success("Employee Deleted", `${employeeToDelete.name} has been permanently deleted.`);
            return;
          } else {
            hardDeleteEmployee(employeeToDelete.id);
            showToast.success("Employee Removed", `${employeeToDelete.name} removed from app (no Supabase Auth account found).`);
            return;
          }
        } catch (err) {
          console.error("Error finding user:", err);
          hardDeleteEmployee(employeeToDelete.id);
          showToast.warning("Partial Deletion", `${employeeToDelete.name} removed from app, but could not delete from Supabase Auth. Please manually delete them.`);
          return;
        }
      }

      const { success, error } = await deleteSupabaseUser(employeeToDelete.authUserId);
      
      if (!success) {
        console.error("Failed to delete from Supabase Auth:", error);
        hardDeleteEmployee(employeeToDelete.id);
        showToast.warning("Partial Deletion", `${employeeToDelete.name} removed from app but could not delete from Supabase Auth: ${error}.`);
        return;
      }
      
      hardDeleteEmployee(employeeToDelete.id);
      showToast.success("Employee Deleted", `${employeeToDelete.name} has been permanently deleted.`);
    } catch (err: any) {
      showToast.error("Deletion Failed", err.message);
    }
  };

  // ===== HANDLE CLEAR ALL =====
  const handleClearAll = () => {
    if (confirm("⚠️ Delete ALL employees? This cannot be undone.")) {
      clearEmployees();
      showToast.success("All Cleared", "All employees have been removed.");
    }
  };

  // ===== HANDLE LOAD DEMO =====
  const handleLoadDemo = () => {
    if (employees.length > 0) {
      if (!confirm("This will replace all current employees. Continue?")) {
        return;
      }
    }
    loadDemo();
    showToast.success("Demo Loaded", "Demo employees have been loaded.");
  };

  const getMultiplierColor = (mult: number) => {
    if (mult >= 1.0) return "text-green-600";
    if (mult >= 0.8) return "text-blue-600";
    if (mult >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">👥 Employees</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage employees with weighted category KPIs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" /> Add
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" /> Template
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" /> Upload CSV
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleLoadDemo}
            className="flex items-center gap-1"
          >
            Demo
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleClearAll}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-end">
            <div className="flex gap-1 bg-muted p-1 rounded-md">
              <Button
                size="sm"
                variant={viewMode === 'company' ? 'default' : 'ghost'}
                onClick={() => setViewMode('company')}
                className="text-xs h-7 px-3"
              >
                Company Mode
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'individual' ? 'default' : 'ghost'}
                onClick={() => setViewMode('individual')}
                className="text-xs h-7 px-3"
              >
                Individual Mode
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Employee Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Multiplier</TableHead>
              <TableHead>Months</TableHead>
              <TableHead>Final Bonus</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No employees found. Add one or load demo data.
                </TableCell>
              </TableRow>
            ) : (
              sortedEmployees.map((emp) => {
                const empCalc = calc.perEmployee[emp.id];
                const trend = getPerformanceTrend(emp.id);
                
                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {emp.name}
                        {emp.isSalesRole && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                            Sales
                          </Badge>
                        )}
                        {emp.isAdjunct && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
                            Adjunct
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{emp.jobGrade || '-'}</TableCell>
                    <TableCell>
                      {emp.isAdjunct ? '6' : empCalc?.gradePoints?.toFixed(1) || '-'}
                    </TableCell>
                    <TableCell>
                      {emp.isSalesRole ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Yes</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {emp.isAdjunct ? (
                        '—'
                      ) : (
                        <span className={`font-bold ${getMultiplierColor(empCalc?.performanceMultiplier || 0)}`}>
                          {fmtNum(empCalc?.performanceMultiplier || 0, 2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {emp.isAdjunct ? '—' : (emp.monthsWorked || 12)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600">
                        {fmtGHS(empCalc?.bonus || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingEmployee(emp);
                            setModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setEmployeeToDelete(emp);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Employee Modal (Add/Edit) */}
      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && employeeToDelete && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setEmployeeToDelete(null);
          }}
          onConfirm={handleDeleteEmployee}
          employeeName={employeeToDelete.name}
          employeeEmail={employeeToDelete.email || 'No email'}
        />
      )}
    </div>
  );
}