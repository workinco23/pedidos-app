import { consultarDocumento } from "@/lib/sunat";
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

  const { documento } = await request.json();
  if (typeof documento !== "string") {
    return NextResponse.json({ error: "Documento requerido" }, { status: 400 });
  }

  try {
    const resultado = await consultarDocumento(documento);
    return NextResponse.json(resultado);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error consultando documento" },
      { status: 422 }
    );
  }
}
