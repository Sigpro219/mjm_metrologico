import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydahorxeresxvabgzaat.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWhvcnhlcmVzeHZhYmd6YWF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MjI0OCwiZXhwIjoyMDg4MTY4MjQ4fQ.0AI69RbylU0w0MYF--pik0VuYVC25e2Jf4DWmsl4esY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function dump() {
    const { data, error } = await supabase.from('site_settings').select('*')
    if (error) {
        console.error('Error fetching data:', error)
        return
    }
    console.log('--- DUMP DE SITE_SETTINGS ---')
    data.forEach(item => {
        console.log(`ID: ${item.id} | VALUE: ${item.value.substring(0, 50)}...`)
    })
    console.log('--- FIN DUMP ---')
}

dump()
