"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertaMostrador } from "@/components/AlertaMostrador";
import { AlertaClienteEnTienda } from "@/components/AlertaClienteEnTienda";
import { NuevoPedidoForm, type PrefillMostrador } from "@/components/NuevoPedidoForm";
import { IconoHistorial } from "@/components/ComercialIcons";

export function ComercialPanelHeader({
  usuarioId,
  totalPedidos,
}: {
  usuarioId: string;
  totalPedidos: number;
}) {
  const [prefill, setPrefill] = useState<PrefillMostrador | null>(null);

  return (
    <>
      <AlertaMostrador
        onRegistrarPedido={({ documento, razonSocial }) =>
          setPrefill({ documento, razonSocial })
        }
      />
      <AlertaClienteEnTienda />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{totalPedidos} pedido(s) registrados</p>
        <div className="flex items-center gap-4">
          <Link
            href="/comercial/historial"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <IconoHistorial /> Ver historial
          </Link>
          <NuevoPedidoForm
            usuarioId={usuarioId}
            prefillMostrador={prefill}
            onPrefillConsumido={() => setPrefill(null)}
          />
        </div>
      </div>
    </>
  );
}
