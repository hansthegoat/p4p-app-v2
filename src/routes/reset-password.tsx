import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { checkPassword, passwordColor } from "@/lib/p4p/password";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwCheck, setPwCheck] = useState(checkPassword(""));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    const pwResult = checkPassword(password);
    if (!pwResult.ok) {
      setError(pwResult.errors[0] || "Password doesn't meet requirements");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      showToast.success("Password updated", "Redirecting to sign in...");
      setTimeout(() => navigate({ to: "/login" }), 1500);
    } catch (err: any) {
      setError(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Set New Password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choose a new password for your account
        </p>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!ready ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Verifying your reset link...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPwCheck(checkPassword(e.target.value));
                }}
                required
                disabled={loading}
              />
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
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}