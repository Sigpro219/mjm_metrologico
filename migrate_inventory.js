
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyCw-REDACTED",
  authDomain: "mjm-core-bd.firebaseapp.com",
  projectId: "mjm-core-bd",
  storageBucket: "mjm-core-bd.firebasestorage.app",
  messagingSenderId: "317167080548",
  appId: "1:317167080548:web:7573934f899c77395b0981"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TENANT_ID = 'deltapruebas-sandbox';

async function migrate() {
    try {
        const rawText = fs.readFileSync('./inventario_data.json', 'utf16le');
        const instruments = JSON.parse(rawText.startsWith('\ufeff') ? rawText.slice(1) : rawText);
        
        // Limpiador profundo de caracteres para metrología
        const deepClean = (str) => {
            if (typeof str !== 'string') return str;
            return str
                .replace(/├│/g, 'ó').replace(/├í/g, 'á').replace(/├®/g, 'é')
                .replace(/├¡/g, 'í').replace(/├║/g, 'ú').replace(/├▒/g, 'ñ')
                .replace(/├ô/g, 'Ó').replace(/\|ÔN/g, 'ÓN').replace(/├ôN/g, 'ÓN')
                .replace(/├ü/g, 'Á').replace(/├ë/g, 'É').replace(/├ì/g, 'Í')
                .replace(/├ö/g, 'Ó').replace(/├Ü/g, 'Ú').replace(/├æ/g, 'Ñ');
        };

        console.log(`--- Iniciando migración limpia de ${instruments.length} equipos ---`);

        let count = 0;
        for (const item of instruments) {
            const keys = Object.keys(item);
            const getVal = (search) => {
                const key = keys.find(k => k.toLowerCase().includes(search.toLowerCase()));
                return key ? deepClean(item[key]) : null;
            };

            const cleanInstrument = {
                codigo: getVal('digo interno') || getVal('ID') || `SN-${count + 1}`,
                nombre: getVal('Instrumento') || getVal('Descripcion') || 'Sin nombre',
                marca: getVal('Marca') || 'N/A',
                modelo: getVal('Modelo') || 'N/A',
                serie: getVal('Serial') || getVal('Serie') || 'N/A',
                ubicacion: getVal('Ubicaci') || 'Laboratorio',
                proceso: getVal('Proceso') || 'OPERATIVO',
                magnitud: getVal('Magnitud') || 'OTRA',
                criticidad: getVal('Criticidad') || 'MEDIA',
                
                rango_max: getVal('xima') || '',
                rango_min: getVal('nima') || '',
                resolucion: getVal('escala') || getVal('Resolucion') || 'N/A',
                estado_funcional: getVal('funcional') || 'FUNCIONAL',
                frecuencia_meses: parseInt(getVal('Intervalo')) || 12,
                
                tenantId: TENANT_ID,
                fecha_creacion: new Date().toISOString(),
                procedencia: 'MIGRACION_LIMPIA_V2'
            };

            const docId = `${TENANT_ID}_${cleanInstrument.codigo.toString().replace(/[\s\/]/g, '_')}_${count}`;
            await setDoc(doc(db, 'tenants', TENANT_ID, 'inventario_metrologico', docId), cleanInstrument);
            
            count++;
            if (count % 10 === 0) console.log(`Limpiados y cargados ${count} equipos...`);
        }

        console.log(`\n✅ MIGRACIÓN EXITOSA: ${count} equipos cargados.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
