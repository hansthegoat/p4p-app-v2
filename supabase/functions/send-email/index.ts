// supabase/functions/send-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    console.log("📧 Function called!")
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "P4P@aoholdings.net"
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const { to, subject, html } = await req.json()
    
    console.log("📧 To:", to)
    console.log("📧 From:", FROM_EMAIL)
    console.log("📧 Subject:", subject)

    // Send email using Resend with YOUR VERIFIED DOMAIN
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject: subject || "P4P App Notification",
        html: html || "<p>No content</p>",
      }),
    })

    const result = await emailResponse.json()
    console.log("📧 Resend response:", result)

    if (!emailResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: result.message || "Failed to send email",
          details: result 
        }),
        { status: emailResponse.status, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("❌ Error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})