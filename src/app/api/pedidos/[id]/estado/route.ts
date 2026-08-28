import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EstadoPedido, RolUsuario } from "@/lib/types";

const ESTADOS_PERMITIDOS_POR_ROL: Record<RolUsuario, EstadoPedido[]> = {
  comercial: ["en_extraccion", "facturado"],
  almacen: ["en_extraccion", "contabilizado", "entregado", "despachado"],
  vigilancia: [],
  sub_admin: [
    "en_extraccion",
    "contabilizado",
    "facturado",
    "entregado",
    "pendiente_creditos",
    "despachado",
  ],
  admin: [
    "en_extraccion",
    "contabilizado",
    "facturado",
    "entregado",
    "pendiente_creditos",
    "despachado",
  ],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { estado } = (await request.json()) as { estado: EstadoPedido };

  if (!rol || !ESTADOS_PERMITIDOS_POR_ROL[rol]?.includes(estado)) {
    return NextResponse.json(
      { error: `El rol ${rol ?? "desconocido"} no puede asignar el estado "${estado}"` },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
