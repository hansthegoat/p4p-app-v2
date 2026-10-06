import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const authFile = "tests/.auth/supervisor.json";

// ⚠️ Sarah's credentials
const SUP_EMAIL = "iddoadugyamfi123+test2@gmail.com";
const SUP_PASSWORD = "Kwame@123#";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";

setup("authenticate as supervisor", async ({ page }) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: SUP_EMAIL,
    password: SUP_PASSWORD,
  });

  if (error) throw new Error(`Login failed: ${error.message}`);
  if (!data.session) throw new Error("No session returned");

  await page.goto("login");
  await page.waitForLoadState("domcontentloaded");

  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  await page.evaluate(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: storageKey, value: JSON.stringify(data.session) }
  );

  await page.context().storageState({ path: authFile });
});