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
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
        <p className="text-xs text-slate-500">{descripcion}</p>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <button
        type="button"
        onClick={importar}
        disabled={!archivo || subiendo}
        className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {subiendo ? "Importando..." : "Importar"}
      </button>

      {resumen?.error && <p className="text-sm text-red-600">{resumen.error}</p>}
      {resumen?.ok && (
        <div className="text-sm text-slate-600">
          <p>{resumen.procesadas} filas procesadas.</p>
          {resumen.errores && resumen.errores.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-amber-600">
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
      <h1 className="text-xl font-semibold text-slate-900">
        Importar maestros de clientes
      </h1>
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
