import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { NuevoPedidoForm } from "@/components/NuevoPedidoForm";
import { PedidosComercialTable } from "@/components/PedidosComercialTable";
import { AlertaMostrador } from "@/components/AlertaMostrador";
import Link from "next/link";
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
      <AlertaMostrador />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {pedidos?.length ?? 0} pedido(s) registrados
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/comercial/historial"
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Ver historial
          </Link>
          <NuevoPedidoForm usuarioId={usuario.id} />
        </div>
      </div>
      <PedidosComercialTable iniciales={(pedidos as Pedido[]) ?? []} />
    </div>
  );
}
