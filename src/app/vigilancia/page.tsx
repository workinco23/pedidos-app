import { createClient } from "@/lib/supabase/server";
import { VigilanciaCheckin } from "@/components/VigilanciaCheckin";
import { VigilanciaActivos } from "@/components/VigilanciaActivos";
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
      <VigilanciaCheckin />
      <VigilanciaActivos iniciales={(registros as RegistroVigilancia[]) ?? []} />
    </div>
  );
}
