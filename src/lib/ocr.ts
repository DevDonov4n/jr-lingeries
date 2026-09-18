import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

type OcrMode = undefined | "current" | "aggressive";

export type OcrPsm = 3 | 6 | 11 | 12;

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

export async function preprocessImage(
  imageBuffer: ArrayBuffer,
  mode: OcrMode,
) {
  const image = sharp(Buffer.from(imageBuffer));

  if (mode === undefined) {
    return image.png().toBuffer();
  }

  if (mode === "aggressive") {
    return image
      .resize({ width: 2400 })
      .grayscale()
      .normalize()
      .linear(1.8, -90)
      .sharpen()
      .png()
      .toBuffer();
  }

  return image
    .resize({ width: 1800 })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();
}

export async function downloadAndPreprocessImage(
  imageUrl: string,
  mode: OcrMode = "current",
) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar a imagem. Status: ${response.status}`,
    );
  }

  const imageBuffer = await response.arrayBuffer();

  return preprocessImage(imageBuffer, mode);
}

export async function extractTextFromImage(
  imageUrl: string,
  mode: OcrMode = "current",
  psm: OcrPsm = 6,
) {
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

  const processedImage = await preprocessImage(imageBuffer, mode);

  console.log(
    `[OCR] Imagem processada (${mode ?? "original"}):`,
    Math.round(processedImage.byteLength / 1024),
    "KB",
  );

  const worker = await getWorker();

  await worker.setParameters({
    tessedit_pageseg_mode: String(psm),
  });

  console.log(
    `[OCR] Iniciando reconhecimento (${mode ?? "original"}, PSM ${psm})...`,
  );

  const result = await worker.recognize(processedImage);

  console.log(
    `[OCR] Reconhecimento concluído (${mode ?? "original"}, PSM ${psm}).`,
  );

  return result.data.text.trim();
}
