import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ybolgcdwdfyouvidwjwu.supabase.co' // https://ybolgcdwdfyouvidwjwu.supabase.co
const supabaseKey = 'sb_publishable_XLo53A1BJ5RbpaMkrPJsQw_va1wC_pG' // sb_publishable_XLo53A1BJ5RbpaMkrPJsQw_va1wC_pG

export const supabase = createClient(supabaseUrl, supabaseKey)