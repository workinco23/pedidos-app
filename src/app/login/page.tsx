"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
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
        redirectTo: `${window.location.origin}/auth/callback`,
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
    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">
        Gestión Operativa de Pedidos
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Inicia sesión con tu cuenta corporativa de Google.
      </p>
      <button
        onClick={iniciarSesionConGoogle}
        disabled={cargando}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
      >
        {cargando ? "Redirigiendo..." : "Continuar con Google"}
      </button>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
