import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

type VariantInput = { color: string; quantity: number };

type Input =
  | { action: "estoque"; sku: string; variants: VariantInput[] }
  | {
      action: "cadastrar";
      sku: string;
      name: string;
      description?: string;
      size?: string;
      categoryId?: string;
      costPrice?: number;
      salePrice?: number;
      quantity: number;
      imageUrl: string;
      variants: VariantInput[];
    };

export const runtime = "nodejs";

function validateVariants(variants: VariantInput[], expectedQuantity: number) {
  if (!Array.isArray(variants) || variants.length === 0) throw new Error("Informe pelo menos uma variante de cor.");

  const normalized = variants.map((variant) => ({
    color: String(variant.color ?? "").trim(),
    quantity: Number(variant.quantity),
  }));

  for (const variant of normalized) {
    if (!variant.color || variant.color.length > 50) throw new Error("Cada variante precisa de uma cor entre 1 e 50 caracteres.");
    if (!Number.isInteger(variant.quantity) || variant.quantity <= 0) throw new Error("A quantidade da cor " + variant.color + " deve ser um inteiro positivo.");
  }

  const colorKeys = normalized.map((variant) => variant.color.toLocaleLowerCase("pt-BR"));
  if (new Set(colorKeys).size !== colorKeys.length) throw new Error("Não é possível repetir a mesma cor no mesmo produto.");

  const total = normalized.reduce((sum, variant) => sum + variant.quantity, 0);
  if (total !== expectedQuantity) throw new Error("As quantidades das cores devem somar exatamente " + expectedQuantity + " unidade(s).");

  return normalized;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body = (await request.json()) as Input;
    const sku = body.sku?.trim();
    if (!sku) return NextResponse.json({ error: "SKU obrigatório." }, { status: 400 });

    if (body.action === "estoque") {
      const product = await prisma.products.findUnique({ where: { sku } });
      if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });

      const incomingTotal = body.variants.reduce((sum, variant) => sum + Number(variant.quantity), 0);
      const variants = validateVariants(body.variants, incomingTotal);

      const result = await prisma.$transaction(async (tx) => {
        for (const variant of variants) {
          const existingVariant = await tx.product_variants.findFirst({
            where: { product_id: product.id, color: variant.color },
          });

          if (existingVariant) {
            await tx.product_variants.update({
              where: { id: existingVariant.id },
              data: {
                stock_quantity: existingVariant.stock_quantity + variant.quantity,
                active: true,
                updated_at: new Date(),
              },
            });
          } else {
            await tx.product_variants.create({
              data: {
                product_id: product.id,
                color: variant.color,
                color_hex: "#d2a58a",
                stock_quantity: variant.quantity,
                active: true,
                updated_at: new Date(),
              },
            });
          }
        }

        const previousStock = product.stock_quantity;
        const currentStock = previousStock + incomingTotal;

        await tx.products.update({
          where: { id: product.id },
          data: { stock_quantity: currentStock, updated_at: new Date() },
        });

        await tx.inventory_movements.create({
          data: {
            product_id: product.id,
            type: "ENTRADA",
            quantity: incomingTotal,
            previous_stock: previousStock,
            current_stock: currentStock,
            reason: "Importação de pedido da Morena Lingerie por variantes de cor",
          },
        });

        return currentStock;
      });

      return NextResponse.json({ success: true, action: "estoque", sku, stockQuantity: result });
    }

    if (!body.name?.trim() || !body.imageUrl?.trim()) {
      return NextResponse.json({ error: "Nome e imagem são obrigatórios para o cadastro." }, { status: 400 });
    }
    if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
      return NextResponse.json({ error: "A quantidade deve ser um número inteiro positivo." }, { status: 400 });
    }

    const variants = validateVariants(body.variants, body.quantity);
    const existing = await prisma.products.findUnique({ where: { sku } });
    if (existing) return NextResponse.json({ error: "Este SKU já foi cadastrado. Atualize o estoque pela opção de produto existente." }, { status: 409 });

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
          color: variants[0]?.color ?? null,
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

      for (const variant of variants) {
        await tx.product_variants.create({
          data: {
            product_id: product.id,
            color: variant.color,
            color_hex: "#d2a58a",
            stock_quantity: variant.quantity,
            active: true,
            updated_at: new Date(),
          },
        });
      }

      await tx.inventory_movements.create({
        data: {
          product_id: product.id,
          type: "ENTRADA",
          quantity: body.quantity,
          previous_stock: 0,
          current_stock: body.quantity,
          reason: "Cadastro por importação de pedido da Morena Lingerie com variantes de cor",
        },
      });

      return product;
    });

    return NextResponse.json({ success: true, action: "cadastrar", sku, productId: created.id.toString(), stockQuantity: created.stock_quantity });
  } catch (error) {
    console.error("[import-pedido/acao]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível concluir a ação." },
      { status: 500 },
    );
  }
}
