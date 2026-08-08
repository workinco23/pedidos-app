import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Usuario } from "@/lib/types";

export async function obtenerUsuarioActual(): Promise<Usuario> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!perfil) redirect("/login");

  return perfil as Usuario;
}

export async function exigirRol(rolesPermitidos: Usuario["rol"][]) {
  const usuario = await obtenerUsuarioActual();
  if (usuario.rol !== "admin" && !rolesPermitidos.includes(usuario.rol)) {
    redirect("/");
  }
  return usuario;
}
