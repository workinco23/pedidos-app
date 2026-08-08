import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
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
