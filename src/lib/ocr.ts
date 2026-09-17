import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("por");
  }

  return workerPromise;
}

export async function extractTextFromImage(imageUrl: string) {
  const worker = await getWorker();
  const result = await worker.recognize(imageUrl);

  return result.data.text.trim();
}
