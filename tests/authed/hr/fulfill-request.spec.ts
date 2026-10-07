import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { waitForStoreSync } from "../../helpers/wait-for-store";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";

const HR_EMAIL = "iddoadugyamfi123+test1@gmail.com";
const HR_PASSWORD = "Kwame@123#";

const ORG_ID = "00000000-0000-0000-0000-000000000001";
const ALICE_ID = "emp-alice-001";
const SARAH_ID = "5714755d-4303-483a-857a-33f3ebb22891";
const SEEDED_REQUEST_ID = "test-req-fulfill-flow";

test.describe("HR fulfills an employee KPI request", () => {
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
    // 1. Capture Alice's categories for restore
    const { data: alice, error: aliceErr } = await supabase
      .from("employees")
      .select("categories")
      .eq("id", ALICE_ID)
      .maybeSingle();
    if (aliceErr) throw new Error(`Fetch Alice failed: ${aliceErr.message}`);
    aliceOriginalCategories = alice?.categories || [];

    // 2. Empty Alice's categories so the push finds a real diff
    await supabase
      .from("employees")
      .update({ categories: [], needs_kpi_setup: true })
      .eq("id", ALICE_ID);

    // 3. Clear any pending kpi_update_requests for Alice (from other runs)
    await supabase
      .from("kpi_update_requests")
      .delete()
      .eq("employee_id", ALICE_ID);

    // 4. Clear ALL pending kpi_requests in the org — clean slate.
    //    Old tests may have left requests for other roles/depts that
    //    would show up as extra "Set up template" buttons.
    await supabase
      .from("kpi_requests")
      .delete()
      .eq("org_id", ORG_ID)
      .eq("status", "pending");

    // 6. Seed our controlled request
    const { error: seedErr } = await supabase.from("kpi_requests").insert({
      id: SEEDED_REQUEST_ID,
      org_id: ORG_ID,
      employee_id: ALICE_ID,
      employee_name: "Alice Worker",
      employee_email: "alice@test.local",
      department: "Support",
      role: "Analyst",
      status: "pending",
      created_at: new Date().toISOString(),
    });
    if (seedErr) throw new Error(`Seed request failed: ${seedErr.message}`);

    // 7. Ensure the Support/Analyst template exists
    await supabase.from("kpi_templates").upsert(
      {
        org_id: ORG_ID,
        department: "Support",
        role_name: "Analyst",
        job_grade: "4",
        categories: [
          {
            id: "cat-fulfill-test",
            name: "Fulfill Test Category",
            weight: 100,
            kpis: [
              {
                id: "kpi-fulfill-test",
                description: "Fulfill test KPI",
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
  });

  test.afterEach(async () => {
    // Restore Alice
    await supabase
      .from("employees")
      .update({ categories: aliceOriginalCategories })
      .eq("id", ALICE_ID);

    // Clean up everything we created
    await supabase.from("kpi_requests").delete().eq("id", SEEDED_REQUEST_ID);
    await supabase
      .from("kpi_update_requests")
      .delete()
      .eq("employee_id", ALICE_ID);
  });

  test("fulfills the request when HR pushes a template", async ({ page }) => {
    // ── ACT ──
    // 1. Navigate directly to the Requests tab
    await page.goto("kpi-framework?view=requests");

    // 2. Wait for the page and the store
    await expect(
      page.getByRole("heading", { name: /KPI Framework|Editing/ })
    ).toBeVisible({ timeout: 15000 });
    await waitForStoreSync(page);

    // 3. Confirm the Requests tab is active and Alice's request is visible
    await expect(page.getByText("Alice Worker")).toBeVisible({
      timeout: 10000,
    });

    // 3b. Assert exactly one pending request is showing.
    //     Checking the button count is more reliable than the header text,
    //     which React renders as multiple text nodes.
    await expect(
      page.getByRole("button", { name: "Set up template" })
    ).toHaveCount(1);

    // 4. Click "Set up template" on the request card
    await page.getByRole("button", { name: "Set up template" }).click();

    // 5. Confirm we've jumped to the Build tab with Support / Analyst loaded
    //    (the tab bar highlights "Build Templates")
    await expect(
      page.getByRole("tab", { name: /Build Templates/ })
    ).toHaveAttribute("data-state", "active", { timeout: 5000 });

    // 6. Wait for the template to render (Save + Push buttons appear)
    const pushButton = page
      .locator('[data-tour="framework-actions"]')
      .getByRole("button", { name: /Push to Employees/ });
    await expect(pushButton).toBeVisible({ timeout: 10000 });
    await expect(pushButton).toBeEnabled();

    // 7. Click Push — preview dialog opens
    await pushButton.click();
    await expect(
      page.getByRole("heading", { name: /Push KPI changes to employees/ })
    ).toBeVisible({ timeout: 5000 });

    // 8. Confirm the push
    await page.getByRole("button", { name: /^Push changes$/ }).click();

    // ── ASSERT LAYER 1: The kpi_requests row is fulfilled ──
    await expect
      .poll(
        async () => {
          const { data } = await supabase
            .from("kpi_requests")
            .select("status, fulfilled_at")
            .eq("id", SEEDED_REQUEST_ID)
            .maybeSingle();
          return data?.status;
        },
        { timeout: 15000, intervals: [500, 1000, 2000] }
      )
      .toBe("fulfilled");

    // ── ASSERT LAYER 2: A kpi_update_request was created for Alice ──
    const { data: requests } = await supabase
      .from("kpi_update_requests")
      .select("id, employee_id, status, assigned_supervisor_id")
      .eq("employee_id", ALICE_ID)
      .eq("status", "pending_supervisor_review");

    expect(requests?.length).toBeGreaterThanOrEqual(1);
    expect(requests?.[0]?.assigned_supervisor_id).toBe(SARAH_ID);

    // ── ASSERT LAYER 3: The Requests tab is now empty ──
    //    (auto-fulfillment removes the request from the queue)
    await page.getByRole("tab", { name: /Requests/ }).click();
    await expect(page.getByText("No pending requests")).toBeVisible({
      timeout: 10000,
    });
  });
});