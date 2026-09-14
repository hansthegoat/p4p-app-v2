import { jsxs, jsx } from "react/jsx-runtime";
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
export {
  PageHeader as P
};
