import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { ComercialPanelHeader } from "@/components/ComercialPanelHeader";
import { PedidosComercialTable } from "@/components/PedidosComercialTable";
import { HubDeSubPaneles } from "@/components/HubDeSubPaneles";
import { esContado, esCredito, esDelivery } from "@/lib/pedidosFiltros";
import type { Pedido } from "@/lib/types";

export default async function ComercialPage() {
  const usuario = await obtenerUsuarioActual();
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, pedido_obs(ob)")
    .order("fecha_registro", { ascending: false });

  const iniciales = (pedidos ?? []).map((p) => ({
    ...p,
    obsAdicionales: (p.pedido_obs ?? []).map((o: { ob: string }) => o.ob),
  })) as Pedido[];

  const activos = iniciales.filter((p) => p.estado !== "entregado" && p.estado !== "despachado");

  return (
    <div className="mx-auto max-w-6xl">
      <ComercialPanelHeader usuarioId={usuario.id} totalPedidos={iniciales.length} />
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
    </div>
  );
}
