import type { StaticImageData } from "next/image";

export interface ProductColor {
  color: string;
  colorHex: string;
  stock: number;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: StaticImageData | string;
  sizes: string[];
  stock: number;
  colors: ProductColor[];
  description?: string;
  color?: string | null;
  sku?: string | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  offerName?: string;
}
