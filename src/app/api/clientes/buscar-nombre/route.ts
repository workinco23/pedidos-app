import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { obtenerBpsAsignados } from "@/lib/carteraAsignada";
import type { SugerenciaCliente } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ resultados: [] as SugerenciaCliente[] });
  }

  // A diferencia de otras rutas de este mismo panel, acá sí hace falta
  // pedir el usuario: no solo para confirmar que hay sesión (eso ya lo
  // garantiza el middleware) sino para saber SU email y poder restringir
  // la búsqueda a su cartera asignada si tiene una.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const bpsAsignados = user ? await obtenerBpsAsignados(supabase, user.email!) : null;

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

  let consulta = supabase
    .from("clientes")
    .select("ruc_dni, bp, razon_social")
    .or(`razon_social.ilike.${termino}*,razon_social.ilike.* ${termino}*`)
    .order("razon_social", { ascending: true })
    .limit(8);

  if (bpsAsignados) {
    consulta = consulta.in("bp", bpsAsignados);
  }

  const { data, error } = await consulta;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resultados: (data ?? []) as SugerenciaCliente[] });
}
