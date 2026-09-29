import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { useP4P } from "@/lib/p4p/store";
import { useUser } from "@/lib/p4p/user-context";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { TourReplayButton } from "@/components/p4p/TourReplayButton";
import { ChangePasswordModal } from "@/components/p4p/ChangePasswordModal";
import {
  KeyRound, LogOut, Mail, Building2, Calendar,
  Target, Award, CheckCircle, Briefcase, AlertTriangle, Send,
} from "lucide-react";
import type { Employee } from "@/lib/p4p/types";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const {
    employees,
    getMonthlyHistory,
    getPerformanceTrend,
    submitKpiRequest,
    getEmployeeKpiRequest,
  } = useP4P();
  const { user: contextUser, logout } = useUser();
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Derive `me` synchronously — no async, no spinner on navigation
  const me = useMemo<Employee | null>(() => {
    if (!contextUser) return null;
    return (
      employees.find((e) => e.authUserId === contextUser.id) ||
      employees.find((e) => e.email === contextUser.email) ||
      null
    );
  }, [employees, contextUser]);

  const authEmail = contextUser?.email || "";
  const hasNoKpis = !me?.categories || me.categories.length === 0;
  const pendingKpiRequest = me ? getEmployeeKpiRequest(me.id) : null;
  const needsSupervisor = !me?.supervisorId || me.supervisorId === "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout?.();
    showToast.success("Logged out", "See you soon.");
    navigate({ to: "/login" });
  };

  const handleRequestKpis = async () => {
    if (!me) return;
    setSubmittingRequest(true);
    try {
      await submitKpiRequest(me.id, undefined);
      showToast.success(
        "Request sent to HR",
        "Your KPIs will appear here once they're assigned."
      );
    } catch (err: any) {
      showToast.error("Could not send request", err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const history = me ? getMonthlyHistory(me.id) : [];
  const trend = me ? getPerformanceTrend(me.id) : null;
  const totalKpis = me?.categories?.reduce((s, c) => s + c.kpis.length, 0) || 0;

  // Brief auth gate — only for the split-second before useUser() resolves
  if (!contextUser) {
    return <PageLoader text="Loading your profile…" />;
  }

  return (
    <div className="space-y-6">
      <div data-tour="profile-header">
        <PageHeader
          title="My Profile"
          description="Your account and performance summary."
          icon={<Award className="h-6 w-6" />}
        />
      </div>

      {/* ============ IDENTITY CARD ============ */}
      <Card className="p-5" data-tour="profile-header">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {(me?.name || authEmail || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate">
              {me?.name || "Unknown"}
            </h2>
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {authEmail || me?.email || "—"}
            </p>
          </div>
          {me?.roleType && (
            <Badge variant="outline" className="text-[10px] capitalize shrink-0">
              {me.roleType}
            </Badge>
          )}
        </div>
      </Card>

      {/* ============ WORK INFORMATION ============ */}
      <Card className="p-5 space-y-4" data-tour="profile-details">
        <h3 className="text-sm font-semibold">Work information</h3>

        {needsSupervisor && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>No supervisor assigned.</strong> Contact HR to get a
              supervisor set up — you'll need one before you can submit
              appraisals.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Department"
            value={me?.department || "—"}
          />
          <InfoRow
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Role"
            value={me?.role || "—"}
          />
          <InfoRow
            icon={<Award className="h-3.5 w-3.5" />}
            label="Job grade"
            value={me?.jobGrade ? `Grade ${me.jobGrade}` : "—"}
          />
          <InfoRow
            icon={<Target className="h-3.5 w-3.5" />}
            label="Supervisor"
            value={me?.supervisorName || "Not assigned"}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Join date"
            value={me?.joinDate || "—"}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Months worked"
            value={String(me?.monthsWorked || 0)}
          />
        </div>
      </Card>

      {/* ============ KPI STRUCTURE ============ */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold">KPI Structure</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your assigned categories and KPIs
            </p>
          </div>
          {!hasNoKpis && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {totalKpis} KPIs
            </Badge>
          )}
        </div>

        {hasNoKpis ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No KPIs assigned yet. You can request them from HR.
            </p>

            {pendingKpiRequest ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Request sent · awaiting HR
              </div>
            ) : (
              <Button
                onClick={handleRequestKpis}
                disabled={submittingRequest}
                size="sm"
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
              >
                {submittingRequest ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Request KPIs from HR
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {me!.categories!.map((cat, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-sm truncate">{cat.name}</span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums ml-2">
                  {cat.kpis.length} · {cat.weight}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ============ PERFORMANCE SNAPSHOT ============ */}
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

      {/* ============ ACCOUNT ============ */}
      <Card className="p-5 space-y-2" data-tour="profile-account">
        <h3 className="text-sm font-semibold mb-3">Account</h3>

        <TourReplayButton role={me?.roleType || "employee"} />

        <Button
          variant="outline"
          onClick={() => setPwModalOpen(true)}
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

      <ChangePasswordModal
        open={pwModalOpen}
        onClose={() => setPwModalOpen(false)}
      />
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
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-1 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {label}
        </div>
        <div className="text-sm truncate mt-0.5">{value}</div>
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