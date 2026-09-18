import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    console.log("[OCR] Inicializando worker...");

    workerPromise = createWorker("por", 1, {
      workerPath: require.resolve("tesseract.js/src/worker-script/node/index.js"),
    });
  }

  return workerPromise;
}

export async function extractTextFromImage(imageUrl: string) {
  console.log("[OCR] Baixando imagem:", imageUrl);

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar a imagem. Status: ${response.status}`,
    );
  }

  const imageBuffer = await response.arrayBuffer();

  console.log(
    "[OCR] Imagem baixada:",
    Math.round(imageBuffer.byteLength / 1024),
    "KB",
  );

  const worker = await getWorker();

  console.log("[OCR] Iniciando reconhecimento...");

  const result = await worker.recognize(new Uint8Array(imageBuffer));

  console.log("[OCR] Reconhecimento concluído.");

  return result.data.text.trim();
}
