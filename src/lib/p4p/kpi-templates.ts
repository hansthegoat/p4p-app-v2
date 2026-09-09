import type { KPITemplate, CategoryTemplate, KPIItem } from "./types";
import { newId } from "./defaults";

// ===== ALL DEPARTMENTS =====
export const DEFAULT_DEPARTMENTS = [
  "Applications Development",
  "Enterprise Solutions",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Business Development",
  "Project Management",
  "Quality Assurance",
  "Infrastructure",
  "Customer Experience",
  "Technical Operations",
  "Commercial Operations",
  "Support",
] as const;

// ===== ALL ROLES (matching grade points) =====
export const DEFAULT_ROLES = [,
  "Executive President",
  "Head of Department",
  "Deputy Head of Department", // NEW ROLE – placed after Head of Department
  "Line Manager/SBU Head",
  "Team Lead",
  "Senior Specialist",
  "Specialist",
  "Senior Analyst",
  "Analyst",
  "Senior Executive",
  "Executive",
  "Intern",
] as const;

// Map role to job grade (approximate mapping from your grade points)
const roleToGrade: Record<string, string> = {
  "President": "B",
  "Executive President": "C",
  "Senior Vice President": "D",
  "Vice President": "E",
  "Head of Department": "F",
  "Deputy Head of Department": "G", // NEW mapping – adjust as needed
  "Line Manager/SBU Head": "G",
  "Team Lead": "H",
  "Senior Specialist": "1",
  "Specialist": "2",
  "Senior Analyst": "3",
  "Analyst": "4",
  "Senior Executive": "5",
  "Executive": "6",
  "Graduate Trainee": "7",
  "NSS/Assistant": "8",
  "Intern": "9",
};

// Helper to create KPI items (includes measurementSource)
const k = (
  description: string,
  metric: string,
  target: number,
  maxScore: number = 100,
  measurementSource: string = ""
): KPIItem => ({
  id: newId(),
  description,
  metric,
  target,
  maxScore,
  measurementSource,
});

// Helper to create categories
const cat = (name: string, weight: number, kpis: KPIItem[]): CategoryTemplate => ({
  id: newId(),
  name,
  weight,
  kpis,
});

// ===== GENERATE TEMPLATES FOR ALL DEPARTMENTS + ROLES =====
export const KPI_TEMPLATES: Record<string, KPITemplate> = {};

// For each department and each role, create a placeholder template with source field
for (const dept of DEFAULT_DEPARTMENTS) {
  for (const role of DEFAULT_ROLES) {
    const key = `${dept}-${role}`;
    const jobGrade = roleToGrade[role] || "4";
    const defaultCat = cat(
      "Default Category",
      100,
      [
        k(
          "Default KPI - Please configure",
          "%",
          0,
          100,
          "Measurement source (e.g., CRM, Attendance Log)"
        ),
      ]
    );
    KPI_TEMPLATES[key] = {
      jobGrade,
      roleName: role,
      department: dept,
      categories: [defaultCat],
    };
  }
}

// ===== HELPERS =====

export function getTemplateByDepartmentAndRole(department: string, role: string): KPITemplate | undefined {
  const key = `${department}-${role}`;
  return KPI_TEMPLATES[key];
}

export function getDepartments(): string[] {
  return [...DEFAULT_DEPARTMENTS];
}

export function getRolesForDepartment(department: string): string[] {
  // Return all roles for any department (since we have templates for all)
  return [...DEFAULT_ROLES];
}

export function getTemplateForJobGrade(jobGrade: string): KPITemplate | undefined {
  return Object.values(KPI_TEMPLATES).find(t => t.jobGrade === jobGrade);
}

export function getAllRoles(): string[] {
  return [...DEFAULT_ROLES];
}