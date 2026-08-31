"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { RolUsuario, Usuario } from "@/lib/types";

const ROL_LABEL: Record<RolUsuario, string> = {
  comercial: "Comercial",
  almacen: "Almacén",
  vigilancia: "Vigilancia",
  sub_admin: "Sub Administrador",
  admin: "Super Administrador",
};

const ROL_COLOR: Record<RolUsuario, string> = {
  comercial: "bg-brand-navy-50 text-brand-navy",
  almacen: "bg-brand-navy-50 text-brand-navy",
  vigilancia: "bg-brand-navy-50 text-brand-navy",
  sub_admin: "bg-status-warning-bg text-status-warning-text",
  admin: "bg-status-success-bg text-status-success-text",
};

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
        <h1 className="text-base font-bold text-brand-navy sm:text-lg">Centro de Control</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-brand-navy">{usuario.nombre}</p>
          <p className="text-xs text-slate-500">{usuario.email}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ROL_COLOR[usuario.rol]}`}>
          {ROL_LABEL[usuario.rol]}
        </span>
        <button
          onClick={cerrarSesion}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-brand-navy hover:bg-slate-50"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
