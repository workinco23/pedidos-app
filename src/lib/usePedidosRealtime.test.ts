import { describe, expect, it } from "vitest";
import { aplicarEventoPedido, aplicarObAdicional } from "@/lib/usePedidosRealtime";
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

describe("aplicarEventoPedido", () => {
  it("INSERT agrega el pedido nuevo al inicio de la lista", () => {
    const actuales = [pedido({ id: "1" })];
    const nuevo = pedido({ id: "2" });
    const resultado = aplicarEventoPedido(actuales, { eventType: "INSERT", new: nuevo });
    expect(resultado.map((p) => p.id)).toEqual(["2", "1"]);
  });

  it("INSERT no duplica si el pedido ya existe en la lista", () => {
    const actuales = [pedido({ id: "1" })];
    const resultado = aplicarEventoPedido(actuales, {
      eventType: "INSERT",
      new: pedido({ id: "1" }),
    });
    expect(resultado).toHaveLength(1);
  });

  it("UPDATE reemplaza el pedido preservando obsAdicionales (no viene en el evento realtime)", () => {
    const actuales = [pedido({ id: "1", estado: "waiting", obsAdicionales: ["OB-2", "OB-3"] })];
    const actualizado = pedido({ id: "1", estado: "en_extraccion", obsAdicionales: [] });
    const resultado = aplicarEventoPedido(actuales, { eventType: "UPDATE", new: actualizado });
    expect(resultado[0].estado).toBe("en_extraccion");
    expect(resultado[0].obsAdicionales).toEqual(["OB-2", "OB-3"]);
  });

  it("UPDATE de un pedido marcado como entregado lo saca de la lista activa (regresion del bug de panel Almacen)", () => {
    // Este es el escenario exacto reportado: un pedido pasa a "entregado" via
    // el boton de Almacen. Los paneles activos solo retienen pedidos en flujo,
    // así que al llegar a un estado terminal debe desaparecer de la lista en
    // vez de quedarse marcado como entregado dentro de ella.
    const actuales = [
      pedido({ id: "1", estado: "facturado" }),
      pedido({ id: "2", estado: "facturado" }),
    ];
    const resultado = aplicarEventoPedido(actuales, {
      eventType: "UPDATE",
      new: pedido({ id: "1", estado: "entregado" }),
    });
    expect(resultado.map((p) => p.id)).toEqual(["2"]);
  });

  it("INSERT de un pedido ya entregado no se agrega a la lista activa", () => {
    const actuales = [pedido({ id: "1" })];
    const resultado = aplicarEventoPedido(actuales, {
      eventType: "INSERT",
      new: pedido({ id: "2", estado: "despachado" }),
    });
    expect(resultado.map((p) => p.id)).toEqual(["1"]);
  });

  it("DELETE quita el pedido de la lista", () => {
    const actuales = [pedido({ id: "1" }), pedido({ id: "2" })];
    const resultado = aplicarEventoPedido(actuales, {
      eventType: "DELETE",
      old: pedido({ id: "1" }),
    });
    expect(resultado.map((p) => p.id)).toEqual(["2"]);
  });
});

describe("aplicarObAdicional", () => {
  it("agrega la OB al pedido correspondiente sin afectar a otros", () => {
    const actuales = [
      pedido({ id: "1", obsAdicionales: ["OB-1"] }),
      pedido({ id: "2", obsAdicionales: [] }),
    ];
    const resultado = aplicarObAdicional(actuales, { pedido_id: "1", ob: "OB-2" });
    expect(resultado[0].obsAdicionales).toEqual(["OB-1", "OB-2"]);
    expect(resultado[1].obsAdicionales).toEqual([]);
  });
});
