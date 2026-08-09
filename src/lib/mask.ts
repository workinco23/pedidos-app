/** Enmascara un código mostrando 2 primeros caracteres, asteriscos y 3 últimos dígitos. Ej: OB12****890 */
export function enmascararCodigo(codigo: string): string {
  if (codigo.length <= 5) return codigo;
  const inicio = codigo.slice(0, 2);
  const fin = codigo.slice(-3);
  const asteriscos = "*".repeat(Math.max(codigo.length - 5, 4));
  return `${inicio}${asteriscos}${fin}`;
}

/** Enmascara mostrando 1 primer caracter, "x" y 2 últimos dígitos. Ej: 4xxxxxxx81 */
export function enmascararPedidoVenta(codigo: string): string {
  if (codigo.length <= 3) return codigo;
  const inicio = codigo.slice(0, 1);
  const fin = codigo.slice(-2);
  const equis = "x".repeat(Math.max(codigo.length - 3, 2));
  return `${inicio}${equis}${fin}`;
}
