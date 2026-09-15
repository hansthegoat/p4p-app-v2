import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { checkPassword, passwordColor } from "@/lib/p4p/password";
import { KeyRound, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/change-password")({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwCheck, setPwCheck] = useState(checkPassword(""));

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

      showToast.success("Password changed", "Use your new password next time you sign in.");
      setCurrent("");
      setNext("");
      setConfirm("");
      setPwCheck(checkPassword(""));
    } catch (err: any) {
      setError(err.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <PageHeader
        title="Change Password"
        description="Update your account password."
        icon={<KeyRound className="h-6 w-6" />}
      />

      <Card className="p-5">
        {error && (
          <div className="text-[13px] text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div>
            <Label>New password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={next}
              onChange={(e) => {
                setNext(e.target.value);
                setPwCheck(checkPassword(e.target.value));
              }}
              required
              disabled={loading}
              autoComplete="new-password"
            />

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

          <div>
            <Label>Confirm new password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
