import type { Employee, GradePoint, Globals } from "./types";

export function exportCalculationLogic() {
  return {
    version: "1.0",
    description: "P4P Bonus Calculation Engine",
    formula: {
      description: "Bonus = (Employee Pool / Sum of all Weights) × Employee's Weight",
      steps: [
        "1. Total Pool = Revenue × P4P%",
        "2. Adjunct Pool = Total Pool × Adjunct%",
        "3. Employee Pool = Total Pool × (1 − Adjunct%)",
        "4. Weight = Grade Points × Performance Multiplier × Proration × Sales Multiplier",
        "5. Value per Unit = Employee Pool / Sum of all Weights",
        "6. Bonus = Value per Unit × Employee's Weight"
      ],
      variables: {
        totalRevenue: "Total actual revenue (GHS)",
        p4pPercent: "Pay-for-performance percentage of revenue",
        adjunctPercent: "Percentage of pool for adjunct employees",
        floor: "Minimum performance multiplier (clamp)",
        cap: "Maximum performance multiplier (clamp)",
        prorationOn: "Whether to scale bonus by months worked",
        salesMultiplier: "Multiplier for sales roles"
      }
    }
  };
}

export function getCalculationSchema() {
  return {
    input: {
      globals: {
        totalRevenue: "number (GHS)",
        p4pPercent: "number (%)",
        adjunctPercent: "number (%)",
        floor: "number (0-1)",
        cap: "number (0.5-2)",
        prorationOn: "boolean",
        salesMultiplier: "number"
      },
      grades: [
        {
          code: "string (e.g., 'G')",
          name: "string",
          points: "number"
        }
      ],
      employees: [
        {
          id: "string",
          name: "string",
          jobGrade: "string",
          isAdjunct: "boolean",
          isSalesRole: "boolean",
          joinDate: "string (ISO)",
          monthsWorked: "number",
          kpis: [
            {
              id: "string",
              description: "string",
              metric: "string",
              target: "number",
              actual: "number",
              weight: "number"
            }
          ],
          categories: [
            {
              id: "string",
              name: "string",
              weight: "number (%)",
              kpis: [
                {
                  id: "string",
                  description: "string",
                  metric: "string",
                  target: "number",
                  actual: "number",
                  weight: "number"
                }
              ]
            }
          ]
        }
      ]
    },
    output: {
      totalPool: "number (GHS)",
      adjunctPool: "number (GHS)",
      employeePool: "number (GHS)",
      perAdjunctBonus: "number (GHS)",
      valuePerUnit: "number (GHS)",
      perEmployee: {
        "[employeeId]": {
          performanceMultiplier: "number",
          proration: "number",
          salesMult: "number",
          gradePoints: "number",
          weight: "number",
          bonus: "number (GHS)",
          kpiBreakdown: "array",
          categoryBreakdown: "array"
        }
      }
    },
    warnings: "array of warning messages"
  };
}