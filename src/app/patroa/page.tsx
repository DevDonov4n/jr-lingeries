import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import PatroaClient from "./PatroaClient";

export default async function PatroaPage() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") redirect("/login");

  const [products, categories, clients, paid, pending, pendingSuggestions] =
    await Promise.all([
      prisma.products.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          category_id: true,
          stock_quantity: true,
        },
      }),
      prisma.categories.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.clients.count({ where: { active: true } }),
      prisma.sales.aggregate({
        where: { payment_status: "PAGO" },
        _sum: { total: true },
      }),
      prisma.sales.aggregate({
        where: { payment_status: { in: ["PENDENTE", "PARCIAL", "ATRASADO"] } },
        _sum: { total: true },
      }),
      prisma.product_suggestions.count({ where: { status: "PENDENTE" } }),
    ]);

  return (
    <PatroaClient
      products={products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        categoryId: p.category_id?.toString() ?? "",
        stock: p.stock_quantity,
      }))}
      categories={categories.map((c) => ({
        id: c.id.toString(),
        name: c.name,
      }))}
      clients={clients}
      received={Number(paid._sum.total ?? 0)}
      toReceive={Number(pending._sum.total ?? 0)}
      pendingSuggestions={pendingSuggestions}
    />
  );
}
