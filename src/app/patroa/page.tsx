import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import PatroaClient from "./PatroaClient";

export default async function PatroaPage() {
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

  return (
    <PatroaClient
      initialProducts={products.map((product) => ({
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
      }))}
      categories={categories.map((category) => ({ id: category.id.toString(), name: category.name }))}
    />
  );
}
