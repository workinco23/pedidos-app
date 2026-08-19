"use client";

import { useState } from "react";
import { usePedidosRealtime } from "@/lib/usePedidosRealtime";
import { useClientesEnTienda } from "@/lib/useClientesEnTienda";
import { EstadoBadge } from "@/components/EstadoBadge";
import { GenerarQrClienteButton } from "@/components/GenerarQrClienteButton";
import { EditarPedidoModal } from "@/components/EditarPedidoModal";
import { IconoCheck, IconoLapiz, IconoX } from "@/components/ComercialIcons";
import type { Pedido } from "@/lib/types";
import { format } from "date-fns";

interface GrupoCliente {
  bp: string;
  razonSocial: string;
  pedidos: Pedido[];
  enTienda: boolean;
}

function agruparPorCliente(pedidos: Pedido[], enTiendaIds: Set<string>): GrupoCliente[] {
  const mapa = new Map<string, Pedido[]>();
  for (const p of pedidos) {
    const lista = mapa.get(p.bp) ?? [];
    lista.push(p);
    mapa.set(p.bp, lista);
  }
  const grupos = Array.from(mapa.entries()).map(([bp, items]) => ({
    bp,
    razonSocial: items[0].razon_social,
    pedidos: items,
    enTienda: items.some((p) => enTiendaIds.has(p.id)),
  }));
  return grupos.sort((a, b) => {
    if (a.enTienda !== b.enTienda) return a.enTienda ? -1 : 1;
    return b.pedidos[0].fecha_registro.localeCompare(a.pedidos[0].fecha_registro);
  });
}

export function PedidosComercialTable({ iniciales }: { iniciales: Pedido[] }) {
  const todos = usePedidosRealtime(iniciales);
  const enTiendaIds = useClientesEnTienda();
  const pedidos = todos.filter((p) => p.estado !== "entregado");
  const grupos = agruparPorCliente(pedidos, enTiendaIds);
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
    <div className="flex flex-col gap-3">
      {grupos.map((grupo) => (
        <div
          key={grupo.bp}
          className="overflow-x-auto rounded-xl border p-3"
          style={{
            backgroundColor: "rgba(30,41,59,0.7)",
            borderColor: grupo.enTienda ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-semibold text-white">
                {grupo.razonSocial}{" "}
                {grupo.enTienda && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                  >
                    En tienda
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                BP {grupo.bp} · {grupo.pedidos.length} pedido(s)
              </p>
            </div>
            <GenerarQrClienteButton pedidos={grupo.pedidos} />
          </div>

          <div className="min-w-[860px]">
            <div
              className="grid gap-2 px-3 pb-2 text-xs font-semibold uppercase tracking-wide"
              style={{
                color: "#F8FAFC",
                gridTemplateColumns: "1fr 1fr 1.6fr 0.8fr 1fr 1.6fr",
              }}
            >
              <span>Fecha</span>
              <span>Pedido de Venta</span>
              <span>OB</span>
              <span>Comprobante</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            <div className="flex flex-col gap-2">
              {grupo.pedidos.map((p) => {
                const enTienda = enTiendaIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="grid items-center gap-2 rounded-[10px] px-3 py-3 text-sm"
                    style={{
                      color: "#0F172A",
                      backgroundColor: enTienda ? "#FEF2F2" : "#FFFFFF",
                      gridTemplateColumns: "1fr 1fr 1.6fr 0.8fr 1fr 1.6fr",
                    }}
                  >
                    <span className="text-slate-500">
                      {format(new Date(p.fecha_registro), "dd/MM/yyyy HH:mm")}
                    </span>
                    <span className="font-mono text-xs">{p.pedido_venta}</span>
                    <span className="truncate font-mono text-xs">
                      {[p.ob, ...p.obsAdicionales].join(", ")}
                    </span>
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
                );
              })}
            </div>
          </div>
        </div>
      ))}
      {grupos.length === 0 && (
        <div
          className="rounded-xl border p-8 text-center text-sm text-slate-300"
          style={{ backgroundColor: "rgba(30,41,59,0.7)", borderColor: "rgba(255,255,255,0.15)" }}
        >
          Aún no hay pedidos registrados.
        </div>
      )}

      {editando && (
        <EditarPedidoModal pedido={editando} onCerrar={() => setEditando(null)} />
      )}
    </div>
  );
}
