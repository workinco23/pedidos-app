"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** IDs de pedidos cuyo cliente tiene una visita de vigilancia activa (sin salida registrada). */
export function useClientesEnTienda(): Set<string> {
  const [pedidoIds, setPedidoIds] = useState<Set<string>>(new Set());
  const porRegistro = useRef<Record<string, string[]>>({});

  function recalcular() {
    const set = new Set<string>();
    Object.values(porRegistro.current).forEach((ids) => ids.forEach((id) => set.add(id)));
    setPedidoIds(set);
  }

  useEffect(() => {
    const supabase = createClient();
    let activo = true;

    async function cargarInicial() {
      const { data } = await supabase
        .from("registros_vigilancia")
        .select("id, registro_vigilancia_pedidos(pedido_id)")
        .is("fecha_salida", null);
      if (!activo || !data) return;
      const mapa: Record<string, string[]> = {};
      for (const r of data as { id: string; registro_vigilancia_pedidos: { pedido_id: string }[] }[]) {
        mapa[r.id] = (r.registro_vigilancia_pedidos ?? []).map((x) => x.pedido_id);
      }
      porRegistro.current = mapa;
      recalcular();
    }
    cargarInicial();

    const canal = supabase
      .channel("clientes-en-tienda")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "registro_vigilancia_pedidos" },
        (payload) => {
          const fila = payload.new as { registro_vigilancia_id: string; pedido_id: string };
          const lista = porRegistro.current[fila.registro_vigilancia_id] ?? [];
          porRegistro.current = {
            ...porRegistro.current,
            [fila.registro_vigilancia_id]: [...lista, fila.pedido_id],
          };
          recalcular();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "registros_vigilancia" },
        (payload) => {
          const fila = payload.new as { id: string; fecha_salida: string | null };
          if (!fila.fecha_salida) return;
          if (!(fila.id in porRegistro.current)) return;
          const resto = { ...porRegistro.current };
          delete resto[fila.id];
          porRegistro.current = resto;
          recalcular();
        }
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, []);

  return pedidoIds;
}
