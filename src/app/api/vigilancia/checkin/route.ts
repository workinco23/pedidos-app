import { createClient } from "@/lib/supabase/server";
import { consultarDocumento } from "@/lib/sunat";
import { NextResponse } from "next/server";

interface BodyQr {
  modo: "qr";
  pedidoIds: string[];
  dniReceptor?: string;
  nombreReceptor?: string;
}
interface BodyMostrador {
  modo: "mostrador";
  documento: string;
  razonSocialManual?: string;
  dniReceptor?: string;
  nombreReceptor?: string;
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
    if (!Array.isArray(body.pedidoIds) || body.pedidoIds.length === 0) {
      return NextResponse.json({ error: "Código QR inválido" }, { status: 400 });
    }

    const { data: pedidosDb } = await supabase
      .from("pedidos")
      .select("*")
      .in("id", body.pedidoIds);

    if (!pedidosDb || pedidosDb.length === 0) {
      return NextResponse.json({ error: "No se encontraron los pedidos del QR" }, { status: 404 });
    }

    const { data: registro, error } = await supabase
      .from("registros_vigilancia")
      .insert({
        pedido_id: pedidosDb[0].id,
        documento_cliente: pedidosDb[0].documento_identidad,
        razon_social: pedidosDb[0].razon_social,
        tipo_atencion: "recojo_qr",
        usuario_vigilancia_id: user.id,
        dni_receptor: body.dniReceptor?.trim() || null,
        nombre_receptor: body.nombreReceptor?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { error: errorVinculo } = await supabase.from("registro_vigilancia_pedidos").insert(
      pedidosDb.map((p) => ({ registro_vigilancia_id: registro.id, pedido_id: p.id }))
    );
    if (errorVinculo) {
      return NextResponse.json({ error: errorVinculo.message }, { status: 400 });
    }

    return NextResponse.json({ ...registro, pedidos: pedidosDb });
  }

  if (body.modo === "mostrador") {
    let razonSocial: string;
    if (body.razonSocialManual?.trim()) {
      razonSocial = body.razonSocialManual.trim();
    } else {
      try {
        const resultado = await consultarDocumento(body.documento);
        razonSocial = resultado.razonSocial;
      } catch (err) {
        return NextResponse.json(
          {
            error: err instanceof Error ? err.message : "Documento inválido",
            permiteManual: true,
          },
          { status: 422 }
        );
      }
    }

    const { data, error } = await supabase
      .from("registros_vigilancia")
      .insert({
        pedido_id: null,
        documento_cliente: body.documento,
        razon_social: razonSocial,
        tipo_atencion: "atencion_mostrador",
        usuario_vigilancia_id: user.id,
        dni_receptor: body.dniReceptor?.trim() || null,
        nombre_receptor: body.nombreReceptor?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
}
