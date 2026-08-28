"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pedido } from "@/lib/types";

type EventoPedido =
  | { eventType: "INSERT"; new: Pedido }
  | { eventType: "UPDATE"; new: Pedido }
  | { eventType: "DELETE"; old: Pedido };

export function aplicarEventoPedido(actuales: Pedido[], payload: EventoPedido): Pedido[] {
  if (payload.eventType === "INSERT") {
    const nuevo = payload.new;
    if (actuales.some((p) => p.id === nuevo.id)) return actuales;
    // Los eventos realtime no traen el join a pedido_obs
    return [{ ...nuevo, obsAdicionales: nuevo.obsAdicionales ?? [] }, ...actuales];
  }
  if (payload.eventType === "UPDATE") {
    const actualizado = payload.new;
    return actuales.map((p) =>
      p.id === actualizado.id ? { ...actualizado, obsAdicionales: p.obsAdicionales } : p
    );
  }
  if (payload.eventType === "DELETE") {
    const eliminado = payload.old;
    return actuales.filter((p) => p.id !== eliminado.id);
  }
  return actuales;
}

export function aplicarObAdicional(
  actuales: Pedido[],
  fila: { pedido_id: string; ob: string }
): Pedido[] {
  return actuales.map((p) =>
    p.id === fila.pedido_id ? { ...p, obsAdicionales: [...p.obsAdicionales, fila.ob] } : p
  );
}

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
          setPedidos((actuales) =>
            aplicarEventoPedido(actuales, payload as unknown as EventoPedido)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedido_obs" },
        (payload) => {
          const fila = payload.new as { pedido_id: string; ob: string };
          setPedidos((actuales) => aplicarObAdicional(actuales, fila));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return pedidos;
}
