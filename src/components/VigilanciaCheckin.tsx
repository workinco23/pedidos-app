"use client";

import { useState } from "react";
import { QrScanner } from "@/components/QrScanner";

export function VigilanciaCheckin() {
  const [modo, setModo] = useState<"qr" | "mostrador">("qr");
  const [documento, setDocumento] = useState("");
  const [razonSocialManual, setRazonSocialManual] = useState("");
  const [permiteManual, setPermiteManual] = useState(false);
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
        body: JSON.stringify({
          modo: "mostrador",
          documento,
          razonSocialManual: razonSocialManual.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.permiteManual) setPermiteManual(true);
        throw new Error(data.error);
      }
      setMensaje({
        tipo: "ok",
        texto: `Atención en mostrador registrada: ${data.razon_social}. Se notificó a Comercial.`,
      });
      setDocumento("");
      setRazonSocialManual("");
      setPermiteManual(false);
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
    <div
      className="rounded-xl border p-5 shadow-lg"
      style={{
        backgroundColor: "rgba(15,23,42,0.75)",
        borderColor: "rgba(56,189,248,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setModo("qr")}
          className="rounded-md px-3 py-1.5 text-sm font-medium transition"
          style={
            modo === "qr"
              ? { backgroundColor: "#1E3A8A", color: "#fff" }
              : { backgroundColor: "rgba(255,255,255,0.08)", color: "#CBD5E1" }
          }
        >
          Escanear QR
        </button>
        <button
          onClick={() => setModo("mostrador")}
          className="rounded-md px-3 py-1.5 text-sm font-medium transition"
          style={
            modo === "mostrador"
              ? { backgroundColor: "#1E3A8A", color: "#fff" }
              : { backgroundColor: "rgba(255,255,255,0.08)", color: "#CBD5E1" }
          }
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
              className="rounded-md px-4 py-2 text-sm font-semibold hover:brightness-95"
              style={{ backgroundColor: "#FFCD00", color: "#1E1E1E" }}
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
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
          {permiteManual && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-amber-300">
                No se encontró automáticamente. Escribe la razón social a mano:
              </label>
              <input
                placeholder="Razón social"
                value={razonSocialManual}
                onChange={(e) => setRazonSocialManual(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
          )}
          <button
            onClick={registrarMostrador}
            disabled={procesando || !documento}
            className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
            style={{ backgroundColor: "#1E3A8A" }}
          >
            {procesando ? "Registrando..." : "Registrar y notificar a Comercial"}
          </button>
        </div>
      )}

      {mensaje && (
        <p
          className="mt-4 text-sm font-medium"
          style={{ color: mensaje.tipo === "ok" ? "#4ade80" : "#f87171" }}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
