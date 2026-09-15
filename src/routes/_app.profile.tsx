import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useP4P } from "@/lib/p4p/store";
import { useUser } from "@/lib/p4p/user-context";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import {
  KeyRound, LogOut, Mail, Building2, UserCog, Calendar,
  Target, Award, CheckCircle,
} from "lucide-react";
import type { Employee } from "@/lib/p4p/types";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { employees, getMonthlyHistory, getPerformanceTrend } = useP4P();
  const { logout } = useUser();
  const [me, setMe] = useState<Employee | null>(null);
  const [authEmail, setAuthEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u || cancelled) return;
      setAuthEmail(u.email || "");
      const emp = employees.find(
        (e) => e.authUserId === u.id || e.email === u.email
      );
      setMe(emp || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [employees]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout?.();
    showToast.success("Logged out", "See you soon.");
    navigate({ to: "/login" });
  };

  const history = me ? getMonthlyHistory(me.id) : [];
  const trend = me ? getPerformanceTrend(me.id) : null;
  const totalKpis = me?.categories?.reduce((s, c) => s + c.kpis.length, 0) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="My Profile"
        description="Your account and performance summary."
        icon={<Award className="h-6 w-6" />}
      />

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
            {(me?.name || authEmail || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{me?.name || "Unknown"}</h2>
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {authEmail || me?.email || "—"}
            </p>
            {me?.roleType && (
              <Badge variant="outline" className="mt-2 text-[10px] capitalize">
                {me.roleType}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-semibold">Work information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={me?.department || "—"} />
          <InfoRow icon={<UserCog className="h-3.5 w-3.5" />} label="Role" value={me?.role || "—"} />
          <InfoRow icon={<Award className="h-3.5 w-3.5" />} label="Job grade" value={me?.jobGrade || "—"} />
          <InfoRow icon={<Target className="h-3.5 w-3.5" />} label="Supervisor" value={me?.supervisorName || "Not assigned"} />
          <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Join date" value={me?.joinDate || "—"} />
          <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Months worked" value={String(me?.monthsWorked || 0)} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Your KPIs</h3>
        {me?.categories && me.categories.length > 0 ? (
          <div className="space-y-2">
            <div className="text-[11px] text-muted-foreground mb-3">
              {me.categories.length} categories · {totalKpis} KPIs assigned
            </div>
            {me.categories.map((cat, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {cat.kpis.length} KPIs · {cat.weight}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No KPIs assigned yet. HR will push them soon.
          </p>
        )}
      </Card>

      {trend && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">Performance snapshot</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Current" value={trend.currentScore.toFixed(2)} />
            <MiniStat label="Average" value={trend.averageScore.toFixed(2)} />
            <MiniStat label="Best month" value={trend.bestMonth.score.toFixed(2)} />
            <MiniStat label="Months tracked" value={String(history.length)} />
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-2">
        <h3 className="text-sm font-semibold mb-3">Account</h3>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/change-password" })}
          className="w-full justify-start gap-2"
        >
          <KeyRound className="h-4 w-4" /> Change password
        </Button>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </Card>
    </div>
  );
}

function InfoRow({
  icon, label, value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-1 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {label}
        </div>
        <div className="text-sm truncate">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 border border-border/50 p-3">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}