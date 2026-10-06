import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useP4P } from "@/lib/p4p/store";
import { getDepartments, getRolesForDepartment } from "@/lib/p4p/kpi-templates";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { DEFAULT_ORG_ID } from "@/lib/p4p/constants";
import { checkPassword, passwordColor } from "@/lib/p4p/password";
import { lookupInvite, type InviteLookup } from "@/lib/p4p/admin-data";
import { Check, X, Eye, EyeOff, Sparkles, Building2 } from "lucide-react";

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
  invite: z.string().optional(),
});

function StrengthBar({ value }: { value: string }) {
  const check = checkPassword(value);
  if (!value) return null;

  return (
    <>
      <div className="flex gap-1 mt-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < check.score ? passwordColor(check.score) : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="text-[10px] text-muted-foreground leading-tight">
          {check.errors.length > 0 ? (
            <ul className="space-y-0.5">
              {check.errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">
              ✓ Password is {check.label.toLowerCase()}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium shrink-0">{check.label}</span>
      </div>
    </>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/register" }) as { email?: string; invite?: string };
  const inviteCode = search.invite || "";
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
  const [invite, setInvite] = useState<InviteLookup | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const departments = getDepartments();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // If invite code is present, look it up and prefill
  useEffect(() => {
    if (!inviteCode) return;
    let cancelled = false;
    setInviteLoading(true);
    lookupInvite(inviteCode)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setInviteError(
            "This invite link has expired or has already been used. Ask your administrator for a new one."
          );
        } else {
          setInvite(result);
          setName(result.invitee_name);
          setEmail(result.invitee_email);
          // HR's dept/role are pre-set by admin — kept on the employee row.
          // The form fields below will be hidden while invite is present.
          setDepartment("Human Resources");
          setRole("Head of Department");
        }
      })
      .finally(() => {
        if (!cancelled) setInviteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  useEffect(() => {
    if (!invite && department) {
      setRoles(getRolesForDepartment(department));
    }
  }, [department, invite]);

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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, invite: inviteCode || undefined },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user account");

      const needsVerification = !authData.session;

      // Store pending registration. When invite is present, we pass the
      // invite details so verify-otp can claim the existing row.
      const pendingRegistration = {
        authUserId: authData.user.id,
        name,
        email,
        department,
        role,
        inviteCode: inviteCode || undefined,
        orgId: invite?.org_id || undefined,
        inviteEmployeeId: invite?.employee_id || undefined,
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

      // No email verification — finalize immediately
      if (invite) {
        // Link to pre-created row
        const { error: linkError } = await supabase
          .from("employees")
          .update({ auth_id: authData.user.id, invite_code: null })
          .eq("invite_code", inviteCode);
        if (linkError) {
          console.error("Failed to link invite:", linkError);
          showToast.error("Could not link invite", linkError.message);
        }
      } else {
        // Fresh employee signup
        const template = getTemplate(department, role);
        const hasTemplate = !!template;
        const isManager = MANAGER_ROLES.some(
          (r) => r.toLowerCase() === role.toLowerCase()
        );

        const dbRow = {
          id: authData.user.id,
          org_id: DEFAULT_ORG_ID,
          auth_id: authData.user.id,
          name,
          email: email.toLowerCase().trim(),
          department,
          role,
          job_grade: template?.jobGrade || "4",
          is_adjunct: false,
          is_sales_role: false,
          is_manager: isManager,
          supervisor_id: null,
          supervisor_name: null,
          join_date: new Date().toISOString().slice(0, 10),
          months_worked: 12,
          role_type: "employee",
          role_status: "active",
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
          kpis: [],
          needs_kpi_setup: !hasTemplate,
        };

        const { error: dbError } = await supabase
          .from("employees")
          .upsert(dbRow, { onConflict: "id" });

        if (dbError) {
          console.error("Failed to save employee:", dbError);
          showToast.error("Profile sync failed", dbError.message);
        }
      }

      localStorage.removeItem("p4p_pending_registration");
      showToast.success("Account Created!", "You're now logged in.");
      localStorage.removeItem("p4p_onboarding_done");
      localStorage.setItem("p4p_welcome_tour_pending", "true");
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    name.trim() &&
    email.trim() &&
    pwCheck.ok &&
    passwordsMatch &&
    (invite || (department && role));

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-0.5">
          {invite ? "Accept your invitation" : "Create your account"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {invite
            ? `Complete your account setup for ${invite.org_name}`
            : "Register to access your performance dashboard"}
        </p>
      </div>

      {/* Invite banner */}
      {inviteLoading && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mb-3 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Validating invite...
        </div>
      )}

      {invite && (
        <div className="text-xs bg-violet-500/5 border border-violet-500/20 text-violet-800 dark:text-violet-300 p-3 rounded mb-3">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">You've been invited to {invite.org_name}</div>
              <div className="text-[10.5px] opacity-80 mt-0.5">
                You'll join as <strong>HR — Head of Department</strong>. Your
                name and email are pre-filled below.
              </div>
              <div className="text-[11px] font-medium mt-2 pt-2 border-t border-violet-500/20">
                👉 Set a password below to complete your account setup.
              </div>
            </div>
          </div>
        </div>
      )}

      {inviteError && (
        <div className="text-xs bg-red-500/5 border border-red-500/20 text-red-800 dark:text-red-300 p-3 rounded mb-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{inviteError}</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-2.5 rounded mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Full Name</Label>
            <Input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || !!invite}
              className={`h-9 mt-1 ${invite ? "bg-muted/50" : ""}`}
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || !!invite}
              className={`h-9 mt-1 ${invite ? "bg-muted/50" : ""}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          <div>
            <Label className="text-xs">Password</Label>
            <div className="relative mt-1">
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
                className={`pr-9 h-9 ${
                  password.length > 0 && pwCheck.ok
                    ? "border-emerald-500/50 focus-visible:ring-emerald-500/30"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <StrengthBar value={password} />
          </div>

          <div>
            <Label className="text-xs">Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                className={`pr-14 h-9 ${
                  passwordsMatch
                    ? "border-emerald-500/50 focus-visible:ring-emerald-500/30"
                    : passwordsMismatch
                    ? "border-red-500/50 focus-visible:ring-red-500/30"
                    : ""
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {confirmPassword.length > 0 && (
                  <>
                    {passwordsMatch ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
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
                  {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <StrengthBar value={confirmPassword} />
          </div>
        </div>

        {/* Dept / Role pickers — hidden when invite is present */}
        {!invite && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Department</Label>
              <Select value={department} onValueChange={setDepartment} disabled={loading}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept, idx) => (
                    <SelectItem key={`dept-${idx}-${dept}`} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={!department || loading}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue
                    placeholder={department ? "Select role" : "Select dept first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r, idx) => (
                    <SelectItem key={`role-${idx}-${r}`} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-9 mt-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white"
          disabled={!canSubmit}
        >
          {loading
            ? "Creating Account..."
            : invite
            ? "Accept Invitation & Create Account"
            : "Register"}
        </Button>
      </form>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/register")({
  validateSearch: searchSchema,
  component: RegisterForm,
});