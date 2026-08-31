import { exigirRol } from "@/lib/auth";
import { PanelHeader } from "@/components/PanelHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await exigirRol(["admin"]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-navy-deep">
      <PanelHeader usuario={usuario} titulo="Importar Maestros" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
