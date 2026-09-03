import type { StaticImageData } from "next/image";
import bodyDelicate from "@/assets/BodyDelicate.jpg";
import conjuntoElegance from "@/assets/ConjuntoElegance.jpg";
import conjuntoRomance from "@/assets/ConjuntoRomance.jpg";
import sutiaComfort from "@/assets/SutiaComfort.jpg";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: StaticImageData;
  sizes: string[];
  stock: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Conjunto Elegance",
    category: "Conjuntos",
    price: 89.90,
    image: conjuntoElegance,
    sizes: ["P", "M", "G"],
    stock: 10,
  },
  {
    id: 2,
    name: "Conjunto Romance",
    category: "Conjuntos",
    price: 99.90,
    image: conjuntoRomance,
    sizes: ["P", "M", "G", "GG"],
    stock: 8,
  },
  {
    id: 3,
    name: "Body Delicate",
    category: "Bodies",
    price: 79.90,
    image: bodyDelicate,
    sizes: ["P", "M", "G"],
    stock: 5,
  },
  {
    id: 4,
    name: "Sutiã Comfort",
    category: "Sutiãs",
    price: 59.90,
    image: sutiaComfort,
    sizes: ["M", "G", "GG"],
    stock: 12,
  },
];
