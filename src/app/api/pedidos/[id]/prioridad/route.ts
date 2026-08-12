import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RolUsuario } from "@/lib/types";

const ROLES_PERMITIDOS: RolUsuario[] = ["almacen", "sub_admin", "admin"];

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

  if (!rol || !ROLES_PERMITIDOS.includes(rol)) {
    return NextResponse.json(
      { error: `El rol ${rol ?? "desconocido"} no puede cambiar la prioridad` },
      { status: 403 }
    );
  }

  const { prioridad } = (await request.json()) as { prioridad: boolean };

  const { data, error } = await supabase
    .from("pedidos")
    .update({ prioridad })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
