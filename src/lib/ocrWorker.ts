/**
 * Corre el OCR de Tesseract.js con un límite de tiempo. Por defecto,
 * Tesseract.js descarga su worker/motor WASM/datos de idioma desde un CDN
 * externo (jsdelivr) en cada llamada; en una red lenta o restringida esa
 * descarga puede quedarse colgada sin nunca resolver ni rechazar la
 * promesa, dejando la UI en "Leyendo..." para siempre. Por eso estos
 * archivos se sirven desde /public/tesseract (mismo origen que la app, sin
 * depender de un CDN externo) y además hay un timeout de respaldo que
 * garantiza que el usuario siempre reciba un resultado o un error.
 */
export async function reconocerTexto(archivo: File, timeoutMs = 25000): Promise<string> {
  const { createWorker } = await import("tesseract.js");

  let temporizador: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    temporizador = setTimeout(() => reject(new Error("TIMEOUT_OCR")), timeoutMs);
  });

  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  try {
    worker = await Promise.race([
      createWorker("spa", 1, {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract",
        langPath: "/tesseract",
        gzip: true,
      }),
      timeout,
    ]);
    const resultado = await Promise.race([worker.recognize(archivo), timeout]);
    return resultado.data.text;
  } finally {
    clearTimeout(temporizador!);
    if (worker) worker.terminate().catch(() => {});
  }
}
