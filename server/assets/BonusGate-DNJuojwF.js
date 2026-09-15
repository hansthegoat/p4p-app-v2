import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { a as useP4P, s as supabase, f as fmtGHS } from "./router-D7LNLANq.js";
function BonusGate({ value, className = "", compact = false }) {
  const { bonusRevealed, employees } = useP4P();
  const [role, setRole] = useState("employee");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u || cancelled) return;
      if (u.email === "hr@aoholdings.net") {
        setRole("hr");
        return;
      }
      const me = employees.find(
        (e) => e.authUserId === u.id || e.email === u.email
      );
      if (me?.roleType) setRole(me.roleType);
    })();
    return () => {
      cancelled = true;
    };
  }, [employees]);
  const canSee = role === "hr" || role === "admin" || bonusRevealed;
  if (canSee) {
    return /* @__PURE__ */ jsx("span", { className, children: fmtGHS(value) });
  }
  if (compact) {
    return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 ${className}`, children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block h-4 w-16 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" }),
      /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-muted-foreground" })
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex flex-col items-start gap-1 ${className}`, children: [
    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block h-5 w-24 rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" }),
      /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5 text-muted-foreground" })
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground italic", children: "Keep pushing hard 💪" })
  ] });
}
export {
  BonusGate as B
};
