// lib/geminiMetrologyService.ts
// Motor de Inteligencia Artificial Metrológica para MJM Asesorías Integrales
// Basado en Google Gemini 3.6 Flash con soporte multimodal para PDFs

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function getGeminiApiKey(): string {
  const key = 
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
    process.env.GEMINI_API_KEY || 
    "";
  return key.trim();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error("Error leyendo archivo como texto"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

export interface CalibrationPoint {
  nominal: number;
  reference: number;
  measured: number;
  uncertainty: number;
  emp: number;
  unit: string;
}

export interface ExtractedMetrologyData {
  instrumentName: string;
  serial: string;
  brand: string;
  model: string;
  capacity: string;
  certificateNumber: string;
  calibrationDate: string;
  laboratoryName: string;
  laboratoryType: 'Acreditado' | 'Trazable';
  normaReferencia: string;
  errorMaximo: number;
  incertidumbreMaxima: number;
  empNormativo: number;
  veredicto: 'Conforme' | 'No Conforme' | 'Zona de Duda';
  dictamenParrafo: string;
  aptitudUso: string;
  points: CalibrationPoint[];
}

export async function analyzeMetrologyCertificateWithGemini(file: File, customKey?: string): Promise<ExtractedMetrologyData> {
  const apiKey = customKey || getGeminiApiKey();

  if (!apiKey) {
    throw new Error("No se ha configurado la clave de API de Google Gemini (NEXT_PUBLIC_GEMINI_API_KEY).");
  }

  const base64Pdf = await fileToBase64(file);

  const prompt = `Actúa como un Auditor Metrológico Senior bajo las normas ISO/IEC 17025:2017, ISO 10012, y las directrices de la guía JCGM 106:2012 e ISO 14253-1.

Analiza minuciosamente el certificado de calibración adjunto en formato PDF.

Debes extraer todos los datos y realizar una evaluación técnica cuantitativa estricta:

1. IDENTIFICACIÓN DEL INSTRUMENTO:
   - instrumento: Nombre técnico del instrumento (ej. Manómetro analógico, Termómetro digital, Termohigrómetro, Pie de rey, Comparador de carátula, Torquímetro, Pesa patrón, Pinza voltiamperimétrica, etc.)
   - marca: Fabricante del instrumento
   - modelo: Modelo del equipo
   - serie: Número de serie / Serial
   - rango: Rango o intervalo de medición con unidades
   - resolucion: División de escala o resolución con unidades
   - unidad: Unidad principal de medida (ej. psi, bar, °C, %HR, mm, N·m, lbf·ft, mg, g, A, V)
   - laboratorio: Nombre del laboratorio emisor
   - laboratorio_tipo: "Acreditado" o "Trazable"
   - certificado_numero: Número oficial del certificado
   - fecha_calibracion: Fecha en formato YYYY-MM-DD
   - patron: Patrón o patrones utilizados para la calibración

2. PUNTOS DE CALIBRACIÓN:
   - Extrae los puntos de calibración relevantes reportados en la tabla del documento:
     * nominal: Valor numérico nominal
     * patron: Valor numérico de referencia del patrón
     * instrumento: Valor numérico leído en el instrumento
     * error: Error absoluto (|instrumento - patron| o el reportado)
     * incertidumbre: Incertidumbre expandida U (k=2) numérica
     * emp: Error Máximo Permisible normativo numérico para ese punto

3. CONFRONTACIÓN Y REGLA DE DECISIÓN METROLÓGICA:
   - Identifica la norma técnica internacional o estándar aplicable (ASME B40.100, OIML R 111, JIS B 7507, ISO 6789, ASTM E230, etc.).
   - Aplica la regla de decisión:
     * Si el certificado dice explícitamente "No Cumple" -> "No Conforme" (Reprobado).
     * Si |Error Máx| > EMP -> "No Conforme" (Reprobado).
     * Si |Error Máx| <= EMP pero |Error Máx| + U > EMP -> "Zona de Duda" (Riesgo Compartido / Indeterminación).
     * Si |Error Máx| + U <= EMP -> "Conforme" (Aprobado).

4. DICTAMEN TÉCNICO FORMAL:
   - veredicto: "Conforme", "No Conforme" o "Zona de Duda".
   - dictamen_parrafo: Un párrafo formal de extensión corta a media (entre 4 y 7 líneas) redactado con solvencia técnica metrológica, explicando:
     * Nombre, marca y serial del equipo analizado.
     * El peor error de medición encontrado, en qué punto ocurrió y qué magnitud representa frente a la escala o valor medido.
     * La norma técnica o estándar de referencia contra el que se contrastó y el valor del Error Máximo Permisible (EMP).
     * El veredicto técnico final (Aprobado / Reprobado / En Zona de Duda).
     * Recomendación u orientación operativa clara para la planta.
   - aptitud_de_uso: "Apto para uso sin restricciones" / "No apto para uso" / "Uso condicionado con corrección".

Genera EXCLUSIVAMENTE una respuesta en formato JSON con la siguiente estructura exacta:
{
  "instrumento": "...",
  "marca": "...",
  "modelo": "...",
  "serie": "...",
  "rango": "...",
  "resolucion": "...",
  "unidad": "...",
  "laboratorio": "...",
  "laboratorio_tipo": "Acreditado",
  "certificado_numero": "...",
  "fecha_calibracion": "...",
  "norma_referencia": "...",
  "error_maximo": 0.0,
  "incertidumbre_maxima": 0.0,
  "emp_normativo": 0.0,
  "veredicto": "Conforme",
  "dictamen_parrafo": "...",
  "aptitud_de_uso": "...",
  "puntos": [
    {
      "nominal": 0.0,
      "patron": 0.0,
      "instrumento": 0.0,
      "incertidumbre": 0.0,
      "emp": 0.0,
      "unit": "..."
    }
  ]
}
Sin bloques de código markdown, responde únicamente el objeto JSON crudo.`;

  const models = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(`${GEMINI_ENDPOINT_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf
                  }
                },
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Error HTTP ${response.status} en modelo ${model}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Respuesta vacía del modelo");

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const p = JSON.parse(cleanJson);

      const points: CalibrationPoint[] = Array.isArray(p.puntos) ? p.puntos.map((pt: any) => ({
        nominal: Number(pt.nominal) || 0,
        reference: Number(pt.patron ?? pt.reference) || 0,
        measured: Number(pt.instrumento ?? pt.measured) || 0,
        uncertainty: Number(pt.incertidumbre) || 0,
        emp: Number(pt.emp) || Number(p.emp_normativo) || 0,
        unit: pt.unit || p.unidad || ''
      })) : [];

      return {
        instrumentName: p.instrumento || file.name.replace('.pdf', ''),
        serial: p.serie || 'S/N',
        brand: p.marca || 'N/A',
        model: p.modelo || 'N/A',
        capacity: p.rango || 'N/A',
        certificateNumber: p.certificado_numero || 'N/A',
        calibrationDate: p.fecha_calibracion || new Date().toISOString().split('T')[0],
        laboratoryName: p.laboratorio || 'Laboratorio Metrológico',
        laboratoryType: p.laboratorio_tipo === 'Trazable' ? 'Trazable' : 'Acreditado',
        normaReferencia: p.norma_referencia || 'ISO/IEC 17025',
        errorMaximo: Number(p.error_maximo) || 0,
        incertidumbreMaxima: Number(p.incertidumbre_maxima) || 0,
        empNormativo: Number(p.emp_normativo) || 0,
        veredicto: p.veredicto === 'No Conforme' ? 'No Conforme' : p.veredicto === 'Zona de Duda' ? 'Zona de Duda' : 'Conforme',
        dictamenParrafo: p.dictamen_parrafo || '',
        aptitudUso: p.aptitud_de_uso || '',
        points: points
      };

    } catch (err: any) {
      console.warn(`[GeminiMetrology Next] Error con ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Error en el motor Gemini: ${lastError?.message || 'Fallo desconocido'}`);
}
