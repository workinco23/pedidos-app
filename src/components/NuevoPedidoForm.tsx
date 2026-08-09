"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconoMas } from "@/components/ComercialIcons";
import type { OrigenPedido, TipoComprobante } from "@/lib/types";

export interface PrefillMostrador {
  documento: string;
  razonSocial: string;
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
  const [pedidoVenta, setPedidoVenta] = useState("");
  const [ob, setOb] = useState("");
  const [origen, setOrigen] = useState<OrigenPedido>("fuerza_ventas");
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante>("factura");
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
    setAbierto(true);
    onPrefillConsumido?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillMostrador]);

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
    setPedidoVenta("");
    setOb("");
    setOrigen("fuerza_ventas");
    setTipoComprobante("factura");
    setError(null);
    setAbierto(false);
  }

  async function guardarPedido(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("pedidos").insert({
      bp,
      documento_identidad: documento,
      razon_social: razonSocial,
      pedido_venta: pedidoVenta,
      ob,
      tipo_comprobante: tipoComprobante,
      estado: "en_extraccion",
      origen,
      usuario_creacion_id: usuarioId,
    });

    setGuardando(false);
    if (error) {
      setError(error.message);
      return;
    }

    resetFormulario();
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
        style={{ backgroundColor: "#1E3A8A" }}
      >
        <IconoMas /> Nuevo pedido
      </button>
    );
  }

  return (
    <form
      onSubmit={guardarPedido}
      className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3"
    >
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
        <label className="text-xs font-medium text-slate-500">Pedido de Venta</label>
        <input
          required
          placeholder="Ej. 40... / 49..."
          value={pedidoVenta}
          onChange={(e) => setPedidoVenta(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">OB (Orden de Venta)</label>
        <input
          required
          placeholder="Ej. 60..."
          value={ob}
          onChange={(e) => setOb(e.target.value)}
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
            onClick={() => setOrigen("mostrador")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
              origen === "mostrador"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Mostrador
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Tipo de Comprobante</label>
        <select
          value={tipoComprobante}
          onChange={(e) => setTipoComprobante(e.target.value as TipoComprobante)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="factura">Factura</option>
          <option value="boleta">Boleta</option>
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar pedido"}
        </button>
        <button
          type="button"
          onClick={resetFormulario}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <p className="col-span-full text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
