import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { getSession } from "@/lib/auth";
import EstoqueClient from "./EstoqueClient";

export default async function EstoquePage() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") redirect("/login");

  const [products, categories] = await Promise.all([
    prisma.products.findMany({
      orderBy: { created_at: "desc" },
      include: { categories: { select: { id: true, name: true } } },
    }),
    prisma.categories.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const variants = products.length
    ? await prisma.$queryRaw<
        Array<{
          product_id: bigint;
          color: string;
          color_hex: string;
          stock_quantity: number;
          active: boolean;
        }>
      >`SELECT product_id, color, color_hex, stock_quantity, active FROM product_variants WHERE product_id IN (${Prisma.join(products.map((product) => product.id))}) ORDER BY color ASC`
    : [];
  const variantMap = new Map<
    string,
    { color: string; colorHex: string; stock: number; active: boolean }[]
  >();
  for (const variant of variants) {
    const key = variant.product_id.toString();
    const list = variantMap.get(key) ?? [];
    list.push({
      color: variant.color,
      colorHex: variant.color_hex,
      stock: Number(variant.stock_quantity),
      active: Boolean(variant.active),
    });
    variantMap.set(key, list);
  }

  return (
    <EstoqueClient
      initialProducts={products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        category: p.categories?.name ?? "Sem categoria",
        categoryId: p.categories?.id.toString() ?? "",
        description: p.description ?? "",
        sku: p.sku ?? "",
        size: p.size ?? "",
        color: p.color ?? "",
        costPrice: Number(p.cost_price),
        price: Number(p.sale_price),
        stock: p.stock_quantity,
        minimumStock: p.minimum_stock,
        imageUrl: p.image_url ?? "",
        active: p.active,
        colors:
          variantMap.get(p.id.toString()) ??
          (p.color
            ? [
                {
                  color: p.color,
                  colorHex: "#d2a58a",
                  stock: p.stock_quantity,
                  active: p.stock_quantity > 0,
                },
              ]
            : []),
      }))}
      categories={categories.map((c) => ({
        id: c.id.toString(),
        name: c.name,
      }))}
    />
  );
}
