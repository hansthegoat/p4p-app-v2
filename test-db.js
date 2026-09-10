import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ozefieqvaaclxqbbpfck.supabase.co',
  'sb_publishable_71QSPKv8b5ETNTBKA4fpcg_94iKssYi'
)

async function test() {
  console.log('Testing DB access...')
  
  // Test 1: Read employees (should return empty array, not error)
  const { data, error } = await supabase.from('employees').select('*').limit(5)
  console.log('Employees:', data, 'Error:', error)
  
  // Test 2: Read templates
  const { data: tpl, error: tplErr } = await supabase.from('kpi_templates').select('*').limit(5)
  console.log('Templates:', tpl, 'Error:', tplErr)
  
  // Test 3: Read notifications
  const { data: notif, error: notifErr } = await supabase.from('notifications').select('*').limit(5)
  console.log('Notifications:', notif, 'Error:', notifErr)
}

test()