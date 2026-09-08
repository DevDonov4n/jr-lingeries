import type { StaticImageData } from "next/image";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: StaticImageData | string;
  sizes: string[];
  stock: number;
  description?: string;
  color?: string | null;
  sku?: string | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  offerName?: string;
}
