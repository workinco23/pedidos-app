import type { Pedido } from "@/lib/types";

// Waiting/Mostrador siempre es Contado + Pickup (regla de negocio confirmada),
// así que ya vienen marcados así desde NuevoPedidoForm — estos helpers solo
// leen los campos, no necesitan tratar `origen` como caso especial.

export function esContado(p: Pedido) {
  return p.condicion_pago === "contado" && p.metodo_entrega === "pickup";
}

export function esCredito(p: Pedido) {
  return p.condicion_pago === "credito" && p.metodo_entrega === "pickup";
}

export function esDelivery(p: Pedido) {
  return p.metodo_entrega === "delivery";
}
