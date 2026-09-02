import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  VigilanciaHistorialTable,
  type FilaHistorialVigilancia,
} from "@/components/VigilanciaHistorialTable";

interface PedidoLigado {
  bp: string;
  pedido_venta: string;
  ob: string | null;
  pedido_obs: { ob: string }[];
}

interface FilaCruda {
  id: string;
  documento_cliente: string;
  razon_social: string;
  tipo_atencion: "recojo_qr" | "atencion_mostrador";
  fecha_ingreso: string;
  fecha_salida: string | null;
  dni_receptor: string | null;
  nombre_receptor: string | null;
  registro_vigilancia_pedidos: { pedidos: PedidoLigado | null }[];
  comprobantes_salida: { numero_comprobante: string }[];
}

export default async function VigilanciaHistorialPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registros_vigilancia")
    .select(
      `id, documento_cliente, razon_social, tipo_atencion, fecha_ingreso, fecha_salida,
       dni_receptor, nombre_receptor,
       registro_vigilancia_pedidos ( pedidos ( bp, pedido_venta, ob, pedido_obs ( ob ) ) ),
       comprobantes_salida ( numero_comprobante )`
    )
    .order("fecha_ingreso", { ascending: false });

  const crudas = (data ?? []) as unknown as FilaCruda[];

  const filas: FilaHistorialVigilancia[] = crudas.map((r) => {
    const pedidosLigados = (r.registro_vigilancia_pedidos ?? [])
      .map((v) => v.pedidos)
      .filter((p): p is PedidoLigado => p !== null);

    const bps = Array.from(new Set(pedidosLigados.map((p) => p.bp)));
    const obs = pedidosLigados.flatMap((p) =>
      [p.ob, ...p.pedido_obs.map((o) => o.ob)].filter((ob): ob is string => Boolean(ob))
    );
    const receptor = [r.nombre_receptor, r.dni_receptor ? `(${r.dni_receptor})` : null]
      .filter(Boolean)
      .join(" ");

    return {
      id: r.id,
      fechaIngreso: r.fecha_ingreso,
      fechaSalida: r.fecha_salida,
      bp: bps.join(", "),
      razonSocial: r.razon_social,
      documento: r.documento_cliente,
      pedidos: pedidosLigados.map((p) => p.pedido_venta).join(", "),
      obs: obs.join(", "),
      comprobantes: (r.comprobantes_salida ?? []).map((c) => c.numero_comprobante).join(", "),
      tipoAtencion: r.tipo_atencion === "recojo_qr" ? "Recojo con QR" : "Atención en Mostrador",
      receptor,
    };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Historial de vigilancia</h1>
        <Link
          href="/vigilancia"
          className="rounded-md border bg-brand-navy-soft px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          ← Volver
        </Link>
      </div>
      <VigilanciaHistorialTable filas={filas} />
    </div>
  );
}
