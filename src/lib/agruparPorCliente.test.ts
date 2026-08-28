import { describe, expect, it } from "vitest";
import { agruparPorCliente } from "@/lib/agruparPorCliente";
import type { Pedido } from "@/lib/types";

function pedido(overrides: Partial<Pedido>): Pedido {
  return {
    id: "1",
    fecha_registro: "2026-01-01T00:00:00Z",
    bp: "BP1",
    documento_identidad: "12345678",
    razon_social: "Cliente Test",
    pedido_venta: "PV-1",
    ob: "OB-1",
    tipo_comprobante: "factura",
    estado: "waiting",
    origen: "fuerza_ventas",
    prioridad: false,
    condicion_pago: "contado",
    metodo_entrega: "pickup",
    qr_codigo_hash: null,
    usuario_creacion_id: null,
    updated_at: "2026-01-01T00:00:00Z",
    obsAdicionales: [],
    ...overrides,
  };
}

describe("agruparPorCliente", () => {
  it("agrupa pedidos del mismo bp y misma fecha_registro exacta", () => {
    const pedidos = [
      pedido({ id: "1", bp: "BP1", fecha_registro: "2026-01-01T10:00:00Z" }),
      pedido({ id: "2", bp: "BP1", fecha_registro: "2026-01-01T10:00:00Z" }),
    ];
    const grupos = agruparPorCliente(pedidos, new Set());
    expect(grupos).toHaveLength(1);
    expect(grupos[0].pedidos.map((p) => p.id)).toEqual(["1", "2"]);
  });

  it("no mezcla lotes distintos del mismo bp con fecha_registro diferente", () => {
    const pedidos = [
      pedido({ id: "1", bp: "BP1", fecha_registro: "2026-01-01T10:00:00Z" }),
      pedido({ id: "2", bp: "BP1", fecha_registro: "2026-01-02T10:00:00Z" }),
    ];
    const grupos = agruparPorCliente(pedidos, new Set());
    expect(grupos).toHaveLength(2);
  });

  it("ordena primero los grupos en_tienda, luego por fecha_registro descendente", () => {
    const pedidos = [
      pedido({ id: "1", bp: "BP1", fecha_registro: "2026-01-01T10:00:00Z" }),
      pedido({ id: "2", bp: "BP2", fecha_registro: "2026-01-02T10:00:00Z" }),
      pedido({ id: "3", bp: "BP3", fecha_registro: "2026-01-03T10:00:00Z" }),
    ];
    const grupos = agruparPorCliente(pedidos, new Set(["1"]));
    expect(grupos.map((g) => g.bp)).toEqual(["BP1", "BP3", "BP2"]);
    expect(grupos[0].enTienda).toBe(true);
  });
});
