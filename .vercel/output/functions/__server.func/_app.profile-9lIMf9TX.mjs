import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { C as Card } from "./_ssr/card-DJtmP4ah.mjs";
import { B as Button } from "./_ssr/button-D-QX7IMW.mjs";
import { B as Badge } from "./_ssr/badge-wpDZCSRZ.mjs";
import { P as PageHeader } from "./_ssr/page-header-DgJSKcTG.mjs";
import { a as useP4P, b as useUser, s as supabase } from "./_ssr/router-BPHF_myF.mjs";
import { s as showToast } from "./_ssr/toast-DYWvTbJb.mjs";
import "./_libs/sonner.mjs";
import { x as Award, M as Mail, z as Building2, N as UserCog, T as Target, _ as Calendar, C as CircleCheckBig, K as KeyRound, k as LogOut } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/zod.mjs";
import "./_libs/sentry__react.mjs";
import "./_libs/sentry__core.mjs";
import "./_libs/sentry__browser.mjs";
import "./_libs/sentry__browser-utils.mjs";
import "./_libs/sentry__conventions.mjs";
function ProfilePage() {
  const navigate = useNavigate();
  const {
    employees,
    getMonthlyHistory,
    getPerformanceTrend
  } = useP4P();
  const {
    logout
  } = useUser();
  const [me, setMe] = reactExports.useState(null);
  const [authEmail, setAuthEmail] = reactExports.useState("");
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data
      } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u || cancelled) return;
      setAuthEmail(u.email || "");
      const emp = employees.find((e) => e.authUserId === u.id || e.email === u.email);
      setMe(emp || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [employees]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout?.();
    showToast.success("Logged out", "See you soon.");
    navigate({
      to: "/login"
    });
  };
  const history = me ? getMonthlyHistory(me.id) : [];
  const trend = me ? getPerformanceTrend(me.id) : null;
  const totalKpis = me?.categories?.reduce((s, c) => s + c.kpis.length, 0) || 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "My Profile", description: "Your account and performance summary.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0", children: (me?.name || authEmail || "?").charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold truncate", children: me?.name || "Unknown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground truncate flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
          " ",
          authEmail || me?.email || "—"
        ] }),
        me?.roleType && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-2 text-[10px] capitalize", children: me.roleType })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Work information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }), label: "Department", value: me?.department || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-3.5 w-3.5" }), label: "Role", value: me?.role || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3.5 w-3.5" }), label: "Job grade", value: me?.jobGrade || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5" }), label: "Supervisor", value: me?.supervisorName || "Not assigned" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }), label: "Join date", value: me?.joinDate || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }), label: "Months worked", value: String(me?.monthsWorked || 0) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Your KPIs" }),
      me?.categories && me.categories.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mb-3", children: [
          me.categories.length,
          " categories · ",
          totalKpis,
          " KPIs assigned"
        ] }),
        me.categories.map((cat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: cat.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground shrink-0", children: [
            cat.kpis.length,
            " KPIs · ",
            cat.weight,
            "%"
          ] })
        ] }, i))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No KPIs assigned yet. HR will push them soon." })
    ] }),
    trend && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Performance snapshot" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Current", value: trend.currentScore.toFixed(2) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Average", value: trend.averageScore.toFixed(2) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Best month", value: trend.bestMonth.score.toFixed(2) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat, { label: "Months tracked", value: String(history.length) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => navigate({
        to: "/change-password"
      }), className: "w-full justify-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4" }),
        " Change password"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleLogout, className: "w-full justify-start gap-2 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
        " Sign out"
      ] })
    ] })
  ] });
}
function InfoRow({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mt-1 shrink-0", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm truncate", children: value })
    ] })
  ] });
}
function MiniStat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/40 border border-border/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold tabular-nums mt-0.5", children: value })
  ] });
}
export {
  ProfilePage as component
};
