import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import OfertasClient from "./OfertasClient";

export default async function OfertasPage() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") redirect("/login");
  const [offers, products] = await Promise.all([
    prisma.offers.findMany({
      orderBy: { created_at: "desc" },
      include: {
        offer_items: {
          include: { products: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.products.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sale_price: true },
    }),
  ]);
  return (
    <OfertasClient
      initialOffers={offers.map((o) => ({
        id: o.id.toString(),
        name: o.name,
        description: o.description ?? "",
        discountType: o.discount_type,
        discountValue: Number(o.discount_value),
        startsAt: o.starts_at.toISOString(),
        endsAt: o.ends_at.toISOString(),
        active: o.active,
        productIds: o.offer_items.map((i) => i.products.id.toString()),
        productNames: o.offer_items.map((i) => i.products.name),
      }))}
      products={products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        price: Number(p.sale_price),
      }))}
    />
  );
}
