import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProductById } from "@/lib/products";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "../page.module.css";

export default async function FavoritosPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") redirect("/login");

  const favorites = await prisma.favorites.findMany({
    where: { user_id: BigInt(session.id) },
    select: { product_id: true },
    orderBy: { created_at: "desc" },
  });

  const products = (await Promise.all(favorites.map((favorite) => getProductById(Number(favorite.product_id))))).filter(Boolean);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Minha conta</span>
          <h1>Meus favoritos 💗</h1>
          <p>As peças que você salvou para encontrar com facilidade depois.</p>
        </div>
        <Link className={styles.backLink} href="/cliente">Voltar para minha conta</Link>
      </header>

      {products.length > 0 ? (
        <section className={styles.favoriteGrid}>
          {products.map((product) => product && <ProductCard key={product.id} product={product} />)}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <span>♡</span>
          <h2>Você ainda não tem favoritos</h2>
          <p>Explore a coleção e salve as peças que você mais gostar.</p>
          <Link className={styles.primaryButton} href="/produtos">Explorar produtos</Link>
        </section>
      )}
    </main>
  );
}
