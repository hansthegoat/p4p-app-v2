// supabase/functions/cleanup-unverified/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError

    const now = Date.now()
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
    let deletedCount = 0
    const deleted: string[] = []

    for (const user of usersData.users) {
      const createdAt = new Date(user.created_at).getTime()
      const isUnverified = !user.email_confirmed_at
      const isOlderThan24h = now - createdAt > TWENTY_FOUR_HOURS

      if (isUnverified && isOlderThan24h) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        if (!deleteError) {
          deletedCount++
          deleted.push(user.email || user.id)
          console.log(`Deleted unverified user: ${user.email} (created ${user.created_at})`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        deleted,
        message: `Cleaned up ${deletedCount} unverified user(s)`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Cleanup failed:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})