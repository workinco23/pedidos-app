import { createClient } from "@/lib/supabase/server";
import { HistorialPedidosTable } from "@/components/HistorialPedidosTable";
import Link from "next/link";
import type { Pedido } from "@/lib/types";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .order("fecha_registro", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Historial de pedidos</h1>
        <Link
          href="/comercial"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← Volver
        </Link>
      </div>
      <HistorialPedidosTable pedidos={(pedidos as Pedido[]) ?? []} />
    </div>
  );
}
