import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    console.log("[OCR] Inicializando worker...");

    const workerPath = path.join(
      process.cwd(),
      "node_modules",
      "tesseract.js",
      "src",
      "worker-script",
      "node",
      "index.js",
    );

    console.log("[OCR] Worker path:", workerPath);

    workerPromise = createWorker("por", 1, {
      workerPath,
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

  console.log("[OCR] Pré-processando imagem...");

  const processedImage = await sharp(Buffer.from(imageBuffer))
    .resize({ width: 1800 })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();

  console.log(
    "[OCR] Imagem pré-processada:",
    Math.round(processedImage.byteLength / 1024),
    "KB",
  );

  const worker = await getWorker();

  console.log("[OCR] Iniciando reconhecimento...");

  const result = await worker.recognize(processedImage);

  console.log("[OCR] Reconhecimento concluído.");

  return result.data.text.trim();
}
