import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";

type OcrMode = "original" | "current" | "aggressive";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    const mode: OcrMode =
      body.mode === "original" ||
      body.mode === "aggressive" ||
      body.mode === "current"
        ? body.mode
        : "current";

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Informe a URL da imagem." },
        { status: 400 },
      );
    }

    const ocrMode = mode === "original" ? undefined : mode;
    const text = await extractTextFromImage(imageUrl, ocrMode);

    return NextResponse.json({
      mode,
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
