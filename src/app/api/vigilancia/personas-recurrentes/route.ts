import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export interface PersonaRecurrente {
  dni_receptor: string;
  nombre_receptor: string;
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ resultados: [] as PersonaRecurrente[] });
  }
  const termino = q.replace(/[,()*]/g, "");
  if (!termino) {
    return NextResponse.json({ resultados: [] as PersonaRecurrente[] });
  }

  const { data, error } = await supabase
    .from("registros_vigilancia")
    .select("dni_receptor, nombre_receptor")
    .not("dni_receptor", "is", null)
    .not("nombre_receptor", "is", null)
    .or(
      `dni_receptor.ilike.${termino}*,nombre_receptor.ilike.${termino}*,nombre_receptor.ilike.* ${termino}*`
    )
    .order("fecha_ingreso", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const vistos = new Set<string>();
  const resultados: PersonaRecurrente[] = [];
  for (const fila of data ?? []) {
    const clave = `${fila.dni_receptor}|${fila.nombre_receptor}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    resultados.push(fila as PersonaRecurrente);
    if (resultados.length >= 6) break;
  }

  return NextResponse.json({ resultados });
}
