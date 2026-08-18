import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import styles from "./page.module.css";
import ProductDetails from "@/components/ProductDetails/ProductDetails";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = products.find(
    (product) => product.id === Number(id)
  );

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <Link href="/produtos" className={styles.back}>
        ← Voltar para produtos
      </Link>

      <section className={styles.product}>
        <div className={styles.imageContainer}>
          <span className={styles.category}>
            {product.category}
          </span>

          <div className={styles.imagePlaceholder}>
            Imagem do produto
          </div>
        </div>

        <div className={styles.info}>
          <p className={styles.brand}>
            JR Lingeries
          </p>

          <h1>{product.name}</h1>

          <p className={styles.price}>
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>

          <p className={styles.description}>
            Uma peça pensada para proporcionar conforto,
            delicadeza e beleza em todos os momentos.
          </p>

          <ProductDetails product={product} />

            <p className={styles.stock}>
            {product.stock} unidades disponíveis
            </p>
        </div>
      </section>
    </main>
  );
}