"use client";

import { useState } from "react";
import { usePedidosRealtime } from "@/lib/usePedidosRealtime";
import { EstadoBadge } from "@/components/EstadoBadge";
import { GenerarQrButton } from "@/components/GenerarQrButton";
import { EditarPedidoModal } from "@/components/EditarPedidoModal";
import { IconoCheck, IconoLapiz, IconoX } from "@/components/ComercialIcons";
import type { Pedido } from "@/lib/types";
import { format } from "date-fns";

const COLUMNAS = [
  "Fecha",
  "BP",
  "Razón Social",
  "Pedido de Venta",
  "OB",
  "Comprobante",
  "Estado",
  "Acciones",
];

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
    <div
      className="overflow-x-auto rounded-xl border p-3"
      style={{
        backgroundColor: "rgba(30,41,59,0.7)",
        borderColor: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="min-w-[980px]">
        <div
          className="grid gap-2 px-4 pb-2 text-xs font-semibold uppercase tracking-wide"
          style={{
            color: "#F8FAFC",
            gridTemplateColumns: "1fr 1fr 1.6fr 1fr 1fr 0.8fr 1fr 2fr",
          }}
        >
          {COLUMNAS.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {pedidos.map((p) => (
            <div
              key={p.id}
              className="grid items-center gap-2 rounded-[10px] bg-white px-4 py-3 text-sm"
              style={{
                color: "#0F172A",
                gridTemplateColumns: "1fr 1fr 1.6fr 1fr 1fr 0.8fr 1fr 2fr",
              }}
            >
              <span className="text-slate-500">
                {format(new Date(p.fecha_registro), "dd/MM/yyyy HH:mm")}
              </span>
              <span className="font-mono text-xs">{p.bp}</span>
              <span className="truncate">{p.razon_social}</span>
              <span className="font-mono text-xs">{p.pedido_venta}</span>
              <span className="font-mono text-xs">{p.ob}</span>
              <span className="capitalize text-slate-500">{p.tipo_comprobante}</span>
              <span>
                <EstadoBadge estado={p.estado} />
              </span>
              <div className="flex flex-wrap gap-1.5">
                {p.estado === "contabilizado" && (
                  <button
                    onClick={() => marcarFacturado(p.id)}
                    className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <IconoCheck /> Marcar Facturado
                  </button>
                )}
                <GenerarQrButton pedido={p} />
                <button
                  onClick={() => setEditando(p)}
                  className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <IconoLapiz /> Editar
                </button>
                <button
                  onClick={() => borrarPedido(p.id)}
                  disabled={borrando === p.id}
                  className="flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <IconoX /> {borrando === p.id ? "..." : "Borrar"}
                </button>
              </div>
            </div>
          ))}
          {pedidos.length === 0 && (
            <div className="rounded-[10px] bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
              Aún no hay pedidos registrados.
            </div>
          )}
        </div>
      </div>

      {editando && (
        <EditarPedidoModal pedido={editando} onCerrar={() => setEditando(null)} />
      )}
    </div>
  );
}
