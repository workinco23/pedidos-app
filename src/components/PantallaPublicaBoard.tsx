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

const ESTADO_COLOR: Record<ItemPantalla["estado"], { bg: string; texto: string }> = {
  en_extraccion: { bg: "#fdf0d8", texto: "#a15c00" },
  contabilizado: { bg: "#dbe8fb", texto: "#1d4f91" },
  facturado: { bg: "#dcf5e3", texto: "#1f8a4c" },
};

function IconoBuscar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#142a4f" strokeWidth="2.5">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconoCaja() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c98a1e" strokeWidth="1.5">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

function LogoFerreyros() {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-2"
      style={{ backgroundColor: "#142a4f" }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black"
        style={{ backgroundColor: "#f5a623", color: "#142a4f" }}
      >
        F
      </span>
      <span className="text-xl font-black tracking-wide text-white">FERREYROS</span>
    </div>
  );
}

function EstadoPill({ estado }: { estado: ItemPantalla["estado"] }) {
  const { bg, texto } = ESTADO_COLOR[estado];
  return (
    <span
      className="inline-block rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wide"
      style={{ backgroundColor: bg, color: texto }}
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
        <IconoCaja />
        <p className="text-lg font-semibold uppercase tracking-wide text-[#a56a1a]">
          {vacioTexto}
        </p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr style={{ backgroundColor: "#e9ebef" }}>
          <th className="px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-600">
            N° Pedido
          </th>
          <th className="px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-600">
            Cliente
          </th>
          <th className="px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-600">
            Estado
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((p, i) => (
          <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f7f8fa" }}>
            <td className="px-6 py-4 font-mono text-2xl font-black tracking-tight text-[#142a4f]">
              {p.pedidoVentaEnmascarado.slice(0, 1)}
              <span className="text-slate-300">
                {p.pedidoVentaEnmascarado.slice(1, -2)}
              </span>
              {p.pedidoVentaEnmascarado.slice(-2)}
            </td>
            <td className="max-w-[260px] truncate px-6 py-4 text-lg font-semibold text-slate-800">
              {p.razonSocial}
            </td>
            <td className="px-6 py-4">
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
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#0f1f38" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between gap-4 px-6 py-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #f5a623 0 40px, #f2ac3a 40px 80px)",
        }}
      >
        <div className="flex items-center gap-4">
          <LogoFerreyros />
          <div className="h-8 w-px bg-[#142a4f]/30" />
          <div className="flex items-center gap-2">
            <IconoBuscar />
            <h1 className="text-2xl font-black uppercase tracking-wide text-[#142a4f]">
              Sigue tu pedido contado de hoy
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center rounded-lg px-4 py-1.5" style={{ backgroundColor: "#efe0bd" }}>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#7a5a1e]">
              Actualiza en
            </span>
            <span className="text-xl font-black text-[#142a4f]">{segundosProxima}s</span>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl font-black leading-none text-[#142a4f]">
              {ahora ? ahora.toLocaleTimeString("es-PE", { hour12: false }) : "--:--:--"}
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-[#7a5a1e]">
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
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ backgroundColor: "#f5a623" }}
          >
            <span className="flex items-center gap-2 text-lg font-black uppercase tracking-wide text-[#142a4f]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#e05a00" }} />
              Pedidos en Extracción
            </span>
            <span className="text-2xl font-black text-[#142a4f]">{boxA.length}</span>
          </div>
          <div className="flex flex-1 flex-col" style={{ backgroundColor: "#fbeecb" }}>
            <TablaPedidos items={boxA} vacioTexto="Sin pedidos en extracción" />
          </div>
        </section>

        <section className="flex flex-col">
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ backgroundColor: "#142a4f" }}
          >
            <span className="flex items-center gap-2 text-lg font-black uppercase tracking-wide text-white">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#3ddc7a" }} />
              Pedidos Facturados
            </span>
            <span className="text-2xl font-black" style={{ color: "#3ddc7a" }}>
              {boxB.length}
            </span>
          </div>
          <div className="flex flex-1 flex-col bg-white">
            <TablaPedidos items={boxB} vacioTexto="Sin pedidos facturados" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-6 py-2 text-sm"
        style={{ backgroundColor: "#142a4f" }}
      >
        <p className="text-slate-300">
          Última actualización:{" "}
          <span className="font-semibold" style={{ color: "#f5a623" }}>
            {ultimaActualizacion
              ? ultimaActualizacion.toLocaleTimeString("es-PE", { hour12: true })
              : "--"}
          </span>
        </p>
        <p className="text-slate-300">
          <span className="font-semibold text-white">{totalActivos}</span> pedidos activos hoy
        </p>
      </footer>
    </div>
  );
}
