import { createClient } from "@/lib/supabase/server";
import { consultarDocumento } from "@/lib/sunat";
import { NextResponse } from "next/server";
import type { ResultadoBusquedaCliente } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const doc = new URL(request.url).searchParams.get("doc")?.trim();
  if (!doc || !/^[a-zA-Z0-9-]+$/.test(doc)) {
    return NextResponse.json({ error: "Parámetro doc inválido" }, { status: 400 });
  }

  // El BP se guarda con ceros a la izquierda hasta completar 10 dígitos
  // (p.ej. "0001048316"); si buscan solo "1048316" hay que rellenar para
  // que el eq. contra `bp` haga match igual.
  const bpConCeros =
    /^\d{1,10}$/.test(doc) && doc.length < 10 ? doc.padStart(10, "0") : null;

  const filtroOr = bpConCeros
    ? `ruc_dni.eq.${doc},bp.eq.${doc},bp.eq.${bpConCeros}`
    : `ruc_dni.eq.${doc},bp.eq.${doc}`;

  const { data: cliente } = await supabase
    .from("clientes")
    .select("ruc_dni, bp, razon_social")
    .or(filtroOr)
    .maybeSingle();

  if (cliente) {
    const cartera = cliente.bp
      ? (
          await supabase
            .from("cartera")
            .select("vendedor_nombre")
            .eq("bp", cliente.bp)
            .maybeSingle()
        ).data
      : null;

    const resultado: ResultadoBusquedaCliente = {
      registrado: Boolean(cliente.bp),
      ruc_dni: cliente.ruc_dni,
      bp: cliente.bp,
      razon_social: cliente.razon_social,
      vendedor_nombre: cartera?.vendedor_nombre ?? null,
    };
    return NextResponse.json(resultado);
  }

  try {
    const { razonSocial, documento } = await consultarDocumento(doc);
    const resultado: ResultadoBusquedaCliente = {
      registrado: false,
      ruc_dni: documento,
      bp: null,
      razon_social: razonSocial,
      vendedor_nombre: null,
    };
    return NextResponse.json(resultado);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error consultando documento" },
      { status: 422 }
    );
  }
}
