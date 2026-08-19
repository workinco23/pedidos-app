import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RolUsuario } from "@/lib/types";

const ROLES_PERMITIDOS: RolUsuario[] = ["vigilancia", "sub_admin", "admin"];

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
  if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { pedidoIds } = (await request.json()) as { pedidoIds: string[] };
  if (!Array.isArray(pedidoIds) || pedidoIds.length === 0) {
    return NextResponse.json({ error: "Sin pedidos para consultar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_obs(ob)")
    .in("id", pedidoIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No se encontraron los pedidos del QR" }, { status: 404 });
  }

  const pedidos = data.map((p) => ({
    ...p,
    obsAdicionales: (p.pedido_obs ?? []).map((o: { ob: string }) => o.ob),
  }));

  return NextResponse.json({ pedidos });
}
