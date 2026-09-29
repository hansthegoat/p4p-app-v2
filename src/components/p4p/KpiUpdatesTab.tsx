import { useMemo, useState } from "react";
import { useP4P } from "@/lib/p4p/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MessageSquare, ChevronRight, CheckCircle, FileText } from "lucide-react";
import { KpiChangeReviewDrawer } from "@/components/p4p/KpiChangeReviewDrawer";
import type { KpiUpdateRequest } from "@/lib/p4p/types";

interface Props {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: "hr" | "admin";
}

export function KpiUpdatesTab({ reviewerId, reviewerName, reviewerRole }: Props) {
  const { kpiUpdateRequests, employees } = useP4P();
  const [filter, setFilter] = useState<"action" | "review" | "history">("action");
  const [selected, setSelected] = useState<KpiUpdateRequest | null>(null);

  const allVisible = useMemo(
    () =>
      kpiUpdateRequests.filter(
        (r) =>
          r.status === "back_to_hr" ||
          r.status === "pending_supervisor_review" ||
          r.status === "cancelled" ||
          r.status === "unacknowledged" ||
          r.status === "acknowledged"
      ),
    [kpiUpdateRequests]
  );

  const needAction = allVisible.filter((r) => r.status === "back_to_hr");
  const inReview = allVisible.filter((r) => r.status === "pending_supervisor_review");
  const history = allVisible.filter(
    (r) =>
      r.status === "unacknowledged" ||
      r.status === "acknowledged" ||
      r.status === "cancelled"
  );

  const filtered =
    filter === "action"
      ? needAction
      : filter === "review"
      ? inReview
      : history.slice(0, 20);

  const getStatusBadge = (status: KpiUpdateRequest["status"]) => {
    if (status === "back_to_hr") {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
        >
          <MessageSquare className="h-2.5 w-2.5" />
          Needs your reply
        </Badge>
      );
    }
    if (status === "pending_supervisor_review") {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"
        >
          <Clock className="h-2.5 w-2.5" />
          Awaiting supervisor
        </Badge>
      );
    }
    if (status === "cancelled") {
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 gap-1"
        >
          Rejected
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] h-5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
      >
        <CheckCircle className="h-2.5 w-2.5" />
        Resolved
      </Badge>
    );
  };

  return (
    <>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="action" className="gap-2 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Needs Reply
            {needAction.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {needAction.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" />
            In Review ({inReview.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Recent
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={<CheckCircle className="h-6 w-6" />}
              title={
                filter === "action"
                  ? "No replies needed"
                  : filter === "review"
                  ? "Nothing in review"
                  : "No recent activity"
              }
              description={
                filter === "action"
                  ? "No supervisors are waiting on a reply from you."
                  : filter === "review"
                  ? "No KPI changes are currently with supervisors."
                  : "Recently resolved KPI changes will appear here."
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const emp = employees.find((e) => e.id === req.employeeId);
              return (
                <Card
                  key={req.id}
                  className="p-5 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(req)}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {emp?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">
                            {emp?.name || "Unknown"}
                          </span>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {req.department} · {req.role}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>
                            {req.diffs.length} change{req.diffs.length === 1 ? "" : "s"}
                          </span>
                          {req.assignedSupervisorName && (
                            <>
                              <span>·</span>
                              <span>Supervisor: {req.assignedSupervisorName}</span>
                            </>
                          )}
                          {req.comments && req.comments.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {req.comments.length}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <KpiChangeReviewDrawer
        request={selected}
        onClose={() => setSelected(null)}
        reviewerId={reviewerId}
        reviewerName={reviewerName}
        mode="hr"
      />
    </>
  );
}