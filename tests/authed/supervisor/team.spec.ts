import { test, expect } from "@playwright/test";

test("supervisor sees their team", async ({ page }) => {
  await page.goto("my-team");

  // Wait for the sidebar
  const sidebar = page.locator("aside[data-tour='sidebar']");
  await expect(sidebar).toBeVisible({ timeout: 15000 });

  // The supervisor should see "My Team" as an active menu item
  await expect(sidebar.getByRole("link", { name: "My Team" })).toBeVisible();

  // Wait for the page content — should show the supervisor's name or reports
  await expect(page.getByText("Alice Worker")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Bob Worker")).toBeVisible();
});