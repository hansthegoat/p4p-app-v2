import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card } from "./card-DJtmP4ah.js";
function SectionCard({
  title,
  description,
  icon,
  action,
  children,
  className = "",
  noPadding = false
}) {
  return /* @__PURE__ */ jsxs(Card, { className: `overflow-hidden ${className}`, children: [
    (title || action) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
        icon && /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground", children: icon }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          title && /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-foreground truncate", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: description })
        ] })
      ] }),
      action && /* @__PURE__ */ jsx("div", { className: "shrink-0", children: action })
    ] }),
    /* @__PURE__ */ jsx("div", { className: noPadding ? "" : "p-6", children })
  ] });
}
export {
  SectionCard as S
};
