"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function updateSuggestionStatus(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") throw new Error("Não autorizado.");

  const idValue = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!idValue) throw new Error("Pedido não informado.");
  if (!["PENDENTE", "ANALISADA", "ATENDIDA"].includes(status)) throw new Error("Status inválido.");

  let id: bigint;
  try { id = BigInt(idValue); } catch { throw new Error("Pedido inválido."); }

  await prisma.product_suggestions.update({ where: { id }, data: { status: status as "PENDENTE" | "ANALISADA" | "ATENDIDA", updated_at: new Date() } });
  revalidatePath("/patroa");
  revalidatePath("/patroa/sugestoes");
}
