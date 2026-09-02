import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VigilanciaCheckin } from "@/components/VigilanciaCheckin";
import { VigilanciaActivos } from "@/components/VigilanciaActivos";
import { IconoHistorial } from "@/components/ComercialIcons";
import type { RegistroVigilancia } from "@/lib/types";

export default async function VigilanciaPage() {
  const supabase = await createClient();
  const { data: registros } = await supabase
    .from("registros_vigilancia")
    .select("*")
    .is("fecha_salida", null)
    .order("fecha_ingreso", { ascending: false });

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6">
      <div className="flex justify-end">
        <Link
          href="/vigilancia/historial"
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <IconoHistorial /> Ver historial
        </Link>
      </div>
      <VigilanciaCheckin />
      <VigilanciaActivos iniciales={(registros as RegistroVigilancia[]) ?? []} />
    </div>
  );
}
