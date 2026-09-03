export interface CamposDni {
  dni: string | null;
  nombreCompleto: string | null;
}

const ETIQUETAS = /^(APELLIDO|PRE\s*NOMBRE|NOMBRE|SEXO|FECHA|ESTADO|NACIONALIDAD|DNI)/i;

function lineaSiguienteA(lineas: string[], patronEtiqueta: RegExp): string | null {
  const idx = lineas.findIndex((l) => patronEtiqueta.test(l));
  if (idx === -1) return null;
  for (let i = idx + 1; i < lineas.length; i++) {
    const candidata = lineas[i].trim();
    if (candidata.length === 0) continue;
    if (ETIQUETAS.test(candidata)) return null;
    if (/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ\s.'-]{1,39}$/.test(candidata)) return candidata;
    return null;
  }
  return null;
}

/**
 * Extrae el número de DNI y el nombre completo a partir del texto OCR del
 * carnet físico (frente). Si no logra leer los tres campos de nombre, no
 * arma un nombreCompleto parcial: se prefiere dejarlo en null para que la
 * app recurra a la consulta por API en vez de guardar un nombre incompleto.
 */
export function extraerCamposDni(textoOcr: string): CamposDni {
  const lineas = textoOcr
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim().toUpperCase());

  const dniMatch = textoOcr.match(/\b(\d{8})\b/);

  const apellidoPaterno = lineaSiguienteA(lineas, /APELLIDO\s*PATERNO/i);
  const apellidoMaterno = lineaSiguienteA(lineas, /APELLIDO\s*MATERNO/i);
  const nombres = lineaSiguienteA(lineas, /PRE\s*NOMBRES|^NOMBRES/i);

  const nombreCompleto =
    apellidoPaterno && apellidoMaterno && nombres
      ? [nombres, apellidoPaterno, apellidoMaterno].join(" ")
      : null;

  return {
    dni: dniMatch ? dniMatch[1] : null,
    nombreCompleto,
  };
}
