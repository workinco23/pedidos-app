import { createAdminClient } from "@/lib/supabase/admin";
import { enmascararCodigo } from "@/lib/mask";
import { NextResponse } from "next/server";
import type { Pedido } from "@/lib/types";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, razon_social, ob, estado, fecha_registro")
    .in("estado", ["en_extraccion", "contabilizado", "facturado"])
    .order("fecha_registro", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pedidos = (data as Pick<Pedido, "id" | "razon_social" | "ob" | "estado" | "fecha_registro">[]).map(
    (p) => ({
      id: p.id,
      razonSocial: p.razon_social,
      obEnmascarado: enmascararCodigo(p.ob),
      estado: p.estado,
    })
  );

  const boxA = pedidos.filter(
    (p) => p.estado === "en_extraccion" || p.estado === "contabilizado"
  );
  const boxB = pedidos.filter((p) => p.estado === "facturado");

  return NextResponse.json({ boxA, boxB });
}
