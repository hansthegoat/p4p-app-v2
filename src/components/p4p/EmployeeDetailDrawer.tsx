import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X, Save, Trash2, AlertTriangle, Check, GripVertical,
} from "lucide-react";

const METRICS = ["%", "GHS", "$", "#", "ROI", "days", "hrs"];

export interface KpiEditDraft {
  id: string;
  description: string;
  metric: string;
  target: number;
  weight: number;
}

interface EmployeeKpiEditDrawerProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  kpi: KpiEditDraft;
  isNew?: boolean;
  onSave: (updated: KpiEditDraft) => void;
  onDelete?: () => void;
}

export function EmployeeKpiEditDrawer({
  open,
  onClose,
  categoryName,
  kpi,
  isNew = false,
  onSave,
  onDelete,
}: EmployeeKpiEditDrawerProps) {
  const [draft, setDraft] = useState<KpiEditDraft>(kpi);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDraft(kpi);
      setShowDeleteConfirm(false);
    }
  }, [open, kpi]);

  const hasChanges =
    draft.description !== kpi.description ||
    draft.metric !== kpi.metric ||
    draft.target !== kpi.target ||
    draft.weight !== kpi.weight;

  const canSave =
    draft.description.trim().length > 0 &&
    draft.target > 0 &&
    draft.weight > 0 &&
    (hasChanges || isNew);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...draft,
      description: draft.description.trim(),
    });
    onClose();
  };

  const handleDeleteClick = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete?.();
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
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
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-start justify-between p-5 border-b border-border/60">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-base font-semibold">
                    {isNew ? "Add new KPI" : "Edit KPI"}
                  </h2>
                  {isNew && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Category: {categoryName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="e.g., Monthly sales revenue"
                  className="mt-1.5 h-9"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  What is being measured?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Metric</Label>
                  <Select
                    value={draft.metric}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, metric: v }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 h-9 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METRICS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Target</Label>
                  <Input
                    type="number"
                    value={draft.target}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        target: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                    className="mt-1.5 h-9 font-mono"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Weight within category</Label>
                <div className="relative mt-1.5">
                  <Input
                    type="number"
                    value={draft.weight}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        weight: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                    className="h-9 font-mono pr-8"
                    min={0}
                    max={100}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  How much this KPI contributes to the category score.
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  Your changes will be sent to your supervisor for approval
                  before they take effect.
                </p>
              </div>

              {!isNew && onDelete && (
                <div className="pt-4 border-t border-border/60">
                  {showDeleteConfirm ? (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/30">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-red-800 dark:text-red-300">
                            Remove this KPI?
                          </div>
                          <div className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                            Past months will keep the KPI for history, but future
                            scoring won't include it.
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 h-8"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleDeleteClick}
                          className="flex-1 h-8 gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Yes, remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteClick}
                      className="w-full h-9 gap-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 justify-start"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove KPI
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 p-5 border-t border-border/60">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1 gap-2"
              >
                <Save className="h-4 w-4" />
                {isNew ? "Add KPI" : "Save changes"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}