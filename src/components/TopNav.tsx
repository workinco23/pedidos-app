"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/lib/types";

const TITULOS: Record<Usuario["rol"], string> = {
  comercial: "Panel Comercial",
  vigilancia: "Panel de Vigilancia",
  almacen: "Panel de Almacén",
  admin: "Panel Comercial",
};

export function TopNav({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-slate-900">
        {TITULOS[usuario.rol]}
      </h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{usuario.nombre}</p>
          <p className="text-xs text-slate-400">{usuario.email}</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
