import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>

        <Link href="/" className={styles.logo}>
          JR <span>Lingeries</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/">Início</Link>
          <Link href="/produtos">Produtos</Link>
          <Link href="/sobre">Sobre Nós</Link>
          <Link href="/contato">Contato</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/login" className={styles.login}>
            Entrar
          </Link>

          <Link href="/carrinho" className={styles.cart}>
            🛍️
          </Link>
        </div>

      </div>
    </header>
  );
}