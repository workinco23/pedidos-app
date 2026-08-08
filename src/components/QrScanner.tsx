"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onResultado: (texto: string) => void;
  activo: boolean;
}

export function QrScanner({ onResultado, activo }: Props) {
  const contenedorId = "qr-scanner-region";
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activo) return;
    let cancelado = false;

    import("html5-qrcode").then(async ({ Html5Qrcode }) => {
      if (cancelado) return;
      setError(null);
      const scanner = new Html5Qrcode(contenedorId);
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const onFrame = (textoDecodificado: string) => onResultado(textoDecodificado);
      const onFrameError = () => {
        // ignorar frames sin QR detectado
      };

      // Se elige la cámara por deviceId (una sola vez) en vez de reintentar
      // con distintos constraints sobre el mismo scanner: reintentar un
      // start() fallido sin liberar el stream anterior puede dejar la
      // cámara "a medias" y provocar NotReadableError en el segundo intento.
      try {
        const camaras = await Html5Qrcode.getCameras();
        if (cancelado) return;
        if (camaras.length === 0) {
          throw new Error("No se encontró ninguna cámara disponible");
        }
        const trasera = camaras.find((c) => /back|rear|trasera|environment/i.test(c.label));
        await scanner.start((trasera ?? camaras[0]).id, config, onFrame, onFrameError);
      } catch (err) {
        if (!cancelado) {
          console.error("No se pudo iniciar la cámara", err);
          setError(
            "No se pudo acceder a la cámara. Cierra otras apps/pestañas que la estén usando (Zoom, Teams, Cámara de Windows, otra pestaña) y vuelve a intentar."
          );
        }
      }
    });

    return () => {
      cancelado = true;
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);

  if (!activo) return null;

  return (
    <div className="mx-auto w-full max-w-xs">
      <div
        id={contenedorId}
        className="aspect-square w-full overflow-hidden rounded-lg border border-slate-300"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
