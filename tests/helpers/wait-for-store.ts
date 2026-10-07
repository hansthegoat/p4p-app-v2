import { Page, expect } from "@playwright/test";

/**
 * Waits for the P4P store to finish its initial cloud fetch.
 *
 * Without this, tests that click data-dependent buttons (Push, Approve,
 * Fulfill, etc.) can fire before `state.employees` is populated, causing
 * the app to show "No changes" / "All caught up" instead of the expected
 * dialog. The store exposes `__p4p` in dev mode via P4PProvider.
 */
export async function waitForStoreSync(
  page: Page,
  options: { requireEmployees?: boolean; timeout?: number } = {}
): Promise<void> {
  const { requireEmployees = true, timeout = 20000 } = options;

  await page.waitForFunction(
    ({ requireEmployees }) => {
      const p4p = (window as any).__p4p;
      if (!p4p || p4p.isCloudSynced !== true) return false;
      if (requireEmployees && (p4p.employees?.length ?? 0) === 0) return false;
      return true;
    },
    { requireEmployees },
    { timeout }
  );
}