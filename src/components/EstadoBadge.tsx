import { ESTADO_LABELS, type EstadoPedido } from "@/lib/types";
import { IconoCheck } from "@/components/ComercialIcons";

const ESTILOS: Record<EstadoPedido, { bg: string; texto: string }> = {
  en_extraccion: { bg: "#FEF3C7", texto: "#B45309" },
  contabilizado: { bg: "#E0F2FE", texto: "#0284C7" },
  facturado: { bg: "#E0F2FE", texto: "#0284C7" },
  entregado: { bg: "#DCFCE7", texto: "#16A34A" },
  waiting: { bg: "#F3E8FF", texto: "#7E22CE" },
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const { bg, texto } = ESTILOS[estado];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color: texto }}
    >
      <IconoCheck />
      {ESTADO_LABELS[estado]}
    </span>
  );
}
