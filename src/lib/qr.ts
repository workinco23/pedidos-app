import QRCode from "qrcode";
import type { Pedido, QrPayload } from "@/lib/types";

export function construirPayloadQr(pedido: Pedido): QrPayload {
  return {
    ob: pedido.ob,
    pedido: pedido.pedido_venta,
    bp: pedido.bp,
    ruc: pedido.documento_identidad,
    razonSocial: pedido.razon_social,
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
    if (typeof data.ob === "string" && typeof data.bp === "string") {
      return data as QrPayload;
    }
    return null;
  } catch {
    return null;
  }
}
