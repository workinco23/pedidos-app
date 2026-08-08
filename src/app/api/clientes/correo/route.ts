import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const doc = new URL(request.url).searchParams.get("doc")?.trim();
  if (!doc || !/^[a-zA-Z0-9-]+$/.test(doc)) {
    return NextResponse.json({ error: "Parámetro doc inválido" }, { status: 400 });
  }

  const { data } = await supabase
    .from("clientes")
    .select("correo")
    .eq("ruc_dni", doc)
    .maybeSingle();

  return NextResponse.json({ correo: data?.correo ?? null });
}
