import { ESTADO_LABELS, type EstadoPedido } from "@/lib/types";

const ESTILOS: Record<EstadoPedido, string> = {
  en_extraccion: "bg-amber-100 text-amber-800",
  contabilizado: "bg-blue-100 text-blue-800",
  facturado: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTILOS[estado]}`}
    >
      {ESTADO_LABELS[estado]}
    </span>
  );
}
