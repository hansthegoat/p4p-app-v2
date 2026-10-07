import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const authFile = "tests/.auth/hr.json";

// ⚠️ Replace these two with your actual HR password and Supabase anon key
const HR_EMAIL = "iddoadugyamfi123+test1@gmail.com";
const HR_PASSWORD = "Kwame@123#";

// Get these from your .env file — VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ozefieqvaaclxqbbpfck.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";

setup("authenticate as HR", async ({ page }) => {
  // 1. Create a Supabase client in Node
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 2. Sign in directly (no UI)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: HR_EMAIL,
    password: HR_PASSWORD,
  });

  if (error) throw new Error(`Login failed: ${error.message}`);
  if (!data.session) throw new Error("No session returned from Supabase");

  // 3. Navigate to the app so we have the right origin for localStorage
  await page.goto("login");
  await page.waitForLoadState("domcontentloaded");

  // 4. Inject the Supabase session into localStorage
  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  await page.evaluate(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
      // Disable tours so overlays don't block test clicks
      window.localStorage.setItem("p4p_disable_tours", "true");
    },
    { key: storageKey, value: JSON.stringify(data.session) }
  );

  await page.context().storageState({ path: authFile });
});