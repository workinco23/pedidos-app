"use client";

import { HubDeSubPaneles } from "@/components/HubDeSubPaneles";
import { PedidosAlmacenTable } from "@/components/PedidosAlmacenTable";
import { PedidosCreditoAlmacenTable } from "@/components/PedidosCreditoAlmacenTable";
import { PedidosDeliveryAlmacenTable } from "@/components/PedidosDeliveryAlmacenTable";
import { usePedidosRealtime } from "@/lib/usePedidosRealtime";
import { useClientesEnTienda } from "@/lib/useClientesEnTienda";
import { esContado, esCredito, esDelivery } from "@/lib/pedidosFiltros";
import type { Pedido } from "@/lib/types";

export function AlmacenPaneles({ iniciales }: { iniciales: Pedido[] }) {
  const todos = usePedidosRealtime(iniciales);
  const enTiendaIds = useClientesEnTienda();
  const contadoPendientes = todos.filter((p) => p.estado !== "entregado" && esContado(p));
  const creditoPendientes = todos.filter((p) => p.estado !== "entregado" && esCredito(p));
  const deliveryPendientes = todos.filter((p) => p.estado !== "despachado" && esDelivery(p));

  return (
    <HubDeSubPaneles
      paneles={[
        {
          key: "contado",
          titulo: "Pedidos Contado",
          descripcion: "Fuerza de Ventas y Pedidos Waiting.",
          badge: contadoPendientes.length,
          contenido: <PedidosAlmacenTable todos={todos} enTiendaIds={enTiendaIds} />,
        },
        {
          key: "credito",
          titulo: "Pedidos Crédito",
          descripcion: "Pedidos a crédito con recojo en tienda.",
          badge: creditoPendientes.length,
          contenido: <PedidosCreditoAlmacenTable todos={todos} enTiendaIds={enTiendaIds} />,
        },
        {
          key: "delivery",
          titulo: "Pedidos Delivery",
          descripcion: "Pedidos con entrega a domicilio.",
          badge: deliveryPendientes.length,
          contenido: <PedidosDeliveryAlmacenTable todos={todos} enTiendaIds={enTiendaIds} />,
        },
      ]}
    />
  );
}
