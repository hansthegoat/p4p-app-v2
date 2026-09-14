import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useP4P } from "@/lib/p4p/store";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import {
  ArrowLeft, CheckCircle, MessageSquare, AlertCircle,
  Plus, Minus, RefreshCw, TrendingUp, TrendingDown, Loader2,
} from "lucide-react";
import type { KpiDiffItem, KpiUpdateRequest, Employee } from "@/lib/p4p/types";

export const Route = createFileRoute("/_app/kpi-updates")({
  component: KpiUpdatesPage,
});

function KpiUpdatesPage() {
  const navigate = useNavigate();
  const p4p = useP4P();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user || cancelled) {
        setAuthChecked(true);
        return;
      }
      const emp =
        p4p.employees.find((e) => e.authUserId === user.id) ||
        p4p.employees.find((e) => e.email === user.email) ||
        null;
      setEmployee(emp);
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [p4p.employees]);

  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  if (!authChecked) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-sm font-semibold mb-1">No employee record</h2>
          <p className="text-xs text-muted-foreground">
            Your account isn't linked to an employee profile. Contact HR.
          </p>
        </Card>
      </div>
    );
  }

  const requests = p4p.getKpiUpdateRequests(employee.id);
  const needsAck = requests.filter((r) => r.status === "unacknowledged");
  const history = requests.filter((r) => r.status === "acknowledged");

  const handleAcknowledge = async (req: KpiUpdateRequest) => {
    setLoading(req.id);
    try {
      await p4p.acknowledgeKpiUpdate(req.id);
      showToast.success("Acknowledged", "Thanks — HR has been notified.");
    } catch (err: any) {
      showToast.error("Could not acknowledge", err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleComment = async (req: KpiUpdateRequest) => {
    if (!commentText.trim()) return;
    setLoading(req.id);
    try {
      await p4p.commentKpiUpdate(req.id, commentText.trim());
      showToast.success("Comment sent", "HR will see your feedback.");
      setCommentingId(null);
      setCommentText("");
    } catch (err: any) {
      showToast.error("Could not send comment", err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-5 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold">KPI Updates</h1>
          <p className="text-xs text-muted-foreground">
            Changes HR has made to your KPIs
          </p>
        </div>
      </div>

      {needsAck.length === 0 && history.length === 0 && (
        <Card className="p-8 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-sm font-semibold mb-1">All caught up</h2>
          <p className="text-xs text-muted-foreground">
            You have no KPI updates.
          </p>
        </Card>
      )}

      {needsAck.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Needs your acknowledgment ({needsAck.length})
          </h2>
          {needsAck.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              loading={loading === req.id}
              commenting={commentingId === req.id}
              commentText={commentText}
              setCommentText={setCommentText}
              onStartComment={() => {
                setCommentingId(req.id);
                setCommentText("");
              }}
              onCancelComment={() => {
                setCommentingId(null);
                setCommentText("");
              }}
              onAcknowledge={() => handleAcknowledge(req)}
              onComment={() => handleComment(req)}
            />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            History ({history.length})
          </h2>
          {history.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              loading={false}
              commenting={false}
              commentText=""
              setCommentText={() => {}}
              onStartComment={() => {}}
              onCancelComment={() => {}}
              onAcknowledge={() => {}}
              onComment={() => {}}
              readOnly
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RequestCardProps {
  req: KpiUpdateRequest;
  loading: boolean;
  commenting: boolean;
  commentText: string;
  setCommentText: (v: string) => void;
  onStartComment: () => void;
  onCancelComment: () => void;
  onAcknowledge: () => void;
  onComment: () => void;
  readOnly?: boolean;
}

function RequestCard({
  req,
  loading,
  commenting,
  commentText,
  setCommentText,
  onStartComment,
  onCancelComment,
  onAcknowledge,
  onComment,
  readOnly,
}: RequestCardProps) {
  const scoreDelta = (req.afterScore - req.beforeScore) * 100;
  const scoreUp = scoreDelta > 0.05;
  const scoreDown = scoreDelta < -0.05;

  return (
    <Card className="p-3 sm:p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground mb-0.5">
            From {req.department} · {req.role}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {new Date(req.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap max-w-full">
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Score impact
            </div>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span className="text-muted-foreground">
                {(req.beforeScore * 100).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={
                  scoreUp
                    ? "text-emerald-600 dark:text-emerald-400"
                    : scoreDown
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
                }
              >
                {(req.afterScore * 100).toFixed(1)}%
              </span>
              {scoreUp && <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
              {scoreDown && <TrendingDown className="h-3.5 w-3.5 text-red-600" />}
            </div>
          </div>

          {req.status === "unacknowledged" && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 text-[10px] h-5">
              Action needed
            </Badge>
          )}
          {req.status === "acknowledged" && (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 text-[10px] h-5">
              Acknowledged
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {req.diffs.map((diff, i) => (
          <DiffRow key={i} diff={diff} />
        ))}
      </div>

      {req.employeeComment && (
        <div className="mt-3 p-3 rounded-md bg-muted/40 border border-border/50">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Your comment
          </div>
          <p className="text-[13px]">{req.employeeComment}</p>
        </div>
      )}

      {!readOnly && (
        <>
          {commenting ? (
            <div className="space-y-3 pt-3 border-t border-border/50">
              <textarea
                placeholder="Add a comment for HR (optional)..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full min-h-[80px] text-[13px] rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={onComment}
                  disabled={loading || !commentText.trim()}
                  className="gap-1.5 w-full sm:w-auto"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {loading ? "Sending..." : "Send comment"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelComment} disabled={loading} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
              <Button
                size="sm"
                onClick={onAcknowledge}
                disabled={loading}
                className="gap-1.5 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {loading ? "Saving..." : "I understand"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onStartComment}
                disabled={loading}
                className="gap-1.5 w-full sm:w-auto"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Add comment
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function DiffRow({ diff }: { diff: KpiDiffItem }) {
  const meta: Record<string, { icon: typeof Plus; tone: string; label: string }> = {
    category_added: {
      icon: Plus,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      label: "New category",
    },
    category_removed: {
      icon: Minus,
      tone: "text-red-600 dark:text-red-400 bg-red-500/10",
      label: "Category removed",
    },
    category_weight_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Category weight changed",
    },
    category_name_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Category renamed",
    },
    kpi_added: {
      icon: Plus,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      label: "New KPI",
    },
    kpi_removed: {
      icon: Minus,
      tone: "text-red-600 dark:text-red-400 bg-red-500/10",
      label: "KPI removed",
    },
    kpi_target_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Target changed",
    },
    kpi_metric_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "Metric changed",
    },
    kpi_weight_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "KPI weight changed",
    },
    kpi_description_changed: {
      icon: RefreshCw,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      label: "KPI renamed",
    },
  };

  const m = meta[diff.kind] || meta.kpi_target_changed;
  const Icon = m.icon;

  return (
    <div className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30 border border-border/40">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${m.tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="font-medium">{m.label}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{diff.categoryName}</span>
          {diff.kpiDescription && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="truncate">{diff.kpiDescription}</span>
            </>
          )}
        </div>
        {(diff.before !== undefined || diff.after !== undefined) && (
          <div className="text-[11px] mt-1 flex items-center gap-2">
            {diff.before !== undefined && (
              <span className="text-muted-foreground line-through">
                {String(diff.before)}
              </span>
            )}
            {diff.after !== undefined && (
              <span className="font-semibold">{String(diff.after)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}