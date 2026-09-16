import { Lock } from "lucide-react";
import { useP4P } from "@/lib/p4p/store";
import { useUser } from "@/lib/p4p/user-context";
import { fmtGHS } from "@/lib/p4p/calc";

interface BonusGateProps {
  value: number;
  className?: string;
  compact?: boolean;
}

/**
 * Shows the bonus amount when:
 *   - HR/admin (always can see)
 *   - OR bonusRevealed is true
 * Otherwise shows the locked state.
 *
 * Role detection is synchronous — no flash of lock for HR/admin.
 */
export function BonusGate({ value, className = "", compact = false }: BonusGateProps) {
  const { bonusRevealed, employees } = useP4P();
  const { user, role: contextRole } = useUser();

  // ─── Synchronous role check — no async, no flash ────────
  let isHrOrAdmin = false;

  // 1. Shared HR email — instant
  if (user?.email === "hr@aoholdings.net") {
    isHrOrAdmin = true;
  }

  // 2. Context role from useUser (already loaded)
  if (!isHrOrAdmin && (contextRole === "hr" || contextRole === "admin")) {
    isHrOrAdmin = true;
  }

  // 3. Employee record lookup by email/id (already in store, no network)
  if (!isHrOrAdmin && user) {
    const me = employees.find(
      (e) => e.authUserId === user.id || e.email === user.email
    );
    if (me?.roleType === "hr" || me?.roleType === "admin") {
      isHrOrAdmin = true;
    }
  }

  const canSee = isHrOrAdmin || bonusRevealed;

  if (canSee) {
    return <span className={className}>{fmtGHS(value)}</span>;
  }

  // ─── Compact: just the dots, matching the font size ─────
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 tabular-nums ${className}`}
        aria-label="Amount hidden"
      >
        <span className="tracking-[0.15em] text-foreground/30 select-none animate-[bonusBreath_2.8s_ease-in-out_infinite]">
          ••••••
        </span>
        <Lock className="h-3 w-3 text-foreground/25" />
      </span>
    );
  }

  // ─── Full: dots + quiet caption ─────────────────────────
  return (
    <span
      className={`inline-flex flex-col items-start gap-1 ${className}`}
      aria-label="Amount hidden until HR reveals"
    >
      <span className="inline-flex items-center gap-2">
        <span className="tracking-[0.15em] text-foreground/30 select-none animate-[bonusBreath_2.8s_ease-in-out_infinite]">
          ••••••
        </span>
        <Lock className="h-3.5 w-3.5 text-foreground/25" />
      </span>
      <span className="text-[10px] text-muted-foreground/70 italic tracking-wide">
        Revealed after HR publishes the cycle
      </span>
    </span>
  );
}