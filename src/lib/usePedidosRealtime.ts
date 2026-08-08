"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pedido } from "@/lib/types";

export function usePedidosRealtime(iniciales: Pedido[]) {
  const [pedidos, setPedidos] = useState<Pedido[]>(iniciales);

  useEffect(() => {
    const supabase = createClient();

    const canal = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          setPedidos((actuales) => {
            if (payload.eventType === "INSERT") {
              const nuevo = payload.new as Pedido;
              if (actuales.some((p) => p.id === nuevo.id)) return actuales;
              return [nuevo, ...actuales];
            }
            if (payload.eventType === "UPDATE") {
              const actualizado = payload.new as Pedido;
              return actuales.map((p) =>
                p.id === actualizado.id ? actualizado : p
              );
            }
            if (payload.eventType === "DELETE") {
              const eliminado = payload.old as Pedido;
              return actuales.filter((p) => p.id !== eliminado.id);
            }
            return actuales;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return pedidos;
}
