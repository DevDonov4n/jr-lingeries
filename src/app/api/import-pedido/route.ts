import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchMorenaPedido } from "@/lib/morena";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { cpf?: string; pedido?: string };
    const cpf = body.cpf?.trim();
    const pedido = body.pedido?.trim();

    if (!cpf || !pedido) {
      return NextResponse.json({ error: "Informe o CPF e o número do pedido." }, { status: 400 });
    }
    if (!/^\d{11}$/.test(cpf.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Informe um CPF válido com 11 dígitos." }, { status: 400 });
    }
    if (!/^\d+$/.test(pedido)) {
      return NextResponse.json({ error: "O número do pedido deve conter apenas números." }, { status: 400 });
    }

    const result = await fetchMorenaPedido(cpf, pedido);
    const skus = result.products.map((product) => product.sku);
    const [existingProducts, categories] = await Promise.all([
      prisma.products.findMany({
        where: { sku: { in: skus } },
        include: { categories: { select: { id: true, name: true } } },
      }),
      prisma.categories.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    const existingBySku = new Map(existingProducts.map((product) => [product.sku, product]));
    const products = result.products.map((product) => {
      const existing = existingBySku.get(product.sku);
      return {
        ...product,
        status: existing ? "EXISTENTE" : "NOVO",
        existing: existing
          ? {
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
            }
          : null,
      };
    });

    const serializedCategories = categories.map((category) => ({
      id: category.id.toString(),
      name: category.name,
    }));

    return NextResponse.json({
      pedido: result.pedido,
      cadastroId: result.cadastroId,
      total: result.total,
      products,
      categories: serializedCategories,
    });
  } catch (error) {
    console.error("[import-pedido]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível consultar o pedido na Morena Lingerie." },
      { status: 502 },
    );
  }
}
