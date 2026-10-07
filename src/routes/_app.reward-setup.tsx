import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useP4P } from "@/lib/p4p/store";
import { fmtGHS } from "@/lib/p4p/calc";
import type { BonusConfig, BonusSourceType } from "@/lib/p4p/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { showToast } from "@/lib/toast";
import { staggerContainer, fadeUp } from "@/lib/motion";
import {
  Eye, EyeOff, Wallet, CheckCircle, AlertTriangle,
  Save, RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/_app/reward-setup")({
  component: RewardSetupPage,
});

const SOURCE_OPTIONS: { value: BonusSourceType; label: string; hint: string }[] = [
  {
    value: "revenue_percent",
    label: "Revenue %",
    hint: "Pool = % of revenue entered for the current period.",
  },
  {
    value: "profit_percent",
    label: "Profit %",
    hint: "Pool = % of profit entered for the current period.",
  },
  {
    value: "fixed_amount",
    label: "Fixed amount",
    hint: "Pool = a flat amount, regardless of revenue or profit.",
  },
];

function RewardSetupPage() {
  const { bonusConfig, bonusRevealed, setBonusRevealed, saveBonusConfig } = useP4P();

  const [draft, setDraft] = useState<BonusConfig>(bonusConfig);
  const [revealBusy, setRevealBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(bonusConfig),
    [draft, bonusConfig]
  );

  const preview = useMemo(() => {
    let base = 0;
    if (draft.sourceType === "revenue_percent") {
      base = (draft.periodInputs.revenue ?? 0) * (draft.revenuePercent / 100);
    } else if (draft.sourceType === "profit_percent") {
      base = (draft.periodInputs.profit ?? 0) * (draft.profitPercent / 100);
    } else {
      base = draft.fixedAmount;
    }
    const addOn = draft.addOn?.amount ?? 0;
    return base + addOn;
  }, [draft]);

  const set = <K extends keyof BonusConfig>(key: K, value: BonusConfig[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (draft.sourceType === "revenue_percent") {
      if (draft.revenuePercent < 0 || draft.revenuePercent > 100) {
        showToast.error("Invalid value", "Revenue % must be between 0 and 100.");
        return;
      }
    }
    if (draft.sourceType === "profit_percent") {
      if (draft.profitPercent < 0 || draft.profitPercent > 100) {
        showToast.error("Invalid value", "Profit % must be between 0 and 100.");
        return;
      }
    }
    if (draft.sourceType === "fixed_amount" && draft.fixedAmount <= 0) {
      showToast.error("Invalid value", "Fixed amount must be greater than 0.");
      return;
    }
    if (draft.adjunctPercent < 0 || draft.adjunctPercent > 100) {
      showToast.error("Invalid value", "Adjunct % must be between 0 and 100.");
      return;
    }

    // Warn if bonuses are already revealed
    if (bonusRevealed) {
      const proceed = confirm(
        "Bonuses are currently visible to employees. Changing the pool source will affect what they see. Continue?"
      );
      if (!proceed) return;
    }

    setSaving(true);
    try {
      await saveBonusConfig(draft);
      showToast.success("Reward setup saved", "Your changes are now live.");
    } catch (err: any) {
      showToast.error("Could not save", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(bonusConfig);
  };

  const handleToggleReveal = async () => {
    try {
      setRevealBusy(true);
      await setBonusRevealed(!bonusRevealed);
      showToast.success(
        !bonusRevealed ? "Bonuses revealed" : "Bonuses hidden",
        !bonusRevealed
          ? "All employees can now see their amounts."
          : "Employees see the locked placeholder again."
      );
    } catch (err: any) {
      showToast.error("Could not update", err.message);
    } finally {
      setRevealBusy(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-8 pb-24"
    >
      <div data-tour="reward-setup-header">
        <PageHeader
          title="Reward Setup"
          description="Configure how the bonus pool is calculated and distributed."
          icon={<Wallet className="h-6 w-6" />}
        />
      </div>

      {/* ─── Section 1: Bonus Visibility ─── */}
      <motion.section variants={fadeUp} className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Bonus visibility
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Whether employees can see their bonus amounts.
            </p>
          </div>
        </div>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  bonusRevealed
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {bonusRevealed ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  Bonuses are {bonusRevealed ? "visible" : "hidden"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {bonusRevealed
                    ? "Employees see their calculated amounts on My Calculation."
                    : "Employees see a locked placeholder until you reveal."}
                </div>
              </div>
            </div>
            <Button
              onClick={handleToggleReveal}
              disabled={revealBusy}
              variant={bonusRevealed ? "outline" : "default"}
              className="shrink-0"
            >
              {revealBusy
                ? "Updating…"
                : bonusRevealed
                ? "Hide bonuses"
                : "Reveal bonuses"}
            </Button>
          </div>
        </Card>
      </motion.section>

      {/* ─── Section 2: Pool Source ─── */}
      <motion.section variants={fadeUp} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Pool source
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How the total bonus pool is calculated.
          </p>
        </div>
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SOURCE_OPTIONS.map((opt) => {
              const active = draft.sourceType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("sourceType", opt.value)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    active
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:bg-muted/40 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>

          {draft.sourceType === "revenue_percent" && (
            <div>
              <Label className="text-xs">Revenue percentage</Label>
              <div className="relative mt-1.5 max-w-xs">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={draft.revenuePercent}
                  onChange={(e) => set("revenuePercent", Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          )}

          {draft.sourceType === "profit_percent" && (
            <div>
              <Label className="text-xs">Profit percentage</Label>
              <div className="relative mt-1.5 max-w-xs">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={draft.profitPercent}
                  onChange={(e) => set("profitPercent", Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          )}

          {draft.sourceType === "fixed_amount" && (
            <div>
              <Label className="text-xs">Fixed pool amount (GHS)</Label>
              <Input
                type="number"
                min={0}
                value={draft.fixedAmount}
                onChange={(e) => set("fixedAmount", Number(e.target.value))}
                className="mt-1.5 max-w-xs"
              />
            </div>
          )}
        </Card>
      </motion.section>

      {/* ─── Section 3: Add-on ─── */}
      <motion.section variants={fadeUp} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Add-on bonus
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optional. A fixed amount added on top of the calculated pool.
          </p>
        </div>
        <Card className="p-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!draft.addOn}
              onChange={(e) =>
                set(
                  "addOn",
                  e.target.checked ? { label: "Bonus", amount: 0 } : null
                )
              }
              className="h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm">Add a fixed bonus on top of the pool</span>
          </label>

          {draft.addOn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={draft.addOn.label}
                  onChange={(e) =>
                    set("addOn", { ...draft.addOn!, label: e.target.value })
                  }
                  placeholder="e.g. Christmas bonus"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs">Amount (GHS)</Label>
                <Input
                  type="number"
                  min={0}
                  value={draft.addOn.amount}
                  onChange={(e) =>
                    set("addOn", {
                      ...draft.addOn!,
                      amount: Number(e.target.value),
                    })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
        </Card>
      </motion.section>

      {/* ─── Section 4: Distribution Rules ─── */}
      <motion.section variants={fadeUp} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Distribution rules
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How the pool is divided across employees.
          </p>
        </div>
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Adjunct pool %</Label>
              <div className="relative mt-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.adjunctPercent}
                  onChange={(e) =>
                    set("adjunctPercent", Number(e.target.value))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div>
              <Label className="text-xs">Floor</Label>
              <Input
                type="number"
                step="0.01"
                value={draft.floor}
                onChange={(e) => set("floor", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs">Cap</Label>
              <Input
                type="number"
                step="0.01"
                value={draft.cap}
                onChange={(e) => set("cap", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={draft.prorationOn}
                onChange={(e) => set("prorationOn", e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              Proration on
            </label>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Sales multiplier</Label>
              <Input
                type="number"
                step="0.01"
                value={draft.salesMultiplier}
                onChange={(e) =>
                  set("salesMultiplier", Number(e.target.value))
                }
                className="h-9 w-24"
              />
            </div>
          </div>
        </Card>
      </motion.section>

      {/* ─── Section 5: Current Period Inputs ─── */}
      <motion.section variants={fadeUp} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Current period inputs
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {draft.sourceType === "revenue_percent"
              ? "Revenue for this period. Used to calculate the pool."
              : draft.sourceType === "profit_percent"
              ? "Profit for this period. Used to calculate the pool."
              : "Fixed-amount pools do not use period inputs."}
          </p>
        </div>
        <Card className="p-5 space-y-4">
          {draft.sourceType === "revenue_percent" && (
            <div>
              <Label className="text-xs">Revenue (GHS)</Label>
              <Input
                type="number"
                min={0}
                value={draft.periodInputs.revenue ?? ""}
                onChange={(e) =>
                  set("periodInputs", {
                    ...draft.periodInputs,
                    revenue: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="mt-1.5 max-w-xs"
                placeholder="Enter current period revenue"
              />
            </div>
          )}
          {draft.sourceType === "profit_percent" && (
            <div>
              <Label className="text-xs">Profit (GHS)</Label>
              <Input
                type="number"
                min={0}
                value={draft.periodInputs.profit ?? ""}
                onChange={(e) =>
                  set("periodInputs", {
                    ...draft.periodInputs,
                    profit: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="mt-1.5 max-w-xs"
                placeholder="Enter current period profit"
              />
            </div>
          )}
          {draft.sourceType === "fixed_amount" && (
            <p className="text-xs text-muted-foreground">
              The fixed amount is set in the Pool source section above.
            </p>
          )}
        </Card>
      </motion.section>
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/25">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Total bonus pool
              </div>
              <div className="text-3xl font-bold text-foreground mt-0.5 tabular-nums">
                {fmtGHS(preview)}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground max-w-xs text-right">
            Based on the source and inputs above. Updates as you type.
          </div>
        </div>
      </Card>

      {/* ─── Sticky save bar ─── */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Card className="px-4 py-3 shadow-xl border-primary/30 flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Unsaved changes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}