"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RegistroVigilancia } from "@/lib/types";

export function AlertaMostrador() {
  const [alertas, setAlertas] = useState<RegistroVigilancia[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const audio =
      typeof Audio !== "undefined"
        ? new Audio(
            "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
          )
        : null;

    const canal = supabase
      .channel("alertas-mostrador")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registros_vigilancia",
          filter: "tipo_atencion=eq.atencion_mostrador",
        },
        (payload) => {
          setAlertas((actuales) => [
            payload.new as RegistroVigilancia,
            ...actuales,
          ]);
          audio?.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  if (alertas.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {alertas.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800"
        >
          <span>
            Atención en mostrador: <strong>{a.razon_social}</strong> (
            {a.documento_cliente})
          </span>
          <button
            onClick={() =>
              setAlertas((actuales) => actuales.filter((x) => x.id !== a.id))
            }
            className="text-amber-700 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
