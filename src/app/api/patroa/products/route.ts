import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "PATROA") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const products = await prisma.products.findMany({
    orderBy: { created_at: "desc" },
    include: { categories: { select: { id: true, name: true } } },
  });

  return NextResponse.json(products.map((product) => ({
    id: product.id.toString(),
    name: product.name,
    category: product.categories?.name ?? "",
    categoryId: product.categories?.id.toString() ?? "",
    description: product.description ?? "",
    sku: product.sku ?? "",
    size: product.size ?? "",
    color: product.color ?? "",
    costPrice: Number(product.cost_price),
    price: Number(product.sale_price),
    stock: product.stock_quantity,
    minimumStock: product.minimum_stock,
    imageUrl: product.image_url ?? "",
    active: product.active,
  })));
}
