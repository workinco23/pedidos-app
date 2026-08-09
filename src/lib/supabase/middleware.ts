import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { RolUsuario } from "@/lib/types";

const RUTA_POR_ROL: Record<RolUsuario, string> = {
  comercial: "/comercial",
  vigilancia: "/vigilancia",
  almacen: "/almacen",
  admin: "/hub",
};

const PREFIJO_POR_ROL: Record<Exclude<RolUsuario, "admin">, string> = {
  comercial: "/comercial",
  vigilancia: "/vigilancia",
  almacen: "/almacen",
};

// Incluye /admin (además de los prefijos de rol) para que los roles no-admin
// sean redirigidos fuera de esa área, aunque no tengan un prefijo propio ahí.
const PREFIJOS_PROTEGIDOS = [...Object.values(PREFIJO_POR_ROL), "/admin"];

const RUTAS_PUBLICAS = [
  "/login",
  "/auth/callback",
  "/pantalla-publica",
  "/api/pantalla-publica",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esRutaPublica = RUTAS_PUBLICAS.some((r) => pathname.startsWith(r));

  if (!user && !esRutaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && !esRutaPublica) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", user.id)
      .single();

    const rol = (perfil?.rol as RolUsuario | undefined) ?? "comercial";

    if (pathname === "/" || pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = RUTA_POR_ROL[rol];
      return NextResponse.redirect(url);
    }

    if (rol !== "admin") {
      const prefijoPermitido = PREFIJO_POR_ROL[rol as Exclude<RolUsuario, "admin">];
      const intentaOtraArea = PREFIJOS_PROTEGIDOS.some(
        (prefijo) => pathname.startsWith(prefijo) && prefijo !== prefijoPermitido
      );
      if (intentaOtraArea) {
        const url = request.nextUrl.clone();
        url.pathname = prefijoPermitido;
        return NextResponse.redirect(url);
      }
    }
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
