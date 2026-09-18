import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Informe a URL da imagem." },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      [undefined, "current", "aggressive"].map((mode) =>
        extractTextFromImage(imageUrl, mode),
      ),
    );

    return NextResponse.json({
      original: results[0],
      current: results[1],
      aggressive: results[2],
    });
  } catch (error) {
    console.error("Erro no teste de OCR:", error);

    return NextResponse.json(
      { error: "Não foi possível processar a imagem com OCR." },
      { status: 500 },
    );
  }
}
