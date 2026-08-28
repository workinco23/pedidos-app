import { createClient } from "@/lib/supabase/server";
import { PedidosAlmacenTable } from "@/components/PedidosAlmacenTable";
import { PedidosCreditoAlmacenTable } from "@/components/PedidosCreditoAlmacenTable";
import { PedidosDeliveryAlmacenTable } from "@/components/PedidosDeliveryAlmacenTable";
import { AlmacenPanelHeader } from "@/components/AlmacenPanelHeader";
import { HubDeSubPaneles } from "@/components/HubDeSubPaneles";
import { esContado, esCredito, esDelivery } from "@/lib/pedidosFiltros";
import type { Pedido } from "@/lib/types";

export default async function AlmacenPage() {
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, pedido_obs(ob)")
    .order("fecha_registro", { ascending: false });

  const iniciales = (pedidos ?? []).map((p) => ({
    ...p,
    obsAdicionales: (p.pedido_obs ?? []).map((o: { ob: string }) => o.ob),
  })) as Pedido[];

  const contadoPendientes = iniciales.filter((p) => p.estado !== "entregado" && esContado(p));
  const creditoPendientes = iniciales.filter((p) => p.estado !== "entregado" && esCredito(p));
  const deliveryPendientes = iniciales.filter((p) => p.estado !== "despachado" && esDelivery(p));

  return (
    <div className="mx-auto max-w-6xl">
      <AlmacenPanelHeader />
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
    </div>
  );
}
