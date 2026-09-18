import type { Config } from "driver.js";

export interface TourStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
}

export interface Tour {
  key: string;
  steps: TourStep[];
}

const BASE_DRIVER_CONFIG: Partial<Config> = {
  showProgress: true,
  progressText: "{{current}} of {{total}}",
  nextBtnText: "Next",
  prevBtnText: "Back",
  doneBtnText: "Got it",
  showButtons: ["next", "previous", "close"],
  allowClose: true,
  overlayColor: "rgba(2, 6, 23, 0.75)",
  smoothScroll: true,
  stagePadding: 4,
  stageRadius: 12,
  popoverOffset: 12,
  popoverClass: "p4p-tour-popover",
};

/* ============================================================
   WELCOME TOURS (post-onboarding)
   ============================================================ */

const EMPLOYEE_WELCOME: Tour = {
  key: "employee_welcome",
  steps: [
    {
      element: '[data-tour="sidebar"]',
      popover: {
        title: "Your navigation",
        description:
          "Everything you need is on the left. Pages open as you click them — you can always come back here.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[data-tour="kpi-score"]',
      popover: {
        title: "Your live score",
        description:
          "This is your performance score. It updates automatically as you enter your monthly KPI actuals.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="notifications"]',
      popover: {
        title: "Stay in the loop",
        description:
          "You'll get notified here whenever HR updates your KPIs or an appraisal needs your attention.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="nav-my-performance"]',
      popover: {
        title: "Start here",
        description:
          "My Performance is where you enter your monthly KPIs, upload proof, and add comments.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-my-profile"]',
      popover: {
        title: "Your account",
        description:
          "Your profile, password, and personal info all live here. Take the tour again from this page anytime.",
        side: "right",
        align: "center",
      },
    },
  ],
};

const HR_WELCOME: Tour = {
  key: "hr_welcome",
  steps: [
    {
      element: '[data-tour="sidebar"]',
      popover: {
        title: "Your command center",
        description:
          "Navigate between templates, employees, and reviews from the sidebar.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[data-tour="needs-attention"]',
      popover: {
        title: "What needs your attention",
        description:
          "This section surfaces everything pending: unassigned supervisors, missing KPIs, appraisals to review. It updates live.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-kpi-framework"]',
      popover: {
        title: "Define your KPIs",
        description:
          "The KPI Framework is where you build weighted templates per department and role. Import from Excel, export, or push to employees.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-employees"]',
      popover: {
        title: "Manage your team",
        description:
          "Every employee lives here. Track performance, edit records, and see who's missing what.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-audit-log"]',
      popover: {
        title: "Every change is tracked",
        description:
          "The Audit Log records every KPI push, acknowledgment, and comment. Compliance and debugging in one place.",
        side: "right",
        align: "center",
      },
    },
  ],
};

/* ============================================================
   EMPLOYEE DASHBOARD TOUR
   ============================================================ */

const EMPLOYEE_DASHBOARD_TOUR: Tour = {
  key: "page_dashboard_employee",
  steps: [
    {
      element: '[data-tour="dashboard-header"]',
      popover: {
        title: "Your performance dashboard",
        description:
          "This is your home base. Your current score, YTD average, estimated bonus, and months tracked — all live up top.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="kpi-score"]',
      popover: {
        title: "Your live score",
        description:
          "Your current weighted score. It updates automatically as you enter your monthly KPI actuals.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="dashboard-tabs"]',
      popover: {
        title: "Three views of your performance",
        description:
          "Overview shows your trend and status breakdown. Categories breaks it down by KPI group. Insights highlights your strengths and areas for improvement.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="dashboard-leaderboard"]',
      popover: {
        title: "Compare with your team",
        description:
          "See how you rank against your department. Celebrate wins and spot patterns.",
        side: "top",
        align: "center",
      },
    },
  ],
};

/* ============================================================
   ADMIN / HR DASHBOARD TOUR
   ============================================================ */

const ADMIN_DASHBOARD_TOUR: Tour = {
  key: "page_dashboard_admin",
  steps: [
    {
      element: '[data-tour="dashboard-header"]',
      popover: {
        title: "Your command center",
        description:
          "Live overview of pools, payouts, performance signals, and monthly trends — for the whole company.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="needs-attention"]',
      popover: {
        title: "What needs your attention",
        description:
          "Anything pending shows up here first: unassigned supervisors, missing KPIs, appraisals to review.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="global-settings"]',
      popover: {
        title: "Global P4P settings",
        description:
          "Revenue, pool percentages, floor, cap, and sales multiplier all live here. Change once, and every bonus recalculates.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="dashboard-stats"]',
      popover: {
        title: "The numbers at a glance",
        description:
          "Revenue, total pool, adjunct pool, employee pool, headcount, and average bonus — updated as settings change.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="dashboard-trend"]',
      popover: {
        title: "Monthly performance trend",
        description:
          "Average multiplier across all tracked employees, month by month. Spot momentum or drift early.",
        side: "top",
        align: "center",
      },
    },
  ],
};

/* ============================================================
   PAGE TOURS
   ============================================================ */

const MY_PERFORMANCE_TOUR: Tour = {
  key: "page_my_performance",
  steps: [
    {
      element: '[data-tour="performance-header"]',
      popover: {
        title: "Your performance",
        description:
          "This page shows your KPIs, entered actuals, and your live weighted score.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="performance-categories"]',
      popover: {
        title: "Categories & KPIs",
        description:
          "Each category holds a set of KPIs. Enter actuals and add proof or comments for each one.",
        side: "bottom",
        align: "center",
      },
    },
  ],
};

const MY_CALCULATION_TOUR: Tour = {
  key: "page_my_calculation",
  steps: [
    {
      element: '[data-tour="calculation-header"]',
      popover: {
        title: "How your bonus is calculated",
        description:
          "Every step of the formula is traced here — no hidden math. You can see exactly which KPIs contributed.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="calculation-bonus"]',
      popover: {
        title: "Your current bonus",
        description:
          "This is your live bonus, based on approved KPI data. It grows as your performance multiplier rises.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="calculation-steps"]',
      popover: {
        title: "Step by step",
        description:
          "Each section walks through one piece of the formula — Grade Points, Value per Point, your Multiplier, and more.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="calculation-whatif"]',
      popover: {
        title: "What if you improved?",
        description:
          "See what your bonus would be if you hit every target, or reached 120% — a clear target to aim for.",
        side: "top",
        align: "center",
      },
    },
  ],
};

const PROFILE_TOUR: Tour = {
  key: "page_profile",
  steps: [
    {
      element: '[data-tour="profile-header"]',
      popover: {
        title: "Your profile",
        description:
          "Your name, role, department, and grade — the info HR has on file for you.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="profile-details"]',
      popover: {
        title: "Your details",
        description:
          "Email, department, role, grade, and supervisor. Contact HR if anything here is out of date.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="profile-account"]',
      popover: {
        title: "Account actions",
        description:
          "Replay any tour, change your password, or sign out from here. Keep your account safe.",
        side: "top",
        align: "center",
      },
    },
  ],
};

const APPRAISALS_TOUR: Tour = {
  key: "page_appraisals",
  steps: [
    {
      element: '[data-tour="appraisals-header"]',
      popover: {
        title: "Your appraisals",
        description:
          "Every monthly appraisal you've submitted lives here — with its status, score, and reviewer.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="appraisals-stats"]',
      popover: {
        title: "At a glance",
        description:
          "Counts of pending, approved, rejected, and revision requests. Use this to see what needs your attention.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="appraisals-submit"]',
      popover: {
        title: "Submit a new appraisal",
        description:
          "When a new month or quarter opens, enter the period here and click Submit for Review. Your current KPI data goes with it.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="appraisals-list"]',
      popover: {
        title: "Your submission history",
        description:
          "Click Details on any appraisal to see the full KPI breakdown, proof files, and reviewer comments.",
        side: "top",
        align: "center",
      },
    },
  ],
};

const APPRAISALS_REVIEW_TOUR: Tour = {
  key: "page_appraisals_review",
  steps: [
    {
      element: '[data-tour="review-header"]',
      popover: {
        title: "Appraisals to review",
        description:
          "Every submission waiting for approval lands here. Approve, request changes, or leave feedback.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="review-stats"]',
      popover: {
        title: "Queue at a glance",
        description:
          "Pending, approved, revision requests, and rejections — everything you need to see what needs action.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="review-tabs"]',
      popover: {
        title: "Pending vs History",
        description:
          "The Pending tab shows what's waiting on you. History lets you filter past appraisals by department and status.",
        side: "bottom",
        align: "center",
      },
    },
  ],
};

const KPI_FRAMEWORK_TOUR: Tour = {
  key: "page_kpi_framework",
  steps: [
    {
      element: '[data-tour="framework-header"]',
      popover: {
        title: "KPI Framework",
        description: "Build weighted KPI templates for every department and role.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="framework-actions"]',
      popover: {
        title: "Bulk operations",
        description:
          "Export all templates, bulk-import from Excel, or push every template to employees in one click.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="framework-selector"]',
      popover: {
        title: "Pick a department and role",
        description:
          "Choose from the dropdowns to edit that template. Or leave empty for bulk mode.",
        side: "bottom",
        align: "center",
      },
    },
  ],
};

const EMPLOYEES_TOUR: Tour = {
  key: "page_employees",
  steps: [
    {
      element: '[data-tour="employees-header"]',
      popover: {
        title: "Your team",
        description:
          "Add new employees, load demo data, or clear everyone. Each record shows role, department, and current performance multiplier.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="employees-stats"]',
      popover: {
        title: "At a glance",
        description:
          "Headcount, managers, average multiplier, and how many people still need KPIs assigned.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="employees-search"]',
      popover: {
        title: "Find anyone fast",
        description:
          "Search by name, email, department, or role. The list filters live as you type.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="employees-list"]',
      popover: {
        title: "Full employee table",
        description:
          "Click a row's edit pencil to update details, or the trash icon to remove someone. Employees needing KPIs are flagged in orange.",
        side: "top",
        align: "center",
      },
    },
  ],
};

const KPI_UPDATES_TOUR: Tour = {
  key: "page_kpi_updates",
  steps: [
    {
      element: '[data-tour="kpi-updates-header"]',
      popover: {
        title: "KPI Updates",
        description:
          "Whenever HR changes your KPIs, you'll see it here. You can acknowledge the change or leave a comment.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="kpi-updates-needs-ack"]',
      popover: {
        title: "Needs your acknowledgment",
        description:
          "These are changes waiting on you. Review each one, then click 'I understand' or add a comment if you have concerns.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="kpi-updates-history"]',
      popover: {
        title: "Acknowledged changes",
        description:
          "Once you've acknowledged an update, it moves here. HR has been notified — nothing else is needed from you.",
        side: "top",
        align: "center",
      },
    },
  ],
};

const SUPERVISORS_TOUR: Tour = {
  key: "page_supervisors",
  steps: [
    {
      element: '[data-tour="supervisors-header"]',
      popover: {
        title: "Supervisor Assignment",
        description:
          "This is where you connect employees to managers. Every employee should have a supervisor for appraisals to route correctly.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="supervisors-stats"]',
      popover: {
        title: "Coverage at a glance",
        description:
          "Total employees, how many are assigned, how many still need a supervisor, and how many managers you have.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="supervisors-managers"]',
      popover: {
        title: "Your managers",
        description:
          "Anyone with a crown is a manager and can be assigned as a supervisor. Promote or demote someone using the crown icon in the table below.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="supervisors-list"]',
      popover: {
        title: "Assign supervisors",
        description:
          "Click Assign next to an employee to choose their supervisor. Managers will then see that employee's appraisals in their review queue.",
        side: "top",
        align: "center",
      },
    },
  ],
};
// 👈 NEW — Grade Points tour
const GRADES_TOUR: Tour = {
  key: "page_grades",
  steps: [
    {
      element: '[data-tour="grades-header"]',
      popover: {
        title: "Grade Points",
        description:
          "Each job grade has a point value that determines an employee's share of the bonus pool. Higher points = larger bonus.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="grades-stats"]',
      popover: {
        title: "Your grade structure",
        description:
          "Total grades, highest point value, average points, and how many employees are graded. Updates live as you edit.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="grades-table"]',
      popover: {
        title: "Edit the grade table",
        description:
          "Change codes, names, or point values. Click Add Grade to create a new tier. Save Changes applies — nothing recalculates until you save.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="grades-info"]',
      popover: {
        title: "How it works",
        description:
          "A quick refresher on how grade points feed into the bonus formula. If anything is unclear, check here first.",
        side: "top",
        align: "center",
      },
    },
  ],
};

/* ============================================================
   REGISTRY + HELPERS
   ============================================================ */

/** Route path → page tour. Dashboard is excluded (handled in-component by role). */
export const PAGE_TOURS: Record<string, Tour> = {
  "/employee": MY_PERFORMANCE_TOUR,
  "/my-calculation": MY_CALCULATION_TOUR,
  "/profile": PROFILE_TOUR,
  "/appraisals": APPRAISALS_TOUR,
  "/appraisals-review": APPRAISALS_REVIEW_TOUR,
  "/kpi-framework": KPI_FRAMEWORK_TOUR,
  "/employees": EMPLOYEES_TOUR,
  "/kpi-updates": KPI_UPDATES_TOUR,
  "/supervisors": SUPERVISORS_TOUR,
  "/grades": GRADES_TOUR,   // 👈 ADD THIS LINE
  "/trace": TRACE_TOUR,   // 👈 ADD THIS LINE
};

// 👈 NEW — Calculation Trace tour
const TRACE_TOUR: Tour = {
  key: "page_trace",
  steps: [
    {
      element: '[data-tour="trace-header"]',
      popover: {
        title: "Calculation Trace",
        description:
          "This is the audit view — every employee's bonus traced from grade points to final payout. Nothing hidden.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="trace-pool"]',
      popover: {
        title: "The pool at the top",
        description:
          "Revenue → P4P pool → employee pool → value per point. Everything downstream derives from these four numbers.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="trace-stats"]',
      popover: {
        title: "Who's being traced",
        description:
          "Count, total bonus, average multiplier, and total grade points across the current filter. Updates live.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="trace-filters"]',
      popover: {
        title: "Narrow the list",
        description:
          "Search by name, department, or role. Or filter by department to focus on one team at a time.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="trace-list"]',
      popover: {
        title: "Click any row to expand",
        description:
          "Each row opens a full breakdown — Grade & Weight, Performance Multiplier, Category Breakdown, and the final formula. Great for answering 'why is my bonus this number?'",
        side: "top",
        align: "center",
      },
    },
  ],
};

export function getWelcomeTourForRole(role: string): Tour {
  if (role === "hr" || role === "admin") return HR_WELCOME;
  return EMPLOYEE_WELCOME;
}

/** 👈 Role-aware dashboard tour. */
export function getDashboardTourForRole(role: string): Tour {
  if (role === "hr" || role === "admin") return ADMIN_DASHBOARD_TOUR;
  return EMPLOYEE_DASHBOARD_TOUR;
}

/** Resolve a page tour from a URL pathname. */
export function getPageTourForPath(pathname: string): Tour | null {
  if (!pathname) return null;

  const clean = pathname.replace(/\/$/, "");
  if (PAGE_TOURS[clean]) return PAGE_TOURS[clean];

  const candidates = Object.keys(PAGE_TOURS)
    .filter((p) => clean === p || clean.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length);

  return candidates[0] ? PAGE_TOURS[candidates[0]] : null;
}

/* ============================================================
   PERSISTENCE
   ============================================================ */

export function getTourStorageKey(tourKey: string): string {
  return `p4p_tour_${tourKey}_done`;
}

export function isTourDone(tourKey: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getTourStorageKey(tourKey)) === "true";
}

export function markTourDone(tourKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTourStorageKey(tourKey), "true");
}

export function resetAllTours(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("p4p_tour_"));
  keys.forEach((k) => localStorage.removeItem(k));
}

export { BASE_DRIVER_CONFIG };