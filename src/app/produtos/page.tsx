import ProductCard from "@/components/ProductCard/ProductCard";
import { getProducts } from "@/lib/products";
import styles from "./page.module.css";

export default async function Produtos() {
  const products = await getProducts();
  const grouped = products.reduce<Record<string, typeof products>>(
    (groups, product) => {
      (groups[product.category] ??= []).push(product);
      return groups;
    },
    {},
  );
  const categories = Object.entries(grouped);

  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <p className={styles.subtitle}>JR Lingeries</p>
        <h1>Nossos produtos</h1>
        <p>
          Encontre peças pensadas para valorizar sua beleza e proporcionar
          conforto em todos os momentos.
        </p>
      </section>
      {categories.length === 0 ? (
        <p className={styles.empty}>Nenhum produto disponível no momento.</p>
      ) : (
        <div className={styles.categories}>
          {categories.map(([category, categoryProducts]) => (
            <section className={styles.categorySection} key={category}>
              <div className={styles.categoryHeader}>
                <h2>{category}</h2>
                <span>
                  {categoryProducts.length}{" "}
                  {categoryProducts.length === 1 ? "produto" : "produtos"}
                </span>
              </div>
              <div className={styles.grid}>
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
