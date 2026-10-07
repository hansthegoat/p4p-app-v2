import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { waitForStoreSync } from "../../helpers/wait-for-store";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi"; 

// ⚠️ Fill in the real HR password
const HR_EMAIL = "iddoadugyamfi123+test1@gmail.com";
const HR_PASSWORD = "Kwame@123#"; 

const ORG_ID = "00000000-0000-0000-0000-000000000001";
const ALICE_ID = "emp-alice-001";
const BOB_ID = "emp-bob-001";
const SARAH_ID = "5714755d-4303-483a-857a-33f3ebb22891";

test.describe("HR pushes a KPI template to employees", () => {
  let supabase: ReturnType<typeof createClient>;
  let aliceOriginalCategories: any[] = [];

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.signInWithPassword({
      email: HR_EMAIL,
      password: HR_PASSWORD,
    });
    if (error) throw new Error(`HR auth failed: ${error.message}`);
  });

  test.beforeEach(async () => {
    // 1. Capture Alice's categories so we can restore them later
    const { data: alice, error: aliceErr } = await supabase
      .from("employees")
      .select("categories")
      .eq("id", ALICE_ID)
      .maybeSingle();
    if (aliceErr) throw new Error(`Fetch Alice failed: ${aliceErr.message}`);
    aliceOriginalCategories = alice?.categories || [];

    // 2. Empty Alice + Bob's categories so the push has real diffs to apply
    const { error: wipeErr } = await supabase
      .from("employees")
      .update({ categories: [] })
      .in("id", [ALICE_ID, BOB_ID]);
    if (wipeErr) throw new Error(`Wipe failed: ${wipeErr.message}`);

    // 3. Clear any leftover pending requests for these two
    const { error: delErr } = await supabase
      .from("kpi_update_requests")
      .delete()
      .in("employee_id", [ALICE_ID, BOB_ID]);
    if (delErr) throw new Error(`Cleanup failed: ${delErr.message}`);

    // 4. Seed a deterministic template for Support · Analyst
    const { error: tplErr } = await supabase.from("kpi_templates").upsert(
      {
        org_id: ORG_ID,
        department: "Support",
        role_name: "Analyst",
        job_grade: "4",
        categories: [
          {
            id: "cat-push-test",
            name: "Push Test Category",
            weight: 100,
            kpis: [
              {
                id: "kpi-push-test",
                description: "Push test KPI",
                metric: "#",
                target: 100,
                weight: 100,
                measurementSource: "Test",
              },
            ],
          },
        ],
      },
      { onConflict: "org_id,department,role_name" }
    );
    if (tplErr) throw new Error(`Template seed failed: ${tplErr.message}`);
  });

  test.afterEach(async () => {
    // Restore Alice's categories
    await supabase
      .from("employees")
      .update({ categories: aliceOriginalCategories })
      .eq("id", ALICE_ID);

    // Remove requests created during this test
    await supabase
      .from("kpi_update_requests")
      .delete()
      .in("employee_id", [ALICE_ID, BOB_ID]);
  });

  test("creates a pending request for each report and notifies the supervisor", async ({
    page,
  }) => {
    // ── ACT ──
    // 1. Load KPI Framework preselected to Support · Analyst via URL params
    await page.goto("kpi-framework?dept=Support&role=Analyst");

    // 2. Wait for the page to load
    await expect(
      page.getByRole("heading", { name: /KPI Framework|Editing/ })
    ).toBeVisible({ timeout: 15000 });

    // 3. Wait for the store to finish its initial cloud fetch.
    await waitForStoreSync(page);

    // 3. The Push button should be visible and enabled.
    //    There are two on the page (header + bottom of tab). Use the
    //    header one — always visible regardless of scroll position.
    const pushButton = page
      .locator('[data-tour="framework-actions"]')
      .getByRole("button", { name: /Push to Employees/ });
    await expect(pushButton).toBeVisible({ timeout: 10000 });
    await expect(pushButton).toBeEnabled({ timeout: 10000 });

    // 4. Click Push — preview dialog opens
    await pushButton.click();

    // 5. Preview dialog should appear
    await expect(
      page.getByRole("heading", {
        name: /Push KPI changes to employees/,
      })
    ).toBeVisible({ timeout: 5000 });

    // 6. Confirm the push
    await page.getByRole("button", { name: /^Push changes$/ }).click();

    // ── ASSERT LAYER 1: Requests created in DB ──
    // Both Alice and Bob should now have a pending_supervisor_review request
    await expect
      .poll(
        async () => {
          const { data } = await supabase
            .from("kpi_update_requests")
            .select("id, employee_id, status")
            .in("employee_id", [ALICE_ID, BOB_ID])
            .eq("status", "pending_supervisor_review");
          return data?.length ?? 0;
        },
        { timeout: 15000, intervals: [500, 1000, 2000] }
      )
      .toBeGreaterThanOrEqual(2);

    // ── ASSERT LAYER 2: Requests assigned to Sarah ──
    const { data: requests } = await supabase
      .from("kpi_update_requests")
      .select("employee_id, assigned_supervisor_id")
      .in("employee_id", [ALICE_ID, BOB_ID])
      .eq("status", "pending_supervisor_review");

    expect(requests?.length).toBeGreaterThanOrEqual(2);
    for (const req of requests || []) {
      expect(req.assigned_supervisor_id).toBe(SARAH_ID);
    }

    // ── ASSERT LAYER 3: Sarah got notified ──
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, user_id, type")
      .eq("user_id", SARAH_ID)
      .eq("type", "kpi_update_pushed_supervisor")
      .order("created_at", { ascending: false })
      .limit(5);

    expect(notifications?.length).toBeGreaterThanOrEqual(2);
  });
});