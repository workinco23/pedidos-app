"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IconoLogout } from "@/components/ComercialIcons";
import type { Usuario } from "@/lib/types";

export function PanelHeader({ usuario, titulo }: { usuario: Usuario; titulo: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="relative flex items-center justify-between overflow-hidden px-6 py-4"
      style={{ backgroundColor: "#0F172A" }}
    >
      <h1 className="relative z-10 text-lg font-semibold text-white">{titulo}</h1>

      {/* Placa trapezoidal con el logo */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center sm:flex">
        <div
          className="flex h-full items-center px-12"
          style={{
            backgroundColor: "#ffffff",
            transform: "skewX(-18deg)",
            WebkitMaskImage: "linear-gradient(100deg, black 55%, transparent 95%)",
            maskImage: "linear-gradient(100deg, black 55%, transparent 95%)",
          }}
        >
          <div style={{ transform: "skewX(18deg)" }}>
            <Image
              src="/logo-ferreyros.webp"
              alt="Ferreyros CAT"
              width={150}
              height={60}
              className="h-9 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        {(usuario.rol === "admin" || usuario.rol === "sub_admin") && (
          <Link
            href="/hub"
            className="rounded-full border px-3.5 py-1.5 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            ← Hub
          </Link>
        )}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-white">{usuario.nombre}</p>
          <p className="text-xs text-slate-400">{usuario.email}</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "#1e293b" }}
        >
          Cerrar sesión
          <IconoLogout />
        </button>
      </div>
    </header>
  );
}
