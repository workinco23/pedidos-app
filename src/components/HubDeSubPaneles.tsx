"use client";

import { useState, type ReactNode } from "react";

export interface SubPanelDef {
  key: string;
  titulo: string;
  descripcion: string;
  contenido: ReactNode;
  badge?: number;
}

export function HubDeSubPaneles({ paneles }: { paneles: SubPanelDef[] }) {
  const [activo, setActivo] = useState<string | null>(null);
  const actual = paneles.find((p) => p.key === activo);

  if (!actual) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paneles.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActivo(p.key)}
            className="flex flex-col items-start gap-2 rounded-xl border p-5 text-left shadow-lg transition hover:-translate-y-0.5"
            style={{
              backgroundColor: "rgba(30,41,59,0.7)",
              borderColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-lg font-bold text-white">{p.titulo}</span>
              {p.badge !== undefined && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  {p.badge}
                </span>
              )}
            </div>
            <span className="text-sm text-slate-400">{p.descripcion}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActivo(null)}
          className="flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/5"
        >
          ← Volver
        </button>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {paneles.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setActivo(p.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                p.key === actual.key
                  ? "bg-white text-slate-900"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {p.titulo}
              {p.badge !== undefined && (
                <span className="ml-1.5 text-xs opacity-70">({p.badge})</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {actual.contenido}
    </div>
  );
}
