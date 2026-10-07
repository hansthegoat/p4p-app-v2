import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { waitForStoreSync } from "../../helpers/wait-for-store";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUP_EMAIL,
  SUP_PASSWORD,
  ORG_ID,
  ALICE_ID,
  SARAH_ID,
} from "../../test-constants";

const SEEDED_APPRAISAL_ID = "test-appr-approve-flow";
const TEST_YEAR = 2099;
const TEST_MONTH = 12;

test.describe("Supervisor approves a pending appraisal", () => {
  let supabase: ReturnType<typeof createClient>;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.signInWithPassword({
      email: SUP_EMAIL,
      password: SUP_PASSWORD,
    });
    if (error) throw new Error(`Supervisor auth failed: ${error.message}`);
  });

  test.beforeEach(async () => {
    // Clean any prior seeded data
    await supabase.from("appraisals").delete().eq("id", SEEDED_APPRAISAL_ID);
    await supabase
      .from("monthly_performance")
      .delete()
      .eq("employee_id", ALICE_ID)
      .eq("year", TEST_YEAR)
      .eq("month", TEST_MONTH);

    // Remove any other pending appraisals for Alice so the test has one target
    await supabase
      .from("appraisals")
      .delete()
      .eq("employee_id", ALICE_ID)
      .eq("status", "pending");

    // Seed a pending appraisal
    const { error } = await supabase.from("appraisals").insert({
      id: SEEDED_APPRAISAL_ID,
      org_id: ORG_ID,
      employee_id: ALICE_ID,
      employee_name: "Alice Worker",
      department: "Support",
      role: "Analyst",
      period: `Q4 ${TEST_YEAR}`,
      year: TEST_YEAR,
      month: TEST_MONTH,
      status: "pending",
      overall_score: 0.85,
      overall_percent: 85,
      performance_band: "Meets Expectations",
      categories: [
        {
          id: "cat-appr-test",
          name: "Appraisal Test Category",
          weight: 100,
          kpis: [
            {
              id: "kpi-appr-test",
              description: "Appraisal test KPI",
              metric: "%",
              target: 100,
              actual: 85,
              weight: 100,
            },
          ],
        },
      ],
      submitted_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Seed appraisal failed: ${error.message}`);
  });

  test.afterEach(async () => {
    await supabase.from("appraisals").delete().eq("id", SEEDED_APPRAISAL_ID);
    await supabase
      .from("monthly_performance")
      .delete()
      .eq("employee_id", ALICE_ID)
      .eq("year", TEST_YEAR)
      .eq("month", TEST_MONTH);
  });

  test("approves the appraisal and writes to the database", async ({ page }) => {
    // ── ACT ──
    // 1. Load the review page
    await page.goto("appraisals-review");
    await expect(
      page.getByRole("heading", { name: "Review Appraisals" })
    ).toBeVisible({ timeout: 15000 });
    await waitForStoreSync(page);

    // 2. Confirm Alice's card is in the Pending tab
    await expect(
      page.getByRole("heading", { name: "Alice Worker" })
    ).toBeVisible({ timeout: 10000 });

    // 3. Open the review drawer on Alice's card
    const aliceCard = page
      .locator(".border-l-4.border-l-blue-500")
      .filter({ has: page.getByRole("heading", { name: "Alice Worker" }) })
      .first();

    await aliceCard.getByRole("button", { name: "Review" }).click();

    // 4. The Review Decision section should expand
    await expect(
      page.getByRole("heading", { name: "Review Decision" })
    ).toBeVisible({ timeout: 5000 });

    // 5. Click Approve
    await aliceCard.getByRole("button", { name: "Approve" }).click();

    // ── ASSERT LAYER 1: appraisal row updated ──
    await expect
      .poll(
        async () => {
          const { data } = await supabase
            .from("appraisals")
            .select("status")
            .eq("id", SEEDED_APPRAISAL_ID)
            .maybeSingle();
          return data?.status;
        },
        { timeout: 15000, intervals: [500, 1000, 2000] }
      )
      .toBe("approved");

    const { data: finalAppraisal } = await supabase
      .from("appraisals")
      .select("status, reviewer_id, reviewer_name")
      .eq("id", SEEDED_APPRAISAL_ID)
      .maybeSingle();

    expect(finalAppraisal?.reviewer_id).toBe(SARAH_ID);
    expect(finalAppraisal?.reviewer_name).toBe("Sarah Supervisor");

    // ── ASSERT LAYER 2: monthly_performance snapshot created ──
    const { data: perfRow } = await supabase
      .from("monthly_performance")
      .select("employee_id, year, month, performance_multiplier")
      .eq("employee_id", ALICE_ID)
      .eq("year", TEST_YEAR)
      .eq("month", TEST_MONTH)
      .maybeSingle();

    expect(perfRow).toBeTruthy();
    expect(perfRow?.performance_multiplier).toBeCloseTo(0.85, 2);

    // ── ASSERT LAYER 3: UI reflects the approval after refresh ──
    //    We refresh explicitly because the page's local state doesn't
    //    re-derive on store updates (Bug 2 — being fixed separately).
    await page.reload();
    await waitForStoreSync(page);

    await expect(
      page
        .locator(".border-l-4.border-l-blue-500")
        .filter({ has: page.getByRole("heading", { name: "Alice Worker" }) })
    ).toHaveCount(0, { timeout: 10000 });
  });
});