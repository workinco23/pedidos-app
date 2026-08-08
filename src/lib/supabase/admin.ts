import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con Service Role Key: solo para uso en route handlers/servidor,
 * nunca exponer al navegador. Ignora RLS, así que cada uso debe validar
 * el rol del solicitante antes de leer/escribir.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
