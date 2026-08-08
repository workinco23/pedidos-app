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

  const { registroId, comprobantes } = (await request.json()) as {
    registroId: string;
    comprobantes: string[];
  };

  if (!comprobantes?.length) {
    return NextResponse.json(
      { error: "Debe registrar al menos un comprobante de entrega" },
      { status: 400 }
    );
  }

  const { error: errorComprobantes } = await supabase
    .from("comprobantes_salida")
    .insert(
      comprobantes.map((numero) => ({
        registro_vigilancia_id: registroId,
        numero_comprobante: numero,
      }))
    );

  if (errorComprobantes) {
    return NextResponse.json({ error: errorComprobantes.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("registros_vigilancia")
    .update({ fecha_salida: new Date().toISOString() })
    .eq("id", registroId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
