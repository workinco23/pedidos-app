export interface ConsultaDocumentoResultado {
  razonSocial: string;
  documento: string;
}

/**
 * Consulta RUC/DNI. Si SUNAT_API_URL está configurada, llama al servicio real
 * (formato Decolecta: /sunat/ruc?numero=... y /reniec/dni?numero=...);
 * si no, devuelve un mock determinístico útil para desarrollo sin credenciales.
 */
export async function consultarDocumento(
  documento: string
): Promise<ConsultaDocumentoResultado> {
  const limpio = documento.trim();
  const esDni = /^\d{8}$/.test(limpio);
  const esRuc = /^\d{11}$/.test(limpio);

  if (!esDni && !esRuc) {
    throw new Error("Documento inválido: debe ser DNI (8 dígitos) o RUC (11 dígitos)");
  }

  const apiUrl = process.env.SUNAT_API_URL;
  if (apiUrl) {
    const recurso = esRuc ? "sunat/ruc" : "reniec/dni";
    const res = await fetch(`${apiUrl}/${recurso}?numero=${limpio}`, {
      headers: { Authorization: `Bearer ${process.env.SUNAT_API_TOKEN}` },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`No se encontró información para el documento ${limpio}`);
      }
      throw new Error("No se pudo consultar el documento (servicio externo)");
    }

    const data = await res.json();
    const razonSocial = esRuc ? data.razon_social : data.full_name;
    if (!razonSocial) {
      throw new Error("El servicio de consulta no devolvió razón social/nombre");
    }
    return { razonSocial, documento: limpio };
  }

  return {
    razonSocial: mockRazonSocial(limpio, esRuc),
    documento: limpio,
  };
}

function mockRazonSocial(documento: string, esRuc: boolean): string {
  const sufijo = documento.slice(-4);
  return esRuc ? `EMPRESA DEMO ${sufijo} S.A.C.` : `CLIENTE DEMO ${sufijo}`;
}
