"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function assertPatroa() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") throw new Error("Não autorizado.");
  return session;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function decimal(formData: FormData, key: string) {
  const value = text(formData, key).replace(",", ".");
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`Valor inválido para ${key}.`);
  return value || "0";
}

function nonNegativeInt(formData: FormData, key: string) {
  const value = Number(text(formData, key));
  if (!Number.isInteger(value) || value < 0) throw new Error(`Valor inválido para ${key}.`);
  return value;
}

function optionalBigInt(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value || value.startsWith("fallback-")) return null;
  try {
    return BigInt(value);
  } catch {
    throw new Error("Categoria inválida.");
  }
}

function revalidateProducts() {
  revalidatePath("/patroa");
  revalidatePath("/produtos");
}

export async function createProduct(formData: FormData) {
  await assertPatroa();

  const name = text(formData, "name");
  if (!name) throw new Error("Informe o nome do produto.");

  const stock = nonNegativeInt(formData, "stock_quantity");
  const categoryId = optionalBigInt(formData, "category_id");

  const product = await prisma.products.create({
    data: {
      name,
      category_id: categoryId,
      description: text(formData, "description") || null,
      sku: text(formData, "sku") || null,
      size: text(formData, "size") || null,
      color: text(formData, "color") || null,
      cost_price: decimal(formData, "cost_price"),
      sale_price: decimal(formData, "sale_price"),
      stock_quantity: stock,
      minimum_stock: nonNegativeInt(formData, "minimum_stock"),
      image_url: text(formData, "image_url") || null,
      active: true,
    },
  });

  if (stock > 0) {
    await prisma.inventory_movements.create({
      data: {
        product_id: product.id,
        type: "ENTRADA",
        quantity: stock,
        previous_stock: 0,
        current_stock: stock,
        reason: "Estoque inicial do produto",
      },
    });
  }

  revalidateProducts();
}

export async function updateProduct(formData: FormData) {
  await assertPatroa();

  const idValue = text(formData, "id");
  if (!idValue) throw new Error("Produto não informado.");

  let id: bigint;
  try {
    id = BigInt(idValue);
  } catch {
    throw new Error("Produto inválido.");
  }

  const current = await prisma.products.findUnique({ where: { id } });
  if (!current) throw new Error("Produto não encontrado.");

  const name = text(formData, "name");
  if (!name) throw new Error("Informe o nome do produto.");

  const stock = nonNegativeInt(formData, "stock_quantity");
  const categoryId = optionalBigInt(formData, "category_id");

  await prisma.$transaction(async (tx) => {
    await tx.products.update({
      where: { id },
      data: {
        name,
        category_id: categoryId,
        description: text(formData, "description") || null,
        sku: text(formData, "sku") || null,
        size: text(formData, "size") || null,
        color: text(formData, "color") || null,
        cost_price: decimal(formData, "cost_price"),
        sale_price: decimal(formData, "sale_price"),
        stock_quantity: stock,
        minimum_stock: nonNegativeInt(formData, "minimum_stock"),
        image_url: text(formData, "image_url") || null,
        updated_at: new Date(),
      },
    });

    if (stock !== current.stock_quantity) {
      await tx.inventory_movements.create({
        data: {
          product_id: id,
          type: "AJUSTE",
          quantity: Math.abs(stock - current.stock_quantity),
          previous_stock: current.stock_quantity,
          current_stock: stock,
          reason: "Ajuste de estoque pelo dashboard da patroa",
        },
      });
    }
  });

  revalidateProducts();
}

export async function deleteProduct(formData: FormData) {
  await assertPatroa();

  const idValue = text(formData, "id");
  if (!idValue) throw new Error("Produto não informado.");

  let id: bigint;
  try {
    id = BigInt(idValue);
  } catch {
    throw new Error("Produto inválido.");
  }

  const product = await prisma.products.findUnique({
    where: { id },
    include: {
      sale_items: { select: { id: true }, take: 1 },
      offer_items: { select: { id: true }, take: 1 },
    },
  });

  if (!product) throw new Error("Produto não encontrado.");

  if (product.sale_items.length > 0 || product.offer_items.length > 0) {
    throw new Error("Este produto já possui vendas ou ofertas vinculadas. Desative o produto em vez de excluí-lo.");
  }

  await prisma.products.delete({ where: { id } });
  revalidateProducts();
}

export async function toggleProductStatus(formData: FormData) {
  await assertPatroa();

  const idValue = text(formData, "id");
  if (!idValue) throw new Error("Produto não informado.");

  let id: bigint;
  try {
    id = BigInt(idValue);
  } catch {
    throw new Error("Produto inválido.");
  }

  const product = await prisma.products.findUnique({ where: { id }, select: { active: true } });
  if (!product) throw new Error("Produto não encontrado.");

  await prisma.products.update({
    where: { id },
    data: { active: !product.active, updated_at: new Date() },
  });

  revalidateProducts();
}
