import { createClient } from "@/lib/supabase/server";
import { PedidosAlmacenTable } from "@/components/PedidosAlmacenTable";
import type { Pedido } from "@/lib/types";

export default async function AlmacenPage() {
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .order("fecha_registro", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <PedidosAlmacenTable iniciales={(pedidos as Pedido[]) ?? []} />
    </div>
  );
}
