import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin: origenRequest } = new URL(request.url);
  // En Netlify, el origin derivado de request.url a veces resuelve a la URL
  // interna del deploy en vez del dominio público, así que preferimos la
  // URL fija de producción cuando está configurada.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? origenRequest;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Supabase/Google no devolvieron "code": suele venir un error del proveedor
  // (ej. el trigger handle_new_user rechazó el dominio del correo).
  const errorDescripcion =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (errorDescripcion) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescripcion)}`
    );
  }

  return NextResponse.redirect(`${origin}/login`);
}
