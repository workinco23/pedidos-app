"use client";

import { useState } from "react";

interface ResumenImportacion {
  ok?: boolean;
  procesadas?: number;
  errores?: string[];
  error?: string;
}

function TarjetaImportacion({
  titulo,
  descripcion,
  endpoint,
}: {
  titulo: string;
  descripcion: string;
  endpoint: string;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resumen, setResumen] = useState<ResumenImportacion | null>(null);

  async function importar() {
    if (!archivo) return;
    setSubiendo(true);
    setResumen(null);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = (await res.json()) as ResumenImportacion;
      setResumen(res.ok ? data : { error: data.error ?? "Error al importar" });
    } catch (err) {
      setResumen({ error: err instanceof Error ? err.message : "Error al importar" });
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-5 shadow-lg"
      style={{
        backgroundColor: "rgba(15,23,42,0.75)",
        borderColor: "rgba(56,189,248,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div>
        <h2 className="text-sm font-semibold text-white">{titulo}</h2>
        <p className="text-xs text-slate-400">{descripcion}</p>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        className="text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-slate-100 hover:file:bg-white/15"
      />
      <button
        type="button"
        onClick={importar}
        disabled={!archivo || subiendo}
        className="w-fit rounded-md px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: "#1E3A8A" }}
      >
        {subiendo ? "Importando..." : "Importar"}
      </button>

      {resumen?.error && <p className="text-sm text-red-400">{resumen.error}</p>}
      {resumen?.ok && (
        <div className="text-sm text-slate-300">
          <p>{resumen.procesadas} filas procesadas.</p>
          {resumen.errores && resumen.errores.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-amber-400">
              {resumen.errores.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImportarPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Importar maestros de clientes</h1>
      <TarjetaImportacion
        titulo="Maestro de clientes"
        descripcion="Archivo con RUC/DNI y BP (CustomerDocumentNumberRUC, CustomerDocumentNumberDNI, CustomerS4ID)."
        endpoint="/api/admin/importar-clientes"
      />
      <TarjetaImportacion
        titulo="Cartera de vendedores"
        descripcion="Archivo con BP y vendedor asignado (CustomerS4ID, EmployeeFullName). Reemplaza la cartera actual."
        endpoint="/api/admin/importar-cartera"
      />
    </div>
  );
}
