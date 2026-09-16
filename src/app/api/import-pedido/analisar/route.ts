import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
};

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
      return NextResponse.json({ error: "SKU e imagem são obrigatórios." }, { status: 400 });
    }

    const existing = await prisma.products.findUnique({
      where: { sku },
      include: { categories: { select: { id: true, name: true } } },
    });

    const categories = await prisma.categories.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        sku,
        status: existing ? "EXISTENTE" : "NOVO",
        existing: existing
          ? {
              id: existing.id.toString(),
              name: existing.name,
              stockQuantity: existing.stock_quantity,
              imageUrl: existing.image_url,
              category: existing.categories?.name ?? null,
            }
          : null,
        analysis: null,
        categories,
        warning: "OPENAI_API_KEY não configurada. O produto foi verificado no banco, mas a análise automática da imagem não foi executada.",
      });
    }

    const imageResponse = await fetch(imageUrl, { cache: "no-store" });
    if (!imageResponse.ok) {
      throw new Error(`Não foi possível baixar a imagem do SKU ${sku}.`);
    }

    const contentType = imageResponse.headers.get("content-type") || "image/png";
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageData = `data:${contentType};base64,${imageBuffer.toString("base64")}`;

    const prompt = `Analise a imagem de um produto de lingerie para pré-preencher um cadastro de e-commerce brasileiro. Retorne somente JSON válido. Não invente detalhes que não estejam visíveis; quando não souber, use string vazia. O SKU informado é ${sku}. Categorias disponíveis: ${categories.map((category) => category.name).join(", ")}. Escolha exatamente uma categoria da lista quando houver correspondência, senão deixe vazia. Identifique nome comercial visível ou, se não houver, um nome descritivo curto. Tamanho e cor devem ser preenchidos somente quando houver evidência visual ou textual na imagem.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é um assistente de cadastro de produtos. Sua resposta deve ser JSON com as chaves name, description, size, color e category.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageData, detail: "high" } },
            ],
          },
        ],
      }),
    });

    const aiJson = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error("[import-pedido/analisar] OpenAI HTTP", aiResponse.status);
      throw new Error("A análise automática da imagem não pôde ser concluída.");
    }

    const rawContent = aiJson.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string") {
      throw new Error("A análise automática não retornou dados válidos.");
    }

    const parsed = JSON.parse(rawContent) as Partial<Analysis>;
    const analysis: Analysis = {
      name: parsed.name?.trim() || `Produto ${sku}`,
      description: parsed.description?.trim() || "",
      size: parsed.size?.trim() || "",
      color: parsed.color?.trim() || "",
      category: parsed.category?.trim() || "",
    };

    return NextResponse.json({
      sku,
      status: existing ? "EXISTENTE" : "NOVO",
      existing: existing
        ? {
            id: existing.id.toString(),
            name: existing.name,
            stockQuantity: existing.stock_quantity,
            imageUrl: existing.image_url,
            category: existing.categories?.name ?? null,
          }
        : null,
      analysis,
      categories,
    });
  } catch (error) {
    console.error("[import-pedido/analisar]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível analisar o produto." },
      { status: 502 },
    );
  }
}
