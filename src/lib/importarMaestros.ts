import { read, utils } from "xlsx";
import { z } from "zod";

export interface FilaClienteImportada {
  ruc_dni: string;
  bp: string | null;
  razon_social: string;
  datos_adicionales: Record<string, unknown>;
}

export interface FilaCarteraImportada {
  bp: string;
  vendedor_nombre: string;
  datos_adicionales: Record<string, unknown>;
}

export interface ResultadoImportacion<T> {
  filas: T[];
  errores: string[];
}

const COLUMNAS_RUC = ["CustomerDocumentNumberRUC", "RUC", "Ruc"];
const COLUMNAS_DNI = ["CustomerDocumentNumberDNI", "DNI", "Dni"];
const COLUMNAS_BP = ["CustomerS4ID", "BP", "Bp"];
const COLUMNAS_RAZON_SOCIAL = [
  "CustomerName",
  "CustomerFullName",
  "RazonSocial",
  "Razon Social",
  "Nombre",
  "Name",
];
const COLUMNAS_VENDEDOR = ["EmployeeFullName", "Vendedor", "VendedorNombre"];

function leerFilas(buffer: ArrayBuffer): Record<string, unknown>[] {
  const libro = read(buffer, { type: "array" });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  return utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: null });
}

function valorColumna(fila: Record<string, unknown>, candidatos: string[]): string | null {
  for (const candidato of candidatos) {
    const valor = fila[candidato];
    if (valor !== null && valor !== undefined && String(valor).trim() !== "") {
      return String(valor).trim();
    }
  }
  return null;
}

function datosRestantes(
  fila: Record<string, unknown>,
  usadas: string[]
): Record<string, unknown> {
  const restante: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(fila)) {
    if (!usadas.includes(clave)) restante[clave] = valor;
  }
  return restante;
}

const filaClienteSchema = z.object({
  ruc_dni: z.string().min(1),
  razon_social: z.string().min(1),
});

export function parsearMaestroClientes(
  buffer: ArrayBuffer
): ResultadoImportacion<FilaClienteImportada> {
  const filas: FilaClienteImportada[] = [];
  const errores: string[] = [];

  leerFilas(buffer).forEach((fila, indice) => {
    const rucDni = valorColumna(fila, COLUMNAS_RUC) ?? valorColumna(fila, COLUMNAS_DNI);
    const bp = valorColumna(fila, COLUMNAS_BP);
    const razonSocial = valorColumna(fila, COLUMNAS_RAZON_SOCIAL) ?? "";

    const parseo = filaClienteSchema.safeParse({ ruc_dni: rucDni, razon_social: razonSocial });
    if (!parseo.success) {
      errores.push(`Fila ${indice + 2}: falta RUC/DNI o razón social`);
      return;
    }

    filas.push({
      ruc_dni: parseo.data.ruc_dni,
      bp,
      razon_social: parseo.data.razon_social,
      datos_adicionales: datosRestantes(fila, [
        ...COLUMNAS_RUC,
        ...COLUMNAS_DNI,
        ...COLUMNAS_BP,
        ...COLUMNAS_RAZON_SOCIAL,
      ]),
    });
  });

  return { filas, errores };
}

const filaCarteraSchema = z.object({
  bp: z.string().min(1),
  vendedor_nombre: z.string().min(1),
});

export function parsearCartera(
  buffer: ArrayBuffer
): ResultadoImportacion<FilaCarteraImportada> {
  const filas: FilaCarteraImportada[] = [];
  const errores: string[] = [];

  leerFilas(buffer).forEach((fila, indice) => {
    const bp = valorColumna(fila, COLUMNAS_BP);
    const vendedor = valorColumna(fila, COLUMNAS_VENDEDOR);

    const parseo = filaCarteraSchema.safeParse({ bp, vendedor_nombre: vendedor });
    if (!parseo.success) {
      errores.push(`Fila ${indice + 2}: falta BP o nombre de vendedor`);
      return;
    }

    filas.push({
      bp: parseo.data.bp,
      vendedor_nombre: parseo.data.vendedor_nombre,
      datos_adicionales: datosRestantes(fila, [...COLUMNAS_BP, ...COLUMNAS_VENDEDOR]),
    });
  });

  return { filas, errores };
}
