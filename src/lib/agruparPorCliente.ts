import type { Pedido } from "@/lib/types";

export interface GrupoCliente {
  bp: string;
  razonSocial: string;
  pedidos: Pedido[];
  enTienda: boolean;
}

export function agruparPorCliente(pedidos: Pedido[], enTiendaIds: Set<string>): GrupoCliente[] {
  // Se agrupa por BP + fecha_registro exacta: los pedidos de un mismo "Guardar
  // pedido(s)" comparten timestamp (mismo now() de transacción), así que esto
  // junta solo el lote que se liberó junto, no todo el histórico pendiente del cliente.
  const mapa = new Map<string, Pedido[]>();
  for (const p of pedidos) {
    const clave = `${p.bp}__${p.fecha_registro}`;
    const lista = mapa.get(clave) ?? [];
    lista.push(p);
    mapa.set(clave, lista);
  }
  const grupos = Array.from(mapa.values()).map((items) => ({
    bp: items[0].bp,
    razonSocial: items[0].razon_social,
    pedidos: items,
    enTienda: items.some((p) => enTiendaIds.has(p.id)),
  }));
  return grupos.sort((a, b) => {
    if (a.enTienda !== b.enTienda) return a.enTienda ? -1 : 1;
    return b.pedidos[0].fecha_registro.localeCompare(a.pedidos[0].fecha_registro);
  });
}
