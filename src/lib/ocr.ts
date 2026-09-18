import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

type OcrMode = undefined | "current" | "aggressive";

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

export async function extractTextFromImage(
  imageUrl: string,
  mode: OcrMode = "current",
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

  const image = sharp(Buffer.from(imageBuffer));

  let processedImage: Buffer;

  if (mode === undefined) {
    processedImage = await image.png().toBuffer();
  } else if (mode === "aggressive") {
    processedImage = await image
      .resize({ width: 2400 })
      .grayscale()
      .normalize()
      .linear(1.8, -90)
      .sharpen()
      .png()
      .toBuffer();
  } else {
    processedImage = await image
      .resize({ width: 1800 })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();
  }

  console.log(
    `[OCR] Imagem processada (${mode ?? "original"}):`,
    Math.round(processedImage.byteLength / 1024),
    "KB",
  );

  const worker = await getWorker();

  console.log(`[OCR] Iniciando reconhecimento (${mode ?? "original"})...`);

  const result = await worker.recognize(processedImage);

  console.log(
    `[OCR] Reconhecimento concluído (${mode ?? "original"}).`,
  );

  return result.data.text.trim();
}
