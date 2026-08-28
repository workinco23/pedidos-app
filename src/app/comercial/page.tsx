import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { ComercialPanelHeader } from "@/components/ComercialPanelHeader";
import { ComercialPaneles } from "@/components/ComercialPaneles";
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

  return (
    <div className="mx-auto max-w-6xl">
      <ComercialPanelHeader usuarioId={usuario.id} totalPedidos={iniciales.length} />
      <ComercialPaneles iniciales={iniciales} />
    </div>
  );
}
