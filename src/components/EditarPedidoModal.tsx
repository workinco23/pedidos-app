"use client";

import { useState } from "react";
import type { Pedido, TipoComprobante } from "@/lib/types";

export function EditarPedidoModal({
  pedido,
  onCerrar,
}: {
  pedido: Pedido;
  onCerrar: () => void;
}) {
  const [bp, setBp] = useState(pedido.bp);
  const [documento, setDocumento] = useState(pedido.documento_identidad);
  const [razonSocial, setRazonSocial] = useState(pedido.razon_social);
  const [pedidoVenta, setPedidoVenta] = useState(pedido.pedido_venta);
  const [ob, setOb] = useState(pedido.ob);
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>(
    pedido.tipo_comprobante
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bp,
          documento_identidad: documento,
          razon_social: razonSocial,
          pedido_venta: pedidoVenta,
          ob,
          tipo_comprobante: tipoComprobante,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Editar pedido</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">BP</label>
            <input
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">RUC / DNI</label>
            <input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500">Razón Social</label>
            <input
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Pedido de Venta</label>
            <input
              value={pedidoVenta}
              onChange={(e) => setPedidoVenta(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">OB</label>
            <input
              value={ob}
              onChange={(e) => setOb(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Tipo de Comprobante</label>
            <select
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value as TipoComprobante)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="factura">Factura</option>
              <option value="boleta">Boleta</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={onCerrar}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
