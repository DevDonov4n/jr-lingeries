import Link from "next/link";
import styles from "./page.module.css";

const whatsappNumber = "5511954400071";
const whatsappMessage = encodeURIComponent("Olá! Gostaria de falar com a JR Lingeries.");

export default function ContatoPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>FALE CONOSCO</span>
        <h1>Estamos aqui para <em>atender você.</em></h1>
        <p>Tem alguma dúvida sobre nossos produtos, pedidos ou precisa de ajuda? Entre em contato com a JR Lingeries.</p>
      </section>

      <section className={styles.contactGrid}>
        <div className={styles.card}>
          <div className={styles.icon}>💬</div>
          <span className={styles.label}>WHATSAPP</span>
          <h2>Converse com a gente</h2>
          <p>Fale diretamente com a JR Lingeries pelo WhatsApp e tire suas dúvidas de forma rápida e prática.</p>
          <Link
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsapp}
          >
            Falar pelo WhatsApp
          </Link>
        </div>

        <div className={styles.info}>
          <span className={styles.label}>ATENDIMENTO</span>
          <h2>Como podemos ajudar?</h2>
          <div className={styles.item}><strong>🛍️ Produtos</strong><span>Informações sobre tamanhos, modelos e disponibilidade.</span></div>
          <div className={styles.item}><strong>📦 Pedidos</strong><span>Ajuda com pedidos e informações sobre sua compra.</span></div>
          <div className={styles.item}><strong>💗 Dúvidas</strong><span>Estamos à disposição para ajudar você a escolher suas peças.</span></div>
        </div>
      </section>
    </main>
  );
}
