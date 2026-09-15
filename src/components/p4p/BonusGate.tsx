import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS } from "@/lib/p4p/calc";
import { supabase } from "@/lib/supabase";

interface BonusGateProps {
  value: number;
  className?: string;
  compact?: boolean;
}

export function BonusGate({ value, className = "", compact = false }: BonusGateProps) {
  const { bonusRevealed, employees } = useP4P();
  const [role, setRole] = useState<string>("employee");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u || cancelled) return;
      if (u.email === "hr@aoholdings.net") {
        setRole("hr");
        return;
      }
      const me = employees.find(
        (e) => e.authUserId === u.id || e.email === u.email
      );
      if (me?.roleType) setRole(me.roleType);
    })();
    return () => {
      cancelled = true;
    };
  }, [employees]);

  const canSee = role === "hr" || role === "admin" || bonusRevealed;

  if (canSee) {
    return <span className={className}>{fmtGHS(value)}</span>;
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="inline-block h-4 w-16 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
        <Lock className="h-3 w-3 text-muted-foreground" />
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-5 w-24 rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <span className="text-[10px] text-muted-foreground italic">
        Keep pushing hard 💪
      </span>
    </span>
  );
}