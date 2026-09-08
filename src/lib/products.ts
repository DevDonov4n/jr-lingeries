import type { StaticImageData } from "next/image";
import prisma from "@/lib/prisma";
import type { Product } from "@/data/products";

import bodyDelicate from "@/assets/BodyDelicate.jpg";
import conjuntoElegance from "@/assets/ConjuntoElegance.jpg";
import conjuntoRomance from "@/assets/ConjuntoRomance.jpg";
import sutiaComfort from "@/assets/SutiaComfort.jpg";

const imageMap: Record<string, StaticImageData> = {
  "BodyDelicate.jpg": bodyDelicate,
  "ConjuntoElegance.jpg": conjuntoElegance,
  "ConjuntoRomance.jpg": conjuntoRomance,
  "SutiaComfort.jpg": sutiaComfort,
};

function mapProduct(product: {
  id: bigint;
  name: string;
  description: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  sale_price: unknown;
  stock_quantity: number;
  image_url: string | null;
  categories: { name: string } | null;
  offer_items?: Array<{
    offers: {
      name: string;
      discount_type: "PERCENTAGE" | "FIXED";
      discount_value: unknown;
      starts_at: Date;
      ends_at: Date;
      active: boolean;
    };
  }>;
}): Product {
  const image = product.image_url
    ? imageMap[product.image_url] ?? product.image_url
    : conjuntoElegance;

  const originalPrice = Number(product.sale_price);
  const now = new Date();
  const activeOffers = (product.offer_items ?? [])
    .map((item) => item.offers)
    .filter(
      (offer) =>
        offer.active &&
        offer.starts_at <= now &&
        offer.ends_at >= now
    );

  const offer = activeOffers[0];
  let price = originalPrice;
  let discountAmount = 0;
  let discountPercent = 0;

  if (offer) {
    const value = Number(offer.discount_value);

    if (offer.discount_type === "PERCENTAGE") {
      discountPercent = Math.min(value, 100);
      discountAmount = originalPrice * (discountPercent / 100);
    } else {
      discountAmount = Math.min(value, originalPrice);
      discountPercent = originalPrice > 0
        ? (discountAmount / originalPrice) * 100
        : 0;
    }

    price = Math.max(0, originalPrice - discountAmount);
  }

  return {
    id: Number(product.id),
    name: product.name,
    category: product.categories?.name ?? "Sem categoria",
    price: Number(price.toFixed(2)),
    originalPrice: offer ? originalPrice : undefined,
    discountAmount: offer ? Number(discountAmount.toFixed(2)) : undefined,
    discountPercent: offer ? Number(discountPercent.toFixed(2)) : undefined,
    offerName: offer?.name,
    image,
    sizes: product.size
      ? product.size.split(",").map((size) => size.trim()).filter(Boolean)
      : [],
    stock: Number(product.stock_quantity),
    description: product.description ?? undefined,
    color: product.color,
    sku: product.sku,
  };
}

const offerInclude = {
  offer_items: {
    include: {
      offers: {
        select: {
          name: true,
          discount_type: true,
          discount_value: true,
          starts_at: true,
          ends_at: true,
          active: true,
        },
      },
    },
  },
};

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.products.findMany({
    where: { active: true },
    include: { categories: true, ...offerInclude },
    orderBy: { id: "asc" },
  });

  return products.map(mapProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const product = await prisma.products.findFirst({
    where: {
      id: BigInt(id),
      active: true,
    },
    include: { categories: true, ...offerInclude },
  });

  return product ? mapProduct(product) : null;
}
