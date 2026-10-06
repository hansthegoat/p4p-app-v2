import { test, expect } from "@playwright/test";

test("supervisor approves a pending KPI change", async ({ page }) => {
  // 1. Land on /my-team
  await page.goto("my-team");

  // 2. Wait for the page header (page fully loaded)
  await expect(
    page.getByRole("heading", { name: "My Team" })
  ).toBeVisible({ timeout: 15000 });

  // 3. Click the Reviews tab
  await page.getByRole("tab", { name: /Reviews/ }).click();

  // 4. Wait for either a Review button OR the empty state
  const reviewButtons = page.getByRole("button", { name: "Review" });
  const emptyState = page.getByText("All caught up");

  await expect(reviewButtons.first().or(emptyState)).toBeVisible({
    timeout: 10000,
  });

  // 5. If empty, skip — no data to test against
  if (await emptyState.isVisible()) {
    test.skip(
      true,
      "No pending KPI change to review. Push a template from HR to seed one, then re-run."
    );
    return;
  }

  // 6. Open the first pending item
  await reviewButtons.first().click();

  // 7. Drawer should open with a "Review KPI Changes" heading
  await expect(page.getByText("Review KPI Changes")).toBeVisible({
    timeout: 5000,
  });

  // 8. Click Approve
  await page
    .getByRole("button", { name: /Approve & push to employee/ })
    .click();

  // 9. Expect a success toast
  await expect(page.getByText("Approved")).toBeVisible({ timeout: 10000 });

  // 10. Drawer should close
  await expect(page.getByText("Review KPI Changes")).not.toBeVisible({
    timeout: 5000,
  });

  // 11. The approved item should be gone from the queue
  // (one fewer Review button, or empty state now visible)
  const remaining = await reviewButtons.count();
  const nowEmpty = await emptyState.isVisible().catch(() => false);
  expect(remaining === 0 || nowEmpty).toBeTruthy();
});