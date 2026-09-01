import { createClient } from "@/lib/supabase/server";
import { consultarDocumento } from "@/lib/sunat";
import { obtenerBpsAsignados } from "@/lib/carteraAsignada";
import { NextResponse } from "next/server";
import type { ResultadoBusquedaCliente } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();

  // A diferencia de otras rutas de este mismo panel, acá sí hace falta
  // pedir el usuario: no solo para confirmar que hay sesión (eso ya lo
  // garantiza el middleware) sino para saber SU email y poder restringir
  // la búsqueda a su cartera asignada si tiene una.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const bpsAsignados = user ? await obtenerBpsAsignados(supabase, user.email!) : null;

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

  const { data: clienteEncontrado } = await supabase
    .from("clientes")
    .select("ruc_dni, bp, razon_social")
    .or(filtroOr)
    .maybeSingle();

  // Si el usuario tiene cartera asignada y el cliente encontrado pertenece
  // a otro vendedor, se trata como "no encontrado localmente" (no se le
  // entrega el BP/vendedor ajeno) en vez de bloquear la búsqueda: sigue
  // pudiendo consultar el RUC/DNI por la vía externa para un registro sin BP.
  const cliente =
    clienteEncontrado && bpsAsignados && clienteEncontrado.bp
      ? bpsAsignados.includes(clienteEncontrado.bp)
        ? clienteEncontrado
        : null
      : clienteEncontrado;

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
