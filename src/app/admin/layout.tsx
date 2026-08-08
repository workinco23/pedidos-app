import { exigirRol } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await exigirRol(["admin"]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNav usuario={usuario} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
