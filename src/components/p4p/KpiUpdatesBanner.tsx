import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useP4P } from "@/lib/p4p/store";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/p4p/user-context";
import { AlertCircle, ArrowRight } from "lucide-react";

export function KpiUpdatesBanner() {
  const navigate = useNavigate();
  const { employees, kpiUpdateRequests } = useP4P();
  const { user } = useUser();
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthUserId(data.user?.id || null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const me = employees.find(
    (e) => e.authUserId === authUserId || (user?.email && e.email === user.email)
  );
  const pending = me
    ? kpiUpdateRequests.filter(
        (r) => r.employeeId === me.id && r.status === "unacknowledged"
      ).length
    : 0;

  if (pending === 0) return null;

  return (
    <button
      onClick={() => navigate({ to: "/kpi-updates" })}
      className="w-full mb-4 p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-colors flex items-start sm:items-center gap-3 text-left"
    >
      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0 break-words">
        <div className="font-medium text-[13px]">KPI updates need your attention</div>
        <div className="text-[11px] text-muted-foreground">
          HR made {pending} change{pending > 1 ? "s" : ""} to your KPIs. Review and acknowledge.
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
    </button>
  );
}