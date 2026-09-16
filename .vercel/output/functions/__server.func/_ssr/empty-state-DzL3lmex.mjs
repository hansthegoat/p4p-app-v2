import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as fadeUp } from "./motion-DlChdgW6.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
function EmptyState({ icon, title, description, action }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: "hidden",
      animate: "show",
      variants: fadeUp,
      className: "flex flex-col items-center justify-center text-center py-16 px-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 text-muted-foreground border border-border/50", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-foreground mb-1", children: title }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm mb-5", children: description }),
        action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: action })
      ]
    }
  );
}
export {
  EmptyState as E
};
