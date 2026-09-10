import { jsxs, jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
function PageHeader({ title, description, icon, actions }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
      icon && /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary", children: icon }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground truncate", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description })
      ] })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: actions })
  ] });
}
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};
const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.99 }
};
function EmptyState({ icon, title, description, action }) {
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: "hidden",
      animate: "show",
      variants: fadeUp,
      className: "flex flex-col items-center justify-center text-center py-16 px-4",
      children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 text-muted-foreground border border-border/50", children: icon }),
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-foreground mb-1", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-sm mb-5", children: description }),
        action && /* @__PURE__ */ jsx("div", { className: "mt-1", children: action })
      ]
    }
  );
}
export {
  EmptyState as E,
  PageHeader as P,
  fadeUp as f,
  hoverLift as h,
  staggerContainer as s
};
