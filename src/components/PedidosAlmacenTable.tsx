"use client";

import { usePedidosRealtime } from "@/lib/usePedidosRealtime";
import { EstadoBadge } from "@/components/EstadoBadge";
import type { Pedido } from "@/lib/types";
import { format } from "date-fns";

const ORIGEN_LABELS: Record<Pedido["origen"], string> = {
  fuerza_ventas: "Fuerza de Ventas",
  mostrador: "Mostrador",
};

export function PedidosAlmacenTable({ iniciales }: { iniciales: Pedido[] }) {
  const todos = usePedidosRealtime(iniciales);
  const pendientes = todos.filter((p) => p.estado !== "entregado");

  async function cambiarEstado(id: string, estado: "contabilizado" | "entregado") {
    await fetch(`/api/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {(["fuerza_ventas", "mostrador"] as const).map((origen) => (
        <div key={origen} className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {ORIGEN_LABELS[origen]}
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {pendientes
              .filter((p) => p.origen === origen)
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {p.razon_social}
                    </p>
                    <p className="text-xs text-slate-400">
                      OB {p.ob} · {format(new Date(p.fecha_registro), "dd/MM HH:mm")}
                    </p>
                    <div className="mt-1">
                      <EstadoBadge estado={p.estado} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {p.estado === "en_extraccion" && (
                      <button
                        onClick={() => cambiarEstado(p.id, "contabilizado")}
                        className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                      >
                        Contabilizado
                      </button>
                    )}
                    {p.estado === "facturado" && (
                      <button
                        onClick={() => cambiarEstado(p.id, "entregado")}
                        className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500"
                      >
                        Entregado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {pendientes.filter((p) => p.origen === origen).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Sin pedidos pendientes.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
