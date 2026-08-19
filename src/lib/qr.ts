import QRCode from "qrcode";
import type { Pedido, QrPayload } from "@/lib/types";

/** Arma un único QR que agrupa todos los pedidos pendientes de un mismo cliente. */
export function construirPayloadQrCliente(pedidos: Pedido[]): QrPayload {
  const [primero] = pedidos;
  return {
    bp: primero.bp,
    ruc: primero.documento_identidad,
    razonSocial: primero.razon_social,
    pedidos: pedidos.map((p) => ({
      pedidoId: p.id,
      pedidoVenta: p.pedido_venta,
      obs: [p.ob, ...p.obsAdicionales],
    })),
  };
}

export async function generarQrDataUrl(payload: QrPayload): Promise<string> {
  return QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}

export function parsearPayloadQr(texto: string): QrPayload | null {
  try {
    const data = JSON.parse(texto);
    if (
      typeof data.bp === "string" &&
      typeof data.ruc === "string" &&
      Array.isArray(data.pedidos) &&
      data.pedidos.length > 0 &&
      data.pedidos.every(
        (p: unknown) =>
          typeof p === "object" &&
          p !== null &&
          typeof (p as { pedidoId?: unknown }).pedidoId === "string"
      )
    ) {
      return data as QrPayload;
    }
    return null;
  } catch {
    return null;
  }
}
