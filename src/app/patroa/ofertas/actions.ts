"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function assertPatroa() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") throw new Error("Não autorizado.");
}
function text(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}
function idList(data: FormData) {
  return text(data, "product_ids")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => BigInt(v));
}
function dateValue(data: FormData, key: string) {
  const value = text(data, key);
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime()))
    throw new Error(`Data inválida para ${key}.`);
  return date;
}
function discount(data: FormData) {
  const value = Number(text(data, "discount_value").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0)
    throw new Error("Informe um desconto válido.");
  const type = text(data, "discount_type");
  if (type !== "PERCENTAGE" && type !== "FIXED")
    throw new Error("Tipo de desconto inválido.");
  if (type === "PERCENTAGE" && value > 100)
    throw new Error("O desconto percentual não pode passar de 100%.");
  return { value: value.toFixed(2), type };
}
function revalidate() {
  revalidatePath("/patroa/ofertas");
  revalidatePath("/patroa");
  revalidatePath("/produtos");
}

export async function createOffer(data: FormData) {
  await assertPatroa();
  const name = text(data, "name");
  if (!name) throw new Error("Informe o nome da oferta.");
  const products = idList(data);
  if (!products.length) throw new Error("Selecione pelo menos um produto.");
  const d = discount(data);
  const startsAt = dateValue(data, "starts_at");
  const endsAt = dateValue(data, "ends_at");
  if (endsAt <= startsAt)
    throw new Error("A data final deve ser posterior à inicial.");
  await prisma.offers.create({
    data: {
      name,
      description: text(data, "description") || null,
      discount_type: d.type as "PERCENTAGE" | "FIXED",
      discount_value: d.value,
      starts_at: startsAt,
      ends_at: endsAt,
      active: true,
      offer_items: { create: products.map((product_id) => ({ product_id })) },
    },
  });
  revalidate();
}

export async function updateOffer(data: FormData) {
  await assertPatroa();
  const id = BigInt(text(data, "id"));
  const name = text(data, "name");
  if (!name) throw new Error("Informe o nome da oferta.");
  const products = idList(data);
  if (!products.length) throw new Error("Selecione pelo menos um produto.");
  const d = discount(data);
  const startsAt = dateValue(data, "starts_at");
  const endsAt = dateValue(data, "ends_at");
  if (endsAt <= startsAt)
    throw new Error("A data final deve ser posterior à inicial.");
  await prisma.$transaction(async (tx) => {
    await tx.offers.update({
      where: { id },
      data: {
        name,
        description: text(data, "description") || null,
        discount_type: d.type as "PERCENTAGE" | "FIXED",
        discount_value: d.value,
        starts_at: startsAt,
        ends_at: endsAt,
        updated_at: new Date(),
      },
    });
    await tx.offer_items.deleteMany({ where: { offer_id: id } });
    await tx.offer_items.createMany({
      data: products.map((product_id) => ({ offer_id: id, product_id })),
    });
  });
  revalidate();
}

export async function toggleOfferStatus(data: FormData) {
  await assertPatroa();
  const id = BigInt(text(data, "id"));
  const offer = await prisma.offers.findUnique({
    where: { id },
    select: { active: true },
  });
  if (!offer) throw new Error("Oferta não encontrada.");
  await prisma.offers.update({
    where: { id },
    data: { active: !offer.active, updated_at: new Date() },
  });
  revalidate();
}

export async function deleteOffer(data: FormData) {
  await assertPatroa();
  const id = BigInt(text(data, "id"));
  await prisma.offers.delete({ where: { id } });
  revalidate();
}
