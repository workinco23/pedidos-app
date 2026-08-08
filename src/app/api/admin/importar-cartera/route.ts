import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsearCartera } from "@/lib/importarMaestros";
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
  const { filas, errores } = parsearCartera(buffer);

  if (filas.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron filas válidas", errores },
      { status: 422 }
    );
  }

  const admin = createAdminClient();

  // La cartera se reemplaza completa en cada import: se borra lo anterior y
  // se insertan las filas del archivo, para no dejar vendedores obsoletos.
  const { error: errorDelete } = await admin
    .from("cartera")
    .delete()
    .not("id", "is", null);
  if (errorDelete) {
    return NextResponse.json({ error: errorDelete.message }, { status: 400 });
  }

  const TAMANO_LOTE = 1000;
  for (let i = 0; i < filas.length; i += TAMANO_LOTE) {
    const lote = filas.slice(i, i + TAMANO_LOTE);
    const { error: errorInsert } = await admin.from("cartera").insert(
      lote.map((fila) => ({
        bp: fila.bp,
        vendedor_nombre: fila.vendedor_nombre,
        datos_adicionales: fila.datos_adicionales,
      }))
    );
    if (errorInsert) {
      return NextResponse.json({ error: errorInsert.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    procesadas: filas.length,
    errores,
  });
}
