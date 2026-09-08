import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={styles.category}>{product.category}</span>
        {hasDiscount && (
          <span className={styles.discountBadge}>
            {Math.round(product.discountPercent ?? 0)}% OFF
          </span>
        )}

        <Link href={`/produtos/${product.id}`} className={styles.imageLink}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 550px) 100vw, (max-width: 900px) 50vw, 25vw"
            className={styles.productImage}
            priority={product.id <= 2}
          />
        </Link>
      </div>

      <div className={styles.content}>
        <h2>{product.name}</h2>

        {hasDiscount ? (
          <div className={styles.priceBox}>
            <span className={styles.originalPrice}>
              R$ {product.originalPrice!.toFixed(2).replace(".", ",")}
            </span>
            <p className={styles.discountPrice}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
            <span className={styles.offerName}>{product.offerName}</span>
          </div>
        ) : (
          <p className={styles.price}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>
        )}

        <p className={styles.stock}>{product.stock} unidades disponíveis</p>
        <Link href={`/produtos/${product.id}`} className={styles.button}>
          Ver produto
        </Link>
      </div>
    </article>
  );
}
