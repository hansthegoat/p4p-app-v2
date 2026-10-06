import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { useP4P } from "@/lib/p4p/store";
import { useUser } from "@/lib/p4p/user-context";
import { PageLoader } from "@/components/ui/page-loader";
import { SettingUpScreen } from "@/components/p4p/SettingUpScreen";
import { usePageTour } from "@/hooks/usePageTour";
import {
  getWelcomeTourForRole,
  getDashboardTourForRole,
  isTourDone,
  type Tour,
} from "@/lib/p4p/tours";
import { DashboardAdmin } from "@/components/p4p/dashboard/DashboardAdmin";
import { DashboardEmployee } from "@/components/p4p/dashboard/DashboardEmployee";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { employees, refreshFromCloud } = useP4P();
  const { role: contextRole, user: contextUser } = useUser();

  const [detectedRole, setDetectedRole] = useState<string>("employee");
  const [welcomeTour, setWelcomeTour] = useState<Tour | null>(null);
  const [dashboardTour, setDashboardTour] = useState<Tour | null>(null);

  // Guards the "decide which tour to run" effect so it only fires once per role
  const tourDecisionMadeRef = useRef(false);

  // Synchronous Employee Resolution
  const employee = useMemo(() => {
    if (!contextUser) return null;
    return (
      employees.find((e) => e.authUserId === contextUser.id) ||
      employees.find((e) => e.email === contextUser.email) ||
      null
    );
  }, [employees, contextUser]);

  // Cloud Sync / Timeout Management
  const [waitingSince, setWaitingSince] = useState<number | null>(null);
  const [setupTimedOut, setSetupTimedOut] = useState(false);

  useEffect(() => {
    if (!contextUser) return;
    if (employee) {
      setWaitingSince(null);
      setSetupTimedOut(false);
      return;
    }
    setWaitingSince((prev) => prev ?? Date.now());
  }, [contextUser, employee]);

  useEffect(() => {
    if (waitingSince === null) return;
    const elapsed = Date.now() - waitingSince;
    const remaining = Math.max(0, 10000 - elapsed);
    const timer = window.setTimeout(() => setSetupTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [waitingSince]);

  useEffect(() => {
    if (waitingSince === null) return;
    const interval = window.setInterval(() => {
      refreshFromCloud().catch(() => {});
    }, 3000);
    return () => window.clearInterval(interval);
  }, [waitingSince, refreshFromCloud]);

  // Role Detection
  useEffect(() => {
    if (contextUser?.email === "hr@aoholdings.net") {
      setDetectedRole("hr");
      return;
    }
    if (employee?.roleType) {
      setDetectedRole(employee.roleType);
      return;
    }
    if (contextRole && ["employee", "hr", "admin"].includes(contextRole)) {
      setDetectedRole(contextRole);
    }
  }, [contextUser, employee, contextRole]);

  const role = detectedRole || contextRole || "employee";
  const isAdmin = role === "admin" || role === "hr";

  // ---------- Guided Tours ----------
  // We only run one tour per session (welcome OR dashboard), decided once.
  useEffect(() => {
    if (typeof window === "undefined" || !role) return;
    if (tourDecisionMadeRef.current) return;
    tourDecisionMadeRef.current = true;

    const employeeWelcomeDone = isTourDone("employee_welcome");
    const hrWelcomeDone = isTourDone("hr_welcome");
    const welcomeAlreadySeen = employeeWelcomeDone && hrWelcomeDone;

    if (welcomeAlreadySeen) {
      // Skip welcome, go straight to dashboard tour
      setDashboardTour(getDashboardTourForRole(role));
    } else {
      // Play welcome first; onComplete chains the dashboard tour below
      setWelcomeTour(getWelcomeTourForRole(role));
    }
  }, [role]);

  // Welcome tour — on completion, hand off to the dashboard tour
  usePageTour(welcomeTour, !!welcomeTour, () => {
    if (!role) return;
    setWelcomeTour(null);
    setDashboardTour(getDashboardTourForRole(role));
  });

  // Dashboard tour — clears itself when done so it doesn't replay on role change
  usePageTour(dashboardTour, !!dashboardTour, () => {
    setDashboardTour(null);
  });
  // ---------- /Guided Tours ----------

  // Guard Screen States
  if (!contextUser) {
    return <PageLoader text="Loading your dashboard…" />;
  }

  if (!employee && !isAdmin) {
    return (
      <SettingUpScreen
        status={setupTimedOut ? "timeout" : "loading"}
        onRetry={() => {
          setSetupTimedOut(false);
          setWaitingSince(Date.now());
          refreshFromCloud().catch(() => {});
        }}
      />
    );
  }

  if (isAdmin) return <DashboardAdmin />;

  if (!employee) return null;

  return <DashboardEmployee employee={employee} />;
}