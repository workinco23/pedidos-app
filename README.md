## Gestión Operativa de Pedidos

App Next.js 16 + Supabase para coordinar Comercial, Vigilancia, Almacén y la Pantalla Pública, según `../plan_arquitectura_aplicacion_pedidos.md`.

### 1. Crear el proyecto Supabase

1. Crea un proyecto en https://supabase.com.
2. En el editor SQL, ejecuta `../pedidos-app-supabase/schema.sql` (crea tablas, enums, RLS y triggers).
3. Actualiza la fila de `dominios_permitidos` con tu dominio corporativo real (por defecto trae `tuempresa.com`).
4. En **Authentication > Providers**, habilita Google y configura el Client ID/Secret de OAuth (restringido por `hd` al dominio, validado también por el trigger `handle_new_user`).
5. En **Authentication > URL Configuration**, agrega `http://localhost:3000/auth/callback` (y la URL de producción cuando la tengas) como Redirect URL.

### 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` (ya existe un `.env.local` con placeholders) y completa:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API).
- `NEXT_PUBLIC_DOMINIO_CORPORATIVO` con tu dominio.
- `SMTP_*` si quieres enviar correos reales (si se dejan vacíos, el envío se loguea en consola — modo mock).
- `SUNAT_API_URL` / `SUNAT_API_TOKEN` si tienes un servicio real de consulta RUC/DNI (si se dejan vacíos, se usa un mock determinístico).

### 3. Asignar el primer usuario admin

Todo usuario nuevo entra con rol `comercial` por defecto (trigger `handle_new_user`). Para asignar roles reales, actualiza manualmente en la tabla `usuarios` desde el SQL editor de Supabase, por ejemplo:

```sql
update usuarios set rol = 'almacen' where email = 'persona@tuempresa.com';
```

### 4. Ejecutar en desarrollo

```bash
npm install
npm run dev
```

Rutas principales:

- `/login` — acceso con Google.
- `/comercial`, `/almacen`, `/vigilancia` — paneles protegidos por rol (el `proxy.ts` redirige según el rol del usuario).
- `/pantalla-publica` — pública, sin login, pensada para modo kiosko en TV.

### Notas de implementación

- **Auth por rol**: `src/proxy.ts` (convención `proxy` de Next.js 16, reemplazo de `middleware`) refresca la sesión de Supabase y redirige según `usuarios.rol`. Los layouts de cada panel (`src/app/*/layout.tsx`) validan el rol otra vez del lado del servidor.
- **Tiempo real**: Comercial/Almacén/Vigilancia usan `supabase.channel(...).on('postgres_changes', ...)` (RLS aplica con el JWT del usuario). La Pantalla Pública, al ser anónima, usa polling cada 4s contra `/api/pantalla-publica`, que lee con la Service Role Key y enmascara el campo `ob` antes de responder — así nunca se expone la key ni el dato sin enmascarar al navegador.
- **SUNAT y SMTP** están mockeados en `src/lib/sunat.ts` y `src/lib/mailer.ts`; reemplaza la lógica del bloque `if (apiUrl)` / `if (process.env.SMTP_HOST)` cuando tengas credenciales reales.
- **Transiciones de estado**: `src/app/api/pedidos/[id]/estado/route.ts` valida que Comercial solo pueda fijar `en_extraccion`/`facturado` y Almacén solo `contabilizado`/`entregado`, además de las políticas RLS del esquema.
