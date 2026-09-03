import { describe, expect, it } from "vitest";
import { extraerCamposDni } from "@/lib/dniOcr";

describe("extraerCamposDni", () => {
  it("extrae DNI y nombre completo cuando los 3 campos son legibles", () => {
    const texto = `
      REPUBLICA DEL PERU
      DOCUMENTO NACIONAL DE IDENTIDAD
      DNI
      45678912
      APELLIDO PATERNO
      GARCIA
      APELLIDO MATERNO
      LOPEZ
      PRE NOMBRES
      JUAN CARLOS
    `;
    expect(extraerCamposDni(texto)).toEqual({
      dni: "45678912",
      nombreCompleto: "JUAN CARLOS GARCIA LOPEZ",
    });
  });

  it("extrae solo el DNI si no logra leer los apellidos/nombres", () => {
    const texto = "algo de ruido 45678912 más ruido ilegible";
    expect(extraerCamposDni(texto)).toEqual({
      dni: "45678912",
      nombreCompleto: null,
    });
  });

  it("devuelve todo null si no reconoce nada", () => {
    expect(extraerCamposDni("texto totalmente ilegible sin números")).toEqual({
      dni: null,
      nombreCompleto: null,
    });
  });
});
