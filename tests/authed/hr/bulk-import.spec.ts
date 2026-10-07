import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { waitForStoreSync } from "../../helpers/wait-for-store";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";

const HR_EMAIL = "iddoadugyamfi123+test1@gmail.com";
const HR_PASSWORD = "Kwame@123#";

const ORG_ID = "00000000-0000-0000-0000-000000000001";

// Fixture — two templates, no conflict with other tests
const FIXTURE_DIR = path.join(process.cwd(), "tests", "fixtures");
const FIXTURE_PATH = path.join(FIXTURE_DIR, "bulk-test.xlsx");

const TEST_DEPARTMENTS = ["Marketing", "Finance"];
const TEST_ROLE = "Executive";

test.describe("HR bulk imports KPI templates from Excel", () => {
  let supabase: ReturnType<typeof createClient>;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.signInWithPassword({
      email: HR_EMAIL,
      password: HR_PASSWORD,
    });
    if (error) throw new Error(`HR auth failed: ${error.message}`);

    // Generate the fixture on disk
    fs.mkdirSync(FIXTURE_DIR, { recursive: true });

    const rows: (string | number)[][] = [
      [
        "Department",
        "Role",
        "Category",
        "Category Weight %",
        "KPI Description",
        "KPI Weight %",
        "Metric",
        "Target",
        "Measurement Source",
      ],
      // Template 1 — Marketing / Executive
      [
        "Marketing",
        "Executive",
        "Campaign Performance",
        100,
        "Campaign ROI achievement",
        100,
        "ROI",
        100,
        "Test source",
      ],
      // Template 2 — Finance / Executive
      [
        "Finance",
        "Executive",
        "Reporting Accuracy",
        100,
        "Reports delivered on time",
        100,
        "%",
        100,
        "Test source",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, FIXTURE_PATH);
  });

  test.beforeEach(async () => {
    // Clean slate — remove any templates this test might have left
    await supabase
      .from("kpi_templates")
      .delete()
      .eq("org_id", ORG_ID)
      .in("department", TEST_DEPARTMENTS)
      .eq("role_name", TEST_ROLE);
  });

  test.afterEach(async () => {
    await supabase
      .from("kpi_templates")
      .delete()
      .eq("org_id", ORG_ID)
      .in("department", TEST_DEPARTMENTS)
      .eq("role_name", TEST_ROLE);
  });

  test("parses and saves two templates from one Excel file", async ({
    page,
  }) => {
    // ── ACT ──
    // 1. Load KPI Framework in bulk mode (no dept/role selected)
    await page.goto("kpi-framework");
    await expect(
      page.getByRole("heading", { name: /KPI Framework/ })
    ).toBeVisible({ timeout: 15000 });
    await waitForStoreSync(page);

    // 2. Click "Bulk Import"
    await page.getByRole("button", { name: /Bulk Import/ }).click();

    // 3. Dialog opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(
      dialog.getByRole("heading", { name: "Bulk import KPI templates" })
    ).toBeVisible();

    // 4. Upload the fixture (hidden file input)
    await dialog.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);

    // 5. Wait for parse to complete — "Parsed 2 templates."
    await expect(dialog.getByText(/Parsed 2 templates/)).toBeVisible({
      timeout: 10000,
    });

    // 6. Handle the native confirm() BEFORE clicking Apply.
    //    handleBulkApply() calls confirm() — if we don't accept it,
    //    the browser auto-dismisses and nothing saves.
    page.once("dialog", (d) => d.accept());

    // 7. Click Apply templates
    await dialog.getByRole("button", { name: /Apply templates/ }).click();

    // 8. Dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // ── ASSERT LAYER 1: Both templates landed in the DB ──
    await expect
      .poll(
        async () => {
          const { data } = await supabase
            .from("kpi_templates")
            .select("id")
            .eq("org_id", ORG_ID)
            .in("department", TEST_DEPARTMENTS)
            .eq("role_name", TEST_ROLE);
          return data?.length ?? 0;
        },
        { timeout: 10000, intervals: [500, 1000, 2000] }
      )
      .toBe(2);

    // ── ASSERT LAYER 2: The categories were stored correctly ──
    const { data: templates } = await supabase
      .from("kpi_templates")
      .select("department, role_name, categories")
      .eq("org_id", ORG_ID)
      .in("department", TEST_DEPARTMENTS)
      .eq("role_name", TEST_ROLE);

    const marketing = templates?.find((t) => t.department === "Marketing");
    const finance = templates?.find((t) => t.department === "Finance");

    expect(marketing?.categories).toHaveLength(1);
    expect(marketing?.categories[0]?.name).toBe("Campaign Performance");
    expect(marketing?.categories[0]?.kpis).toHaveLength(1);
    expect(marketing?.categories[0]?.kpis[0]?.description).toBe(
      "Campaign ROI achievement"
    );

    expect(finance?.categories).toHaveLength(1);
    expect(finance?.categories[0]?.name).toBe("Reporting Accuracy");
    expect(finance?.categories[0]?.kpis).toHaveLength(1);
    expect(finance?.categories[0]?.kpis[0]?.description).toBe(
      "Reports delivered on time"
    );
  });
});