"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RegistroVigilancia } from "@/lib/types";
import { differenceInMinutes } from "date-fns";

interface Aviso {
  id: string;
  tipo: "llegada" | "salida";
  texto: string;
}

export function AlertaClienteEnTienda() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const audio =
      typeof Audio !== "undefined"
        ? new Audio(
            "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
          )
        : null;

    const canal = supabase
      .channel("alertas-cliente-en-tienda")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registros_vigilancia",
          filter: "tipo_atencion=eq.recojo_qr",
        },
        (payload) => {
          const r = payload.new as RegistroVigilancia;
          setAvisos((actuales) => [
            {
              id: `llegada-${r.id}`,
              tipo: "llegada",
              texto: `Cliente en tienda: ${r.razon_social} (recojo con QR)`,
            },
            ...actuales,
          ]);
          audio?.play().catch(() => {});
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "registros_vigilancia" },
        (payload) => {
          const r = payload.new as RegistroVigilancia;
          if (!r.fecha_salida) return;
          const minutos = differenceInMinutes(
            new Date(r.fecha_salida),
            new Date(r.fecha_ingreso)
          );
          setAvisos((actuales) => [
            {
              id: `salida-${r.id}`,
              tipo: "salida",
              texto: `${r.razon_social} se retiró (estuvo ${minutos} min en tienda)`,
            },
            ...actuales,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  if (avisos.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {avisos.map((a) => (
        <div
          key={a.id}
          className={`flex items-center justify-between rounded-md border px-4 py-2 text-sm ${
            a.tipo === "llegada"
              ? "border-sky-300 bg-status-info-bg text-status-info-text"
              : "border-slate-300 bg-slate-50 text-slate-600"
          }`}
        >
          <span>{a.texto}</span>
          <button
            onClick={() => setAvisos((actuales) => actuales.filter((x) => x.id !== a.id))}
            className="opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
