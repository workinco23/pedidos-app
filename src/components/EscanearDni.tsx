"use client";

import { useRef, useState } from "react";
import { IconoCamara } from "@/components/ComercialIcons";
import { extraerCamposDni, type CamposDni } from "@/lib/dniOcr";

export function EscanearDni({ onExtraido }: { onExtraido: (campos: CamposDni) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alSeleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setLeyendo(true);
    setError(null);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("spa");
      try {
        const { data } = await worker.recognize(archivo);
        onExtraido(extraerCamposDni(data.text));
      } finally {
        await worker.terminate();
      }
    } catch {
      setError("No se pudo leer el DNI. Ingresa el número a mano.");
    } finally {
      setLeyendo(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={alSeleccionarArchivo}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={leyendo}
        className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        title="Escanear el carnet de DNI con la cámara"
      >
        <IconoCamara /> {leyendo ? "Leyendo..." : "Escanear DNI"}
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </span>
  );
}
