import * as XLSX from "xlsx";
import type { KPITemplate, CategoryTemplate, KPIItem } from "./types";
import { newId } from "./defaults";

// ============================================
// SINGLE TEMPLATE — EXPORT
// ============================================

export function exportTemplateToExcel(
  template: KPITemplate,
  department: string,
  roleName: string
): void {
  const rows: any[] = [];

  for (const cat of template.categories) {
    if (cat.kpis.length === 0) {
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
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "KPIs");

  const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `KPI_${safe(department)}_${safe(roleName)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ============================================
// SINGLE TEMPLATE — PARSE
// ============================================

export interface ParsedExcelResult {
  template: KPITemplate | null;
  errors: string[];
  warnings: string[];
}

export async function parseExcelToTemplate(
  file: File
): Promise<ParsedExcelResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
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
      if (!kpiDesc) continue;

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

// ============================================
// BULK — EXPORT ALL
// ============================================

export function exportAllTemplatesToExcel(templates: Record<string, KPITemplate>): void {
  const rows: any[] = [];

  for (const t of Object.values(templates)) {
    for (const cat of t.categories) {
      if (cat.kpis.length === 0) {
        rows.push({
          "Department": t.department,
          "Role": t.roleName,
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
          "Department": t.department,
          "Role": t.roleName,
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
  }

  if (rows.length === 0) {
    rows.push({
      "Department": "Support",
      "Role": "Team Lead",
      "Category": "Example Category",
      "Category Weight %": 100,
      "KPI Description": "Example KPI",
      "KPI Weight %": 100,
      "Metric": "%",
      "Target": 100,
      "Measurement Source": "",
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 16 }, { wch: 18 }, { wch: 24 }, { wch: 16 },
    { wch: 36 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "All KPIs");
  XLSX.writeFile(wb, `P4P_All_KPIs_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ============================================
// BULK — PARSE
// ============================================

export interface BulkParsedResult {
  templates: KPITemplate[];
  errors: string[];
  warnings: string[];
  summary: {
    departments: number;
    roles: number;
    categories: number;
    kpis: number;
  };
}

export async function parseExcelForBulkImport(file: File): Promise<BulkParsedResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const emptySummary = { departments: 0, roles: 0, categories: 0, kpis: 0 };

  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames.includes("KPIs") ? "KPIs" : wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    if (!sheet) {
      return { templates: [], errors: ["No data sheet found."], warnings, summary: emptySummary };
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (rows.length === 0) {
      return { templates: [], errors: ["The file has no data rows."], warnings, summary: emptySummary };
    }

    const required = [
      "Department", "Role", "Category", "Category Weight %",
      "KPI Description", "KPI Weight %", "Target",
    ];
    const headers = Object.keys(rows[0]);
    for (const col of required) {
      if (!headers.includes(col)) errors.push(`Missing required column: "${col}"`);
    }
    if (errors.length > 0) return { templates: [], errors, warnings, summary: emptySummary };

    type Grouped = {
      department: string;
      roleName: string;
      categories: Map<string, { id: string; name: string; weight: number; kpis: KPIItem[] }>;
    };
    const grouped = new Map<string, Grouped>();

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const rowNum = r + 2;
      const dept = String(row["Department"] || "").trim();
      const role = String(row["Role"] || "").trim();
      const catName = String(row["Category"] || "").trim();
      if (!dept || !role || !catName) continue;

      const key = `${dept}||${role}`;
      if (!grouped.has(key)) {
        grouped.set(key, { department: dept, roleName: role, categories: new Map() });
      }
      const g = grouped.get(key)!;

      const catWeightRaw = row["Category Weight %"];
      const catWeight = Number(catWeightRaw);
      if (isNaN(catWeight)) {
        errors.push(`Row ${rowNum}: Category Weight % is not a number ("${catWeightRaw}")`);
        continue;
      }

      if (!g.categories.has(catName)) {
        g.categories.set(catName, { id: newId(), name: catName, weight: catWeight, kpis: [] });
      }
      const cat = g.categories.get(catName)!;
      cat.weight = catWeight;

      const kpiDesc = String(row["KPI Description"] || "").trim();
      if (!kpiDesc) continue;

      const weightRaw = row["KPI Weight %"];
      const targetRaw = row["Target"];
      const metric = String(row["Metric"] || "").trim();
      const source = String(row["Measurement Source"] || "").trim();

      const weight = Number(weightRaw);
      const target = Number(targetRaw);

      if (isNaN(weight)) {
        errors.push(`Row ${rowNum} ("${kpiDesc}"): KPI Weight % is not a number ("${weightRaw}")`);
        continue;
      }
      if (isNaN(target)) {
        errors.push(`Row ${rowNum} ("${kpiDesc}"): Target is not a number ("${targetRaw}")`);
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

    if (grouped.size === 0) {
      return { templates: [], errors: ["No valid rows found."], warnings, summary: emptySummary };
    }

    const templates: KPITemplate[] = [];
    let totalCats = 0;
    let totalKpis = 0;
    const depts = new Set<string>();

    for (const g of grouped.values()) {
      depts.add(g.department);
      const categories = Array.from(g.categories.values());
      totalCats += categories.length;
      totalKpis += categories.reduce((s, c) => s + c.kpis.length, 0);

      const totalCatWeight = categories.reduce((s, c) => s + c.weight, 0);
      if (Math.abs(totalCatWeight - 100) > 0.01) {
        errors.push(
          `${g.department} / ${g.roleName}: category weights sum to ${totalCatWeight}% (must be 100%)`
        );
      }
      for (const cat of categories) {
        if (cat.kpis.length === 0) continue;
        const kpiSum = cat.kpis.reduce((s, k) => s + (k.weight || 0), 0);
        if (Math.abs(kpiSum - 100) > 0.01) {
          errors.push(
            `${g.department} / ${g.roleName} → ${cat.name}: KPI weights sum to ${kpiSum}% (must be 100%)`
          );
        }
      }

      templates.push({
        department: g.department,
        roleName: g.roleName,
        jobGrade: "",
        categories,
      });
    }

    if (errors.length > 0) return { templates: [], errors, warnings, summary: emptySummary };

    return {
      templates,
      errors: [],
      warnings,
      summary: {
        departments: depts.size,
        roles: grouped.size,
        categories: totalCats,
        kpis: totalKpis,
      },
    };
  } catch (err: any) {
    return {
      templates: [],
      errors: [`Could not read file: ${err.message || "unknown error"}`],
      warnings,
      summary: emptySummary,
    };
  }
}