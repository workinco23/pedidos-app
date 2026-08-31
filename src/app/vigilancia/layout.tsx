import { exigirRol } from "@/lib/auth";
import { PanelHeader } from "@/components/PanelHeader";

export default async function VigilanciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await exigirRol(["vigilancia", "sub_admin"]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-navy-deep">
      <PanelHeader usuario={usuario} titulo="Panel de Vigilancia" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
