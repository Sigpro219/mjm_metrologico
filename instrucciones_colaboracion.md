# Guía de Optimización para Colaboración Futura

Para asegurar que los próximos desarrollos se ejecuten con la máxima velocidad y sin errores, se recomienda seguir este esquema de entrega de información:

## 1. Kit de Identidad Visual (Branding)
*   **Logo**: Indicar siempre cuál es el archivo oficial (ej: `public/logo.png`).
*   **Regla de Oro**: Especificar si el logo debe usarse tal cual o si se permite la recreación/modificación. Lo ideal es adjuntar el archivo "Logo Integrado" (Imagen + Texto) desde el inicio.

## 2. Mapa de Recursos (Activos)
*   **Ubicación**: Indicar las rutas exactas de las carpetas de recursos. 
    *   Ejemplo: "Fotos de equipo en `CIMGA\FOTOS`", "Logos de aliados en `MARCAS\LOGOS`".
*   **Limpieza**: Definir si se deben usar todos los archivos de una carpeta o solo una selección específica.

## 3. Definición de Interactividad
*   **Componentes**: Especificar si el diseño requiere efectos al pasar el mouse (hover), animaciones o menús interactivos.
*   **Impacto Técnico**: Esto permite activar el modo `'use client'` desde el inicio, evitando errores de renderizado en el servidor (Vercel).

## 4. Instrucciones Granulares (Lista de Chequeo)
*   **Formato**: Descomponer la solicitud en tareas específicas por sección.
    *   *Sección Inicio*: Cambiar texto a "X".
    *   *Sección Alíados*: Reemplazar placeholders por logos.
    *   *Sección Contacto*: Vincular botón a Google Forms.

## 5. Protocolo de Verificación (Local vs Producción)
*   **Sincronización**: Al detectar que un cambio funciona en `localhost` pero no en `Vercel`, reportarlo inmediatamente. 
*   **Git**: Asegurarse de que los archivos nuevos no estén en el `.gitignore` por error (ej: imágenes grandes o archivos confidenciales).

---
*Esta guía fue generada para optimizar los tiempos de respuesta y asegurar la fidelidad del producto final solicitado por el usuario.*
