import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CategoriasClient from "./CategoriasClient";

export default async function CategoriasPage() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") redirect("/login");

  const categories = await prisma.categories.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <CategoriasClient
      categories={categories.map((category) => ({
        id: category.id.toString(),
        name: category.name,
        description: category.description ?? "",
        active: category.active,
        productCount: category._count.products,
      }))}
    />
  );
}
