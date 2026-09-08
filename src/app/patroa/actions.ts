"use server";

import { createHash } from "node:crypto";
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

function publicIdFromCloudinaryUrl(url: string) {
  try {
    const parsed = new URL(url);
    const marker = "/image/upload/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    let path = parsed.pathname.slice(markerIndex + marker.length);
    const segments = path.split("/").filter(Boolean);
    if (segments[0]?.startsWith("v") && /^v\d+$/.test(segments[0])) segments.shift();
    if (!segments.length) return null;

    const last = segments.length - 1;
    segments[last] = segments[last].replace(/\.[^/.]+$/, "");
    return segments.join("/");
  } catch {
    return null;
  }
}

async function destroyCloudinaryImage(url: string | null) {
  if (!url || !url.includes("res.cloudinary.com/")) return;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const publicId = publicIdFromCloudinaryUrl(url);
  if (!cloudName || !apiKey || !apiSecret || !publicId) return;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const serialized = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp,
    signature,
  });

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
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
  const newImageUrl = text(formData, "image_url") || null;

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
        image_url: newImageUrl,
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

  if (current.image_url && current.image_url !== newImageUrl) {
    await destroyCloudinaryImage(current.image_url);
  }

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
  await destroyCloudinaryImage(product.image_url);
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
