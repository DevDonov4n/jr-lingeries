import Link from "next/link";
import { products } from "@/data/products";
import styles from "./page.module.css";

const categories = [
  { name: "Conjuntos", icon: "✦", description: "Combinações irresistíveis" },
  { name: "Sutiãs", icon: "♡", description: "Conforto e elegância" },
  { name: "Calcinhas", icon: "◌", description: "Delicadeza todos os dias" },
  { name: "Bodies", icon: "✧", description: "Peças que valorizam" },
];

export default function Home() {
  const featuredProducts = products.slice(0, 4);
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>NOVA COLEÇÃO • JR LINGERIES</span>
          <h1>Beleza que começa <em>em você.</em></h1>
          <p>Peças delicadas, confortáveis e feitas para você se sentir ainda mais linda.</p>
          <div className={styles.heroActions}>
            <Link href="/produtos" className={styles.primaryButton}>Comprar agora →</Link>
            <Link href="/produtos" className={styles.secondaryButton}>Ver coleção</Link>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true"><div className={styles.circle}>JR</div><span className={styles.floating}>Delicadeza<br />em cada detalhe</span></div>
      </section>

      <section className={styles.benefits}>
        <div><span>♡</span><div><strong>Compra segura</strong><small>Seus dados protegidos</small></div></div>
        <div><span>✦</span><div><strong>Envio rápido</strong><small>Receba com carinho</small></div></div>
        <div><span>⌁</span><div><strong>Atendimento</strong><small>Estamos aqui para ajudar</small></div></div>
        <div><span>✓</span><div><strong>Qualidade</strong><small>Peças selecionadas</small></div></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><span>EXPLORE</span><h2>Encontre seu estilo</h2></div><Link href="/produtos">Ver todas →</Link></div>
        <div className={styles.categories}>{categories.map((category) => <Link href={`/produtos?categoria=${encodeURIComponent(category.name)}`} className={styles.category} key={category.name}><span className={styles.categoryIcon}>{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small></Link>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><div><span>DESTAQUES</span><h2>Escolhidos para você</h2></div><Link href="/produtos">Ver produtos →</Link></div>
        <div className={styles.products}>{featuredProducts.map((product) => <article className={styles.product} key={product.id}><Link href={`/produtos/${product.id}`} className={styles.productImage}><span>NOVO</span><div>{product.category}</div></Link><div className={styles.productInfo}><small>{product.category}</small><Link href={`/produtos/${product.id}`}><h3>{product.name}</h3></Link><strong>R$ {product.price.toFixed(2).replace(".", ",")}</strong><Link href={`/produtos/${product.id}`} className={styles.productButton}>Ver produto</Link></div></article>)}</div>
      </section>

      <section className={styles.promo}><div><span>OFERTA ESPECIAL</span><h2>Seu momento de se sentir incrível.</h2><p>Confira nossas peças favoritas e encontre aquela que combina com você.</p><Link href="/produtos" className={styles.promoButton}>Aproveitar ofertas →</Link></div><div className={styles.promoBadge}><strong>JR</strong><span>LINGERIES</span></div></section>

      <section className={styles.newsletter}><span>FIQUE POR DENTRO</span><h2>Novidades direto para você</h2><p>Cadastre seu e-mail e receba lançamentos e promoções da JR Lingeries.</p><form onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail" required /><button type="submit">Quero receber</button></form></section>
    </main>
  );
}
