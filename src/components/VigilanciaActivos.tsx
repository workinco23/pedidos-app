"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RegistroVigilancia } from "@/lib/types";
import { format } from "date-fns";

const LABEL_ATENCION: Record<RegistroVigilancia["tipo_atencion"], string> = {
  recojo_qr: "Recojo con QR",
  atencion_mostrador: "Atención en Mostrador",
};

export function VigilanciaActivos({
  iniciales,
}: {
  iniciales: RegistroVigilancia[];
}) {
  const [registros, setRegistros] = useState(iniciales);
  const [registroCheckout, setRegistroCheckout] = useState<RegistroVigilancia | null>(
    null
  );
  const [comprobantes, setComprobantes] = useState<string[]>([""]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel("registros-vigilancia-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registros_vigilancia" },
        (payload) => {
          setRegistros((actuales) => {
            if (payload.eventType === "INSERT") {
              const nuevo = payload.new as RegistroVigilancia;
              if (actuales.some((r) => r.id === nuevo.id)) return actuales;
              return [nuevo, ...actuales];
            }
            if (payload.eventType === "UPDATE") {
              const actualizado = payload.new as RegistroVigilancia;
              if (actualizado.fecha_salida) {
                return actuales.filter((r) => r.id !== actualizado.id);
              }
              return actuales.map((r) =>
                r.id === actualizado.id ? actualizado : r
              );
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

  async function confirmarCheckout() {
    if (!registroCheckout) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/vigilancia/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registroId: registroCheckout.id,
          comprobantes: comprobantes.map((c) => c.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRegistroCheckout(null);
      setComprobantes([""]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar salida");
    } finally {
      setEnviando(false);
    }
  }

  const activos = registros.filter((r) => !r.fecha_salida);

  return (
    <div
      className="rounded-xl border p-4 shadow-lg"
      style={{
        backgroundColor: "rgba(15,23,42,0.75)",
        borderColor: "rgba(56,189,248,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-white">
        Clientes en instalaciones ({activos.length})
      </h2>
      <div className="flex flex-col gap-2">
        {activos.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{r.razon_social}</p>
              <p className="text-xs text-slate-400">
                {LABEL_ATENCION[r.tipo_atencion]} · Ingreso{" "}
                {format(new Date(r.fecha_ingreso), "HH:mm")}
              </p>
            </div>
            <button
              onClick={() => setRegistroCheckout(r)}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-white shadow transition hover:brightness-110"
              style={{ backgroundColor: "#1E3A8A" }}
            >
              Registrar salida
            </button>
          </div>
        ))}
        {activos.length === 0 && (
          <p className="rounded-[10px] bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
            No hay clientes en instalaciones.
          </p>
        )}
      </div>

      {registroCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <h3 className="mb-1 text-sm font-semibold text-slate-900">
              Salida — {registroCheckout.razon_social}
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              Ingresa los números de comprobante entregados por Almacén.
            </p>

            {comprobantes.map((c, i) => (
              <input
                key={i}
                value={c}
                placeholder={`Comprobante ${i + 1}`}
                onChange={(e) =>
                  setComprobantes((actuales) =>
                    actuales.map((x, idx) => (idx === i ? e.target.value : x))
                  )
                }
                className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            ))}
            <button
              type="button"
              onClick={() => setComprobantes((actuales) => [...actuales, ""])}
              className="mb-4 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              + Agregar otro comprobante
            </button>

            <div className="flex gap-2">
              <button
                onClick={confirmarCheckout}
                disabled={enviando}
                className="rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: "#1E3A8A" }}
              >
                {enviando ? "Guardando..." : "Confirmar salida"}
              </button>
              <button
                onClick={() => {
                  setRegistroCheckout(null);
                  setComprobantes([""]);
                  setError(null);
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600"
              >
                Cancelar
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
