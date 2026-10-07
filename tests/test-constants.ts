// Central test credentials — single source of truth
// These match the accounts used by the auth setups.
export const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://ozefieqvaaclxqbbpfck.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi";

export const ORG_ID = "00000000-0000-0000-0000-000000000001";

export const HR_EMAIL = "iddoadugyamfi123+test1@gmail.com";
export const HR_PASSWORD = "Kwame@123#";

export const SUP_EMAIL = "iddoadugyamfi123+test2@gmail.com";
export const SUP_PASSWORD = "Kwame@123#"; // 👈 CHANGE THIS TO YOUR SUPERVISOR PASSWORD

export const ALICE_ID = "emp-alice-001";
export const BOB_ID = "emp-bob-001";
export const SARAH_ID = "5714755d-4303-483a-857a-33f3ebb22891";