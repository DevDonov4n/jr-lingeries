import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Input =
  | { action: "estoque"; sku: string; quantity: number }
  | {
      action: "cadastrar";
      sku: string;
      name: string;
      description?: string;
      size?: string;
      color?: string;
      categoryId?: string;
      costPrice?: number;
      salePrice?: number;
      quantity: number;
      imageUrl: string;
    };

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Input;
    const sku = body.sku?.trim();
    if (!sku) return NextResponse.json({ error: "SKU obrigatório." }, { status: 400 });

    if (body.action === "estoque") {
      if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
        return NextResponse.json({ error: "A quantidade deve ser um número inteiro positivo." }, { status: 400 });
      }

      const product = await prisma.products.findUnique({ where: { sku } });
      if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });

      const result = await prisma.$transaction(async (tx) => {
        const previousStock = product.stock_quantity;
        const currentStock = previousStock + body.quantity;
        const updated = await tx.products.update({
          where: { id: product.id },
          data: { stock_quantity: currentStock, updated_at: new Date() },
        });
        await tx.inventory_movements.create({
          data: {
            product_id: product.id,
            type: "ENTRADA",
            quantity: body.quantity,
            previous_stock: previousStock,
            current_stock: currentStock,
            reason: "Importação de pedido da Morena Lingerie",
          },
        });
        return updated;
      });

      return NextResponse.json({
        success: true,
        action: "estoque",
        sku,
        stockQuantity: result.stock_quantity,
      });
    }

    if (!body.name?.trim() || !body.imageUrl?.trim()) {
      return NextResponse.json({ error: "Nome e imagem são obrigatórios para o cadastro." }, { status: 400 });
    }
    if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
      return NextResponse.json({ error: "A quantidade deve ser um número inteiro positivo." }, { status: 400 });
    }

    const existing = await prisma.products.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ error: "Este SKU já foi cadastrado. Atualize o estoque pela opção de produto existente." }, { status: 409 });
    }

    const categoryId = body.categoryId?.trim() ? BigInt(body.categoryId) : null;
    if (categoryId) {
      const category = await prisma.categories.findUnique({ where: { id: categoryId } });
      if (!category) return NextResponse.json({ error: "Categoria selecionada não existe." }, { status: 400 });
    }

    const costPrice = Number.isFinite(body.costPrice) && Number(body.costPrice) >= 0 ? Number(body.costPrice) : 0;
    const salePrice = Number.isFinite(body.salePrice) && Number(body.salePrice) >= 0 ? Number(body.salePrice) : 0;

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.products.create({
        data: {
          sku,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          size: body.size?.trim() || null,
          color: body.color?.trim() || null,
          category_id: categoryId,
          cost_price: costPrice,
          sale_price: salePrice,
          stock_quantity: body.quantity,
          minimum_stock: 0,
          image_url: body.imageUrl.trim(),
          active: true,
          updated_at: new Date(),
        },
      });

      await tx.inventory_movements.create({
        data: {
          product_id: product.id,
          type: "ENTRADA",
          quantity: body.quantity,
          previous_stock: 0,
          current_stock: body.quantity,
          reason: "Cadastro por importação de pedido da Morena Lingerie",
        },
      });

      return product;
    });

    return NextResponse.json({
      success: true,
      action: "cadastrar",
      sku,
      productId: created.id.toString(),
      stockQuantity: created.stock_quantity,
    });
  } catch (error) {
    console.error("[import-pedido/acao]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível concluir a ação." },
      { status: 500 },
    );
  }
}
