import { describe, expect, it } from "vitest";
import { esContado, esCredito, esDelivery } from "@/lib/pedidosFiltros";
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

describe("esContado", () => {
  it("es true solo para contado + pickup", () => {
    expect(esContado(pedido({ condicion_pago: "contado", metodo_entrega: "pickup" }))).toBe(true);
  });

  it("es false para credito + pickup", () => {
    expect(esContado(pedido({ condicion_pago: "credito", metodo_entrega: "pickup" }))).toBe(false);
  });

  it("es false para contado + delivery", () => {
    expect(esContado(pedido({ condicion_pago: "contado", metodo_entrega: "delivery" }))).toBe(
      false
    );
  });
});

describe("esCredito", () => {
  it("es true solo para credito + pickup", () => {
    expect(esCredito(pedido({ condicion_pago: "credito", metodo_entrega: "pickup" }))).toBe(true);
  });

  it("es false para contado + pickup", () => {
    expect(esCredito(pedido({ condicion_pago: "contado", metodo_entrega: "pickup" }))).toBe(false);
  });

  it("es false para credito + delivery", () => {
    expect(esCredito(pedido({ condicion_pago: "credito", metodo_entrega: "delivery" }))).toBe(
      false
    );
  });
});

describe("esDelivery", () => {
  it("es true para cualquier condicion de pago si el metodo es delivery", () => {
    expect(esDelivery(pedido({ condicion_pago: "contado", metodo_entrega: "delivery" }))).toBe(
      true
    );
    expect(esDelivery(pedido({ condicion_pago: "credito", metodo_entrega: "delivery" }))).toBe(
      true
    );
  });

  it("es false para pickup", () => {
    expect(esDelivery(pedido({ metodo_entrega: "pickup" }))).toBe(false);
  });
});

describe("esContado / esCredito / esDelivery son mutuamente excluyentes", () => {
  it("cada pedido cae en exactamente una categoria", () => {
    const combinaciones: Array<Pick<Pedido, "condicion_pago" | "metodo_entrega">> = [
      { condicion_pago: "contado", metodo_entrega: "pickup" },
      { condicion_pago: "credito", metodo_entrega: "pickup" },
      { condicion_pago: "contado", metodo_entrega: "delivery" },
      { condicion_pago: "credito", metodo_entrega: "delivery" },
    ];
    for (const c of combinaciones) {
      const p = pedido(c);
      const matches = [esContado(p), esCredito(p), esDelivery(p)].filter(Boolean).length;
      expect(matches).toBe(1);
    }
  });
});
