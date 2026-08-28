"use client";

import { HubDeSubPaneles } from "@/components/HubDeSubPaneles";
import { PedidosComercialTable } from "@/components/PedidosComercialTable";
import { esContado, esCredito, esDelivery } from "@/lib/pedidosFiltros";
import type { Pedido } from "@/lib/types";

export function ComercialPaneles({ iniciales }: { iniciales: Pedido[] }) {
  const activos = iniciales.filter((p) => p.estado !== "entregado" && p.estado !== "despachado");

  return (
    <HubDeSubPaneles
      paneles={[
        {
          key: "contado",
          titulo: "Pedidos Contado",
          descripcion: "Pedidos al contado con recojo en tienda.",
          badge: activos.filter(esContado).length,
          contenido: <PedidosComercialTable iniciales={iniciales} filtro={esContado} />,
        },
        {
          key: "credito",
          titulo: "Pedidos Crédito",
          descripcion: "Pedidos a crédito con recojo en tienda.",
          badge: activos.filter(esCredito).length,
          contenido: <PedidosComercialTable iniciales={iniciales} filtro={esCredito} />,
        },
        {
          key: "delivery",
          titulo: "Pedidos Delivery",
          descripcion: "Pedidos con entrega a domicilio.",
          badge: activos.filter(esDelivery).length,
          contenido: (
            <PedidosComercialTable iniciales={iniciales} filtro={esDelivery} mostrarQr={false} />
          ),
        },
      ]}
    />
  );
}
