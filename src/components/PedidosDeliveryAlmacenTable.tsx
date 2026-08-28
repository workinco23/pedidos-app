"use client";

import { EstadoBadge } from "@/components/EstadoBadge";
import { IconoCheck } from "@/components/ComercialIcons";
import { esDelivery } from "@/lib/pedidosFiltros";
import type { EstadoPedido, Pedido } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  todos: Pedido[];
  enTiendaIds: Set<string>;
}

export function PedidosDeliveryAlmacenTable({ todos, enTiendaIds }: Props) {
  const items = todos
    .filter((p) => p.estado !== "despachado" && esDelivery(p))
    .sort((a, b) => {
      const aEnTienda = enTiendaIds.has(a.id);
      const bEnTienda = enTiendaIds.has(b.id);
      if (aEnTienda !== bEnTienda) return aEnTienda ? -1 : 1;
      return a.fecha_registro.localeCompare(b.fecha_registro);
    });

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    await fetch(`/api/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  return (
    <div
      className="rounded-xl border p-4 shadow-lg"
      style={{
        backgroundColor: "rgba(15,23,42,0.75)",
        borderColor: "rgba(56,189,248,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
          Pedidos Delivery
        </h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((p) => {
          const enTienda = enTiendaIds.has(p.id);
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-[10px] px-4 py-3"
              style={{ backgroundColor: enTienda ? "#FEF2F2" : "#FFFFFF" }}
            >
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  {p.razon_social}{" "}
                  {p.condicion_pago === "credito" && (
                    <span
                      className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: "#FDE68A", color: "#92400E" }}
                    >
                      Crédito
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  Pedido {p.pedido_venta} · OB {[p.ob, ...p.obsAdicionales].join(", ")} ·{" "}
                  {format(new Date(p.fecha_registro), "dd/MM HH:mm")}
                </p>
                <div className="mt-1.5">
                  <EstadoBadge estado={p.estado} />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {p.estado === "pendiente_creditos" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "en_extraccion")}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-white hover:brightness-95"
                    style={{ backgroundColor: "#B45309" }}
                  >
                    <IconoCheck /> Aprobado por Créditos
                  </button>
                )}
                {p.estado === "en_extraccion" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "contabilizado")}
                    className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <IconoCheck /> Contabilizado
                  </button>
                )}
                {p.estado === "contabilizado" && p.condicion_pago === "credito" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "facturado")}
                    className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <IconoCheck /> Marcar Facturado
                  </button>
                )}
                {p.estado === "facturado" && (
                  <button
                    onClick={() => cambiarEstado(p.id, "despachado")}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-white hover:brightness-95"
                    style={{ backgroundColor: "#059669" }}
                  >
                    <IconoCheck /> Despachado
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="rounded-[10px] bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
            Sin pedidos pendientes.
          </p>
        )}
      </div>
    </div>
  );
}
