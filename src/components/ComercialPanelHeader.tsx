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
            className="flex items-center gap-1.5 text-sm text-slate-300 decoration-slate-500 underline-offset-4 hover:text-white hover:underline"
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
