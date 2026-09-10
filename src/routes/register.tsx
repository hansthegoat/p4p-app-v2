import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { P4PProvider, useP4P } from "@/lib/p4p/store";
import { register } from "@/lib/p4p/auth";
import { getDepartments, getRolesForDepartment } from "@/lib/p4p/kpi-templates";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

// Manager roles that should be auto-marked as supervisors
const MANAGER_ROLES = [
  "President",
  "Executive President",
  "Senior Vice President",
  "Vice President",
  "Head of Department",
  "Deputy Head of Department",
  "Line Manager",
  "Team Lead",
];

const searchSchema = z.object({
  email: z.string().optional(),
});

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
// Try to find a KPI template — but don't block registration if missing
const template = getTemplate(department, role);
const hasTemplate = !!template;

if (!hasTemplate) {
  // Just warn — don't block
  console.warn(`No KPI template for ${department} / ${role}. Employee will be created with empty KPIs.`);
}

      // Sign up with Supabase Auth (sends OTP email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            department,
            role,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Check if user needs email confirmation
      // Supabase sets `session` to null when email confirmation is required
      const needsVerification = !authData.session;

      // Store pending registration data to finish after OTP verification
      const pendingRegistration = {
        authUserId: authData.user.id,
        name,
        email,
        department,
        role,
      };
      localStorage.setItem("p4p_pending_registration", JSON.stringify(pendingRegistration));

      if (needsVerification) {
        // Redirect to OTP verification page
        showToast.success("Verification Code Sent", `Check ${email} for your 6-digit code.`);
        navigate({
          to: "/verify-otp",
          search: { email },
        });
      } else {
        // No verification needed (email confirmation is off) — create employee directly
        const isManager = MANAGER_ROLES.some((r) => r.toLowerCase() === role.toLowerCase());

const newEmployee = {
  id: authData.user.id,
  name,
  email,
  authUserId: authData.user.id,
  department,
  role,
  jobGrade: template?.jobGrade || "4",
  isAdjunct: false,
  isSalesRole: false,
  joinDate: new Date().toISOString().slice(0, 10),
  monthsWorked: 12,
  kpis: [],
  categories: template
    ? template.categories.map((cat: any) => ({
        id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: cat.name,
        weight: cat.weight,
        kpis: cat.kpis.map((k: any) => ({
          id: `kpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          description: k.description,
          metric: k.metric,
          target: k.target,
          actual: 0,
          weight: 100,
          measurementSource: k.measurementSource || "",
        })),
      }))
    : [], // ← Empty categories if no template
  roleType: "employee" as const,
  isManager,
  supervisorId: "",
  supervisorName: "",
  needsKpiSetup: !hasTemplate, // ← Flag for HR
};

        upsertEmployee(newEmployee);
        localStorage.removeItem("p4p_pending_registration");

        showToast.success("Account Created!", "You're now logged in.");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      console.error("Registration error:", err);
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
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4">
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div>
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole} disabled={!department || loading}>
              <SelectTrigger>
                <SelectValue
                  placeholder={department ? "Select your role" : "Select department first"}
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !department || !role}
          >
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
  validateSearch: searchSchema,
  component: () => (
    <P4PProvider>
      <RegisterForm />
    </P4PProvider>
  ),
});