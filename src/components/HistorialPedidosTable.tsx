"use client";

import { useMemo, useState } from "react";
import { EstadoBadge } from "@/components/EstadoBadge";
import { FiltroColumnaExcel } from "@/components/FiltroColumnaExcel";
import { ESTADO_LABELS, type Pedido } from "@/lib/types";
import { format } from "date-fns";

type Columna = "fecha" | "bp" | "razonSocial" | "pedidoVenta" | "ob" | "comprobante" | "estado";

const COLUMNAS: { key: Columna; label: string }[] = [
  { key: "fecha", label: "Fecha" },
  { key: "bp", label: "BP" },
  { key: "razonSocial", label: "Razón Social" },
  { key: "pedidoVenta", label: "Pedido de Venta" },
  { key: "ob", label: "OB" },
  { key: "comprobante", label: "Comprobante" },
  { key: "estado", label: "Estado" },
];

function valorColumna(p: Pedido, columna: Columna): string {
  switch (columna) {
    case "fecha":
      return format(new Date(p.fecha_registro), "dd/MM/yyyy");
    case "bp":
      return p.bp;
    case "razonSocial":
      return p.razon_social;
    case "pedidoVenta":
      return p.pedido_venta;
    case "ob":
      return [p.ob, ...(p.obsAdicionales ?? [])].filter(Boolean).join(", ");
    case "comprobante":
      return p.tipo_comprobante;
    case "estado":
      return ESTADO_LABELS[p.estado];
  }
}

export function HistorialPedidosTable({ pedidos }: { pedidos: Pedido[] }) {
  const [filtros, setFiltros] = useState<Partial<Record<Columna, Set<string> | null>>>({});

  const valoresPorColumna = useMemo(() => {
    const mapa = {} as Record<Columna, string[]>;
    for (const { key } of COLUMNAS) {
      mapa[key] = Array.from(new Set(pedidos.map((p) => valorColumna(p, key)))).sort();
    }
    return mapa;
  }, [pedidos]);

  const filas = pedidos.filter((p) =>
    COLUMNAS.every(({ key }) => {
      const filtro = filtros[key];
      if (!filtro) return true;
      return filtro.has(valorColumna(p, key));
    })
  );

  const hayFiltrosActivos = Object.values(filtros).some((f) => f != null);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      {hayFiltrosActivos && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
          <span>
            {filas.length} de {pedidos.length} pedido(s)
          </span>
          <button
            onClick={() => setFiltros({})}
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Limpiar filtros
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {COLUMNAS.map(({ key, label }) => (
              <th key={key} className="px-4 py-3 text-left font-medium text-slate-500">
                {label}
                <FiltroColumnaExcel
                  valores={valoresPorColumna[key]}
                  seleccionados={filtros[key] ?? null}
                  onCambiar={(s) => setFiltros((f) => ({ ...f, [key]: s }))}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-slate-500">
                {format(new Date(p.fecha_registro), "dd/MM/yyyy HH:mm")}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.bp}</td>
              <td className="px-4 py-3 text-slate-700">{p.razon_social}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.pedido_venta}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">
                {[p.ob, ...(p.obsAdicionales ?? [])].join(", ")}
              </td>
              <td className="px-4 py-3 capitalize text-slate-500">{p.tipo_comprobante}</td>
              <td className="px-4 py-3">
                <EstadoBadge estado={p.estado} />
              </td>
            </tr>
          ))}
          {filas.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                {pedidos.length === 0 ? "Sin pedidos en el historial." : "Sin resultados con estos filtros."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
