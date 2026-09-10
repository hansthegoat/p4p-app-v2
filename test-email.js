// test-email.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozefieqvaaclxqbbpfck.supabase.co',
  'sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi'
)

async function testEmail() {
  console.log('📧 Testing email function...')
  
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'dts9@aoholdings.net', // ← CAN BE ANY EMAIL NOW
        subject: 'Test Email from P4P App',
        html: '<h1>Hello! 👋</h1><p>This is a test email from your P4P appraisal system.</p><p>If you received this, email notifications are working! 🎉</p>'
      }
    })

    console.log('📤 Response:', data)
    console.log('❌ Error:', error)
  } catch (error) {
    console.log('❌ Error:', error.message || error)
  }
}

testEmail()