"use client";

import { useState } from "react";
import { QrScanner } from "@/components/QrScanner";

export function VigilanciaCheckin() {
  const [modo, setModo] = useState<"qr" | "mostrador">("qr");
  const [documento, setDocumento] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  async function registrarQr(textoQr: string) {
    if (procesando) return;
    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/vigilancia/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "qr", textoQr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje({ tipo: "ok", texto: `Ingreso registrado: ${data.razon_social}` });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error al registrar",
      });
    } finally {
      setProcesando(false);
    }
  }

  function escanearSiguiente() {
    setMensaje(null);
    setScannerKey((k) => k + 1);
  }

  async function registrarMostrador() {
    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/vigilancia/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "mostrador", documento }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje({
        tipo: "ok",
        texto: `Atención en mostrador registrada: ${data.razon_social}. Se notificó a Comercial.`,
      });
      setDocumento("");
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error al registrar",
      });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setModo("qr")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            modo === "qr" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Escanear QR
        </button>
        <button
          onClick={() => setModo("mostrador")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            modo === "mostrador"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          Atención en Mostrador
        </button>
      </div>

      {modo === "qr" ? (
        <div className="flex flex-col items-center gap-3">
          <QrScanner key={scannerKey} onResultado={registrarQr} activo={modo === "qr"} />
          {mensaje && (
            <button
              onClick={escanearSiguiente}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Escanear siguiente
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            placeholder="DNI o RUC del cliente"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={registrarMostrador}
            disabled={procesando || !documento}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {procesando ? "Registrando..." : "Registrar y notificar a Comercial"}
          </button>
        </div>
      )}

      {mensaje && (
        <p
          className={`mt-4 text-sm ${
            mensaje.tipo === "ok" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
