import { createClient } from "@/lib/supabase/server";
import { consultarDocumento } from "@/lib/sunat";
import { parsearPayloadQr } from "@/lib/qr";
import { NextResponse } from "next/server";

interface BodyQr {
  modo: "qr";
  textoQr: string;
}
interface BodyMostrador {
  modo: "mostrador";
  documento: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as BodyQr | BodyMostrador;

  if (body.modo === "qr") {
    const payload = parsearPayloadQr(body.textoQr);
    if (!payload) {
      return NextResponse.json({ error: "Código QR inválido" }, { status: 400 });
    }

    const { data: pedido } = await supabase
      .from("pedidos")
      .select("*")
      .eq("ob", payload.ob)
      .single();

    if (!pedido) {
      return NextResponse.json(
        { error: `No se encontró el pedido ${payload.ob}` },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("registros_vigilancia")
      .insert({
        pedido_id: pedido.id,
        documento_cliente: pedido.documento_identidad,
        razon_social: pedido.razon_social,
        tipo_atencion: "recojo_qr",
        usuario_vigilancia_id: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (body.modo === "mostrador") {
    let razonSocial: string;
    try {
      const resultado = await consultarDocumento(body.documento);
      razonSocial = resultado.razonSocial;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Documento inválido" },
        { status: 422 }
      );
    }

    const { data, error } = await supabase
      .from("registros_vigilancia")
      .insert({
        pedido_id: null,
        documento_cliente: body.documento,
        razon_social: razonSocial,
        tipo_atencion: "atencion_mostrador",
        usuario_vigilancia_id: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
}
