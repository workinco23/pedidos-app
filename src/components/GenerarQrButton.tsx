"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { construirPayloadQr } from "@/lib/qr";
import type { Pedido } from "@/lib/types";

function asuntoPorDefecto(pedido: Pedido) {
  return `Confirmación de pedido ${pedido.pedido_venta} - ${pedido.bp} - ${pedido.razon_social}`;
}

function cuerpoPorDefecto(pedido: Pedido) {
  return `Estimado cliente ${pedido.razon_social}\nLe informamos que se liberó su pedido: ${pedido.pedido_venta}, por favor acercarse a recoger en 1 hora.`;
}

export function GenerarQrButton({ pedido }: { pedido: Pedido }) {
  const [abierto, setAbierto] = useState(false);
  const [para, setPara] = useState("");
  const [asunto, setAsunto] = useState(() => asuntoPorDefecto(pedido));
  const [cuerpo, setCuerpo] = useState(() => cuerpoPorDefecto(pedido));
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    let cancelado = false;

    QRCode.toDataURL(JSON.stringify(construirPayloadQr(pedido)), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 160,
    }).then((url) => {
      if (!cancelado) setQrPreview(url);
    });

    fetch(`/api/clientes/correo?doc=${encodeURIComponent(pedido.documento_identidad)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelado && data?.correo) setPara((actual) => actual || data.correo);
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [abierto, pedido]);

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/qr/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedido.id, correoDestino: para, asunto, cuerpo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar el correo");
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setEnviando(false);
    }
  }

  function cerrarYResetear() {
    setAbierto(false);
    setPara("");
    setAsunto(asuntoPorDefecto(pedido));
    setCuerpo(cuerpoPorDefecto(pedido));
    setQrPreview(null);
    setEnviado(false);
    setError(null);
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
      >
        Generar QR / Gmail
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-2xl"
        style={{ maxWidth: 520, maxHeight: "85vh" }}
      >
        {/* Barra superior estilo Gmail */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ backgroundColor: "#2d2e31", flexShrink: 0 }}
        >
          <span className="text-sm font-medium text-slate-100">Nuevo mensaje</span>
          <button
            onClick={cerrarYResetear}
            className="text-sm leading-none text-slate-300 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {!enviado ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col divide-y divide-slate-100 border-b border-slate-200">
              <input
                type="email"
                required
                placeholder="Para"
                value={para}
                onChange={(e) => setPara(e.target.value)}
                className="px-4 py-2 text-sm outline-none"
              />
              <input
                type="text"
                required
                placeholder="Asunto"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="px-4 py-2 text-sm font-medium outline-none"
              />
            </div>

            <div className="px-4 py-3">
              <textarea
                rows={4}
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                className="w-full resize-none text-sm outline-none"
              />

              <div className="mt-3 flex flex-col items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs text-slate-400">Se adjuntará este QR:</span>
                {qrPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrPreview}
                    alt="Vista previa del QR"
                    style={{ width: 110, height: 110, display: "block" }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center text-xs text-slate-400"
                    style={{ width: 110, height: 110 }}
                  >
                    Generando...
                  </div>
                )}
              </div>

              <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
                <div
                  className="flex items-center gap-3 p-3"
                  style={{ backgroundColor: "#f5a742" }}
                >
                  <div
                    className="rounded px-3 py-2"
                    style={{ backgroundColor: "#14141a", flexShrink: 0 }}
                  >
                    <span className="text-sm font-bold" style={{ color: "#ffffff" }}>
                      ferrey
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#f5a742" }}>
                      net
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#7a1f1f" }}>
                      Descubre Ferreynet
                    </p>
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{ color: "#3a2a10" }}
                    >
                      Descarga comprobantes electrónicos (facturas, notas de crédito y más)
                      <br />
                      Estado de cuenta.
                      <br />
                      Seguimiento de pedidos.
                    </p>
                  </div>
                </div>
                <p className="bg-white px-3 py-1 text-xs text-slate-400">
                  El banner enlaza a ferreynet.com.pe/#/public
                </p>
              </div>
            </div>

            {error && <p className="px-4 pb-1 text-xs text-red-600">{error}</p>}

            <div
              className="flex items-center justify-between border-t border-slate-200 px-4 py-3"
              style={{ flexShrink: 0 }}
            >
              <button
                onClick={enviar}
                disabled={enviando || !para || !asunto || !cuerpo}
                className="rounded-md px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: "#1a73e8" }}
              >
                {enviando ? "Enviando..." : "Enviar"}
              </button>
              <button
                onClick={cerrarYResetear}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Descartar"
              >
                🗑
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-8">
            <p className="text-sm font-medium text-slate-800">Correo enviado a {para}</p>
            {qrPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrPreview}
                alt="QR enviado"
                style={{ width: 140, height: 140, display: "block" }}
              />
            )}
            <button
              onClick={cerrarYResetear}
              className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-600"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
