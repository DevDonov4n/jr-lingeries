export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  sizes: string[];
  stock: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Conjunto Elegance",
    category: "Conjuntos",
    price: 89.90,
    image: "/products/conjunto-elegance.jpg",
    sizes: ["P", "M", "G"],
    stock: 10,
  },
  {
    id: 2,
    name: "Conjunto Romance",
    category: "Conjuntos",
    price: 99.90,
    image: "/products/conjunto-romance.jpg",
    sizes: ["P", "M", "G", "GG"],
    stock: 8,
  },
  {
    id: 3,
    name: "Body Delicate",
    category: "Bodies",
    price: 79.90,
    image: "/products/body-delicate.jpg",
    sizes: ["P", "M", "G"],
    stock: 5,
  },
  {
    id: 4,
    name: "Sutiã Comfort",
    category: "Sutiãs",
    price: 59.90,
    image: "/products/sutia-comfort.jpg",
    sizes: ["M", "G", "GG"],
    stock: 12,
  },
];