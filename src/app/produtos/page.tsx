import ProductCard from "@/components/ProductCard/ProductCard";
import { products } from "@/data/products";
import styles from "./page.module.css";

export default function Produtos() {
  return (
    <main className={styles.main}>

      <section className={styles.header}>
        <p className={styles.subtitle}>
          JR Lingeries
        </p>

        <h1>
          Nossos produtos
        </h1>

        <p>
          Encontre peças pensadas para valorizar sua beleza
          e proporcionar conforto em todos os momentos.
        </p>
      </section>

      <section className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </section>

    </main>
  );
}