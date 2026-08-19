import { createClient } from "@/lib/supabase/server";
import { HistorialPedidosTable } from "@/components/HistorialPedidosTable";
import Link from "next/link";
import type { Pedido } from "@/lib/types";

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, pedido_obs(ob)")
    .order("fecha_registro", { ascending: false });

  const filas = (pedidos ?? []).map((p) => ({
    ...p,
    obsAdicionales: (p.pedido_obs ?? []).map((o: { ob: string }) => o.ob),
  })) as Pedido[];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Historial de pedidos</h1>
        <Link
          href="/comercial"
          className="rounded-md border px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "#1e293b" }}
        >
          ← Volver
        </Link>
      </div>
      <HistorialPedidosTable pedidos={filas} />
    </div>
  );
}
