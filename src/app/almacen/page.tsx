import { createClient } from "@/lib/supabase/server";
import { PedidosAlmacenTable } from "@/components/PedidosAlmacenTable";
import { AlmacenPanelHeader } from "@/components/AlmacenPanelHeader";
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

  return (
    <div className="mx-auto max-w-6xl">
      <AlmacenPanelHeader />
      <PedidosAlmacenTable iniciales={iniciales} />
    </div>
  );
}
