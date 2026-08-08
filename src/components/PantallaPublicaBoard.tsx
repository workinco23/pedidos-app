"use client";

import { useEffect, useState } from "react";

interface ItemPantalla {
  id: string;
  razonSocial: string;
  obEnmascarado: string;
  estado: string;
}

const INTERVALO_MS = 4000;

export function PantallaPublicaBoard() {
  const [boxA, setBoxA] = useState<ItemPantalla[]>([]);
  const [boxB, setBoxB] = useState<ItemPantalla[]>([]);

  useEffect(() => {
    let activo = true;

    async function actualizar() {
      try {
        const res = await fetch("/api/pantalla-publica", { cache: "no-store" });
        const data = await res.json();
        if (!activo) return;
        setBoxA(data.boxA ?? []);
        setBoxB(data.boxB ?? []);
      } catch {
        // reintenta en el siguiente ciclo
      }
    }

    actualizar();
    const intervalo = setInterval(actualizar, INTERVALO_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-slate-950 p-8 text-white md:grid-cols-2">
      <section>
        <h2 className="mb-4 text-2xl font-bold text-amber-400">En Proceso</h2>
        <ul className="flex flex-col gap-3">
          {boxA.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-900 px-6 py-4"
            >
              <span className="text-lg font-medium">{p.razonSocial}</span>
              <span className="font-mono text-xl tracking-wider text-amber-300">
                {p.obEnmascarado}
              </span>
            </li>
          ))}
          {boxA.length === 0 && (
            <li className="text-slate-500">Sin pedidos en proceso.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-emerald-400">
          Listos para Entrega
        </h2>
        <ul className="flex flex-col gap-3">
          {boxB.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-900 px-6 py-4"
            >
              <span className="text-lg font-medium">{p.razonSocial}</span>
              <span className="font-mono text-xl tracking-wider text-emerald-300">
                {p.obEnmascarado}
              </span>
            </li>
          ))}
          {boxB.length === 0 && (
            <li className="text-slate-500">Sin pedidos listos para entrega.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
