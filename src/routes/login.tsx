import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, Calculator } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/p4p/auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      if (login(u, p)) {
        navigate({ to: "/dashboard" });
      } else {
        setErr("Invalid credentials. Leave both fields empty for demo mode.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-3">
            <Calculator className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">P4P Bonus Calculator</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={u} onChange={(e) => setU(e.target.value)} placeholder="Username" autoFocus />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="Password" />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Leave both fields empty to enter demo mode.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
