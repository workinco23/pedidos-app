import { describe, expect, it } from "vitest";
import { extraerCamposComprobante } from "@/lib/comprobanteOcr";

describe("extraerCamposComprobante", () => {
  it("extrae los 5 campos de un texto OCR limpio", () => {
    const texto = `
      R.U.C. N° 20100028698
      COMPROBANTE DE ENTREGA
      900 N°  0055914
      Orden de compra: contado
      Pedido de venta: 4002488968
      Comprobante de pago: 01-F002-0038612
      Código Cliente: 1621512
      Entrega de Salida: 6005558658
    `;
    expect(extraerCamposComprobante(texto)).toEqual({
      numeroComprobante: "0055914",
      pedidoVenta: "4002488968",
      ob: "6005558658",
      codigoCliente: "1621512",
      comprobantePago: "01-F002-0038612",
    });
  });

  it("tolera ruido de OCR (espaciado irregular, sin dos puntos, minúsculas)", () => {
    const texto = `
      900N° 0099821
      pedido de venta 4002500123
      codigo cliente  1998765
      entrega de salida  6005599999
      comprobante de pago 02-B011-0012345
    `;
    expect(extraerCamposComprobante(texto)).toEqual({
      numeroComprobante: "0099821",
      pedidoVenta: "4002500123",
      ob: "6005599999",
      codigoCliente: "1998765",
      comprobantePago: "02-B011-0012345",
    });
  });

  it("devuelve null en los campos que no logra reconocer", () => {
    const resultado = extraerCamposComprobante("texto ilegible sin ningún campo reconocible");
    expect(resultado).toEqual({
      numeroComprobante: null,
      pedidoVenta: null,
      ob: null,
      codigoCliente: null,
      comprobantePago: null,
    });
  });
});
