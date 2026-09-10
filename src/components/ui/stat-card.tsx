import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fadeUp, hoverLift } from "@/lib/motion";

type Accent = "primary" | "success" | "warning" | "danger" | "info" | "purple" | "default";
type PulseColor = "red" | "amber" | "emerald" | "blue" | "purple" | "none";

const ACCENT_STYLES: Record<Accent, { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/20" },
  success: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  danger: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/20" },
  info: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/20" },
  default: { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" },
};

const PULSE_CLASSES: Record<PulseColor, string> = {
  red: "pulse-red ring-2 ring-red-500/40",
  amber: "pulse-amber ring-2 ring-amber-500/40",
  emerald: "pulse-emerald ring-2 ring-emerald-500/40",
  blue: "pulse-blue ring-2 ring-blue-500/40",
  purple: "pulse-purple ring-2 ring-purple-500/40",
  none: "",
};

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  accent?: Accent;
  size?: "default" | "large";
  pulse?: PulseColor;
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  accent = "default",
  size = "default",
  pulse = "none",
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  const TrendIcon =
    trend !== undefined && trend > 0
      ? ArrowUpRight
      : trend !== undefined && trend < 0
      ? ArrowDownRight
      : null;

  const valueSize =
    size === "large"
      ? "text-2xl md:text-3xl lg:text-4xl"
      : "text-xl md:text-2xl lg:text-3xl";

  const pulseClass = PULSE_CLASSES[pulse];

  return (
    <motion.div variants={fadeUp} {...hoverLift} className="h-full">
      <Card
        className={`relative overflow-hidden p-5 h-full group cursor-default transition-all duration-300 ${pulseClass}`}
      >
        {/* Gradient glow on hover */}
        <div
          className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${styles.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}
        />

        <div className="relative flex items-start justify-between gap-3 mb-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {label}
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}
          >
            {icon}
          </div>
        </div>

        {/* ✅ Value now uses default foreground (black in light mode) */}
        <div
          className={`relative font-bold tracking-tight truncate text-foreground ${valueSize} leading-tight`}
          title={String(value)}
        >
          {value}
        </div>

        {(sub || trend !== undefined) && (
          <div className="relative flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            {TrendIcon && (
              <TrendIcon
                className={`h-3.5 w-3.5 shrink-0 ${
                  trend! > 0 ? "text-emerald-500" : "text-red-500"
                }`}
              />
            )}
            {sub && <span className="truncate">{sub}</span>}
          </div>
        )}
      </Card>
    </motion.div>
  );
}