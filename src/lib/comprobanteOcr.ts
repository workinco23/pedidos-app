export interface CamposComprobante {
  numeroComprobante: string | null;
  pedidoVenta: string | null;
  ob: string | null;
  codigoCliente: string | null;
  comprobantePago: string | null;
}

function buscar(texto: string, patrones: RegExp[]): string | null {
  for (const patron of patrones) {
    const m = texto.match(patron);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

/**
 * Extrae los campos del recuadro "Comprobante de Entrega" a partir del texto
 * crudo que devuelve el OCR. Tolerante a ruido típico de impresora
 * matricial: variantes de "N°", espacios extra, mayúsculas/minúsculas.
 */
export function extraerCamposComprobante(textoOcr: string): CamposComprobante {
  const texto = textoOcr.replace(/\r/g, "");

  return {
    numeroComprobante: buscar(texto, [
      /900\s*N[°ºo]?\.?\s*[:\-]?\s*(\d{4,10})/i,
      /comprobante\s*de\s*entrega[^\d]{0,20}?(\d{5,10})/i,
    ]),
    pedidoVenta: buscar(texto, [/pedido\s*d?e?\s*venta\s*[:\-]?\s*(\d{6,12})/i]),
    ob: buscar(texto, [/entrega\s*d?e?\s*salida\s*[:\-]?\s*(\d{4,12})/i]),
    codigoCliente: buscar(texto, [/c[oó0]digo\s*cliente\s*[:\-]?\s*(\d{4,12})/i]),
    comprobantePago: buscar(texto, [
      /comprobante\s*d?e?\s*pago\s*[:\-]?\s*(\d{1,3}-?[A-Z]{1,4}\d{2,4}-?\d{4,10})/i,
      /comprobante\s*d?e?\s*pago\s*[:\-]?\s*([\w-]{5,20})/i,
    ]),
  };
}
