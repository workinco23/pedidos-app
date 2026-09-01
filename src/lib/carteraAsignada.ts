import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * BPs asignados al vendedor logueado según cartera.vendedor_email.
 * Devuelve `null` cuando el usuario no tiene cartera propia asignada,
 * lo que significa "sin restricción, puede buscar entre todos los
 * clientes" — no un array vacío, para no confundir "sin cartera" con
 * "cartera vacía".
 */
export async function obtenerBpsAsignados(
  supabase: SupabaseClient,
  email: string
): Promise<string[] | null> {
  const { data } = await supabase.from("cartera").select("bp").eq("vendedor_email", email);
  if (!data || data.length === 0) return null;
  return data.map((fila) => fila.bp);
}
