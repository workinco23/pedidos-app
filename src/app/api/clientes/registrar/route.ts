import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (perfil?.rol !== "comercial" && perfil?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { ruc_dni, bp, razon_social } = (await request.json()) as {
    ruc_dni?: string;
    bp?: string;
    razon_social?: string;
  };

  if (!ruc_dni || !bp || !razon_social) {
    return NextResponse.json(
      { error: "ruc_dni, bp y razon_social son requeridos" },
      { status: 400 }
    );
  }

  // Mismo formato que el BP importado del maestro (10 dígitos con ceros a
  // la izquierda), para que las búsquedas futuras encuentren este registro
  // sin importar si se escribió con o sin los ceros.
  const bpNormalizado = /^\d{1,10}$/.test(bp) ? bp.padStart(10, "0") : bp;

  const { error } = await supabase.from("clientes").upsert(
    {
      ruc_dni,
      bp: bpNormalizado,
      razon_social,
      fuente: "manual",
      registrado_por: user.id,
    },
    { onConflict: "ruc_dni" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
