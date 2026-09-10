import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      showToast.success("Reset link sent", `Check ${email} for instructions.`);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {sent ? (
          <div className="text-sm text-muted-foreground text-center py-2">
            Check your inbox at <strong className="text-foreground">{email}</strong>.
            <br />
            Didn't get it? Check spam, or try again.
          </div>
        ) : (
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-sm text-muted-foreground text-center mt-4">
          <button
            onClick={() => navigate({ to: "/login" })}
            className="text-primary hover:underline"
          >
            Back to sign in
          </button>
        </p>
      </Card>
    </div>
  );
}