import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Users, CheckCircle, XCircle, Search, RefreshCw, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_app/supervisors")({
  component: SupervisorsPage,
});

function SupervisorsPage() {
  const { employees, upsertEmployee } = useP4P();
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("");
  const [editingSupervisor, setEditingSupervisor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get all managers
  const managers = useMemo(() => {
    return employees.filter(e => e.isManager === true);
  }, [employees]);

  // Get all employees (non-managers) with their supervisors
  const employeesWithSupervisors = useMemo(() => {
    return employees
      .filter(e => !e.isManager)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employeesWithSupervisors;
    const term = search.toLowerCase();
    return employeesWithSupervisors.filter(e => 
      e.name.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term) ||
      (e.supervisorName && e.supervisorName.toLowerCase().includes(term))
    );
  }, [employeesWithSupervisors, search]);

  // Get supervisor name by ID
  const getSupervisorName = (id: string | undefined) => {
    if (!id) return "None";
    const supervisor = employees.find(e => e.id === id);
    return supervisor ? supervisor.name : "Unknown";
  };

  // Assign supervisor
  const handleAssignSupervisor = (employeeId: string, supervisorId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const supervisor = employees.find(e => e.id === supervisorId);
    
    upsertEmployee({
      ...employee,
      supervisorId: supervisorId || undefined,
      supervisorName: supervisor?.name || "",
    });

    setSelectedEmployee(null);
    setEditingSupervisor(null);
    setSelectedSupervisor("");
  };

  // Toggle manager status
  const toggleManager = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const confirmMsg = employee.isManager 
      ? `Remove ${employee.name} as a manager?` 
      : `Make ${employee.name} a manager?`;
    
    if (confirm(confirmMsg)) {
      upsertEmployee({
        ...employee,
        isManager: !employee.isManager,
      });
    }
  };

  // Stats
  const totalEmployees = employees.filter(e => !e.isManager).length;
  const assignedEmployees = employees.filter(e => e.supervisorId && !e.isManager).length;
  const unassignedEmployees = totalEmployees - assignedEmployees;
  const totalManagers = managers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👤 Supervisor Assignment</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Assign managers/supervisors to employees for appraisal reviews.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <div className="text-xs text-muted-foreground">Total Employees</div>
        </Card>
        <Card className="p-4 text-center border-green-200 bg-green-50/50">
          <div className="text-2xl font-bold text-green-600">{assignedEmployees}</div>
          <div className="text-xs text-green-600">Assigned to Supervisor</div>
        </Card>
        <Card className="p-4 text-center border-yellow-200 bg-yellow-50/50">
          <div className="text-2xl font-bold text-yellow-600">{unassignedEmployees}</div>
          <div className="text-xs text-yellow-600">Unassigned</div>
        </Card>
        <Card className="p-4 text-center border-blue-200 bg-blue-50/50">
          <div className="text-2xl font-bold text-blue-600">{totalManagers}</div>
          <div className="text-xs text-blue-600">Managers</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Search Employees</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, or supervisor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearch("")}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Managers List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" /> Managers ({totalManagers})
        </h3>
        <div className="flex flex-wrap gap-2">
          {managers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No managers defined yet. Make someone a manager below.</p>
          ) : (
            managers.map((m) => (
              <Badge key={m.id} variant="outline" className="px-3 py-1.5 text-sm bg-blue-50 border-blue-200">
                <User className="h-3 w-3 mr-1" />
                {m.name} ({m.department})
              </Badge>
            ))
          )}
        </div>
      </Card>

      {/* Employee List */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => {
                const hasSupervisor = !!emp.supervisorId;
                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>
                      {hasSupervisor ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {emp.supervisorName || getSupervisorName(emp.supervisorId)}
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasSupervisor ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingSupervisor === emp.id ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedSupervisor}
                              onValueChange={setSelectedSupervisor}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select supervisor" />
                              </SelectTrigger>
                              <SelectContent>
                               <SelectItem value="none">None</SelectItem>
                                {managers
                                  .filter(m => m.id !== emp.id)
                                  .map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name} ({m.department})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => {
                                if (!selectedSupervisor) {
                                  alert("Please select a supervisor.");
                                  return;
                                }
                                handleAssignSupervisor(emp.id, selectedSupervisor);
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingSupervisor(null);
                                setSelectedSupervisor("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSupervisor(emp.id);
                                setSelectedSupervisor(emp.supervisorId || "");
                              }}
                            >
                              Assign
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (hasSupervisor && confirm(`Remove supervisor from ${emp.name}?`)) {
                                  handleAssignSupervisor(emp.id, "");
                                }
                              }}
                              disabled={!hasSupervisor}
                            >
                              Remove
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`text-blue-500 hover:text-blue-700 hover:bg-blue-50 ${
                                emp.isManager ? 'bg-blue-50 text-blue-700' : ''
                              }`}
                              onClick={() => toggleManager(emp.id)}
                              title={emp.isManager ? "Remove as manager" : "Make manager"}
                            >
                              {emp.isManager ? '👑' : '➕'}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Instructions */}
      <Card className="p-4 border-blue-200 bg-blue-50/50">
        <h3 className="font-semibold text-sm text-blue-800 mb-2">💡 How It Works</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Click <strong>"Assign"</strong> next to an employee to set their supervisor/manager.</li>
          <li>Managers will only see their direct reports in the Review Appraisals page.</li>
          <li>Click <strong>"👑"</strong> to make someone a manager (or remove manager status).</li>
          <li>An employee without a supervisor will appear as "Unassigned".</li>
        </ul>
      </Card>
    </div>
  );
}