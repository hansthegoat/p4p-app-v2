import { useNavigate } from "@tanstack/react-router";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import {
  UserX, Target, ClipboardCheck, Bell, ChevronRight,
  AlertCircle, CheckCircle2,
} from "lucide-react";

interface WidgetProps {
  icon: typeof UserX;
  label: string;
  count: number;
  description: string;
  ctaText: string;
  ctaTo: string;
  tone: "amber" | "blue" | "rose" | "purple";
  priority?: "high" | "normal";
}

function Widget({
  icon: Icon, label, count, description, ctaText, ctaTo, tone, priority = "normal",
}: WidgetProps) {
  const navigate = useNavigate();

  const tones = {
    amber: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      count: "text-amber-600 dark:text-amber-400",
      hover: "hover:bg-amber-500/10",
    },
    blue: {
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
      icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      count: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-500/10",
    },
    rose: {
      bg: "bg-rose-500/5",
      border: "border-rose-500/20",
      icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      count: "text-rose-600 dark:text-rose-400",
      hover: "hover:bg-rose-500/10",
    },
    purple: {
      bg: "bg-purple-500/5",
      border: "border-purple-500/20",
      icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      count: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-500/10",
    },
  };

  const t = tones[tone];

  return (
    <button
      type="button"
      onClick={() => navigate({ to: ctaTo })}
      className={`w-full text-left rounded-lg border ${t.border} ${t.bg} p-4 transition-all duration-200 ${t.hover} hover:-translate-y-0.5 active:scale-[0.99] group cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${t.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        {priority === "high" && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
            Priority
          </span>
        )}
      </div>

      <div className="mb-3">
        <div className={`text-2xl font-bold tabular-nums ${t.count}`}>{count}</div>
        <div className="text-[13px] font-medium text-foreground mt-0.5">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
          {description}
        </div>
      </div>

      <div className="flex items-center text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {ctaText}
        <ChevronRight className="h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

export function NeedsAttention() {
  const { employees, appraisals, kpiUpdateRequests } = useP4P();

  const activeEmployees = employees.filter(
    (e) => e.roleType === "employee" && !e.isAdjunct
  );

  const noSupervisor = activeEmployees.filter(
    (e) => !e.supervisorId || e.supervisorId === ""
  );

  const noKpis = activeEmployees.filter(
    (e) => !e.categories || e.categories.length === 0
  );

  const pendingAppraisals = appraisals.filter((a) => a.status === "pending");

  const unackedUpdates = kpiUpdateRequests.filter(
    (r) => r.status === "unacknowledged"
  );

  const totalIssues =
    noSupervisor.length +
    noKpis.length +
    pendingAppraisals.length +
    unackedUpdates.length;

  // Always visible — even when nothing is wrong, show a status card
  if (totalIssues === 0) {
    return (
      <Card className="p-6 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-[13px] font-medium">Everything is under control</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              No pending actions across the organization.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <h2 className="text-[13px] font-semibold text-foreground">
          Needs your attention
        </h2>
        <span className="text-[11px] text-muted-foreground">
          — {totalIssues} pending {totalIssues === 1 ? "action" : "actions"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {noSupervisor.length > 0 && (
          <Widget
            icon={UserX}
            label="No supervisor assigned"
            count={noSupervisor.length}
            description="Employees can't submit appraisals until a supervisor is set."
            ctaText="Assign supervisors"
            ctaTo="/supervisors"
            tone="rose"
            priority="high"
          />
        )}

        {noKpis.length > 0 && (
          <Widget
            icon={Target}
            label="No KPIs assigned"
            count={noKpis.length}
            description="These employees have empty KPI structures. Push a template."
            ctaText="Open KPI Framework"
            ctaTo="/kpi-framework"
            tone="amber"
          />
        )}

        {pendingAppraisals.length > 0 && (
          <Widget
            icon={ClipboardCheck}
            label="Appraisals awaiting review"
            count={pendingAppraisals.length}
            description="Submitted appraisals waiting for approval or feedback."
            ctaText="Review appraisals"
            ctaTo="/appraisals-review"
            tone="blue"
          />
        )}

        {unackedUpdates.length > 0 && (
          <Widget
            icon={Bell}
            label="KPI updates not acknowledged"
            count={unackedUpdates.length}
            description="Employees haven't acknowledged recent KPI changes."
            ctaText="View audit log"
            ctaTo="/audit-log"
            tone="purple"
          />
        )}
      </div>
    </div>
  );
}