# Guía de Migración: Supabase -> Firebase

Este proyecto está en proceso de migración de Supabase a Firebase (Firestore/Storage).

## Estado Actual
- Se han implementado **fallbacks locales** en `lib/constants.ts` para que la aplicación no crashee si la base de datos de Supabase no responde.
- Los servicios en `services/` aún llaman a `supabase`.

## Próximos Pasos (En el nuevo PC)

### 1. Configurar Entorno
Asegúrate de copiar el archivo `.env.local` con las siguientes llaves:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 2. Refactorizar `services/organizations.ts`
Cambiar las llamadas de `supabase.from('organizations')` a `getDocs(collection(db, 'organizations'))`.

### 3. Refactorizar `services/storage.ts`
Pasar de `supabase.storage` a `firebase/storage`.

### 4. Limpieza
Una vez migrado, se puede eliminar `lib/supabase.ts` y las dependencias de `@supabase/supabase-js`.

---
*Preparado por Antigravity para la transición de equipos.*
