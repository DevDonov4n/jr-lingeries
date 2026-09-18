import { NextRequest, NextResponse } from "next/server";
import {
  extractProductFieldsFromImage,
  extractTextFromImage,
  type OcrPsm,
} from "@/lib/ocr";

const VALID_PSM = new Set<OcrPsm>([3, 6, 7, 11, 12]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    const mode =
      body.mode === "original" ||
      body.mode === "aggressive" ||
      body.mode === "current" ||
      body.mode === "label" ||
      body.mode === "fields"
        ? body.mode
        : "current";

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Informe a URL da imagem." },
        { status: 400 },
      );
    }

    if (mode === "fields") {
      const fields = await extractProductFieldsFromImage(imageUrl);

      return NextResponse.json({
        mode,
        fields,
      });
    }

    const psmCandidate = Number(body.psm);
    const psm: OcrPsm = VALID_PSM.has(psmCandidate as OcrPsm)
      ? (psmCandidate as OcrPsm)
      : 6;

    const ocrMode = mode === "original" ? undefined : mode;
    const text = await extractTextFromImage(imageUrl, ocrMode, psm);

    return NextResponse.json({
      mode,
      psm,
      text,
    });
  } catch (error) {
    console.error("Erro no teste de OCR:", error);

    return NextResponse.json(
      { error: "Não foi possível processar a imagem com OCR." },
      { status: 500 },
    );
  }
}
