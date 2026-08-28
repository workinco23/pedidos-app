"use client";

import { HubDeSubPaneles } from "@/components/HubDeSubPaneles";
import { PedidosAlmacenTable } from "@/components/PedidosAlmacenTable";
import { PedidosCreditoAlmacenTable } from "@/components/PedidosCreditoAlmacenTable";
import { PedidosDeliveryAlmacenTable } from "@/components/PedidosDeliveryAlmacenTable";
import { esContado, esCredito, esDelivery } from "@/lib/pedidosFiltros";
import type { Pedido } from "@/lib/types";

export function AlmacenPaneles({ iniciales }: { iniciales: Pedido[] }) {
  const contadoPendientes = iniciales.filter((p) => p.estado !== "entregado" && esContado(p));
  const creditoPendientes = iniciales.filter((p) => p.estado !== "entregado" && esCredito(p));
  const deliveryPendientes = iniciales.filter((p) => p.estado !== "despachado" && esDelivery(p));

  return (
    <HubDeSubPaneles
      paneles={[
        {
          key: "contado",
          titulo: "Pedidos Contado",
          descripcion: "Fuerza de Ventas y Pedidos Waiting.",
          badge: contadoPendientes.length,
          contenido: <PedidosAlmacenTable iniciales={iniciales} />,
        },
        {
          key: "credito",
          titulo: "Pedidos Crédito",
          descripcion: "Pedidos a crédito con recojo en tienda.",
          badge: creditoPendientes.length,
          contenido: <PedidosCreditoAlmacenTable iniciales={iniciales} />,
        },
        {
          key: "delivery",
          titulo: "Pedidos Delivery",
          descripcion: "Pedidos con entrega a domicilio.",
          badge: deliveryPendientes.length,
          contenido: <PedidosDeliveryAlmacenTable iniciales={iniciales} />,
        },
      ]}
    />
  );
}
