import Link from "next/link";
import { Product } from "@/data/products";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={styles.category}>
          {product.category}
        </span>

        <div className={styles.imagePlaceholder}>
          Imagem
        </div>
      </div>

      <div className={styles.content}>
        <h2>{product.name}</h2>

        <p className={styles.price}>
          R$ {product.price.toFixed(2).replace(".", ",")}
        </p>

        <p className={styles.stock}>
          {product.stock} unidades disponíveis
        </p>

        <Link
          href={`/produtos/${product.id}`}
          className={styles.button}
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}