import { obtenerUsuarioActual } from "@/lib/auth";
import { HubHeader } from "@/components/HubHeader";
import {
  IconoComercial,
  IconoAlmacen,
  IconoVigilancia,
  IconoAdministracion,
  IconoPantallaPublica,
} from "@/components/HubIcons";
import Link from "next/link";
import type { ComponentType } from "react";
import type { RolUsuario } from "@/lib/types";

interface Panel {
  titulo: string;
  descripcion: string;
  href: string;
  rolesPermitidos: RolUsuario[];
  Icono: ComponentType;
  externo?: boolean;
}

const PANELES: Panel[] = [
  {
    titulo: "Comercial",
    descripcion: "Registrar pedidos, buscar clientes y generar el QR de liberación.",
    href: "/comercial",
    rolesPermitidos: ["comercial", "sub_admin", "admin"],
    Icono: IconoComercial,
  },
  {
    titulo: "Almacén",
    descripcion: "Contabilizar pedidos y marcarlos como entregados.",
    href: "/almacen",
    rolesPermitidos: ["almacen", "sub_admin", "admin"],
    Icono: IconoAlmacen,
  },
  {
    titulo: "Vigilancia",
    descripcion: "Escanear el QR de liberación y registrar el ingreso del cliente.",
    href: "/vigilancia",
    rolesPermitidos: ["vigilancia", "sub_admin", "admin"],
    Icono: IconoVigilancia,
  },
  {
    titulo: "Administración",
    descripcion: "Importar el maestro de clientes y la cartera de vendedores.",
    href: "/admin/importar",
    rolesPermitidos: ["admin"],
    Icono: IconoAdministracion,
  },
  {
    titulo: "Pantalla Pública",
    descripcion: "Vista para TV/kiosko con el estado de los pedidos en curso.",
    href: "/pantalla-publica",
    rolesPermitidos: ["comercial", "almacen", "vigilancia", "sub_admin", "admin"],
    Icono: IconoPantallaPublica,
    externo: true,
  },
];

export default async function HubPage() {
  const usuario = await obtenerUsuarioActual();
  const paneles = PANELES.filter((p) => p.rolesPermitidos.includes(usuario.rol));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <HubHeader usuario={usuario} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <p className="mb-6 text-sm text-slate-500">Elige el panel al que quieres entrar.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paneles.map(({ Icono, ...panel }) => (
            <Link
              key={panel.href}
              href={panel.href}
              target={panel.externo ? "_blank" : undefined}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition active:scale-[0.98] sm:flex-col sm:gap-3 sm:hover:-translate-y-0.5 sm:hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy-50 text-brand-navy">
                <Icono />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-bold text-brand-navy">{panel.titulo}</span>
                <span className="text-sm text-slate-600">{panel.descripcion}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
