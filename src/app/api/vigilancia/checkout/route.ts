import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { RolUsuario } from "@/lib/types";

const ESTADOS_TERMINALES = ["entregado", "despachado"];

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
  const rol = perfil?.rol as RolUsuario | undefined;
  if (rol !== "vigilancia" && rol !== "sub_admin" && rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
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

  // Al registrar la salida con sus comprobantes de entrega, los pedidos
  // ligados a este ingreso (recojo por QR) pasan directo a "Entregado":
  // Almacén ya no necesita marcarlos manualmente. Vigilancia no tiene
  // permiso de escritura sobre `pedidos` vía RLS, así que esto usa el
  // cliente admin (el rol ya se validó arriba).
  const { data: vinculos } = await supabase
    .from("registro_vigilancia_pedidos")
    .select("pedido_id")
    .eq("registro_vigilancia_id", registroId);

  const pedidoIds = (vinculos ?? []).map((v) => v.pedido_id);
  if (pedidoIds.length > 0) {
    const admin = createAdminClient();
    await admin
      .from("pedidos")
      .update({ estado: "entregado" })
      .in("id", pedidoIds)
      .not("estado", "in", `(${ESTADOS_TERMINALES.join(",")})`);
  }

  return NextResponse.json(data);
}
