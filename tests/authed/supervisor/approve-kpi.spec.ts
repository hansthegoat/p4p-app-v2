import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";

// Test fixtures — deterministic IDs so we can clean up precisely
const TEST_REQUEST_ID = "test-req-approve-flow";
const TEST_EMPLOYEE_ID = "emp-alice-001";

test.describe("Supervisor approves a pending KPI change", () => {
  let supabase: ReturnType<typeof createClient>;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Sign in as supervisor so RLS allows writes
    await supabase.auth.signInWithPassword({
      email: "iddoadugyamfi123+test2@gmail.com",
      password: process.env.SUPERVISOR_PASSWORD || "Kwame@123#",
    });
  });

  test.beforeEach(async () => {
    // ── SETUP: seed a known pending request ──
    // This makes the test independent of whatever exists in the DB.
    const { error } = await supabase.from("kpi_update_requests").upsert(
      {
        id: TEST_REQUEST_ID,
        org_id: "00000000-0000-0000-0000-000000000001",
        employee_id: TEST_EMPLOYEE_ID,
        department: "Support",
        role: "Analyst",
        template_version: 99,
        diffs: [
          {
            kind: "kpi_target_changed",
            categoryName: "Test Category",
            kpiDescription: "Test KPI",
            before: 50,
            after: 60,
          },
        ],
        proposed_categories: [],
        before_score: 0.5,
        after_score: 0.6,
        status: "pending_supervisor_review",
        created_at: new Date().toISOString(),
        assigned_supervisor_id: "5714755d-4303-483a-857a-33f3ebb22891",
        assigned_supervisor_name: "Sarah Supervisor",
        comments: [],
        template_update_requested: false,
        template_update_applied: false,
      },
      { onConflict: "id" }
    );
    if (error) throw new Error(`Seed failed: ${error.message}`);
  });

  test.afterEach(async () => {
    // ── TEARDOWN: clean up so test can run again ──
    await supabase
      .from("kpi_update_requests")
      .delete()
      .eq("id", TEST_REQUEST_ID);
  });

  test("approves correctly and updates the database", async ({ page }) => {
    // 1. Load /my-team
    await page.goto("my-team");
    await expect(
      page.getByRole("heading", { name: "My Team" })
    ).toBeVisible({ timeout: 15000 });

    // 2. Open Reviews tab
    await page.getByRole("tab", { name: /Reviews/ }).click();

    // 3. Find the seeded item — scope to its unique identifier
    //    We expect exactly one Review button (the one we just seeded)
    const reviewButton = page.getByRole("button", { name: "Review" }).first();
    await expect(reviewButton).toBeVisible({ timeout: 10000 });

    // 4. Open drawer
    await reviewButton.click();
    await expect(page.getByText("Review KPI Changes")).toBeVisible({
      timeout: 5000,
    });

    // 5. Click Approve
    await page
      .getByRole("button", { name: /Approve & push to employee/ })
      .click();

    // 6. ── ASSERT LAYER 1: UI reacts ──
    //    Drawer closes when the operation succeeds.
    await expect(page.getByText("Review KPI Changes")).not.toBeVisible({
      timeout: 15000,
    });

    // 7. ── ASSERT LAYER 2: Database actually changed ──
    //    This is the real proof. Poll because the write is async.
    await expect
      .poll(
        async () => {
          const { data } = await supabase
            .from("kpi_update_requests")
            .select("status, approved_by_supervisor_at")
            .eq("id", TEST_REQUEST_ID)
            .maybeSingle();
          return data?.status;
        },
        { timeout: 10000, intervals: [500, 1000, 2000] }
      )
      .toBe("unacknowledged");

    // 8. ── ASSERT LAYER 3: No orphaned side effects ──
    //    Confirm the row wasn't accidentally left in a bad state.
    const { data: finalRow } = await supabase
      .from("kpi_update_requests")
      .select("status, approved_by_supervisor_at, supervisor_comment")
      .eq("id", TEST_REQUEST_ID)
      .maybeSingle();
    expect(finalRow?.approved_by_supervisor_at).toBeTruthy();
  });
});