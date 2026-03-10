import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedSettings() {
    const keysToEnsure = [
        'servicio_1_title', 'servicio_1_desc', 'servicio_1_image', 'servicio_1_subservices',
        'servicio_2_title', 'servicio_2_desc', 'servicio_2_image', 'servicio_2_subservices',
        'servicio_3_title', 'servicio_3_desc', 'servicio_3_image', 'servicio_3_subservices',
        'servicio_4_title', 'servicio_4_desc', 'servicio_4_image', 'servicio_4_subservices',
        'servicio_5_title', 'servicio_5_desc', 'servicio_5_image', 'servicio_5_subservices',
        'servicios_title', 'servicios_subtitle', 'servicios_image'
    ]

    const records = keysToEnsure.map(key => ({
        id: key,
        value: key.endsWith('_subservices')
            ? JSON.stringify({ title: '', desc: '', items: [{ title: '', desc: '' }, { title: '', desc: '' }, { title: '', desc: '' }] })
            : ''
    }))

    for (const record of records) {
        const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .eq('id', record.id)
            .single()

        if (existing) {
            console.log(`Llave ${record.id} ya existe, saltando...`)
        } else {
            const { error } = await supabase.from('site_settings').insert(record)
            if (error) {
                console.error(`Error al insertar ${record.id}:`, error.message)
            } else {
                console.log(`✅ Llave ${record.id} creada.`)
            }
        }
    }
    console.log('Sincronización finalizada.')
}

seedSettings()
