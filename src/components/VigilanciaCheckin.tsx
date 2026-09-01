"use client";

import { useState } from "react";
import { QrScanner } from "@/components/QrScanner";
import { EstadoBadge } from "@/components/EstadoBadge";
import { PersonaReceptorFields } from "@/components/PersonaReceptorFields";
import { parsearPayloadQr } from "@/lib/qr";
import type { Pedido } from "@/lib/types";

type PedidoConVendedor = Pedido & { vendedor_nombre: string | null };

export function VigilanciaCheckin() {
  const [modo, setModo] = useState<"qr" | "mostrador">("qr");
  const [documento, setDocumento] = useState("");
  const [razonSocialManual, setRazonSocialManual] = useState("");
  const [permiteManual, setPermiteManual] = useState(false);
  const [dniReceptor, setDniReceptor] = useState("");
  const [nombreReceptor, setNombreReceptor] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );

  // Pedidos decodificados del QR, pendientes de confirmar el ingreso
  const [pedidosQr, setPedidosQr] = useState<PedidoConVendedor[] | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  // null = todavía no se preguntó (o no hace falta); true = confirmó que tiene
  // sello; false = indicó que NO tiene sello, se bloquea el ingreso
  const [selloConfirmado, setSelloConfirmado] = useState<boolean | null>(null);

  async function onQrDetectado(textoQr: string) {
    const payload = parsearPayloadQr(textoQr);
    if (!payload) {
      setMensaje({ tipo: "error", texto: "Código QR inválido o de un formato antiguo" });
      return;
    }
    setCargandoDetalle(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/vigilancia/qr/consultar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoIds: payload.pedidos.map((p) => p.pedidoId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPedidosQr(data.pedidos as PedidoConVendedor[]);
      setSelloConfirmado(null);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo consultar el QR",
      });
    } finally {
      setCargandoDetalle(false);
    }
  }

  const tieneCredito = (pedidosQr ?? []).some((p) => p.condicion_pago === "credito");

  async function confirmarIngresoQr() {
    if (!pedidosQr) return;
    if (tieneCredito && selloConfirmado !== true) return;
    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/vigilancia/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "qr",
          pedidoIds: pedidosQr.map((p) => p.id),
          dniReceptor,
          nombreReceptor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje({ tipo: "ok", texto: `Ingreso registrado: ${data.razon_social}` });
      setPedidosQr(null);
      setDniReceptor("");
      setNombreReceptor("");
      setSelloConfirmado(null);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error al registrar",
      });
    } finally {
      setProcesando(false);
    }
  }

  function cancelarQr() {
    setPedidosQr(null);
    setMensaje(null);
    setDniReceptor("");
    setNombreReceptor("");
    setSelloConfirmado(null);
    setScannerKey((k) => k + 1);
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
          dniReceptor,
          nombreReceptor,
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
      setDniReceptor("");
      setNombreReceptor("");
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
              ? { backgroundColor: "var(--color-brand-yellow)", color: "var(--color-brand-navy)" }
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
              ? { backgroundColor: "var(--color-brand-yellow)", color: "var(--color-brand-navy)" }
              : { backgroundColor: "rgba(255,255,255,0.08)", color: "#CBD5E1" }
          }
        >
          Atención en Mostrador
        </button>
      </div>

      {modo === "qr" ? (
        pedidosQr ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-md bg-white p-4">
              <p className="text-sm font-semibold text-brand-navy">
                {pedidosQr[0].razon_social}
              </p>
              <p className="mb-3 text-xs text-slate-400">RUC/DNI {pedidosQr[0].documento_identidad}</p>
              <div className="flex flex-col gap-2">
                {pedidosQr.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span>
                      Pedido {p.pedido_venta} · OB {[p.ob, ...p.obsAdicionales].join(", ")}
                    </span>
                    <EstadoBadge estado={p.estado} />
                  </div>
                ))}
              </div>
            </div>

            {tieneCredito && selloConfirmado === null ? (
              <div className="rounded-md border border-amber-400 bg-amber-50 p-4">
                <p className="mb-3 text-sm font-semibold text-amber-800">
                  Este QR incluye pedido(s) a crédito. ¿Cuenta con sello?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelloConfirmado(true)}
                    className="rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-yellow-dark"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setSelloConfirmado(false)}
                    className="rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : tieneCredito && selloConfirmado === false ? (
              <div className="rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700">
                No se puede continuar sin sello. Debe contactar con su vendedor
                {pedidosQr.find((p) => p.condicion_pago === "credito")?.vendedor_nombre
                  ? ` (${pedidosQr.find((p) => p.condicion_pago === "credito")?.vendedor_nombre})`
                  : ""}{" "}
                para indicar que el cliente no cuenta con sello.
              </div>
            ) : (
              <PersonaReceptorFields
                dni={dniReceptor}
                nombre={nombreReceptor}
                onChangeDni={setDniReceptor}
                onChangeNombre={setNombreReceptor}
              />
            )}

            <div className="flex gap-2">
              {(!tieneCredito || selloConfirmado === true) && (
                <button
                  onClick={confirmarIngresoQr}
                  disabled={procesando}
                  className="rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-yellow-dark disabled:opacity-60"
                >
                  {procesando ? "Registrando..." : "Confirmar ingreso"}
                </button>
              )}
              <button
                onClick={cancelarQr}
                className="rounded-md border border-slate-500 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <QrScanner key={scannerKey} onResultado={onQrDetectado} activo={modo === "qr"} />
            {cargandoDetalle && (
              <p className="text-sm text-slate-300">Consultando pedido(s)...</p>
            )}
            {mensaje && !cargandoDetalle && (
              <button
                onClick={escanearSiguiente}
                className="rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-yellow-dark"
              >
                Escanear siguiente
              </button>
            )}
          </div>
        )
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
          <PersonaReceptorFields
            dni={dniReceptor}
            nombre={nombreReceptor}
            onChangeDni={setDniReceptor}
            onChangeNombre={setNombreReceptor}
            placeholderDni="DNI o CE de quien recoge (opcional)"
            placeholderNombre="Nombre de quien recoge (opcional)"
          />
          <button
            onClick={registrarMostrador}
            disabled={procesando || !documento}
            className="rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy shadow-lg transition hover:bg-brand-yellow-dark disabled:opacity-60"
          >
            {procesando ? "Registrando..." : "Registrar y notificar a Comercial"}
          </button>
        </div>
      )}

      {mensaje && (
        <p
          className={`mt-4 text-sm font-medium ${mensaje.tipo === "ok" ? "text-green-400" : "text-red-400"}`}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
