import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

type OcrMode = undefined | "current" | "aggressive" | "label";

export type OcrPsm = 3 | 6 | 7 | 11 | 12;

export interface OcrProductFields {
  name: string;
  price: string;
  quantity: string;
  sku: string;
}

export type OcrProductRegion = "name" | "price" | "quantity";

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
  const input = Buffer.from(imageBuffer);
  const image = sharp(input);

  if (mode === undefined) {
    return image.png().toBuffer();
  }

  if (mode === "label") {
    const metadata = await image.metadata();
    const width = metadata.width ?? 600;
    const height = metadata.height ?? 900;

    const left = Math.round(width * 0.45);
    const top = Math.round(height * 0.69);
    const cropWidth = Math.min(width - left, Math.round(width * 0.55));
    const cropHeight = Math.min(height - top, Math.round(height * 0.31));

    console.log(
      "[OCR] Recortando etiqueta:",
      JSON.stringify({ left, top, cropWidth, cropHeight }),
    );

    return image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize({ width: 2400 })
      .grayscale()
      .normalize()
      .linear(1.8, -90)
      .sharpen()
      .png()
      .toBuffer();
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

async function getProductRegionBounds(
  imageBuffer: Buffer,
  region: OcrProductRegion,
) {
  const metadata = await sharp(imageBuffer).metadata();

  const imageWidth = metadata.width ?? 600;
  const imageHeight = metadata.height ?? 900;

  const labelLeft = Math.round(imageWidth * 0.45);
  const labelTop = Math.round(imageHeight * 0.69);
  const labelWidth = Math.min(
    imageWidth - labelLeft,
    Math.round(imageWidth * 0.55),
  );
  const labelHeight = Math.min(
    imageHeight - labelTop,
    Math.round(imageHeight * 0.31),
  );

  if (region === "name") {
    return {
      left: labelLeft,
      top: labelTop,
      width: labelWidth,
      height: Math.round(labelHeight * 0.30),
    };
  }

  if (region === "price") {
    return {
      left: labelLeft,
      top: labelTop + Math.round(labelHeight * 0.24),
      width: Math.round(labelWidth * 0.55),
      height: Math.round(labelHeight * 0.25),
    };
  }

  return {
    left: labelLeft + Math.round(labelWidth * 0.48),
    top: labelTop + Math.round(labelHeight * 0.27),
    width: Math.round(labelWidth * 0.52),
    height: Math.round(labelHeight * 0.25),
  };
}

async function preprocessLabelRegion(
  imageBuffer: Buffer,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const imageWidth = metadata.width ?? 600;
  const imageHeight = metadata.height ?? 900;

  const safeLeft = Math.max(0, Math.min(left, imageWidth - 1));
  const safeTop = Math.max(0, Math.min(top, imageHeight - 1));
  const safeWidth = Math.max(1, Math.min(width, imageWidth - safeLeft));
  const safeHeight = Math.max(1, Math.min(height, imageHeight - safeTop));

  console.log(
    "[OCR] Recorte seguro:",
    JSON.stringify({
      left: safeLeft,
      top: safeTop,
      width: safeWidth,
      height: safeHeight,
    }),
  );

  return image
    .extract({
      left: safeLeft,
      top: safeTop,
      width: safeWidth,
      height: safeHeight,
    })
    .resize({ width: 1800 })
    .grayscale()
    .normalize()
    .linear(1.6, -70)
    .sharpen()
    .png()
    .toBuffer();
}

export async function preprocessProductRegion(
  imageUrl: string,
  region: OcrProductRegion,
) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar a imagem. Status: ${response.status}`,
    );
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const bounds = await getProductRegionBounds(imageBuffer, region);

  console.log(
    "[OCR] Visualizando região:",
    JSON.stringify({ region, ...bounds }),
  );

  return preprocessLabelRegion(
    imageBuffer,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
  );
}

async function recognizeRegion(
  worker: Awaited<ReturnType<typeof getWorker>>,
  image: Buffer,
  psm: OcrPsm,
  whitelist?: string,
) {
  const parameters: Record<string, string> = {
    tessedit_pageseg_mode: String(psm),
  };

  if (whitelist) {
    parameters.tessedit_char_whitelist = whitelist;
  }

  await worker.setParameters(parameters);

  const result = await worker.recognize(image);

  return result.data.text.trim();
}

export async function extractProductFieldsFromImage(
  imageUrl: string,
): Promise<OcrProductFields> {
  console.log("[OCR] Baixando imagem para extração por campos:", imageUrl);

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Não foi possível baixar a imagem. Status: ${response.status}`,
    );
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(imageBuffer).metadata();

  const imageWidth = metadata.width ?? 600;
  const imageHeight = metadata.height ?? 900;

  const labelLeft = Math.round(imageWidth * 0.45);
  const labelTop = Math.round(imageHeight * 0.69);
  const labelWidth = Math.min(
    imageWidth - labelLeft,
    Math.round(imageWidth * 0.55),
  );
  const labelHeight = Math.min(
    imageHeight - labelTop,
    Math.round(imageHeight * 0.31),
  );

  const worker = await getWorker();

  const nameImage = await preprocessLabelRegion(
    imageBuffer,
    labelLeft,
    labelTop,
    labelWidth,
    Math.round(labelHeight * 0.30),
  );

  const priceImage = await preprocessLabelRegion(
    imageBuffer,
    labelLeft,
    labelTop + Math.round(labelHeight * 0.24),
    Math.round(labelWidth * 0.55),
    Math.round(labelHeight * 0.25),
  );

  const quantityImage = await preprocessLabelRegion(
    imageBuffer,
    labelLeft + Math.round(labelWidth * 0.48),
    labelTop + Math.round(labelHeight * 0.27),
    Math.round(labelWidth * 0.52),
    Math.round(labelHeight * 0.25),
  );

  const skuMatch = imageUrl.match(/\/tags\/([^/?#]+)\.png(?:[?#].*)?$/i);
  const sku = skuMatch?.[1] ?? "";

  console.log("[OCR] Reconhecendo campo: nome");
  const name = await recognizeRegion(worker, nameImage, 6);

  console.log("[OCR] Reconhecendo campo: preço");
  const price = await recognizeRegion(
    worker,
    priceImage,
    7,
    "R$0123456789,.",
  );

  console.log("[OCR] Reconhecendo campo: quantidade");
  const quantity = await recognizeRegion(
    worker,
    quantityImage,
    6,
    "ContémPecapecA0123456789 ",
  );

  return {
    name,
    price,
    quantity,
    sku,
  };
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

  const result = await recognizeRegion(worker, processedImage, psm);

  console.log(
    `[OCR] Reconhecimento concluído (${mode ?? "original"}, PSM ${psm}).`,
  );

  return result;
}
