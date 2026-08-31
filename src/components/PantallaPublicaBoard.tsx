"use client";

import { useEffect, useState } from "react";

interface ItemPantalla {
  id: string;
  razonSocial: string;
  pedidoVentaEnmascarado: string;
  estado: "en_extraccion" | "contabilizado" | "facturado";
}

const INTERVALO_MS = 4000;

const ESTADO_LABEL: Record<ItemPantalla["estado"], string> = {
  en_extraccion: "En Extracción",
  contabilizado: "Contabilizado",
  facturado: "Facturado",
};

const ESTADO_COLOR: Record<ItemPantalla["estado"], { bg: string; texto: string; borde: string }> = {
  en_extraccion: { bg: "var(--color-status-warning-bg)", texto: "var(--color-status-warning-text)", borde: "#eddcb5" },
  contabilizado: { bg: "var(--color-status-info-bg)", texto: "var(--color-status-info-text)", borde: "#cfdcf1" },
  facturado: { bg: "var(--color-status-success-bg)", texto: "var(--color-status-success-text)", borde: "#cde8d7" },
};

function IconoBuscar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-navy)" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconoBandeja() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-yellow-dark)" strokeWidth="1.5">
      <path d="M4 13h4l1.5 3h5L16 13h4" />
      <path d="M5 13 6.5 6h11L19 13" />
      <path d="M4 13v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
    </svg>
  );
}

function LogoFerreyros() {
  return (
    <div className="flex items-center gap-2 rounded-md bg-brand-navy px-3 py-1.5">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-[11px] font-bold text-brand-navy">
        F
      </span>
      <span className="text-base font-semibold tracking-wide text-white">FERREYROS</span>
    </div>
  );
}

function EstadoPill({ estado }: { estado: ItemPantalla["estado"] }) {
  const { bg, texto, borde } = ESTADO_COLOR[estado];
  return (
    <span
      className="inline-block rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
      style={{ backgroundColor: bg, color: texto, borderColor: borde }}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}

function TablaPedidos({
  items,
  vacioTexto,
}: {
  items: ItemPantalla[];
  vacioTexto: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
        <IconoBandeja />
        <p className="text-sm font-medium tracking-wide text-brand-yellow-dark">{vacioTexto}</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr style={{ backgroundColor: "#eef0f3" }}>
          <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            N° Pedido
          </th>
          <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cliente
          </th>
          <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estado
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((p, i) => (
          <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafbfc" }}>
            <td className="px-6 py-3.5 font-mono text-lg font-semibold tracking-tight text-brand-navy">
              {p.pedidoVentaEnmascarado.slice(0, 1)}
              <span className="text-slate-300">{p.pedidoVentaEnmascarado.slice(1, -2)}</span>
              {p.pedidoVentaEnmascarado.slice(-2)}
            </td>
            <td className="max-w-[260px] truncate px-6 py-3.5 text-sm font-medium text-slate-700">
              {p.razonSocial}
            </td>
            <td className="px-6 py-3.5">
              <EstadoPill estado={p.estado} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PantallaPublicaBoard() {
  const [boxA, setBoxA] = useState<ItemPantalla[]>([]);
  const [boxB, setBoxB] = useState<ItemPantalla[]>([]);
  const [ahora, setAhora] = useState<Date | null>(null);
  const [segundosProxima, setSegundosProxima] = useState(INTERVALO_MS / 1000);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  useEffect(() => {
    let activo = true;

    async function actualizar() {
      try {
        const res = await fetch("/api/pantalla-publica", { cache: "no-store" });
        const data = await res.json();
        if (!activo) return;
        setBoxA(data.boxA ?? []);
        setBoxB(data.boxB ?? []);
        setUltimaActualizacion(new Date());
        setSegundosProxima(INTERVALO_MS / 1000);
      } catch {
        // reintenta en el siguiente ciclo
      }
    }

    actualizar();
    const intervalo = setInterval(actualizar, INTERVALO_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    const reloj = setInterval(() => {
      setAhora(new Date());
      setSegundosProxima((s) => (s > 1 ? s - 1 : INTERVALO_MS / 1000));
    }, 1000);
    return () => clearInterval(reloj);
  }, []);

  const totalActivos = boxA.length + boxB.length;

  return (
    <div className="flex min-h-screen flex-col bg-brand-navy-deep">
      {/* Header */}
      <header
        className="flex items-center justify-between gap-4 border-b border-brand-yellow-dark bg-brand-yellow px-6 py-3 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <LogoFerreyros />
          <div className="h-6 w-px bg-brand-navy/25" />
          <div className="flex items-center gap-2">
            <IconoBuscar />
            <h1 className="text-base font-semibold uppercase tracking-wide text-brand-navy">
              Sigue tu pedido contado de hoy
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex flex-col items-center rounded-md border border-brand-navy/15 bg-white/55 px-3 py-1"
          >
            <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-navy/70">
              Actualiza en
            </span>
            <span className="text-base font-semibold text-brand-navy">{segundosProxima}s</span>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold leading-none text-brand-navy">
              {ahora ? ahora.toLocaleTimeString("es-PE", { hour12: false }) : "--:--:--"}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-brand-navy/70">
              {ahora
                ? ahora.toLocaleDateString("es-PE", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })
                : ""}
            </p>
          </div>
        </div>
      </header>

      {/* Columnas */}
      <main className="grid flex-1 grid-cols-1 md:grid-cols-2">
        <section className="flex flex-col">
          <div className="flex items-center justify-between bg-brand-yellow px-6 py-2.5 shadow-sm">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-navy">
              <span className="h-2 w-2 rounded-full bg-brand-yellow-dark" />
              Pedidos en Extracción
            </span>
            <span className="text-lg font-semibold text-brand-navy">{boxA.length}</span>
          </div>
          <div className="flex flex-1 flex-col bg-status-warning-bg">
            <TablaPedidos items={boxA} vacioTexto="Sin pedidos en extracción" />
          </div>
        </section>

        <section className="flex flex-col">
          <div className="flex items-center justify-between bg-brand-navy px-6 py-2.5 shadow-sm">
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
              <span className="h-2 w-2 rounded-full bg-status-success-text" />
              Pedidos Facturados
            </span>
            <span className="text-lg font-semibold text-status-success-text">
              {boxB.length}
            </span>
          </div>
          <div className="flex flex-1 flex-col bg-white">
            <TablaPedidos items={boxB} vacioTexto="Sin pedidos facturados" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-white/10 bg-brand-navy px-6 py-2 text-xs">
        <p className="text-slate-400">
          Última actualización:{" "}
          <span className="font-semibold text-brand-yellow">
            {ultimaActualizacion
              ? ultimaActualizacion.toLocaleTimeString("es-PE", { hour12: true })
              : "--"}
          </span>
        </p>
        <p className="text-slate-400">
          <span className="font-semibold text-white">{totalActivos}</span> pedidos activos hoy
        </p>
      </footer>
    </div>
  );
}
