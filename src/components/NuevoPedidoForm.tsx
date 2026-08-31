"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconoMas, IconoX } from "@/components/ComercialIcons";
import type { CondicionPago, MetodoEntrega, OrigenPedido, TipoComprobante } from "@/lib/types";

export interface PrefillMostrador {
  documento: string;
  razonSocial: string;
}

interface LineaPedido {
  pedidoVenta: string;
  obs: string[];
  tipoComprobante: TipoComprobante;
}

function lineaVacia(): LineaPedido {
  return { pedidoVenta: "", obs: [""], tipoComprobante: "factura" };
}

interface Props {
  usuarioId: string;
  prefillMostrador?: PrefillMostrador | null;
  onPrefillConsumido?: () => void;
}

export function NuevoPedidoForm({
  usuarioId,
  prefillMostrador,
  onPrefillConsumido,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [bp, setBp] = useState("");
  const [bpBloqueado, setBpBloqueado] = useState(false);
  const [vendedor, setVendedor] = useState<string | null>(null);
  const [documento, setDocumento] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [origen, setOrigen] = useState<OrigenPedido>("fuerza_ventas");
  const [condicionPago, setCondicionPago] = useState<CondicionPago>("contado");
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>("pickup");
  const [lineas, setLineas] = useState<LineaPedido[]>([lineaVacia()]);
  const [consultando, setConsultando] = useState(false);
  const [consultandoBp, setConsultandoBp] = useState(false);
  const [registrandoBp, setRegistrandoBp] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prefillMostrador) return;
    setDocumento(prefillMostrador.documento);
    setRazonSocial(prefillMostrador.razonSocial);
    setOrigen("mostrador");
    setCondicionPago("contado");
    setMetodoEntrega("pickup");
    setAbierto(true);
    onPrefillConsumido?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillMostrador]);

  function actualizarLinea(indice: number, patch: Partial<LineaPedido>) {
    setLineas((actuales) =>
      actuales.map((l, i) => (i === indice ? { ...l, ...patch } : l))
    );
  }

  function agregarLinea() {
    setLineas((actuales) => [...actuales, lineaVacia()]);
  }

  function quitarLinea(indice: number) {
    setLineas((actuales) => actuales.filter((_, i) => i !== indice));
  }

  function actualizarOb(indiceLinea: number, indiceOb: number, valor: string) {
    setLineas((actuales) =>
      actuales.map((l, i) =>
        i === indiceLinea
          ? { ...l, obs: l.obs.map((o, j) => (j === indiceOb ? valor : o)) }
          : l
      )
    );
  }

  function agregarOb(indiceLinea: number) {
    setLineas((actuales) =>
      actuales.map((l, i) => (i === indiceLinea ? { ...l, obs: [...l.obs, ""] } : l))
    );
  }

  function quitarOb(indiceLinea: number, indiceOb: number) {
    setLineas((actuales) =>
      actuales.map((l, i) =>
        i === indiceLinea ? { ...l, obs: l.obs.filter((_, j) => j !== indiceOb) } : l
      )
    );
  }

  async function buscarPorDoc(doc: string) {
    const res = await fetch(`/api/clientes/buscar?doc=${encodeURIComponent(doc)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo consultar");
    return data as {
      registrado: boolean;
      ruc_dni: string;
      bp: string | null;
      razon_social: string;
      vendedor_nombre: string | null;
    };
  }

  async function consultarDocumento() {
    if (!documento) return;
    setConsultando(true);
    setError(null);
    setVendedor(null);
    try {
      const data = await buscarPorDoc(documento);
      setRazonSocial(data.razon_social);
      if (data.registrado && data.bp) {
        setBp(data.bp);
        setBpBloqueado(true);
        setVendedor(data.vendedor_nombre ?? null);
      } else {
        setBp("");
        setBpBloqueado(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar documento");
    } finally {
      setConsultando(false);
    }
  }

  async function consultarPorBp() {
    if (!bp) return;
    setConsultandoBp(true);
    setError(null);
    setVendedor(null);
    try {
      const data = await buscarPorDoc(bp);
      if (!data.registrado || !data.bp) {
        throw new Error("No se encontró ningún cliente con ese BP");
      }
      setDocumento(data.ruc_dni);
      setRazonSocial(data.razon_social);
      setBp(data.bp);
      setBpBloqueado(true);
      setVendedor(data.vendedor_nombre ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar BP");
    } finally {
      setConsultandoBp(false);
    }
  }

  async function registrarBp() {
    if (!bp || !documento || !razonSocial) return;
    setRegistrandoBp(true);
    setError(null);
    try {
      const res = await fetch("/api/clientes/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruc_dni: documento, bp, razon_social: razonSocial }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar el BP");
      if (/^\d{1,10}$/.test(bp)) setBp(bp.padStart(10, "0"));
      setBpBloqueado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar BP");
    } finally {
      setRegistrandoBp(false);
    }
  }

  function resetFormulario() {
    setBp("");
    setBpBloqueado(false);
    setVendedor(null);
    setDocumento("");
    setRazonSocial("");
    setOrigen("fuerza_ventas");
    setCondicionPago("contado");
    setMetodoEntrega("pickup");
    setLineas([lineaVacia()]);
    setError(null);
    setAbierto(false);
  }

  async function guardarPedido(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const supabase = createClient();
    const filas = lineas.map((l) => ({
      bp,
      documento_identidad: documento,
      razon_social: razonSocial,
      pedido_venta: l.pedidoVenta,
      ob: l.obs[0],
      tipo_comprobante: l.tipoComprobante,
      estado: condicionPago === "credito" ? ("pendiente_creditos" as const) : ("en_extraccion" as const),
      origen,
      prioridad: origen === "mostrador",
      condicion_pago: condicionPago,
      metodo_entrega: metodoEntrega,
      usuario_creacion_id: usuarioId,
    }));

    const { data: creados, error: errorPedidos } = await supabase
      .from("pedidos")
      .insert(filas)
      .select();

    if (errorPedidos || !creados) {
      setGuardando(false);
      setError(errorPedidos?.message ?? "No se pudo guardar el pedido");
      return;
    }

    const obsExtra = creados.flatMap((p, indice) =>
      lineas[indice].obs
        .slice(1)
        .map((ob) => ob.trim())
        .filter(Boolean)
        .map((ob) => ({ pedido_id: p.id, ob }))
    );

    if (obsExtra.length > 0) {
      const { error: errorObs } = await supabase.from("pedido_obs").insert(obsExtra);
      if (errorObs) {
        setGuardando(false);
        setError(`Pedido(s) guardado(s), pero falló un OB adicional: ${errorObs.message}`);
        return;
      }
    }

    setGuardando(false);
    resetFormulario();
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-md bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy shadow-lg transition hover:bg-brand-yellow-dark"
      >
        <IconoMas /> Nuevo pedido
      </button>
    );
  }

  return (
    <form
      onSubmit={guardarPedido}
      className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">BP (Código Cliente)</label>
          <div className="flex gap-2">
            <input
              required
              readOnly={bpBloqueado}
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm read-only:bg-slate-100"
            />
            {bpBloqueado ? (
              <button
                type="button"
                onClick={() => {
                  setBpBloqueado(false);
                  setVendedor(null);
                }}
                className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cambiar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={consultarPorBp}
                  disabled={consultandoBp || !bp}
                  className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {consultandoBp ? "..." : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={registrarBp}
                  disabled={registrandoBp || !bp || !razonSocial}
                  className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {registrandoBp ? "..." : "Registrar BP"}
                </button>
              </>
            )}
          </div>
          {vendedor && (
            <span className="text-xs text-slate-500">Vendedor asignado: {vendedor}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">RUC / DNI</label>
          <div className="flex gap-2">
            <input
              required
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={consultarDocumento}
              disabled={consultando}
              className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {consultando ? "..." : "Consultar"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Razón Social</label>
          <input
            required
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Origen</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrigen("fuerza_ventas")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                origen === "fuerza_ventas"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Fuerza de Ventas
            </button>
            <button
              type="button"
              onClick={() => {
                setOrigen("mostrador");
                setCondicionPago("contado");
                setMetodoEntrega("pickup");
              }}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                origen === "mostrador"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Mostrador (Waiting)
            </button>
          </div>
        </div>

        {origen !== "mostrador" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Condición de Pago</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCondicionPago("contado")}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                    condicionPago === "contado"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Contado
                </button>
                <button
                  type="button"
                  onClick={() => setCondicionPago("credito")}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                    condicionPago === "credito"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Crédito
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Método de Entrega</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoEntrega("pickup")}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                    metodoEntrega === "pickup"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoEntrega("delivery")}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                    metodoEntrega === "delivery"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pedidos de este cliente
          </span>
          <button
            type="button"
            onClick={agregarLinea}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <IconoMas /> Agregar otro pedido
          </button>
        </div>

        {lineas.map((linea, indiceLinea) => (
          <div
            key={indiceLinea}
            className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Pedido de Venta</label>
              <input
                required
                placeholder="Ej. 40... / 49..."
                value={linea.pedidoVenta}
                onChange={(e) => actualizarLinea(indiceLinea, { pedidoVenta: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-xs font-medium text-slate-500">OB (Orden de Venta)</label>
              {linea.obs.map((ob, indiceOb) => (
                <div key={indiceOb} className="flex gap-2">
                  <input
                    required
                    placeholder="Ej. 60..."
                    value={ob}
                    onChange={(e) => actualizarOb(indiceLinea, indiceOb, e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  {linea.obs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => quitarOb(indiceLinea, indiceOb)}
                      className="rounded-md border border-slate-300 px-2 text-slate-500 hover:bg-white"
                      aria-label="Quitar OB"
                    >
                      <IconoX />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => agregarOb(indiceLinea)}
                className="w-fit text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                + Agregar otro OB a este pedido
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Tipo de Comprobante</label>
              <select
                value={linea.tipoComprobante}
                onChange={(e) =>
                  actualizarLinea(indiceLinea, {
                    tipoComprobante: e.target.value as TipoComprobante,
                  })
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="factura">Factura</option>
                <option value="boleta">Boleta</option>
              </select>
            </div>

            {lineas.length > 1 && (
              <button
                type="button"
                onClick={() => quitarLinea(indiceLinea)}
                className="flex w-fit items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 lg:col-span-4"
              >
                <IconoX /> Quitar este pedido
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar pedido(s)"}
        </button>
        <button
          type="button"
          onClick={resetFormulario}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
