import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { C as Card } from "./card-DJtmP4ah.js";
import { h as hoverLift, f as fadeUp } from "./motion-DlChdgW6.js";
const ACCENT_STYLES = {
  primary: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/20" },
  success: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  danger: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/20" },
  info: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/20" },
  default: { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" }
};
const PULSE_CLASSES = {
  red: "pulse-red ring-2 ring-red-500/40",
  amber: "pulse-amber ring-2 ring-amber-500/40",
  emerald: "pulse-emerald ring-2 ring-emerald-500/40",
  blue: "pulse-blue ring-2 ring-blue-500/40",
  purple: "pulse-purple ring-2 ring-purple-500/40",
  none: ""
};
function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  accent = "default",
  size = "default",
  pulse = "none"
}) {
  const styles = ACCENT_STYLES[accent];
  const TrendIcon = trend !== void 0 && trend > 0 ? ArrowUpRight : trend !== void 0 && trend < 0 ? ArrowDownRight : null;
  const valueSize = size === "large" ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl md:text-2xl lg:text-3xl";
  const pulseClass = PULSE_CLASSES[pulse];
  return /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, ...hoverLift, className: "h-full", children: /* @__PURE__ */ jsxs(
    Card,
    {
      className: `relative overflow-hidden p-5 h-full group cursor-default transition-all duration-300 ${pulseClass}`,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `absolute -top-8 -right-8 w-24 h-24 rounded-full ${styles.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative flex items-start justify-between gap-3 mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate", children: label }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.text} ring-1 ${styles.ring}`,
              children: icon
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `relative font-bold tracking-tight truncate text-foreground ${valueSize} leading-tight`,
            title: String(value),
            children: value
          }
        ),
        (sub || trend !== void 0) && /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-1 mt-2 text-xs text-muted-foreground", children: [
          TrendIcon && /* @__PURE__ */ jsx(
            TrendIcon,
            {
              className: `h-3.5 w-3.5 shrink-0 ${trend > 0 ? "text-emerald-500" : "text-red-500"}`
            }
          ),
          sub && /* @__PURE__ */ jsx("span", { className: "truncate", children: sub })
        ] })
      ]
    }
  ) });
}
export {
  StatCard as S
};
