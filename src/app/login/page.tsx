"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error")
  );

  async function iniciarSesionConGoogle() {
    setCargando(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
        queryParams: {
          hd: process.env.NEXT_PUBLIC_DOMINIO_CORPORATIVO ?? "",
          prompt: "select_account",
        },
      },
    });
    if (error) {
      setError(error.message);
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-12">
      {/* Panel izquierdo: foto del centro de distribución */}
      <div className="relative hidden bg-slate-900 lg:col-span-7 lg:block">
        <Image
          src="/almacen-ferreyros.jpg"
          alt="Centro de Distribución Ferreyros CAT"
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute bottom-8 left-8 z-10 text-white">
          <span className="rounded bg-brand-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-navy">
            Centro de Distribución
          </span>
          <p className="mt-2 text-sm font-medium text-slate-200">
            Gestión y control logístico de piezas y maquinaria.
          </p>
        </div>
      </div>

      {/* Panel derecho: tarjeta de login */}
      <div className="flex min-h-screen flex-col justify-between bg-slate-50 p-8 lg:col-span-5 lg:p-16">
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Sistema Operativo v2.0
          </span>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl lg:p-10">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo-ferreyros.webp"
              alt="Logo Ferreyros CAT"
              width={220}
              height={90}
              className="h-14 w-auto object-contain"
            />
          </div>

          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Gestión Operativa de Pedidos
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            Inicia sesión con tu cuenta corporativa de Google para acceder a la plataforma.
          </p>

          <button
            onClick={iniciarSesionConGoogle}
            disabled={cargando}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-sm font-medium text-slate-800">
              {cargando ? "Redirigiendo..." : "Continuar con Google"}
            </span>
          </button>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-6 text-xs text-slate-400">
            <svg
              className="h-4 w-4 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Acceso protegido vía OAuth 2.0</span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          © Ferreyros. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
