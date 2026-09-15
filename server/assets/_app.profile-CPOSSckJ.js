import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { C as Card } from "./card-DJtmP4ah.js";
import { B as Button } from "./button-D-QX7IMW.js";
import { B as Badge } from "./badge-wpDZCSRZ.js";
import { P as PageHeader } from "./page-header-DgJSKcTG.js";
import { a as useP4P, b as useUser, s as supabase } from "./router-D7LNLANq.js";
import { s as showToast } from "./toast-DYWvTbJb.js";
import { Award, Mail, Building2, UserCog, Target, Calendar, CheckCircle, KeyRound, LogOut } from "lucide-react";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@sentry/react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "zod";
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
  const [me, setMe] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "My Profile", description: "Your account and performance summary.", icon: /* @__PURE__ */ jsx(Award, { className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0", children: (me?.name || authEmail || "?").charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold truncate", children: me?.name || "Unknown" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground truncate flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
          " ",
          authEmail || me?.email || "—"
        ] }),
        me?.roleType && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mt-2 text-[10px] capitalize", children: me.roleType })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Work information" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }), label: "Department", value: me?.department || "—" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(UserCog, { className: "h-3.5 w-3.5" }), label: "Role", value: me?.role || "—" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(Award, { className: "h-3.5 w-3.5" }), label: "Job grade", value: me?.jobGrade || "—" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(Target, { className: "h-3.5 w-3.5" }), label: "Supervisor", value: me?.supervisorName || "Not assigned" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }), label: "Join date", value: me?.joinDate || "—" }),
        /* @__PURE__ */ jsx(InfoRow, { icon: /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }), label: "Months worked", value: String(me?.monthsWorked || 0) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", children: "Your KPIs" }),
      me?.categories && me.categories.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground mb-3", children: [
          me.categories.length,
          " categories · ",
          totalKpis,
          " KPIs assigned"
        ] }),
        me.categories.map((cat, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: cat.name })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground shrink-0", children: [
            cat.kpis.length,
            " KPIs · ",
            cat.weight,
            "%"
          ] })
        ] }, i))
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No KPIs assigned yet. HR will push them soon." })
    ] }),
    trend && /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", children: "Performance snapshot" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsx(MiniStat, { label: "Current", value: trend.currentScore.toFixed(2) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Average", value: trend.averageScore.toFixed(2) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Best month", value: trend.bestMonth.score.toFixed(2) }),
        /* @__PURE__ */ jsx(MiniStat, { label: "Months tracked", value: String(history.length) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "p-5 space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", children: "Account" }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => navigate({
        to: "/change-password"
      }), className: "w-full justify-start gap-2", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4" }),
        " Change password"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: handleLogout, className: "w-full justify-start gap-2 text-red-600 hover:text-red-700 border-red-500/30 hover:bg-red-500/10", children: [
        /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
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
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground mt-1 shrink-0", children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx("div", { className: "text-sm truncate", children: value })
    ] })
  ] });
}
function MiniStat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/40 border border-border/50 p-3", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider font-semibold text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-lg font-bold tabular-nums mt-0.5", children: value })
  ] });
}
export {
  ProfilePage as component
};
