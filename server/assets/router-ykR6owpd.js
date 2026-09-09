import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const appCss = "/p4p-app-v2/assets/styles-Dyv3_qMv.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$e = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "P4P Bonus Calculator" },
      { name: "description", content: "Calculate and trace pay-for-performance bonus grades and traces for employees." },
      { name: "author", content: "Iddo Adu Gyamfi" },
      { property: "og:title", content: "P4P Bonus Calculator" },
      { property: "og:description", content: "Calculate and trace pay-for-performance bonus grades and traces for employees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$e.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const $$splitComponentImporter$d = () => import("./register-BX9w6lQj.js");
const Route$d = createFileRoute("/register")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./login-9PePDPnz.js");
const Route$c = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const DEFAULT_GRADES = [
  { code: "B", name: "President", points: 100 },
  { code: "C", name: "Executive President", points: 90 },
  { code: "D", name: "Senior Vice President", points: 80 },
  { code: "E", name: "Vice President", points: 70 },
  { code: "F", name: "Head of Department", points: 60 },
  { code: "G", name: "Line Manager/SBU Head", points: 55 },
  { code: "H", name: "Team Lead", points: 50 },
  { code: "1", name: "Senior Specialist", points: 45 },
  { code: "2", name: "Specialist", points: 40 },
  { code: "3", name: "Senior Analyst", points: 35 },
  { code: "4", name: "Analyst", points: 30 },
  { code: "5", name: "Senior Executive", points: 25 },
  { code: "6", name: "Executive", points: 20 },
  { code: "7", name: "Graduate Trainee", points: 15 },
  { code: "8", name: "NSS/Assistant", points: 10 },
  { code: "9", name: "Intern", points: 5 }
];
const DEFAULT_GLOBALS = {
  totalRevenue: 2e7,
  p4pPercent: 2.5,
  adjunctPercent: 10,
  floor: 0.5,
  cap: 1.5,
  prorationOn: false,
  salesMultiplier: 1.3
};
const id = () => Math.random().toString(36).slice(2, 10);
const newId = id;
const DEMO_EMPLOYEES = [
  {
    id: id(),
    name: "Jane Adjunct",
    jobGrade: "5",
    isAdjunct: true,
    isSalesRole: false,
    joinDate: "2025-01-01",
    monthsWorked: 12,
    kpis: [],
    categories: []
  },
  {
    id: id(),
    name: "John Adjunct",
    jobGrade: "6",
    isAdjunct: true,
    isSalesRole: false,
    joinDate: "2025-01-01",
    monthsWorked: 12,
    kpis: [],
    categories: []
  },
  {
    id: id(),
    name: "Alice Johnson",
    jobGrade: "G",
    isAdjunct: false,
    isSalesRole: true,
    joinDate: "2025-01-15",
    monthsWorked: 12,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Strategic Contribution",
        weight: 30,
        kpis: [
          { id: id(), description: "Revenue Growth", metric: "GHS", target: 5e5, actual: 6e5, weight: 40 },
          { id: id(), description: "CSAT Score", metric: "%", target: 90, actual: 85, weight: 30 },
          { id: id(), description: "Market Share", metric: "%", target: 25, actual: 20, weight: 30 }
        ]
      },
      {
        id: id(),
        name: "Operational Excellence",
        weight: 20,
        kpis: [
          { id: id(), description: "Process Efficiency", metric: "%", target: 95, actual: 88, weight: 100 }
        ]
      }
    ]
  },
  {
    id: id(),
    name: "Bob Smith",
    jobGrade: "4",
    isAdjunct: false,
    isSalesRole: false,
    joinDate: "2025-03-01",
    monthsWorked: 10,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Team Performance",
        weight: 40,
        kpis: [
          { id: id(), description: "Team Lead", metric: "%", target: 100, actual: 90, weight: 60 },
          { id: id(), description: "Projects Completed", metric: "#", target: 12, actual: 10, weight: 40 }
        ]
      }
    ]
  },
  {
    id: id(),
    name: "Carol Davis",
    jobGrade: "1",
    isAdjunct: false,
    isSalesRole: true,
    joinDate: "2025-02-10",
    monthsWorked: 11,
    kpis: [],
    categories: [
      {
        id: id(),
        name: "Project Delivery",
        weight: 50,
        kpis: [
          { id: id(), description: "Project completion", metric: "%", target: 100, actual: 95, weight: 100 }
        ]
      },
      {
        id: id(),
        name: "Client Satisfaction",
        weight: 30,
        kpis: [
          { id: id(), description: "Client NPS", metric: "%", target: 80, actual: 75, weight: 100 }
        ]
      }
    ]
  }
];
const SUPABASE_URL = "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
const uploadProofFile = async (employeeId, kpiId, file) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const fileExt = file.name.split(".").pop();
    const fileName = `${employeeId}/${kpiId}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("proof-files").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("proof-files").getPublicUrl(fileName);
    return {
      id: newId(),
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type
    };
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
const $$splitComponentImporter$b = () => import("./_app-L7ilCN7O.js");
const Route$b = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./index-BTU5dmpx.js");
const Route$a = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("p4p_logged_in") === "1";
    throw redirect({
      to: ok ? "/dashboard" : "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_app.trace-CHXbODq6.js");
const Route$9 = createFileRoute("/_app/trace")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./_app.supervisors-Dptc66Yo.js");
const Route$8 = createFileRoute("/_app/supervisors")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_app.monthly-C_z3v-U_.js");
const Route$7 = createFileRoute("/_app/monthly")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_app.kpi-framework-MSE3r66V.js");
const Route$6 = createFileRoute("/_app/kpi-framework")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_app.grades-Den5iPJ2.js");
const Route$5 = createFileRoute("/_app/grades")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_app.employees-C0mrnkoI.js");
const Route$4 = createFileRoute("/_app/employees")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_app.employee-DND6eAdw.js");
const Route$3 = createFileRoute("/_app/employee")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_app.dashboard-E88VKH6y.js");
const Route$2 = createFileRoute("/_app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_app.appraisals-review-Dv-rIy24.js");
const Route$1 = createFileRoute("/_app/appraisals-review")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_app.appraisals-Bc7Q5hcG.js");
const Route = createFileRoute("/_app/appraisals")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const RegisterRoute = Route$d.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$e
});
const LoginRoute = Route$c.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$e
});
const AppRoute = Route$b.update({
  id: "/_app",
  getParentRoute: () => Route$e
});
const IndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$e
});
const AppTraceRoute = Route$9.update({
  id: "/trace",
  path: "/trace",
  getParentRoute: () => AppRoute
});
const AppSupervisorsRoute = Route$8.update({
  id: "/supervisors",
  path: "/supervisors",
  getParentRoute: () => AppRoute
});
const AppMonthlyRoute = Route$7.update({
  id: "/monthly",
  path: "/monthly",
  getParentRoute: () => AppRoute
});
const AppKpiFrameworkRoute = Route$6.update({
  id: "/kpi-framework",
  path: "/kpi-framework",
  getParentRoute: () => AppRoute
});
const AppGradesRoute = Route$5.update({
  id: "/grades",
  path: "/grades",
  getParentRoute: () => AppRoute
});
const AppEmployeesRoute = Route$4.update({
  id: "/employees",
  path: "/employees",
  getParentRoute: () => AppRoute
});
const AppEmployeeRoute = Route$3.update({
  id: "/employee",
  path: "/employee",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppAppraisalsReviewRoute = Route$1.update({
  id: "/appraisals-review",
  path: "/appraisals-review",
  getParentRoute: () => AppRoute
});
const AppAppraisalsRoute = Route.update({
  id: "/appraisals",
  path: "/appraisals",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAppraisalsRoute,
  AppAppraisalsReviewRoute,
  AppDashboardRoute,
  AppEmployeeRoute,
  AppEmployeesRoute,
  AppGradesRoute,
  AppKpiFrameworkRoute,
  AppMonthlyRoute,
  AppSupervisorsRoute,
  AppTraceRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute,
  RegisterRoute
};
const routeTree = Route$e._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  DEFAULT_GRADES as D,
  DEMO_EMPLOYEES as a,
  DEFAULT_GLOBALS as b,
  getCurrentUser as g,
  newId as n,
  router as r,
  supabase as s,
  uploadProofFile as u
};
