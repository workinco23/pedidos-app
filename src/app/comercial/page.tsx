import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { ComercialPanelHeader } from "@/components/ComercialPanelHeader";
import { PedidosComercialTable } from "@/components/PedidosComercialTable";
import type { Pedido } from "@/lib/types";

export default async function ComercialPage() {
  const usuario = await obtenerUsuarioActual();
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .order("fecha_registro", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <ComercialPanelHeader usuarioId={usuario.id} totalPedidos={pedidos?.length ?? 0} />
      <PedidosComercialTable iniciales={(pedidos as Pedido[]) ?? []} />
    </div>
  );
}
