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
  stagePadding: 10,
  stageRadius: 16,
  popoverOffset: 16,
  popoverClass: "p4p-tour-popover",
};

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
          "Every employee with their role, department, and current performance multiplier.",
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
  ],
};

export function getWelcomeTourForRole(role: string): Tour {
  if (role === "hr" || role === "admin") return HR_WELCOME;
  return EMPLOYEE_WELCOME;
}

export const PAGE_TOURS: Record<string, Tour> = {
  "/employee": MY_PERFORMANCE_TOUR,
  "/my-calculation": MY_CALCULATION_TOUR,
  "/kpi-framework": KPI_FRAMEWORK_TOUR,
  "/employees": EMPLOYEES_TOUR,
};

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