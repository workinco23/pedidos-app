export interface ConsultaDniResultado {
  nombreCompleto: string;
}

/**
 * Consulta el nombre asociado a un DNI probando dos proveedores en cascada:
 * primero Decolecta (SUNAT_API_URL, ya usado para RUC), y si no está
 * configurado o falla, APIsPerú (APISPERU_DNI_TOKEN, plan gratuito).
 */
export async function consultarNombrePorDni(dni: string): Promise<ConsultaDniResultado> {
  const limpio = dni.trim();
  if (!/^\d{8}$/.test(limpio)) {
    throw new Error("DNI inválido: debe tener 8 dígitos");
  }

  const decolectaUrl = process.env.SUNAT_API_URL;
  if (decolectaUrl) {
    try {
      const res = await fetch(`${decolectaUrl}/reniec/dni?numero=${limpio}`, {
        headers: { Authorization: `Bearer ${process.env.SUNAT_API_TOKEN}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.full_name) return { nombreCompleto: data.full_name };
      }
    } catch {
      // Sigue al siguiente proveedor
    }
  }

  const apisperuToken = process.env.APISPERU_DNI_TOKEN;
  if (apisperuToken) {
    const res = await fetch(
      `https://dniruc.apisperu.com/api/v1/dni/${limpio}?token=${apisperuToken}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.nombres) {
        const nombreCompleto = [data.nombres, data.apellidoPaterno, data.apellidoMaterno]
          .filter(Boolean)
          .join(" ");
        return { nombreCompleto };
      }
    }
  }

  throw new Error(`No se encontró información para el DNI ${limpio}`);
}
