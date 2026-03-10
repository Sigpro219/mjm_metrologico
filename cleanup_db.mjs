import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydahorxeresxvabgzaat.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWhvcnhlcmVzeHZhYmd6YWF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MjI0OCwiZXhwIjoyMDg4MTY4MjQ4fQ.0AI69RbylU0w0MYF--pik0VuYVC25e2Jf4DWmsl4esY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanup() {
    console.log('--- INICIANDO LIMPIEZA DE BASE DE DATOS ---')
    const { data, error } = await supabase.from('site_settings').select('*')
    if (error) {
        console.error('Error fetching data:', error)
        return
    }

    const uniqueMap = new Map()

    data.forEach(item => {
        const id = item.id
        const val = item.value

        if (!uniqueMap.has(id)) {
            uniqueMap.set(id, item)
        } else {
            const existing = uniqueMap.get(id)
            // Criterio: Si el nuevo valor no es vacío y el existente sí, lo reemplazamos
            const isNewBetter = val.length > existing.value.length
            if (isNewBetter) {
                uniqueMap.set(id, item)
            }
        }
    })

    console.log(`Encontrados ${uniqueMap.size} IDs únicos de ${data.length} filas totales.`)

    // 1. Borrar todo (PELIGROSO PERO NECESARIO PARA REINICIAR CON PK)
    const { error: deleteError } = await supabase.from('site_settings').delete().neq('id', '---NONE---')
    if (deleteError) {
        console.error('Error al borrar:', deleteError)
        return
    }
    console.log('Tabla vaciada con éxito.')

    // 2. Re-insertar lo mejor
    const finalRecords = Array.from(uniqueMap.values()).map(item => ({ id: item.id, value: item.value }))
    const { error: insertError } = await supabase.from('site_settings').insert(finalRecords)

    if (insertError) {
        console.error('Error al re-insertar:', insertError)
    } else {
        console.log('✅ Base de datos deduplicada y restaurada con los mejores valores.')
    }
}

cleanup()
