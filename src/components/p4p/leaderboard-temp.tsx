import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useP4P } from "@/lib/p4p/store";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import {
  Trophy, TrendingUp, TrendingDown, Minus, Crown,
} from "lucide-react";

export function DepartmentLeaderboard() {
  const { employees, getPerformanceTrend } = useP4P();
  const [myDept, setMyDept] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u || cancelled) return;
      const me = employees.find(
        (e) => e.authUserId === u.id || e.email === u.email
      );
      if (me) {
        setMyDept(me.department);
        setMyId(me.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employees]);

  if (!myDept) return null;

  const deptEmployees = employees.filter(
    (e) =>
      e.department === myDept &&
      !e.isAdjunct &&
      e.roleType === "employee"
  );

  const ranked = deptEmployees
    .map((e) => {
      const trend = getPerformanceTrend(e.id);
      return {
        id: e.id,
        name: e.name,
        role: e.role,
        score: trend?.currentScore || 0,
        trend: trend?.trendDirection || "stable",
        months: trend?.months.length || 0,
      };
    })
    .filter((x) => x.months > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <motion.div variants={fadeUp}>
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Department Leaderboard</h3>
          <Badge variant="outline" className="text-[10px] h-5 ml-auto">
            {myDept}
          </Badge>
        </div>

        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No performance data yet. Rankings appear once appraisals are submitted.
          </p>
        ) : (
          <motion.div variants={staggerContainer} className="space-y-1.5">
            {ranked.map((entry, idx) => {
              const isMe = entry.id === myId;
              const rankColor =
                idx === 0
                  ? "bg-amber-500 text-white"
                  : idx === 1
                  ? "bg-slate-400 text-white"
                  : idx === 2
                  ? "bg-amber-700 text-white"
                  : "bg-muted text-muted-foreground";

              const TrendIcon =
                entry.trend === "improving"
                  ? TrendingUp
                  : entry.trend === "declining"
                  ? TrendingDown
                  : Minus;

              const trendColor =
                entry.trend === "improving"
                  ? "text-emerald-600"
                  : entry.trend === "declining"
                  ? "text-red-600"
                  : "text-muted-foreground";

              return (
                <motion.div
                  key={entry.id}
                  variants={fadeUp}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    isMe
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-accent/30"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${rankColor}`}
                  >
                    {idx === 0 ? <Crown className="h-3.5 w-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate flex items-center gap-2">
                      {entry.name}
                      {isMe && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {entry.role}
                    </div>
                  </div>

                  <TrendIcon className={`h-3.5 w-3.5 shrink-0 ${trendColor}`} />

                  <div className="text-[13px] font-bold tabular-nums shrink-0 w-12 text-right">
                    {entry.score.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}