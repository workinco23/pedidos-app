import { createClient } from "@/lib/supabase/server";
import { consultarNombrePorDni } from "@/lib/reniec";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const dni = new URL(request.url).searchParams.get("dni") ?? "";

  try {
    const resultado = await consultarNombrePorDni(dni);
    return NextResponse.json(resultado);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo consultar el DNI" },
      { status: 404 }
    );
  }
}
