import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SugerenciaCliente } from "@/lib/types";

export async function GET(request: Request) {
  // No se vuelve a validar el usuario acá: el middleware ya exige sesión
  // para cualquier ruta no listada en RUTAS_PUBLICAS (incluida esta), así
  // que repetir supabase.auth.getUser() acá sumaba un segundo viaje de red
  // al servidor de auth de Supabase en cada request, sin aportar nada extra.
  const supabase = await createClient();

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ resultados: [] as SugerenciaCliente[] });
  }

  // Buscar solo desde el inicio de una palabra (no en cualquier posición):
  // Postgres puede resolver esto mucho más rápido que un %termino% libre en
  // una tabla de 50k+ filas (ver PORTS.md / notas de perf), y en la práctica
  // es como la gente espera que funcione un buscador de nombre de empresa.
  // Se sanean los caracteres con significado especial en la sintaxis .or()
  // de PostgREST (, ( ) *) antes de armar el filtro.
  const termino = q.replace(/[,()*]/g, "");
  if (!termino) {
    return NextResponse.json({ resultados: [] as SugerenciaCliente[] });
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("ruc_dni, bp, razon_social")
    .or(`razon_social.ilike.${termino}*,razon_social.ilike.* ${termino}*`)
    .order("razon_social", { ascending: true })
    .limit(8);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resultados: (data ?? []) as SugerenciaCliente[] });
}
