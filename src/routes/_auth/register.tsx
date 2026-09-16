import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { P4PProvider, useP4P } from "@/lib/p4p/store";
import { getDepartments, getRolesForDepartment } from "@/lib/p4p/kpi-templates";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { checkPassword, passwordColor } from "@/lib/p4p/password";
import { Check, X, Eye, EyeOff } from "lucide-react";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [pwCheck, setPwCheck] = useState(checkPassword(""));

  const departments = getDepartments();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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

    const pwResult = checkPassword(password);
    if (!pwResult.ok) {
      setError(pwResult.errors[0] || "Password doesn't meet requirements");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const template = getTemplate(department, role);
      const hasTemplate = !!template;

      if (!hasTemplate) {
        console.warn(
          `No KPI template for ${department} / ${role}. Employee will be created with empty KPIs.`
        );
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, department, role },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user account");

      const needsVerification = !authData.session;

      const pendingRegistration = {
        authUserId: authData.user.id,
        name,
        email,
        department,
        role,
      };
      localStorage.setItem(
        "p4p_pending_registration",
        JSON.stringify(pendingRegistration)
      );

      if (needsVerification) {
        showToast.success(
          "Verification Code Sent",
          `Check ${email} for your 6-digit code.`
        );
        navigate({ to: "/verify-otp", search: { email } });
        return;
      }

      const isManager = MANAGER_ROLES.some(
        (r) => r.toLowerCase() === role.toLowerCase()
      );

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
          : [],
        roleType: "employee" as const,
        isManager,
        supervisorId: "",
        supervisorName: "",
        needsKpiSetup: !hasTemplate,
      };

      const dbRow = {
        id: newEmployee.id,
        auth_id: authData.user.id,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role,
        job_grade: newEmployee.jobGrade,
        is_adjunct: newEmployee.isAdjunct,
        is_sales_role: newEmployee.isSalesRole,
        is_manager: newEmployee.isManager,
        supervisor_id: newEmployee.supervisorId || null,
        supervisor_name: newEmployee.supervisorName || null,
        join_date: newEmployee.joinDate,
        months_worked: newEmployee.monthsWorked,
        role_type: newEmployee.roleType,
        categories: newEmployee.categories,
        kpis: newEmployee.kpis,
        needs_kpi_setup: newEmployee.needsKpiSetup,
      };

      const { error: dbError } = await supabase
        .from("employees")
        .upsert(dbRow, { onConflict: "id" });

      if (dbError) {
        console.error("Failed to save employee to Supabase:", dbError);
        showToast.error("Profile sync failed", dbError.message);
      }

      upsertEmployee(newEmployee);
      localStorage.removeItem("p4p_pending_registration");

      showToast.success("Account Created!", "You're now logged in.");

      // New accounts get the onboarding tour once
      if (!localStorage.getItem("p4p_onboarding_done")) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading && department && role && pwCheck.ok && passwordsMatch;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Register to access your performance dashboard
        </p>
      </div>

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

        {/* Password with show/hide */}
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwCheck(checkPassword(e.target.value));
              }}
              required
              disabled={loading}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < pwCheck.score ? passwordColor(pwCheck.score) : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-1.5 flex items-start justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  {pwCheck.errors.length > 0 ? (
                    <ul className="space-y-0.5">
                      {pwCheck.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✓ Password is {pwCheck.label.toLowerCase()}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium shrink-0">{pwCheck.label}</span>
              </div>
            </>
          )}
        </div>

        {/* Confirm Password with show/hide + match check */}
        <div>
          <Label>Confirm Password</Label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              className={`pr-16 ${
                passwordsMatch
                  ? "border-emerald-500/50 focus-visible:ring-emerald-500/30"
                  : passwordsMismatch
                  ? "border-red-500/50 focus-visible:ring-red-500/30"
                  : ""
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {confirmPassword.length > 0 && (
                <>
                  {passwordsMatch ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {passwordsMismatch && (
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-1.5">
              Passwords don't match
            </p>
          )}
          {passwordsMatch && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5">
              ✓ Passwords match
            </p>
          )}
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

        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {loading ? "Creating Account..." : "Register"}
        </Button>
      </form>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/register")({
  validateSearch: searchSchema,
  component: () => (
    <P4PProvider>
      <RegisterForm />
    </P4PProvider>
  ),
});