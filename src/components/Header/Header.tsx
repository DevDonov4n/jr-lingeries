import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          JR <span>Lingeries</span>
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          <Link href="/">Início</Link>
          <Link href="/produtos">Produtos</Link>
          <Link href="/sobre">Sobre Nós</Link>
          <Link href="/contato">Contato</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/login" className={styles.login}>
            Entrar
          </Link>

          <Link href="/carrinho" className={styles.cart} aria-label="Carrinho">
            🛍️
          </Link>
        </div>

        <input id="mobile-menu" type="checkbox" className={styles.menuToggle} />
        <label htmlFor="mobile-menu" className={styles.menuButton} aria-label="Abrir menu">
          <span />
          <span />
          <span />
        </label>

        <nav className={styles.mobileNav} aria-label="Menu mobile">
          <Link href="/">Início</Link>
          <Link href="/produtos">Produtos</Link>
          <Link href="/sobre">Sobre Nós</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/login" className={styles.mobileLogin}>Entrar</Link>
          <Link href="/carrinho" className={styles.mobileCart}>🛍️ Carrinho</Link>
        </nav>
      </div>
    </header>
  );
}
