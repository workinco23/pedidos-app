import { exigirRol } from "@/lib/auth";
import { ComercialHeader } from "@/components/ComercialHeader";

export default async function ComercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await exigirRol(["comercial"]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#0B1325" }}>
      <ComercialHeader usuario={usuario} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
