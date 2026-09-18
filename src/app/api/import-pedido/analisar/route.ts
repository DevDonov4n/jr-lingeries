import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type Input = { sku?: string; imageUrl?: string };

type Analysis = {
  name: string;
  description: string;
  size: string;
  color: string;
  category: string;
  costPrice: number;
  salePrice: number;
};

function parsePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = typeof value === "string" ? value : "";
  const match = text.replace(/\s/g, "").match(/(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})/);
  if (!match) return 0;
  const normalized = match[1].includes(",") ? match[1].replace(/\./g, "").replace(",", ".") : match[1];
  const price = Number(normalized);
  return Number.isFinite(price) ? price : 0;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function extractGeminiJson(text: string) {
  const cleaned = text.replace(/^\s*```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("O Gemini não retornou um JSON válido.");
  return JSON.parse(cleaned.slice(start, end + 1)) as Partial<Analysis>;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body = (await request.json()) as Input;
    const sku = body.sku?.trim();
    const imageUrl = body.imageUrl?.trim();
    if (!sku || !imageUrl) return NextResponse.json({ error: "SKU e imagem são obrigatórios." }, { status: 400 });

    const existing = await prisma.products.findUnique({
      where: { sku },
      include: { categories: { select: { id: true, name: true } } },
    });

    const categories = await prisma.categories.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    const serializedCategories = categories.map((category) => ({ id: category.id.toString(), name: category.name }));

    if (existing) {
      return NextResponse.json({
        sku, status: "EXISTENTE",
        existing: {
          id: existing.id.toString(), name: existing.name, description: existing.description,
          size: existing.size, color: existing.color, costPrice: Number(existing.cost_price),
          salePrice: Number(existing.sale_price), stockQuantity: existing.stock_quantity,
          categoryId: existing.category_id?.toString() ?? null, category: existing.categories?.name ?? null,
          imageUrl: existing.image_url,
        },
        analysis: null, categories: serializedCategories,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no ambiente.");

    const imageResponse = await fetch(imageUrl, { cache: "no-store" });
    if (!imageResponse.ok) throw new Error("Não foi possível baixar a imagem do SKU " + sku + ".");
    const contentType = imageResponse.headers.get("content-type") || "image/png";
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");
    const categoryNames = serializedCategories.map((category) => category.name);

    const prompt = [
      "Analise cuidadosamente a imagem de um produto de lingerie da Morena Lingerie para pré-preencher um cadastro de e-commerce brasileiro.",
      "",
      "Retorne SOMENTE um objeto JSON válido com exatamente estas chaves:",
      JSON.stringify({ name: "", description: "", size: "", color: "", category: "", costPrice: 0, salePrice: 0 }),
      "",
      "Regras:",
      "- Leia o texto da etiqueta com atenção.",
      "- name: use o nome comercial visível na etiqueta, preservando a grafia original quando possível.",
      '- description: use informações descritivas visíveis. Se aparecer "Contém 1 Peça", isso pertence à descrição/conteúdo da embalagem e NÃO representa a quantidade recebida.',
      "- size: informe somente se estiver claramente visível.",
      "- color: informe somente se estiver claramente visível; não deduza apenas pela aparência.",
      "- category: escolha exatamente uma categoria disponível quando houver correspondência clara; caso contrário, deixe vazio.",
      "- costPrice: extraia o preço visível como número decimal. Ex.: R$ 69,90 = 69.90.",
      "- salePrice: sempre 0; não invente preço de venda.",
      "- Não invente informações.",
      "- O SKU é " + sku + " e não precisa ser extraído.",
      "- A quantidade real do pedido não deve ser inferida da etiqueta.",
      "",
      "Categorias disponíveis: " + (categoryNames.join(", ") || "nenhuma") + ".",
    ].join("\n");

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: contentType, data: imageBase64 } }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
      },
    );

    const geminiJson = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error("[import-pedido/analisar] Gemini HTTP", geminiResponse.status);
      throw new Error("A análise da imagem pelo Gemini não pôde ser concluída.");
    }

    const rawContent = geminiJson.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";
    if (!rawContent) throw new Error("O Gemini não retornou dados para o produto.");
    const parsed = extractGeminiJson(rawContent);
    const category = cleanText(parsed.category);

    const analysis: Analysis = {
      name: cleanText(parsed.name) || "Produto " + sku,
      description: cleanText(parsed.description),
      size: cleanText(parsed.size),
      color: cleanText(parsed.color),
      category: categoryNames.includes(category) ? category : "",
      costPrice: parsePrice(parsed.costPrice),
      salePrice: 0,
    };

    return NextResponse.json({ sku, status: "NOVO", existing: null, analysis, categories: serializedCategories });
  } catch (error) {
    console.error("[import-pedido/analisar]", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível analisar o produto com Gemini.",
    }, { status: 502 });
  }
}