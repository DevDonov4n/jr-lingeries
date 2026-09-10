"use client";

import Image from "next/image";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import styles from "./Header.module.css";
import logo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cart, isHydrated } = useCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="JR Lingeries - Início">
          <Image src={logo} alt="JR Lingeries" priority />
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

          <Link href="/carrinho" className={styles.cart} aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}>
            <FaCartShopping aria-hidden="true" />
            <span className={styles.cartLabel}>{isHydrated ? `${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "0 itens"}</span>
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
          <Link href="/carrinho" className={styles.mobileCart}>
            <FaCartShopping aria-hidden="true" />
            <span>Carrinho ({isHydrated ? cartCount : 0})</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
