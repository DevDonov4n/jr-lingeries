import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import styles from "./page.module.css";
import ProductDetails from "@/components/ProductDetails/ProductDetails";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) notFound();

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <main className={styles.main}>
      <Link href="/produtos" className={styles.back}>
        ← Voltar para produtos
      </Link>

      <section className={styles.product}>
        <div className={styles.imageContainer}>
          <span className={styles.category}>{product.category}</span>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            className={styles.productImage}
            priority
          />
        </div>

        <div className={styles.info}>
          <p className={styles.brand}>JR Lingeries</p>
          <h1 id="product-name">{product.name}</h1>

          {hasDiscount ? (
            <div className={styles.priceBox}>
              <span className={styles.originalPrice}>
                R$ {product.originalPrice!.toFixed(2).replace(".", ",")}
              </span>
              <p className={styles.price}>
                R$ {product.price.toFixed(2).replace(".", ",")}
              </p>
              <span className={styles.discountBadge}>
                {Math.round(product.discountPercent ?? 0)}% OFF
              </span>
              {product.offerName && (
                <span className={styles.offerName}>{product.offerName}</span>
              )}
            </div>
          ) : (
            <p className={styles.price}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
          )}

          <p className={styles.description}>
            {product.description ??
              "Uma peça pensada para proporcionar conforto, delicadeza e beleza em todos os momentos."}
          </p>
          <ProductDetails product={product} />
          <p className={styles.stock}>{product.stock} unidades disponíveis</p>
        </div>
      </section>
    </main>
  );
}
