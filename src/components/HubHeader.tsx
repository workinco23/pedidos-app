"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Usuario } from "@/lib/types";

export function HubHeader({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <Image
          src="/logo-ferreyros.webp"
          alt="Ferreyros CAT"
          width={140}
          height={56}
          className="h-7 w-auto object-contain sm:h-8"
        />
        <span className="hidden h-6 w-px bg-slate-200 sm:block" />
        <h1 className="text-base font-bold text-[#1E293B] sm:text-lg">Centro de Control</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-[#1E293B]">{usuario.nombre}</p>
          <p className="text-xs text-[#64748B]">{usuario.email}</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-[#1E293B] hover:bg-slate-50"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
