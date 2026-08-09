import { obtenerUsuarioActual } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import Link from "next/link";
import type { RolUsuario } from "@/lib/types";

interface Panel {
  titulo: string;
  descripcion: string;
  href: string;
  rolesPermitidos: RolUsuario[];
  externo?: boolean;
}

const PANELES: Panel[] = [
  {
    titulo: "Comercial",
    descripcion: "Registrar pedidos, buscar clientes y generar el QR de liberación.",
    href: "/comercial",
    rolesPermitidos: ["comercial", "admin"],
  },
  {
    titulo: "Almacén",
    descripcion: "Contabilizar pedidos y marcarlos como entregados.",
    href: "/almacen",
    rolesPermitidos: ["almacen", "admin"],
  },
  {
    titulo: "Vigilancia",
    descripcion: "Escanear el QR de liberación y registrar el ingreso del cliente.",
    href: "/vigilancia",
    rolesPermitidos: ["vigilancia", "admin"],
  },
  {
    titulo: "Administración",
    descripcion: "Importar el maestro de clientes y la cartera de vendedores.",
    href: "/admin/importar",
    rolesPermitidos: ["admin"],
  },
  {
    titulo: "Pantalla Pública",
    descripcion: "Vista para TV/kiosko con el estado de los pedidos en curso.",
    href: "/pantalla-publica",
    rolesPermitidos: ["comercial", "almacen", "vigilancia", "admin"],
    externo: true,
  },
];

export default async function HubPage() {
  const usuario = await obtenerUsuarioActual();
  const paneles = PANELES.filter((p) => p.rolesPermitidos.includes(usuario.rol));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNav usuario={usuario} titulo="Centro de Control" />
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        <p className="mb-6 text-sm text-slate-500">
          Elige el panel al que quieres entrar.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paneles.map((panel) => (
            <Link
              key={panel.href}
              href={panel.href}
              target={panel.externo ? "_blank" : undefined}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <h2 className="text-base font-semibold text-slate-900">{panel.titulo}</h2>
              <p className="text-sm text-slate-500">{panel.descripcion}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
