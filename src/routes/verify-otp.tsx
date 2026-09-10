import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";
import {
  Mail, Shield, RefreshCw, ArrowLeft, CheckCircle,
  AlertCircle, Loader2, Sparkles, KeyRound,
} from "lucide-react";

// Manager roles (mirrors register.tsx)
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

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes

export const Route = createFileRoute("/verify-otp")({
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/verify-otp" }) as { email?: string };
  const email = search.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const expired = secondsLeft <= 0;

  // Auto-focus first input
  useEffect(() => {
    if (inputs.current[0]) inputs.current[0]?.focus();
  }, []);

  // Resend cooldown counter
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // OTP expiry countdown
  useEffect(() => {
    if (expired || success) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [expired, success]);

  // If no email, kick back to register
  useEffect(() => {
    if (!email) navigate({ to: "/register" });
  }, [email, navigate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timerTone =
    expired
      ? "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/5"
      : secondsLeft <= 120
      ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
      : "text-muted-foreground border-border bg-muted/40";

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");

    if (digit && index < 5) inputs.current[index + 1]?.focus();

    if (digit && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) setTimeout(() => handleVerify(code), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
    setOtp(newOtp);
    if (pasted.length === 6) {
      setTimeout(() => handleVerify(pasted), 100);
    } else {
      inputs.current[pasted.length]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (expired) {
      setError("Code expired. Please request a new one.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });

      if (verifyError) throw verifyError;
      if (!data.user) throw new Error("Verification failed");

      // Finalize pending registration
      const pendingRaw = localStorage.getItem("p4p_pending_registration");
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);

          const { getTemplateByDepartmentAndRole } = await import("@/lib/p4p/kpi-templates");
          const template = getTemplateByDepartmentAndRole(pending.department, pending.role);
          const hasTemplate = !!template;

          const existingState = localStorage.getItem("p4p_state_v1");
          const state = existingState ? JSON.parse(existingState) : { employees: [] };
          if (!Array.isArray(state.employees)) state.employees = [];

          const alreadyExists = state.employees.some((e: any) => e.email === pending.email);
          if (!alreadyExists) {
            const isManager = MANAGER_ROLES.some(
              (r) => r.toLowerCase() === (pending.role || "").toLowerCase()
            );

            const newEmployee = {
              id: data.user.id,
              name: pending.name,
              email: pending.email,
              authUserId: data.user.id,
              department: pending.department,
              role: pending.role,
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

            state.employees.push(newEmployee);
            localStorage.setItem("p4p_state_v1", JSON.stringify(state));
          }

          localStorage.removeItem("p4p_pending_registration");
        } catch (storageErr) {
          console.error("Failed to save pending registration:", storageErr);
        }
      }

      setSuccess(true);
      showToast.success("Email Verified!", "Your account is ready.");

      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } catch (err: any) {
      console.error("Verify error:", err);
      setError(err.message || "Invalid or expired code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (resendError) throw resendError;

      // Reset the expiry countdown
      setSecondsLeft(OTP_TTL_SECONDS);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();

      showToast.success("Code Sent", `New code sent to ${email}`);
      setResendCooldown(60);
    } catch (err: any) {
      showToast.error("Could Not Resend", err.message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(otp.join(""));
  };

  // ─── Orbital animation state ─────────────────────────────
  const orbitState: "idle" | "loading" | "error" = loading
    ? "loading"
    : error
    ? "error"
    : "idle";

  const ringStroke =
    orbitState === "loading"
      ? "text-primary/40"
      : orbitState === "error"
      ? "text-red-500/40"
      : "text-border";

  const dotFill =
    orbitState === "loading"
      ? "bg-primary"
      : orbitState === "error"
      ? "bg-red-500"
      : "bg-primary";

  const hubClass =
    orbitState === "loading"
      ? "bg-primary/15 border-primary/30 text-primary"
      : orbitState === "error"
      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
      : "bg-primary/10 border-primary/20 text-primary";

  // ─── Success view ────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verified!</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is ready. Redirecting...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Main view ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          {/* Header with orbital animation */}
          <div className="text-center mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {/* Dashed orbit ring */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="2 6"
                  strokeLinecap="round"
                  className={ringStroke}
                />
              </svg>

              {/* Orbiting dot */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: loading ? 1.2 : 3.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center" }}
              >
                <div
                  className={`absolute top-[6px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${dotFill}`}
                />
              </motion.div>

              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${hubClass}`}
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Shield className="h-6 w-6" />
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3 justify-center">
                <KeyRound className="h-3.5 w-3.5" />
                Enter the 6-digit code
              </Label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={loading || expired}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 ${
                      digit ? "border-primary/40 bg-primary/5" : "border-border"
                    }`}
                  />
                ))}
              </div>

              {/* Countdown */}
              <div className="flex justify-center mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${timerTone}`}
                >
                  {expired ? (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Code expired — request a new one
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      Expires in {formatTime(secondsLeft)}
                    </>
                  )}
                </span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-800 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || otp.join("").length !== 6 || expired}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            <p className="text-xs text-muted-foreground mb-2">
              {expired ? "Code expired." : "Didn't receive the code?"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resending
                ? "Sending..."
                : "Resend Code"}
            </Button>
          </div>

          {/* Back */}
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <button
              onClick={() => navigate({ to: "/register" })}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to registration
            </button>
          </div>

          {/* Info */}
          <div className="mt-5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                Check your spam folder if you don't see the code within 2 minutes.
                The code expires after 5 minutes — use the resend button if needed.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}