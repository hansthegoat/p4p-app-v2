// src/lib/email.ts

import { supabase } from "./supabase"

export const sendEmail = async (params: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: params,
    })

    if (error) {
      console.error("Email error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Email error:", error)
    return { success: false, error: error.message }
  }
}