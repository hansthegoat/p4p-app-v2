import { n as newId } from "./router-CQTT2apA.js";
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
export {
  getTemplateByDepartmentAndRole as a,
  getDepartments as b,
  getTemplateForJobGrade as c,
  getRolesForDepartment as g
};
