import type { StaticImageData } from "next/image";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: StaticImageData;
  sizes: string[];
  stock: number;
  description?: string;
  color?: string | null;
  sku?: string | null;
}
