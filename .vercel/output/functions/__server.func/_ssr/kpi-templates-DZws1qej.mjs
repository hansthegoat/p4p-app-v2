import { n as newId } from "./router-BPHF_myF.mjs";
import "../_libs/react.mjs";
import "../_libs/sonner.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "../_libs/sentry__react.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__browser.mjs";
import "../_libs/sentry__browser-utils.mjs";
import "../_libs/sentry__conventions.mjs";
const DEFAULT_DEPARTMENTS = [
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
  "Support"
];
const DEFAULT_ROLES = [
  ,
  "Executive President",
  "Head of Department",
  "Deputy Head of Department",
  // NEW ROLE – placed after Head of Department
  "Line Manager/SBU Head",
  "Team Lead",
  "Senior Specialist",
  "Specialist",
  "Senior Analyst",
  "Analyst",
  "Senior Executive",
  "Executive",
  "Intern"
];
const roleToGrade = {
  "President": "B",
  "Executive President": "C",
  "Senior Vice President": "D",
  "Vice President": "E",
  "Head of Department": "F",
  "Deputy Head of Department": "G",
  // NEW mapping – adjust as needed
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
  "Intern": "9"
};
const k = (description, metric, target, maxScore = 100, measurementSource = "") => ({
  id: newId(),
  description,
  metric,
  target,
  maxScore,
  measurementSource
});
const cat = (name, weight, kpis) => ({
  id: newId(),
  name,
  weight,
  kpis
});
const KPI_TEMPLATES = {};
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
        )
      ]
    );
    KPI_TEMPLATES[key] = {
      jobGrade,
      roleName: role,
      department: dept,
      categories: [defaultCat]
    };
  }
}
function getTemplateByDepartmentAndRole(department, role) {
  const key = `${department}-${role}`;
  return KPI_TEMPLATES[key];
}
function getDepartments() {
  return [...DEFAULT_DEPARTMENTS];
}
function getRolesForDepartment(department) {
  return [...DEFAULT_ROLES];
}
function getTemplateForJobGrade(jobGrade) {
  return Object.values(KPI_TEMPLATES).find((t) => t.jobGrade === jobGrade);
}
function getAllRoles() {
  return [...DEFAULT_ROLES];
}
export {
  DEFAULT_DEPARTMENTS,
  DEFAULT_ROLES,
  KPI_TEMPLATES,
  getAllRoles,
  getDepartments,
  getRolesForDepartment,
  getTemplateByDepartmentAndRole,
  getTemplateForJobGrade
};
