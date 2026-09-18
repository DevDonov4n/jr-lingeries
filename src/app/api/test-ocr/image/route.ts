import { NextRequest, NextResponse } from "next/server";
import {
  downloadAndPreprocessImage,
  preprocessProductRegion,
} from "@/lib/ocr";

export async function GET(request: NextRequest) {
  try {
    const imageUrl =
      request.nextUrl.searchParams.get("imageUrl")?.trim() ?? "";
    const modeParam = request.nextUrl.searchParams.get("mode") ?? "aggressive";

    const regionMode =
      modeParam === "name" ||
      modeParam === "price" ||
      modeParam === "quantity"
        ? modeParam
        : null;

    const mode =
      modeParam === "original" ||
      modeParam === "aggressive" ||
      modeParam === "current" ||
      modeParam === "label"
        ? modeParam
        : "aggressive";

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Informe a URL da imagem." },
        { status: 400 },
      );
    }

    if (regionMode) {
      const processedRegion = await preprocessProductRegion(
        imageUrl,
        regionMode,
      );

      return new NextResponse(processedRegion, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Não foi possível baixar a imagem. Status: ${response.status}`,
        },
        { status: 502 },
      );
    }

    const originalBuffer = await response.arrayBuffer();
    const processedBuffer = await downloadAndPreprocessImage(
      imageUrl,
      mode === "original" ? undefined : mode,
    );

    return new NextResponse(
      mode === "original" ? Buffer.from(originalBuffer) : processedBuffer,
      {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Erro ao gerar imagem de teste do OCR:", error);

    return NextResponse.json(
      { error: "Não foi possível gerar a imagem de teste." },
      { status: 500 },
    );
  }
}
