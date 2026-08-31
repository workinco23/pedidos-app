import { ESTADO_LABELS, type EstadoPedido } from "@/lib/types";
import { IconoCheck } from "@/components/ComercialIcons";

const ESTILOS: Record<EstadoPedido, string> = {
  waiting: "bg-status-danger-bg text-status-danger-text",
  pendiente_creditos: "bg-status-warning-soft-bg text-status-warning-soft-text",
  en_extraccion: "bg-status-warning-bg text-status-warning-text",
  contabilizado: "bg-status-info-bg text-status-info-text",
  facturado: "bg-status-info-bg text-status-info-text",
  entregado: "bg-status-success-bg text-status-success-text",
  despachado: "bg-status-success-bg text-status-success-text",
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILOS[estado]}`}
    >
      <IconoCheck />
      {ESTADO_LABELS[estado]}
    </span>
  );
}
