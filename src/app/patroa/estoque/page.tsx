import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import EstoqueClient from "./EstoqueClient";

export default async function EstoquePage() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") redirect("/login");

  const [products, categories] = await Promise.all([
    prisma.products.findMany({ orderBy: { created_at: "desc" }, include: { categories: { select: { id: true, name: true } } } }),
    prisma.categories.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <EstoqueClient
      initialProducts={products.map((p) => ({
        id: p.id.toString(), name: p.name, category: p.categories?.name ?? "Sem categoria", categoryId: p.categories?.id.toString() ?? "",
        description: p.description ?? "", sku: p.sku ?? "", size: p.size ?? "", color: p.color ?? "", costPrice: Number(p.cost_price), price: Number(p.sale_price),
        stock: p.stock_quantity, minimumStock: p.minimum_stock, imageUrl: p.image_url ?? "", active: p.active,
      }))}
      categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
    />
  );
}
