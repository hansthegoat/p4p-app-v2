import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";
import { fmtNum } from "@/lib/p4p/calc";
import {
  X, CheckCircle, XCircle, MessageSquare, Send, AlertTriangle,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import type { KpiUpdateRequest } from "@/lib/p4p/types";

interface Props {
  request: KpiUpdateRequest | null;
  onClose: () => void;
  reviewerId: string;
  reviewerName: string;
  mode?: "supervisor" | "hr";
}

export function KpiChangeReviewDrawer({
  request,
  onClose,
  reviewerId,
  reviewerName,
  mode = "supervisor",
}: Props) {
  const {
    commentOnKpiUpdateRequest,
    approveKpiUpdateAsSupervisor,
    rejectKpiUpdateAsSupervisor,
    getKpiUpdateComments,
    employees,
  } = useP4P();

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [updateTemplate, setUpdateTemplate] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (request) {
      setCommentText("");
      setRejectMode(false);
      setRejectReason("");
      setUpdateTemplate(false);
    }
  }, [request?.id]);

  if (!request) return null;
  if (!mounted) return null;

  const employee = employees.find((e) => e.id === request.employeeId);
  const comments = getKpiUpdateComments(request.id);
  const scoreDelta = (request.afterScore - request.beforeScore) * 100;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const authorRole: "supervisor" | "hr" =
        mode === "hr" ? "hr" : "supervisor";
      await commentOnKpiUpdateRequest(
        request.id,
        reviewerId,
        reviewerName,
        authorRole,
        commentText.trim()
      );
      setCommentText("");
      showToast.success(
        "Comment sent",
        mode === "hr" ? "The supervisor will see your reply." : "HR will see your feedback."
      );
    } catch (err: any) {
      showToast.error("Comment failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveKpiUpdateAsSupervisor(
        request.id,
        reviewerId,
        reviewerName,
        commentText.trim() || undefined,
        mode === "supervisor" ? updateTemplate : false
      );
      showToast.success(
        "Approved",
        updateTemplate
          ? `${employee?.name || "Employee"}'s KPIs updated + template saved.`
          : `${employee?.name || "Employee"}'s KPIs updated.`
      );
      onClose();
    } catch (err: any) {
      showToast.error("Could not approve", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast.warning("Reason required", "Please explain why you're rejecting.");
      return;
    }
    setSubmitting(true);
    try {
      await rejectKpiUpdateAsSupervisor(
        request.id,
        reviewerId,
        reviewerName,
        rejectReason.trim()
      );
      showToast.success("Rejected", "HR has been notified.");
      onClose();
    } catch (err: any) {
      showToast.error("Could not reject", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {request && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-start justify-between p-5 border-b border-border/60">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-base font-semibold">Review KPI Changes</h2>
                  <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {employee?.name || "Unknown"} · {request.department} · {request.role}
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  Score impact
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-muted-foreground">
                    {(request.beforeScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className={
                    scoreDelta > 0.5 ? "text-emerald-600 dark:text-emerald-400"
                    : scoreDelta < -0.5 ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
                  }>
                    {(request.afterScore * 100).toFixed(1)}%
                  </span>
                  {scoreDelta > 0.5 && <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
                  {scoreDelta < -0.5 && <TrendingDown className="h-3.5 w-3.5 text-red-600" />}
                  {Math.abs(scoreDelta) <= 0.5 && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                  {request.diffs.length} change{request.diffs.length === 1 ? "" : "s"}
                </div>
                <div className="space-y-2">
                  {request.diffs.map((d, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/60 bg-background">
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="font-medium">{formatDiffKind(d.kind)}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{d.categoryName}</span>
                        {d.kpiDescription && (
                          <>
                            <span className="text-muted-foreground">/</span>
                            <span className="truncate">{d.kpiDescription}</span>
                          </>
                        )}
                      </div>
                      {(d.before !== undefined || d.after !== undefined) && (
                        <div className="text-xs mt-1.5 flex items-center gap-2">
                          {d.before !== undefined && (
                            <span className="text-muted-foreground line-through">
                              {String(d.before)}
                            </span>
                          )}
                          {d.after !== undefined && (
                            <span className="font-semibold">{String(d.after)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Discussion ({comments.length})
                </div>
                <div className="space-y-2 mb-3">
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/30">
                      No comments yet. Add one below if you want to discuss with HR.
                    </p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{c.authorName}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                          {c.authorRole === "supervisor" ? "Supervisor" : c.authorRole === "employee" ? "Employee" : "HR"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{c.text}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(c.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment for HR..."
                    rows={2}
                    className="flex-1 text-xs rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                    className="self-end gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Commenting sends this back to HR's queue.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-border/60 space-y-3">
              {mode === "hr" ? (
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-800 dark:text-blue-300 text-center">
                  Only the assigned supervisor can approve or reject this change.
                  Use the comment box above to reply.
                </div>
              ) : rejectMode ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-red-800 dark:text-red-300">
                      Rejecting closes this request. HR will be notified.
                    </div>
                  </div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (required)"
                    rows={2}
                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectMode(false)}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleReject}
                      disabled={submitting || !rejectReason.trim()}
                      className="flex-1 gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Confirm reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {mode === "supervisor" && (
                    <label className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 cursor-pointer hover:bg-blue-500/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={updateTemplate}
                        onChange={(e) => setUpdateTemplate(e.target.checked)}
                        disabled={submitting}
                        className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                          Also update the standard template
                        </div>
                        <div className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
                          New employees in this role will get these KPIs going forward. HR can revert within 3 days.
                        </div>
                      </div>
                    </label>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setRejectMode(true)}
                      disabled={submitting}
                      className="gap-1.5 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={submitting}
                      className="flex-1 gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve & push to employee
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function formatDiffKind(kind: string): string {
  const map: Record<string, string> = {
    category_added: "New category",
    category_removed: "Category removed",
    category_weight_changed: "Category weight changed",
    category_name_changed: "Category renamed",
    kpi_added: "New KPI",
    kpi_removed: "KPI removed",
    kpi_target_changed: "Target changed",
    kpi_metric_changed: "Metric changed",
    kpi_weight_changed: "KPI weight changed",
    kpi_description_changed: "KPI renamed",
  };
  return map[kind] || kind;
}