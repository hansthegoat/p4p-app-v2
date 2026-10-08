import type {
  Employee,
  GradePoint,
  Globals,
  BonusConfig,
  FieldSource,
  SourceConfig,
} from "./types";

export const DEFAULT_GRADES: GradePoint[] = [
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
  { code: "9", name: "Intern", points: 5 },
];

export const DEFAULT_GLOBALS: Globals = {
  totalRevenue: 20_000_000,
  p4pPercent: 2.5,
  adjunctPercent: 10,
  floor: 0.5,
  cap: 1.5,
  prorationOn: false,
  salesMultiplier: 1.3,
};

// FIX: Define the id function BEFORE using it
const id = () => Math.random().toString(36).slice(2, 10);

// FIX: Export newId
export const newId = id;

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: id(), name: "Jane Adjunct", jobGrade: "5", isAdjunct: true, isSalesRole: false,
    joinDate: "2025-01-01", monthsWorked: 12, kpis: [], categories: [],
    email: "",
    department: "",
    role: ""
  },
  {
    id: id(), name: "John Adjunct", jobGrade: "6", isAdjunct: true, isSalesRole: false,
    joinDate: "2025-01-01", monthsWorked: 12, kpis: [], categories: [],
    email: "",
    department: "",
    role: ""
  },
  {
    id: id(), name: "Alice Johnson", jobGrade: "G", isAdjunct: false, isSalesRole: true,
    joinDate: "2025-01-15", monthsWorked: 12, kpis: [],
    categories: [
      {
        id: id(),
        name: "Strategic Contribution",
        weight: 30,
        kpis: [
          { id: id(), description: "Revenue Growth", metric: "GHS", target: 500000, actual: 600000, weight: 40 },
          { id: id(), description: "CSAT Score", metric: "%", target: 90, actual: 85, weight: 30 },
          { id: id(), description: "Market Share", metric: "%", target: 25, actual: 20, weight: 30 },
        ],
      },
      {
        id: id(),
        name: "Operational Excellence",
        weight: 20,
        kpis: [
          { id: id(), description: "Process Efficiency", metric: "%", target: 95, actual: 88, weight: 100 },
        ],
      },
    ],
    email: "",
    department: "",
    role: ""
  },
  {
    id: id(), name: "Bob Smith", jobGrade: "4", isAdjunct: false, isSalesRole: false,
    joinDate: "2025-03-01", monthsWorked: 10, kpis: [],
    categories: [
      {
        id: id(),
        name: "Team Performance",
        weight: 40,
        kpis: [
          { id: id(), description: "Team Lead", metric: "%", target: 100, actual: 90, weight: 60 },
          { id: id(), description: "Projects Completed", metric: "#", target: 12, actual: 10, weight: 40 },
        ],
      },
    ],
    email: "",
    department: "",
    role: ""
  },
  {
    id: id(), name: "Carol Davis", jobGrade: "1", isAdjunct: false, isSalesRole: true,
    joinDate: "2025-02-10", monthsWorked: 11, kpis: [],
    categories: [
      {
        id: id(),
        name: "Project Delivery",
        weight: 50,
        kpis: [
          { id: id(), description: "Project completion", metric: "%", target: 100, actual: 95, weight: 100 },
        ],
      },
      {
        id: id(),
        name: "Client Satisfaction",
        weight: 30,
        kpis: [
          { id: id(), description: "Client NPS", metric: "%", target: 80, actual: 75, weight: 100 },
        ],
      },
    ],
    email: "",
    department: "",
    role: ""
  },
];

export const DEFAULT_BONUS_CONFIG: BonusConfig = {
  sourceType: "revenue_percent",
  revenuePercent: 5,
  profitPercent: 10,
  fixedAmount: 500000,
  addOn: null,
  adjunctPercent: 10,
  floor: 0.5,
  cap: 1.5,
  prorationOn: true,
  salesMultiplier: 1,
  periodInputs: {
    revenue: 5000000,
    profit: 1000000,
  },
};

// ============================================
// SOURCE TRACKING HELPERS
// ============================================
// Pure functions for reading and writing FieldSource values on
// an employee's sourceConfig. Missing keys are treated as "manual".

/**
 * Get the source of a specific field. Defaults to "manual" if
 * the field has no entry in sourceConfig.
 */
export function getFieldSource(
  config: SourceConfig | undefined,
  field: string
): FieldSource {
  return config?.[field] ?? "manual";
}

/**
 * Is this field locked (i.e., synced from an external system)?
 * Locked fields are greyed out in the UI until HR overrides them.
 */
export function isFieldLocked(
  config: SourceConfig | undefined,
  field: string
): boolean {
  const source = getFieldSource(config, field);
  return source !== "manual";
}

/**
 * Set a field's source. Returns a new object.
 * Pass "manual" to unlock a field.
 */
export function setFieldSource(
  config: SourceConfig | undefined,
  field: string,
  source: FieldSource
): SourceConfig {
  return {
    ...(config ?? {}),
    [field]: source,
  };
}

/**
 * Reset a field's source back to "manual".
 * Convenience wrapper for the Override action.
 */
export function unlockField(
  config: SourceConfig | undefined,
  field: string
): SourceConfig {
  return setFieldSource(config, field, "manual");
}