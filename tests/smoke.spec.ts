import { test, expect } from "@playwright/test";

test("login page loads with the expected heading", async ({ page }) => {
  // 1. Navigate to the login page
  await page.goto("login");

  // 2. Wait for the page to actually render (splash screen fades, then login appears)
  //    "Welcome back" is the heading from your login page.
  await expect(page.getByText("Welcome back")).toBeVisible({ timeout: 15000 });

  // 3. Verify the email and password fields are present
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  // 4. Verify the Sign In button exists
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});