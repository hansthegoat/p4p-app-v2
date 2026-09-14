import * as XLSX from "xlsx";
import type { KPITemplate, CategoryTemplate, KPIItem } from "./types";
import { newId } from "./defaults";

export interface ParsedExcelResult {
  template: KPITemplate | null;
  errors: string[];
  warnings: string[];
}

/**
 * Generate an .xlsx file from the current template.
 * Flat format: one row per KPI, with Department / Role / Category repeated per row.
 * Also adds a "How to use" sheet with instructions.
 */
export function exportTemplateToExcel(
  template: KPITemplate,
  department: string,
  roleName: string
): void {
  // ─── Sheet 1: KPIs ───────────────────────────────────
  const rows: any[] = [];

  for (const cat of template.categories) {
    if (cat.kpis.length === 0) {
      // Category with no KPIs — one placeholder row
      rows.push({
        "Department": department,
        "Role": roleName,
        "Category": cat.name,
        "Category Weight %": cat.weight,
        "KPI Description": "",
        "KPI Weight %": "",
        "Metric": "",
        "Target": "",
        "Measurement Source": "",
      });
      continue;
    }

    for (const kpi of cat.kpis) {
      rows.push({
        "Department": department,
        "Role": roleName,
        "Category": cat.name,
        "Category Weight %": cat.weight,
        "KPI Description": kpi.description,
        "KPI Weight %": kpi.weight ?? 0,
        "Metric": kpi.metric,
        "Target": kpi.target,
        "Measurement Source": kpi.measurementSource || "",
      });
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);

  ws["!cols"] = [
    { wch: 16 },  // Department
    { wch: 18 },  // Role
    { wch: 24 },  // Category
    { wch: 16 },  // Category Weight %
    { wch: 36 },  // KPI Description
    { wch: 14 },  // KPI Weight %
    { wch: 10 },  // Metric
    { wch: 10 },  // Target
    { wch: 22 },  // Measurement Source
  ];

  // ─── Sheet 2: How to use ─────────────────────────────
  const help: any[][] = [
    ["How to use this KPI template"],
    [],
    ["1. One row per KPI."],
    ["   If a category has 3 KPIs, that category gets 3 rows."],
    [],
    ["2. Department, Role, Category, and Category Weight % repeat on every row"],
    ["   of the same category. That's normal — change one, change them all."],
    [],
    ["3. Two weight rules that MUST hold or the import will fail:"],
    ["   • Category Weight % must sum to 100 across the whole sheet"],
    ["   • KPI Weight % must sum to 100 inside each category"],
    [],
    ["4. Columns explained:"],
    ["   • Department         — free text, for reference"],
    ["   • Role               — free text, for reference"],
    ["   • Category           — the name of the KPI group"],
    ["   • Category Weight %  — how much this category counts toward the total (0–100)"],
    ["   • KPI Description    — what the KPI is, in plain language"],
    ["   • KPI Weight %       — how much this KPI counts inside its category (0–100)"],
    ["   • Metric             — the unit: %, #, hrs, days, GHS, $, ROI"],
    ["   • Target             — the goal number for the period"],
    ["   • Measurement Source — optional, where the number comes from (e.g. Zendesk)"],
    [],
    ["5. Common tasks:"],
    ["   • Add a KPI:      copy any row, change KPI Description, adjust KPI Weight %"],
    ["   • Change a target: edit the Target cell only"],
    ["   • Remove a KPI:   delete the row, adjust the remaining KPI weights to 100"],
    ["   • Rename category: edit Category cell on every row of that group"],
    [],
    ["6. When done, save the file and use the Import button in the KPI Framework page."],
    ["   The system will preview the changes before applying them."],
  ];
  const wsHelp = XLSX.utils.aoa_to_sheet(help);
  wsHelp["!cols"] = [{ wch: 90 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "KPIs");
  XLSX.utils.book_append_sheet(wb, wsHelp, "How to use");

  const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `KPI_${safe(department)}_${safe(roleName)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Parse an uploaded .xlsx (flat format, one row per KPI) into a template.
 */
export async function parseExcelToTemplate(
  file: File
): Promise<ParsedExcelResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });

    // Prefer sheet named "KPIs", fall back to first sheet
    const sheetName = wb.SheetNames.includes("KPIs")
      ? "KPIs"
      : wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    if (!sheet) {
      return { template: null, errors: ["No data sheet found in the file."], warnings };
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (rows.length === 0) {
      return { template: null, errors: ["The file has no data rows."], warnings };
    }

    // ─── Required columns ────────────────────────────────
    const required = [
      "Category",
      "Category Weight %",
      "KPI Description",
      "KPI Weight %",
      "Target",
    ];
    const headers = Object.keys(rows[0]);
    for (const col of required) {
      if (!headers.includes(col)) errors.push(`Missing required column: "${col}"`);
    }
    if (errors.length > 0) return { template: null, errors, warnings };

    // ─── Group rows by category ──────────────────────────
    const categoryMap = new Map<
      string,
      { id: string; name: string; weight: number; kpis: KPIItem[] }
    >();

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const rowNum = r + 2;

      const catName = String(row["Category"] || "").trim();
      if (!catName) continue;

      const catWeightRaw = row["Category Weight %"];
      const catWeight = Number(catWeightRaw);
      if (isNaN(catWeight)) {
        errors.push(
          `Row ${rowNum}: Category Weight % is not a number ("${catWeightRaw}").`
        );
        continue;
      }

      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, {
          id: newId(),
          name: catName,
          weight: catWeight,
          kpis: [],
        });
      }
      const cat = categoryMap.get(catName)!;
      cat.weight = catWeight;

      const kpiDesc = String(row["KPI Description"] || "").trim();
      if (!kpiDesc) continue; // category-only placeholder row

      const weightRaw = row["KPI Weight %"];
      const targetRaw = row["Target"];
      const metric = String(row["Metric"] || "").trim();
      const source = String(row["Measurement Source"] || "").trim();

      const weight = Number(weightRaw);
      const target = Number(targetRaw);

      if (isNaN(weight)) {
        errors.push(
          `Row ${rowNum} ("${kpiDesc}"): KPI Weight % is not a number ("${weightRaw}").`
        );
        continue;
      }
      if (isNaN(target)) {
        errors.push(
          `Row ${rowNum} ("${kpiDesc}"): Target is not a number ("${targetRaw}").`
        );
        continue;
      }

      cat.kpis.push({
        id: newId(),
        description: kpiDesc,
        metric: metric || "%",
        target,
        weight,
        measurementSource: source || undefined,
      });
    }

    if (categoryMap.size === 0) {
      errors.push("No valid category rows found.");
      return { template: null, errors, warnings };
    }

    const categories: CategoryTemplate[] = Array.from(categoryMap.values());

    // ─── Weight validation ───────────────────────────────
    const totalCatWeight = categories.reduce((s, c) => s + c.weight, 0);
    if (Math.abs(totalCatWeight - 100) > 0.01) {
      errors.push(
        `Category weights sum to ${totalCatWeight}%. Must be exactly 100%.`
      );
    }

    for (const cat of categories) {
      if (cat.kpis.length === 0) continue;
      const kpiSum = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);
      if (Math.abs(kpiSum - 100) > 0.01) {
        errors.push(
          `In category "${cat.name}", KPI weights sum to ${kpiSum}%. Must be 100%.`
        );
      }
    }

    if (errors.length > 0) return { template: null, errors, warnings };

    const template: KPITemplate = {
      department: "",
      roleName: "",
      jobGrade: "",
      categories,
    };

    return { template, errors: [], warnings };
  } catch (err: any) {
    return {
      template: null,
      errors: [`Could not read file: ${err.message || "unknown error"}`],
      warnings,
    };
  }
}