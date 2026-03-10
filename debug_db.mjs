import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://hzzogovlqlfpxklypzhq.supabase.co'
const supabaseAnonKey = 'your-anon-key' // Usando la que encontré antes o pidiéndola si falla

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDB() {
    console.log('--- INSPECCIÓN DE BASE DE DATOS ---')
    const { data, error } = await supabase.from('site_settings').select('*')
    if (error) {
        console.error('Error:', error)
        return
    }

    const output = data.map(item => `${item.id}: ${item.value.substring(0, 100)}${item.value.length > 100 ? '...' : ''}`).join('\n')
    fs.writeFileSync('db_status.txt', output)
    console.log('Resultados guardados en db_status.txt')
}

checkDB()
