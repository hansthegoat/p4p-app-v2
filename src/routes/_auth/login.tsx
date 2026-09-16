import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/p4p/auth";
import { checkLockout, recordFailure, clearThrottle } from "@/lib/p4p/login-throttle";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutInfo, setLockoutInfo] = useState<{ locked: boolean; minutesLeft: number }>({
    locked: false,
    minutesLeft: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const lock = checkLockout(email);
    if (lock.locked) {
      setLockoutInfo(lock);
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      clearThrottle(email);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const result = recordFailure(email);
      if (result.locked) {
        setLockoutInfo({ locked: true, minutesLeft: 15 });
        setError("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        setError(
          err.message ||
            `Login failed. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} remaining.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your dashboard
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {lockoutInfo.locked && (
        <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 rounded mb-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            Account temporarily locked. Try again in{" "}
            <strong>
              {lockoutInfo.minutesLeft} minute{lockoutInfo.minutesLeft === 1 ? "" : "s"}
            </strong>
            .
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <Label>Password</Label>
            <button
              type="button"
              onClick={() => navigate({ to: "/forgot-password" })}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
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
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || lockoutInfo.locked}
        >
          {lockoutInfo.locked ? "Locked" : loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Card>
  );
}