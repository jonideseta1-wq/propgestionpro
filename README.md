# InmoGest — SaaS multi-cuenta para inmobiliarias

Starter funcional en Next.js + Supabase. Sin Google Apps Script, sin marca de terceros:
cada inmobiliaria entra con su propio dominio/subdominio y sus propios colores.

## Qué incluye

- `schema.sql` — todas las tablas (organizations, properties, tenants, charges, payments)
  con seguridad a nivel de fila (RLS) para que cada organización solo vea sus propios datos.
- `app/[org]/layout.tsx` — resuelve la organización por subdominio y aplica su marca (logo, colores, tipografía) automáticamente.
- `app/[org]/portal/page.tsx` — Portal del Inquilino conectado a datos reales.
- `app/[org]/admin/page.tsx` — Panel admin con propiedades y cargos especiales, conectado a datos reales.

## Puesta en marcha (paso a paso)

1. **Creá un proyecto en [supabase.com](https://supabase.com)** (plan gratis alcanza para empezar).
2. Andá a **SQL Editor** dentro de tu proyecto y pegá el contenido de `schema.sql`. Esto crea las tablas, la seguridad multi-cuenta, y carga dos organizaciones de ejemplo (Delta y Once).
3. En **Project Settings → API**, copiá `Project URL` y `anon public key`.
4. Copiá `.env.example` a `.env.local` y pegá esos dos valores.
5. Instalá dependencias y corré local:
   ```bash
   npm install
   npm run dev
   ```
6. Abrí `http://localhost:3000/delta/admin` o `http://localhost:3000/once/portal`.

## Lo que falta para ir a producción (a propósito, para que lo decidamos juntos)

- **Login real**: hoy el Portal espera un usuario autenticado de Supabase Auth vinculado a un inquilino; falta la pantalla de login/registro.
- **Botón "Agregar propiedad / cargo"**: en el prototipo visual eran botones de ejemplo; acá faltan los formularios que graban en la base.
- **Mercado Pago**: el botón de pago está de interfaz nomás, falta conectar la API real.
- **Dominios propios**: subdominios tipo `delta.tuplataforma.com` se configuran en Vercel (Domains) apuntando cada uno a este mismo proyecto — no hace falta duplicar código.
- **Subida de logo**: hoy el logo se carga a mano en la tabla `organizations`; se puede armar una pantalla de configuración para que cada inmobiliaria lo suba sola.

## Deploy

Subilo a GitHub y conectalo en [vercel.com](https://vercel.com) (plan gratis para empezar). Ahí cargás las mismas variables de entorno de `.env.local`.
