"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** Valores únicos posibles de esta columna, ya formateados para mostrar. */
  valores: string[];
  /** Valores actualmente incluidos; null = sin filtro (se incluyen todos). */
  seleccionados: Set<string> | null;
  onCambiar: (seleccionados: Set<string> | null) => void;
}

export function FiltroColumnaExcel({ valores, seleccionados, onCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function alClickearFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClickearFuera);
    return () => document.removeEventListener("mousedown", alClickearFuera);
  }, [abierto]);

  const activo = seleccionados !== null;
  const actuales = seleccionados ?? new Set(valores);
  const opciones = valores.filter((v) => v.toLowerCase().includes(busqueda.toLowerCase()));

  function alternar(valor: string) {
    const nuevo = new Set(actuales);
    if (nuevo.has(valor)) nuevo.delete(valor);
    else nuevo.add(valor);
    onCambiar(nuevo.size === valores.length ? null : nuevo);
  }

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className={`ml-1 rounded p-0.5 align-middle normal-case transition ${
          activo ? "text-brand-yellow-dark" : "text-slate-400 hover:text-slate-600"
        }`}
        title="Filtrar"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill={activo ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path d="M3 4h18l-7 9v6l-4 2v-8z" />
        </svg>
      </button>
      {abierto && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md border border-slate-200 bg-white p-2 text-left font-normal normal-case text-slate-700 shadow-xl">
          <input
            autoFocus
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="mb-2 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
          />
          <div className="mb-2 flex gap-3 text-[11px] font-medium text-slate-500">
            <button type="button" className="hover:text-slate-800" onClick={() => onCambiar(null)}>
              Todos
            </button>
            <button type="button" className="hover:text-slate-800" onClick={() => onCambiar(new Set())}>
              Ninguno
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {opciones.map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-slate-50"
              >
                <input type="checkbox" checked={actuales.has(v)} onChange={() => alternar(v)} />
                <span className="truncate">{v || "(vacío)"}</span>
              </label>
            ))}
            {opciones.length === 0 && (
              <p className="px-1 py-1 text-xs text-slate-400">Sin coincidencias.</p>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
