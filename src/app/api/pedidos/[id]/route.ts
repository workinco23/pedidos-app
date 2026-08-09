import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RolUsuario, TipoComprobante } from "@/lib/types";

async function obtenerRol(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<RolUsuario | undefined> {
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", userId)
    .single();
  return perfil?.rol as RolUsuario | undefined;
}

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

  const rol = await obtenerRol(supabase, user.id);
  if (rol !== "comercial" && rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as {
    bp?: string;
    documento_identidad?: string;
    razon_social?: string;
    pedido_venta?: string;
    ob?: string;
    tipo_comprobante?: TipoComprobante;
  };

  const campos: Record<string, string> = {};
  for (const clave of [
    "bp",
    "documento_identidad",
    "razon_social",
    "pedido_venta",
    "ob",
    "tipo_comprobante",
  ] as const) {
    const valor = body[clave];
    if (typeof valor === "string" && valor.trim() !== "") campos[clave] = valor;
  }

  if (Object.keys(campos).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pedidos")
    .update(campos)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
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

  const rol = await obtenerRol(supabase, user.id);
  if (rol !== "comercial" && rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await supabase.from("pedidos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
