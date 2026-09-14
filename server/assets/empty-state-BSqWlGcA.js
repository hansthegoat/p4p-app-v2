import { jsxs, jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { f as fadeUp } from "./motion-BS01Szpl.js";
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
  EmptyState as E
};
