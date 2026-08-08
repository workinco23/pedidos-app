"use client";

import { useState } from "react";
import { usePedidosRealtime } from "@/lib/usePedidosRealtime";
import { EstadoBadge } from "@/components/EstadoBadge";
import { GenerarQrButton } from "@/components/GenerarQrButton";
import { EditarPedidoModal } from "@/components/EditarPedidoModal";
import type { Pedido } from "@/lib/types";
import { format } from "date-fns";

export function PedidosComercialTable({ iniciales }: { iniciales: Pedido[] }) {
  const todos = usePedidosRealtime(iniciales);
  const pedidos = todos.filter((p) => p.estado !== "entregado");
  const [editando, setEditando] = useState<Pedido | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);

  async function marcarFacturado(id: string) {
    await fetch(`/api/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "facturado" }),
    });
  }

  async function borrarPedido(id: string) {
    if (!confirm("¿Seguro que quieres borrar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }
    setBorrando(id);
    await fetch(`/api/pedidos/${id}`, { method: "DELETE" });
    setBorrando(null);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Fecha</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">BP</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Razón Social</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Pedido de Venta</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">OB</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Comprobante</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-slate-500">
                {format(new Date(p.fecha_registro), "dd/MM/yyyy HH:mm")}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.bp}</td>
              <td className="px-4 py-3 text-slate-700">{p.razon_social}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.pedido_venta}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.ob}</td>
              <td className="px-4 py-3 capitalize text-slate-500">{p.tipo_comprobante}</td>
              <td className="px-4 py-3">
                <EstadoBadge estado={p.estado} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {p.estado === "contabilizado" && (
                    <button
                      onClick={() => marcarFacturado(p.id)}
                      className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-500"
                    >
                      Marcar Facturado
                    </button>
                  )}
                  <GenerarQrButton pedido={p} />
                  <button
                    onClick={() => setEditando(p)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => borrarPedido(p.id)}
                    disabled={borrando === p.id}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {borrando === p.id ? "..." : "Borrar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {pedidos.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                Aún no hay pedidos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editando && (
        <EditarPedidoModal pedido={editando} onCerrar={() => setEditando(null)} />
      )}
    </div>
  );
}
