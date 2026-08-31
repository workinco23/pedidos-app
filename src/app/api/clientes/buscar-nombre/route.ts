import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SugerenciaCliente } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ resultados: [] as SugerenciaCliente[] });
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("ruc_dni, bp, razon_social")
    .ilike("razon_social", `%${q}%`)
    .order("razon_social", { ascending: true })
    .limit(8);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resultados: (data ?? []) as SugerenciaCliente[] });
}
