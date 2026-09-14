"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function createSuggestion(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") throw new Error("Faça login para enviar uma sugestão.");

  const name = String(formData.get("name") ?? "").trim();
  const categoryIdValue = String(formData.get("categoryId") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) throw new Error("Informe qual peça ou pedido você gostaria.");
  if (name.length > 150) throw new Error("O nome deve ter no máximo 150 caracteres.");
  if (description.length > 5000) throw new Error("A descrição deve ter no máximo 5000 caracteres.");

  let categoryId: bigint | null = null;
  if (categoryIdValue) {
    try { categoryId = BigInt(categoryIdValue); } catch { throw new Error("Categoria inválida."); }
    const category = await prisma.categories.findUnique({ where: { id: categoryId }, select: { id: true, active: true } });
    if (!category || !category.active) throw new Error("Categoria inválida.");
  }

  await prisma.product_suggestions.create({
    data: {
      user_id: BigInt(session.id),
      category_id: categoryId,
      name,
      color: color || null,
      size: size || null,
      description: description || null,
      status: "PENDENTE",
    },
  });

  revalidatePath("/patroa");
  revalidatePath("/cliente/sugestoes");
}
