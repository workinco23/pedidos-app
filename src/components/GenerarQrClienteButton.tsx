"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { construirPayloadQrCliente } from "@/lib/qr";
import { IconoQr } from "@/components/ComercialIcons";
import type { Pedido } from "@/lib/types";

function armarAsunto(pedidos: Pedido[]) {
  const { bp, razon_social } = pedidos[0];
  return `Confirmación de pedido(s) ${pedidos.map((p) => p.pedido_venta).join(", ")} - ${bp} - ${razon_social}`;
}

function armarCuerpo(pedidos: Pedido[]) {
  const singular = pedidos.length === 1;
  const lineas = pedidos.map((p) => {
    const obs = [p.ob, ...p.obsAdicionales].join(", ");
    return `- Pedido ${p.pedido_venta} (OB: ${obs})`;
  });
  const frasePedido = singular
    ? `Su pedido ha sido liberado:\n${lineas.join("\n")}`
    : `Sus pedidos han sido liberados:\n${lineas.join("\n")}`;
  return `Estimado cliente ${pedidos[0].razon_social}\n${frasePedido}\nPor favor acercarse a recoger en 1 hora aproximadamente.\n\nSaludos cordiales.`;
}

export function GenerarQrClienteButton({ pedidos }: { pedidos: Pedido[] }) {
  const [abierto, setAbierto] = useState(false);
  const [correo, setCorreo] = useState("");
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [ampliado, setAmpliado] = useState(false);
  const [copiado, setCopiado] = useState<"asunto" | "cuerpo" | "imagen" | null>(null);

  const asunto = armarAsunto(pedidos);
  const cuerpo = armarCuerpo(pedidos);

  useEffect(() => {
    if (!abierto) return;
    let cancelado = false;

    QRCode.toDataURL(JSON.stringify(construirPayloadQrCliente(pedidos)), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
    }).then((url) => {
      if (!cancelado) setQrPreview(url);
    });

    fetch(`/api/clientes/correo?doc=${encodeURIComponent(pedidos[0].documento_identidad)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelado && data?.correo) setCorreo(data.correo);
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  async function copiarTexto(texto: string, cual: "asunto" | "cuerpo") {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(cual);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // clipboard no disponible (contexto no seguro, permisos, etc.)
    }
  }

  async function copiarImagen() {
    if (!qrPreview) return;
    try {
      const blob = await (await fetch(qrPreview)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopiado("imagen");
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // navegador sin soporte para copiar imágenes al portapapeles
    }
  }

  function cerrar() {
    setAbierto(false);
    setQrPreview(null);
    setAmpliado(false);
    setCopiado(null);
    setCorreo("");
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold hover:brightness-95"
        style={{ backgroundColor: "#FFCD00", borderColor: "#B8930A", color: "#1E1E1E" }}
      >
        <IconoQr /> Generar QR / Plantilla
      </button>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-2xl"
        style={{ maxWidth: 640, maxHeight: "90vh" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ backgroundColor: "#2d2e31", flexShrink: 0 }}
        >
          <span className="text-sm font-medium text-slate-100">
            Plantilla para Gmail ({pedidos.length} pedido{pedidos.length > 1 ? "s" : ""})
          </span>
          <button
            onClick={cerrar}
            className="text-sm leading-none text-slate-300 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
          {correo && (
            <p className="text-xs text-slate-400">
              Correo de referencia (para pegar en el &quot;Para&quot; de Gmail):{" "}
              <span className="font-medium text-slate-600">{correo}</span>
            </p>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">Asunto</label>
              <button
                type="button"
                onClick={() => copiarTexto(asunto, "asunto")}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                {copiado === "asunto" ? "Copiado ✓" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              rows={1}
              value={asunto}
              className="resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">Cuerpo del correo</label>
              <button
                type="button"
                onClick={() => copiarTexto(cuerpo, "cuerpo")}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                {copiado === "cuerpo" ? "Copiado ✓" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              rows={pedidos.length + 6}
              value={cuerpo}
              className="resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-col items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-slate-400">
                QR (clic para ampliar y poder copiarlo/guardarlo)
              </span>
              <button
                type="button"
                onClick={copiarImagen}
                disabled={!qrPreview}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {copiado === "imagen" ? "Copiado ✓" : "Copiar imagen"}
              </button>
            </div>
            {qrPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrPreview}
                alt="QR de recojo"
                onClick={() => setAmpliado(true)}
                className="cursor-zoom-in"
                style={{ width: 130, height: 130, display: "block" }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-xs text-slate-400"
                style={{ width: 130, height: 130 }}
              >
                Generando...
              </div>
            )}
          </div>

          <ul className="text-xs text-slate-500">
            {pedidos.map((p) => (
              <li key={p.id}>
                Pedido {p.pedido_venta} — OB: {[p.ob, ...p.obsAdicionales].join(", ")}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex items-center justify-end border-t border-slate-200 px-4 py-3"
          style={{ flexShrink: 0 }}
        >
          <button
            onClick={cerrar}
            className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      {ampliado && qrPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={() => setAmpliado(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrPreview}
            alt="QR de recojo ampliado"
            style={{ width: "min(90vw, 480px)", height: "min(90vw, 480px)" }}
          />
        </div>
      )}
    </div>,
    document.body
  );
}
