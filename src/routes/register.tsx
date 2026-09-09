import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { P4PProvider, useP4P } from "@/lib/p4p/store";
import { register, login } from "@/lib/p4p/auth";
import { getDepartments, getRolesForDepartment, getTemplateByDepartmentAndRole } from "@/lib/p4p/kpi-templates";
import { newId } from "@/lib/p4p/defaults";

// Manager roles that should be auto-marked as supervisors
const MANAGER_ROLES = [
  "President",
  "Executive President",
  "Senior Vice President",
  "Vice President",
  "Head of Department",
  "Deputy Head of Department",
  "Line Manager/SBU Head",
  "Team Lead",
];

function RegisterForm() {
  const navigate = useNavigate();
  const { upsertEmployee, getTemplate } = useP4P();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  const departments = getDepartments();

  useEffect(() => {
    if (department) {
      setRoles(getRolesForDepartment(department));
      setRole("");
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(email, password);

      const template = getTemplateByDepartmentAndRole(department, role);
      if (!template) {
        setError(`No KPI framework defined for ${department} / ${role}. Please contact HR.`);
        setLoading(false);
        return;
      }

      // Check if this role should be a manager
      const isManager = MANAGER_ROLES.some(r => 
        r.toLowerCase() === role.toLowerCase()
      );

      const newEmployee = {
        id: newId(),
        name,
        email,
        department,
        role,
        jobGrade: template.jobGrade || "4",
        isAdjunct: false,
        isSalesRole: false,
        joinDate: new Date().toISOString().slice(0, 10),
        monthsWorked: 12,
        kpis: [],
        categories: template.categories.map(cat => ({
          id: newId(),
          name: cat.name,
          weight: cat.weight,
          kpis: cat.kpis.map(k => ({
            id: newId(),
            description: k.description,
            metric: k.metric,
            target: k.target,
            actual: 0,
            weight: 100,
            measurementSource: k.measurementSource || "",
          })),
        })),
        roleType: "employee",
        isManager: isManager,
        supervisorId: "",
        supervisorName: "",
      };

      upsertEmployee(newEmployee);
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Register to access your performance dashboard
        </p>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole} disabled={!department}>
              <SelectTrigger>
                <SelectValue placeholder={department ? "Select your role" : "Select department first"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !department || !role}>
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Already have an account?{" "}
          <button
            onClick={() => navigate({ to: "/login" })}
            className="text-primary hover:underline"
          >
            Sign In
          </button>
        </p>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/register")({
  component: () => (
    <P4PProvider>
      <RegisterForm />
    </P4PProvider>
  ),
});