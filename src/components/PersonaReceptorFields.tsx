"use client";

import { useEffect, useRef, useState } from "react";
import type { PersonaRecurrente } from "@/app/api/vigilancia/personas-recurrentes/route";

interface Props {
  dni: string;
  nombre: string;
  onChangeDni: (v: string) => void;
  onChangeNombre: (v: string) => void;
  placeholderDni?: string;
  placeholderNombre?: string;
}

export function PersonaReceptorFields({
  dni,
  nombre,
  onChangeDni,
  onChangeNombre,
  placeholderDni = "DNI o CE de quien recoge",
  placeholderNombre = "Nombre de quien recoge",
}: Props) {
  const [sugerencias, setSugerencias] = useState<PersonaRecurrente[]>([]);
  const [mostrar, setMostrar] = useState<"dni" | "nombre" | null>(null);
  const seleccionProgramatica = useRef(false);
  const cacheRef = useRef<Map<string, PersonaRecurrente[]>>(new Map());

  const termino = (mostrar === "dni" ? dni : nombre).trim();

  useEffect(() => {
    if (seleccionProgramatica.current) {
      seleccionProgramatica.current = false;
      return;
    }
    if (!mostrar || termino.length < 2) {
      setSugerencias([]);
      return;
    }
    const enCache = cacheRef.current.get(termino.toLowerCase());
    if (enCache) {
      setSugerencias(enCache);
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/vigilancia/personas-recurrentes?q=${encodeURIComponent(termino)}`
        );
        const data = await res.json();
        const resultados = res.ok ? (data.resultados as PersonaRecurrente[]) : [];
        cacheRef.current.set(termino.toLowerCase(), resultados);
        setSugerencias(resultados);
      } catch {
        setSugerencias([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termino, mostrar]);

  function seleccionar(p: PersonaRecurrente) {
    seleccionProgramatica.current = true;
    onChangeDni(p.dni_receptor);
    onChangeNombre(p.nombre_receptor);
    setMostrar(null);
    setSugerencias([]);
  }

  const mostrarLista = mostrar !== null && sugerencias.length > 0;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="relative">
        <input
          placeholder={placeholderDni}
          value={dni}
          onChange={(e) => onChangeDni(e.target.value)}
          onFocus={() => setMostrar("dni")}
          onBlur={() => setTimeout(() => setMostrar(null), 150)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        {mostrar === "dni" && mostrarLista && (
          <ul className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            {sugerencias.map((p) => (
              <li key={`${p.dni_receptor}-${p.nombre_receptor}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => seleccionar(p)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-brand-navy">{p.nombre_receptor}</span>
                  <span className="text-xs text-slate-500">{p.dni_receptor}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative">
        <input
          placeholder={placeholderNombre}
          value={nombre}
          onChange={(e) => onChangeNombre(e.target.value)}
          onFocus={() => setMostrar("nombre")}
          onBlur={() => setTimeout(() => setMostrar(null), 150)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        {mostrar === "nombre" && mostrarLista && (
          <ul className="absolute top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            {sugerencias.map((p) => (
              <li key={`${p.dni_receptor}-${p.nombre_receptor}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => seleccionar(p)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-brand-navy">{p.nombre_receptor}</span>
                  <span className="text-xs text-slate-500">{p.dni_receptor}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
