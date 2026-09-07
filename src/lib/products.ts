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
}): Product {
  return {
    id: Number(product.id),
    name: product.name,
    category: product.categories?.name ?? "Sem categoria",
    price: Number(product.sale_price),
    image: imageMap[product.image_url ?? ""] ?? conjuntoElegance,
    sizes: product.size
      ? product.size.split(",").map((size) => size.trim()).filter(Boolean)
      : [],
    stock: Number(product.stock_quantity),
    description: product.description ?? undefined,
    color: product.color,
    sku: product.sku,
  };
}

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.products.findMany({
    where: { active: true },
    include: { categories: true },
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
    include: { categories: true },
  });

  return product ? mapProduct(product) : null;
}
