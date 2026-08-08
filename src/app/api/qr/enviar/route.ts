import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { construirPayloadQr, generarQrDataUrl } from "@/lib/qr";
import { enviarCorreoLiberacion } from "@/lib/mailer";
import { NextResponse } from "next/server";
import type { Pedido } from "@/lib/types";

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
  if (perfil?.rol !== "comercial" && perfil?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { pedidoId, correoDestino, asunto, cuerpo } = (await request.json()) as {
    pedidoId: string;
    correoDestino: string;
    asunto?: string;
    cuerpo?: string;
  };

  const { data: pedido, error: errorPedido } = await supabase
    .from("pedidos")
    .select("*")
    .eq("id", pedidoId)
    .single<Pedido>();

  if (errorPedido || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const payload = construirPayloadQr(pedido);
  const qrDataUrl = await generarQrDataUrl(payload);

  const asuntoFinal =
    asunto?.trim() ||
    `Confirmación de pedido ${pedido.pedido_venta} - ${pedido.bp} - ${pedido.razon_social}`;
  const cuerpoFinal =
    cuerpo?.trim() ||
    `Estimado cliente ${pedido.razon_social}\nLe informamos que se liberó su pedido: ${pedido.pedido_venta}, por favor acercarse a recoger en 1 hora.`;

  await enviarCorreoLiberacion({
    destinatario: correoDestino,
    asunto: asuntoFinal,
    cuerpo: cuerpoFinal,
    qrDataUrl,
  });

  const { error: errorUpdate } = await supabase
    .from("pedidos")
    .update({ qr_codigo_hash: JSON.stringify(payload) })
    .eq("id", pedidoId);

  if (errorUpdate) {
    return NextResponse.json({ error: errorUpdate.message }, { status: 400 });
  }

  // Se recuerda el correo para la próxima vez que se genere un QR de este
  // mismo cliente. Se usa el cliente admin porque la política RLS de
  // `clientes` solo permite actualizar mientras el BP está sin asignar, y
  // aquí no tocamos el BP — solo el correo.
  const admin = createAdminClient();
  await admin.from("clientes").upsert(
    {
      ruc_dni: pedido.documento_identidad,
      razon_social: pedido.razon_social,
      correo: correoDestino,
    },
    { onConflict: "ruc_dni" }
  );

  return NextResponse.json({ ok: true, qrDataUrl });
}
