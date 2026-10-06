import { test, expect } from "@playwright/test";

test("HR sees the HR sidebar", async ({ page }) => {
  await page.goto("dashboard");

  // Wait for the dashboard to render — use the sidebar container
  const sidebar = page.locator("aside[data-tour='sidebar']");
  await expect(sidebar).toBeVisible({ timeout: 15000 });

  // HR-only menu items (target links inside the sidebar)
  await expect(sidebar.getByRole("link", { name: "Employees" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Supervisors" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "KPI Framework" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Grade Points" })).toBeVisible();

  // Employee-shared items
  await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "My Profile" })).toBeVisible();
});