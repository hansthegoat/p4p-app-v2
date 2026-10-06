import { Star, TrendingUp, Target, Clock, AlertCircle } from "lucide-react";
import type { useP4P } from "@/lib/p4p/store";

// Static Color Map Definitions to prevent Tailwind Purge failures
export const COLOR_THEMES = {
  emerald: {
    border: "border-l-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    subtleBg: "bg-emerald-500/10",
  },
  blue: {
    border: "border-l-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500",
    subtleBg: "bg-blue-500/10",
  },
  amber: {
    border: "border-l-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    subtleBg: "bg-amber-500/10",
  },
  red: {
    border: "border-l-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500",
    subtleBg: "bg-red-500/10",
  },
  purple: {
    border: "border-l-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500",
    subtleBg: "bg-purple-500/10",
  },
} as const;

export type ThemeKey = keyof typeof COLOR_THEMES;

export const CHART_COLORS = [
  "hsl(152 55% 42%)",
  "hsl(221 70% 50%)",
  "hsl(38 75% 52%)",
  "hsl(0 65% 55%)",
];

export const CHART_PRIMARY_COLOR = "hsl(221 70% 50%)";

export const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  padding: "8px 12px",
};

// Derive employee type from the store instead of re-declaring it
export type P4PEmployee = ReturnType<typeof useP4P>["employees"][number];

export type Kpi = {
  description: string;
  weight?: number;
  metric?: string;
  target?: number;
  actual?: number;
};

export type CategoryScore = {
  name: string;
  score: number;
  weight: number;
  kpiCount: number;
  kpis: Array<{
    description: string;
    weight: number;
    metric?: string;
    target?: number;
    actual?: number;
  }>;
};

export type KpiAchievement = {
  name: string;
  achievement: number;
  target?: number;
  actual?: number;
  metric?: string;
  weight: number;
  category: string;
  status: "Exceeded" | "On Track" | "At Risk" | "Missed";
};

// Helper: Calculate Performance Band
export function getBand(score: number) {
  if (score >= 120) return { label: "Exceptional", color: COLOR_THEMES.purple.text, icon: Star };
  if (score >= 100) return { label: "Exceeds Expectations", color: COLOR_THEMES.emerald.text, icon: TrendingUp };
  if (score >= 80) return { label: "Meets Expectations", color: COLOR_THEMES.blue.text, icon: Target };
  if (score >= 60) return { label: "Needs Improvement", color: COLOR_THEMES.amber.text, icon: Clock };
  return { label: "Performance Improvement Plan", color: COLOR_THEMES.red.text, icon: AlertCircle };
}