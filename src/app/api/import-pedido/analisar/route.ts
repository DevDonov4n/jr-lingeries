import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { extractProductFieldsFromImage } from "@/lib/ocr";

export const runtime = "nodejs";

type Input = {
  sku?: string;
  imageUrl?: string;
};

type Analysis = {
  name: string;
  description: string;
  size: string;
  color: string;
  category: string;
  costPrice?: number;
  salePrice?: number;
};

function parsePrice(value: string) {
  const match = value
    .replace(/\s/g, "")
    .match(/(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})/);

  if (!match) return 0;

  const normalized = match[1].includes(",")
    ? match[1].replace(/\./g, "").replace(",", ".")
    : match[1];

  const price = Number(normalized);
  return Number.isFinite(price) ? price : 0;
}

function cleanOcrText(value: string) {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "PATROA") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Input;
    const sku = body.sku?.trim();
    const imageUrl = body.imageUrl?.trim();

    if (!sku || !imageUrl) {
      return NextResponse.json(
        { error: "SKU e imagem são obrigatórios." },
        { status: 400 },
      );
    }

    const existing = await prisma.products.findUnique({
      where: { sku },
      include: {
        categories: {
          select: { id: true, name: true },
        },
      },
    });

    const categories = await prisma.categories.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const serializedCategories = categories.map((category) => ({
      id: category.id.toString(),
      name: category.name,
    }));

    if (existing) {
      return NextResponse.json({
        sku,
        status: "EXISTENTE",
        existing: {
          id: existing.id.toString(),
          name: existing.name,
          description: existing.description,
          size: existing.size,
          color: existing.color,
          costPrice: Number(existing.cost_price),
          salePrice: Number(existing.sale_price),
          stockQuantity: existing.stock_quantity,
          categoryId: existing.category_id?.toString() ?? null,
          category: existing.categories?.name ?? null,
          imageUrl: existing.image_url,
        },
        analysis: null,
        categories: serializedCategories,
      });
    }

    console.log("[import-pedido/analisar] Iniciando OCR:", sku);

    const fields = await extractProductFieldsFromImage(imageUrl);

    const name = cleanOcrText(fields.name);
    const description = cleanOcrText(fields.quantity);
    const costPrice = parsePrice(fields.price);

    console.log("[import-pedido/analisar] OCR concluído:", sku);

    const analysis: Analysis = {
      name: name || `Produto ${sku}`,
      description,
      size: "",
      color: "",
      category: "",
      costPrice,
      salePrice: 0,
    };

    return NextResponse.json({
      sku,
      status: "NOVO",
      existing: null,
      analysis,
      categories: serializedCategories,
      ocr: {
        name: fields.name,
        description: fields.quantity,
        price: fields.price,
      },
    });
  } catch (error) {
    console.error("[import-pedido/analisar]", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível analisar o produto com OCR.",
      },
      { status: 502 },
    );
  }
}
