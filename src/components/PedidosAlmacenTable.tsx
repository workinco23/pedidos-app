"use client";

import { usePedidosRealtime } from "@/lib/usePedidosRealtime";
import { EstadoBadge } from "@/components/EstadoBadge";
import { IconoCheck, IconoEstrella } from "@/components/ComercialIcons";
import type { EstadoPedido, Pedido } from "@/lib/types";
import { format } from "date-fns";

const ORIGEN_LABELS: Record<Pedido["origen"], string> = {
  fuerza_ventas: "Fuerza de Ventas",
  mostrador: "Mostrador",
};

export function PedidosAlmacenTable({ iniciales }: { iniciales: Pedido[] }) {
  const todos = usePedidosRealtime(iniciales);
  const enEspera = todos
    .filter((p) => p.estado === "waiting")
    .sort((a, b) => {
      if (a.prioridad !== b.prioridad) return a.prioridad ? -1 : 1;
      return a.fecha_registro.localeCompare(b.fecha_registro);
    });
  const pendientes = todos.filter((p) => p.estado !== "entregado" && p.estado !== "waiting");

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    await fetch(`/api/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  }

  async function cambiarPrioridad(id: string, prioridad: boolean) {
    await fetch(`/api/pedidos/${id}/prioridad`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prioridad }),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {enEspera.length > 0 && (
        <div
          className="rounded-xl border p-4 shadow-lg"
          style={{
            backgroundColor: "rgba(88,28,135,0.2)",
            borderColor: "rgba(216,180,254,0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
              Pedidos en Waiting
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              {enEspera.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {enEspera.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => cambiarPrioridad(p.id, !p.prioridad)}
                    title={p.prioridad ? "Quitar prioridad" : "Marcar prioridad"}
                    className="shrink-0"
                    style={{ color: p.prioridad ? "#CA8A04" : "#CBD5E1" }}
                  >
                    <IconoEstrella relleno={p.prioridad} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{p.razon_social}</p>
                    <p className="text-xs text-slate-400">
                      OB {p.ob} · {ORIGEN_LABELS[p.origen]} ·{" "}
                      {format(new Date(p.fecha_registro), "dd/MM HH:mm")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => cambiarEstado(p.id, "en_extraccion")}
                  className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-white shadow transition hover:brightness-110"
                  style={{ backgroundColor: "#1E3A8A" }}
                >
                  Reanudar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {(["fuerza_ventas", "mostrador"] as const).map((origen) => {
        const items = pendientes.filter((p) => p.origen === origen);
        return (
          <div
            key={origen}
            className="rounded-xl border p-4 shadow-lg"
            style={{
              backgroundColor: "rgba(15,23,42,0.75)",
              borderColor: "rgba(56,189,248,0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                {ORIGEN_LABELS[origen]}
              </h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                {items.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{p.razon_social}</p>
                    <p className="text-xs text-slate-400">
                      OB {p.ob} · {format(new Date(p.fecha_registro), "dd/MM HH:mm")}
                    </p>
                    <div className="mt-1.5">
                      <EstadoBadge estado={p.estado} />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {p.estado === "en_extraccion" && (
                      <button
                        onClick={() => cambiarEstado(p.id, "contabilizado")}
                        className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <IconoCheck /> Contabilizado
                      </button>
                    )}
                    {p.estado === "facturado" && (
                      <button
                        onClick={() => cambiarEstado(p.id, "entregado")}
                        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold text-white hover:brightness-95"
                        style={{ backgroundColor: "#059669" }}
                      >
                        <IconoCheck /> Entregado
                      </button>
                    )}
                    <button
                      onClick={() => cambiarEstado(p.id, "waiting")}
                      className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:brightness-95"
                      style={{ borderColor: "#D8B4FE", color: "#7E22CE" }}
                    >
                      Marcar en espera
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="rounded-[10px] bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                  Sin pedidos pendientes.
                </p>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
