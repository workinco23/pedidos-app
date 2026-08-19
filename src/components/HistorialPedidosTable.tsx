import { EstadoBadge } from "@/components/EstadoBadge";
import type { Pedido } from "@/lib/types";
import { format } from "date-fns";

export function HistorialPedidosTable({ pedidos }: { pedidos: Pedido[] }) {
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
              <td className="px-4 py-3 font-mono text-xs text-slate-700">
                {[p.ob, ...(p.obsAdicionales ?? [])].join(", ")}
              </td>
              <td className="px-4 py-3 capitalize text-slate-500">{p.tipo_comprobante}</td>
              <td className="px-4 py-3">
                <EstadoBadge estado={p.estado} />
              </td>
            </tr>
          ))}
          {pedidos.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                Sin pedidos en el historial.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
