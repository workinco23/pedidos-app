import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsearMaestroClientes } from "@/lib/importarMaestros";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (perfil?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  const buffer = await archivo.arrayBuffer();
  const { filas, errores } = parsearMaestroClientes(buffer);

  if (filas.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron filas válidas", errores },
      { status: 422 }
    );
  }

  const admin = createAdminClient();

  // El maestro puede traer el mismo ruc_dni más de una vez (p.ej. distintas
  // sucursales/direcciones); nos quedamos con la última fila de cada uno,
  // porque un upsert con duplicados en el mismo lote falla en Postgres
  // ("ON CONFLICT DO UPDATE command cannot affect row a second time").
  const porRucDni = new Map<string, (typeof filas)[number]>();
  for (const fila of filas) porRucDni.set(fila.ruc_dni, fila);
  const filasUnicas = [...porRucDni.values()];

  // Se separan en dos lotes: las filas sin BP no deben incluir esa columna en
  // el payload, para que el upsert no pise un BP ya registrado manualmente
  // con null (PostgREST solo actualiza las columnas presentes en el body).
  const conBp = filasUnicas.filter((fila) => fila.bp !== null);
  const sinBp = filasUnicas.filter((fila) => fila.bp === null);

  const TAMANO_LOTE = 1000;

  for (let i = 0; i < conBp.length; i += TAMANO_LOTE) {
    const lote = conBp.slice(i, i + TAMANO_LOTE);
    const { error } = await admin.from("clientes").upsert(
      lote.map((fila) => ({
        ruc_dni: fila.ruc_dni,
        bp: fila.bp,
        razon_social: fila.razon_social,
        fuente: "importado",
        datos_adicionales: fila.datos_adicionales,
      })),
      { onConflict: "ruc_dni" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (let i = 0; i < sinBp.length; i += TAMANO_LOTE) {
    const lote = sinBp.slice(i, i + TAMANO_LOTE);
    const { error } = await admin.from("clientes").upsert(
      lote.map((fila) => ({
        ruc_dni: fila.ruc_dni,
        razon_social: fila.razon_social,
        fuente: "importado",
        datos_adicionales: fila.datos_adicionales,
      })),
      { onConflict: "ruc_dni" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    procesadas: filasUnicas.length,
    errores,
  });
}
