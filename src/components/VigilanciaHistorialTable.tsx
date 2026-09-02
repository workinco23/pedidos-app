"use client";

import { useMemo, useState } from "react";
import { FiltroColumnaExcel } from "@/components/FiltroColumnaExcel";
import { format } from "date-fns";

export interface FilaHistorialVigilancia {
  id: string;
  fechaIngreso: string;
  fechaSalida: string | null;
  bp: string;
  razonSocial: string;
  documento: string;
  pedidos: string;
  obs: string;
  comprobantes: string;
  tipoAtencion: "Recojo con QR" | "Atención en Mostrador";
  receptor: string;
}

type Columna =
  | "entrada"
  | "salida"
  | "bp"
  | "razonSocial"
  | "documento"
  | "pedidos"
  | "obs"
  | "comprobantes"
  | "tipoAtencion"
  | "receptor";

const COLUMNAS: { key: Columna; label: string }[] = [
  { key: "entrada", label: "Hora de entrada" },
  { key: "salida", label: "Hora de salida" },
  { key: "bp", label: "BP" },
  { key: "razonSocial", label: "Razón Social" },
  { key: "documento", label: "RUC/DNI" },
  { key: "pedidos", label: "Pedidos" },
  { key: "obs", label: "OBs" },
  { key: "comprobantes", label: "Comprobantes de Entrega" },
  { key: "tipoAtencion", label: "Tipo de atención" },
  { key: "receptor", label: "Recibe" },
];

function valorColumna(f: FilaHistorialVigilancia, columna: Columna): string {
  switch (columna) {
    case "entrada":
      return format(new Date(f.fechaIngreso), "dd/MM/yyyy HH:mm");
    case "salida":
      return f.fechaSalida ? format(new Date(f.fechaSalida), "dd/MM/yyyy HH:mm") : "En instalaciones";
    case "bp":
      return f.bp;
    case "razonSocial":
      return f.razonSocial;
    case "documento":
      return f.documento;
    case "pedidos":
      return f.pedidos;
    case "obs":
      return f.obs;
    case "comprobantes":
      return f.comprobantes;
    case "tipoAtencion":
      return f.tipoAtencion;
    case "receptor":
      return f.receptor;
  }
}

export function VigilanciaHistorialTable({ filas }: { filas: FilaHistorialVigilancia[] }) {
  const [filtros, setFiltros] = useState<Partial<Record<Columna, Set<string> | null>>>({});

  const valoresPorColumna = useMemo(() => {
    const mapa = {} as Record<Columna, string[]>;
    for (const { key } of COLUMNAS) {
      mapa[key] = Array.from(new Set(filas.map((f) => valorColumna(f, key)))).sort();
    }
    return mapa;
  }, [filas]);

  const visibles = filas.filter((f) =>
    COLUMNAS.every(({ key }) => {
      const filtro = filtros[key];
      if (!filtro) return true;
      return filtro.has(valorColumna(f, key));
    })
  );

  const hayFiltrosActivos = Object.values(filtros).some((f) => f != null);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      {hayFiltrosActivos && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
          <span>
            {visibles.length} de {filas.length} registro(s)
          </span>
          <button
            onClick={() => setFiltros({})}
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Limpiar filtros
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {COLUMNAS.map(({ key, label }) => (
              <th key={key} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-500">
                {label}
                <FiltroColumnaExcel
                  valores={valoresPorColumna[key]}
                  seleccionados={filtros[key] ?? null}
                  onCambiar={(s) => setFiltros((f) => ({ ...f, [key]: s }))}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibles.map((f) => (
            <tr key={f.id}>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {format(new Date(f.fechaIngreso), "dd/MM/yyyy HH:mm")}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {f.fechaSalida ? (
                  format(new Date(f.fechaSalida), "dd/MM/yyyy HH:mm")
                ) : (
                  <span className="font-medium text-status-warning-text">En instalaciones</span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{f.bp || "—"}</td>
              <td className="px-4 py-3 text-slate-700">{f.razonSocial}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{f.documento}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{f.pedidos || "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{f.obs || "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{f.comprobantes || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{f.tipoAtencion}</td>
              <td className="px-4 py-3 text-slate-500">{f.receptor || "—"}</td>
            </tr>
          ))}
          {visibles.length === 0 && (
            <tr>
              <td colSpan={COLUMNAS.length} className="px-4 py-8 text-center text-slate-400">
                {filas.length === 0 ? "Sin registros en el historial." : "Sin resultados con estos filtros."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
