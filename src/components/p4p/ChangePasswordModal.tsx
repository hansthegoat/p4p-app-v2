import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { checkPassword, passwordColor } from "@/lib/p4p/password";
import { KeyRound, Loader2, Eye, EyeOff, Check, X } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwCheck, setPwCheck] = useState(checkPassword(""));

  // 👈 password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    setPwCheck(checkPassword(""));
    setShowCurrent(false);
    setShowNext(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  // 👈 live match check (only shows once user types in confirm)
  const confirmTouched = confirm.length > 0;
  const passwordsMatch = next === confirm && confirm.length > 0;
  const confirmMismatch = confirmTouched && !passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!current) {
      setError("Enter your current password");
      return;
    }

    const pwResult = checkPassword(next);
    if (!pwResult.ok) {
      setError(pwResult.errors[0] || "New password doesn't meet requirements");
      return;
    }

    if (next !== confirm) {
      setError("New passwords don't match");
      return;
    }

    if (current === next) {
      setError("New password must be different from the current one");
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) throw new Error("Not signed in");

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (signInErr) {
        setError("Current password is incorrect");
        setLoading(false);
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password: next,
      });
      if (updateErr) throw updateErr;

      showToast.success(
        "Password changed",
        "Use your new password next time you sign in."
      );
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update your account password. You'll use the new one next time you sign in.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-[13px] text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <Label>Current password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <Label>New password</Label>
            <div className="relative">
              <Input
                type={showNext ? "text" : "password"}
                placeholder="••••••••"
                value={next}
                onChange={(e) => {
                  setNext(e.target.value);
                  setPwCheck(checkPassword(e.target.value));
                }}
                required
                disabled={loading}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showNext ? "Hide password" : "Show password"}
              >
                {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {next.length > 0 && (
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

          {/* Confirm new password — 👈 with visibility toggle + live match check */}
          <div>
            <Label>Confirm new password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                className={`pr-10 ${
                  confirmMismatch
                    ? "border-red-500 focus-visible:ring-red-500"
                    : passwordsMatch
                    ? "border-emerald-500 focus-visible:ring-emerald-500"
                    : ""
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {passwordsMatch && (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                {confirmMismatch && (
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  disabled={loading}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 👈 live feedback under the confirm field */}
            {confirmTouched && (
              <div className="mt-1.5 text-[11px]">
                {passwordsMatch ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <X className="h-3 w-3" /> Passwords don't match yet
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (confirmTouched && !passwordsMatch)}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}