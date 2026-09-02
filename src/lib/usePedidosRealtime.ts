"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pedido } from "@/lib/types";

type EventoPedido =
  | { eventType: "INSERT"; new: Pedido }
  | { eventType: "UPDATE"; new: Pedido }
  | { eventType: "DELETE"; old: Pedido };

// Los paneles activos (comercial/almacén) solo mantienen en memoria los
// pedidos que aún están en flujo; una vez entregados/despachados quedan
// fuera para no arrastrar todo el historial en cada render/reconciliación.
const ESTADOS_TERMINALES = new Set(["entregado", "despachado"]);

export function aplicarEventoPedido(actuales: Pedido[], payload: EventoPedido): Pedido[] {
  if (payload.eventType === "INSERT") {
    const nuevo = payload.new;
    if (ESTADOS_TERMINALES.has(nuevo.estado)) return actuales;
    if (actuales.some((p) => p.id === nuevo.id)) return actuales;
    // Los eventos realtime no traen el join a pedido_obs
    return [{ ...nuevo, obsAdicionales: nuevo.obsAdicionales ?? [] }, ...actuales];
  }
  if (payload.eventType === "UPDATE") {
    const actualizado = payload.new;
    if (ESTADOS_TERMINALES.has(actualizado.estado)) {
      return actuales.filter((p) => p.id !== actualizado.id);
    }
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

    async function resincronizar() {
      const { data } = await supabase
        .from("pedidos")
        .select("*, pedido_obs(ob)")
        .not("estado", "in", "(entregado,despachado)")
        .order("fecha_registro", { ascending: false });
      if (!data) return;
      setPedidos(
        data.map((p) => ({
          ...p,
          obsAdicionales: (p.pedido_obs ?? []).map((o: { ob: string }) => o.ob),
        })) as Pedido[]
      );
    }

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

    // Red de seguridad: si el canal realtime se cae en silencio (pestaña en
    // segundo plano, laptop suspendida, WiFi inestable) esto reconcilia el
    // estado solo, sin depender de que alguien refresque la página a mano.
    function alVolverVisible() {
      if (document.visibilityState === "visible") resincronizar();
    }
    document.addEventListener("visibilitychange", alVolverVisible);
    const intervalo = setInterval(resincronizar, 60000);

    return () => {
      supabase.removeChannel(canal);
      document.removeEventListener("visibilitychange", alVolverVisible);
      clearInterval(intervalo);
    };
  }, []);

  return pedidos;
}
