import { createClient } from "@/lib/supabase/server";
import { AlmacenPanelHeader } from "@/components/AlmacenPanelHeader";
import { AlmacenPaneles } from "@/components/AlmacenPaneles";
import type { Pedido } from "@/lib/types";

export default async function AlmacenPage() {
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, pedido_obs(ob)")
    .not("estado", "in", "(entregado,despachado)")
    .order("fecha_registro", { ascending: false });

  const iniciales = (pedidos ?? []).map((p) => ({
    ...p,
    obsAdicionales: (p.pedido_obs ?? []).map((o: { ob: string }) => o.ob),
  })) as Pedido[];

  return (
    <div className="mx-auto max-w-6xl">
      <AlmacenPanelHeader />
      <AlmacenPaneles iniciales={iniciales} />
    </div>
  );
}
