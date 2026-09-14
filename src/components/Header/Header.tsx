"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCartShopping } from "react-icons/fa6";
import styles from "./Header.module.css";
import logo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cart, isHydrated } = useCart();
  const [userName, setUserName] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    let active = true;
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setUserName(data.authenticated ? data.name : null);
      } catch {
        if (active) setUserName(null);
      }
    }
    void loadSession();
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUserName(null);
      setLoggingOut(false);
      window.location.href = "/";
    }
  }

  const accountLabel = userName ?? "Entrar";
  const accountHref = userName ? "/cliente" : "/login";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="JR Lingeries - Início"><Image src={logo} alt="JR Lingeries" priority /></Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          <Link href="/">Início</Link><Link href="/produtos">Produtos</Link><Link href="/sobre">Sobre Nós</Link><Link href="/contato">Contato</Link>
        </nav>
        <div className={styles.actions}>
          <Link href={accountHref} className={styles.login}>{accountLabel}</Link>
          {userName && <button type="button" className={styles.logoutButton} onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "Saindo..." : "Sair"}</button>}
          <Link href="/carrinho" className={styles.cart} aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}><FaCartShopping aria-hidden="true" /><span className={styles.cartLabel}>{isHydrated ? `${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "0 itens"}</span></Link>
        </div>
        <input id="mobile-menu" type="checkbox" className={styles.menuToggle} />
        <label htmlFor="mobile-menu" className={styles.menuButton} aria-label="Abrir menu"><span /><span /><span /></label>
        <nav className={styles.mobileNav} aria-label="Menu mobile">
          <Link href="/">Início</Link><Link href="/produtos">Produtos</Link><Link href="/sobre">Sobre Nós</Link><Link href="/contato">Contato</Link>
          <Link href={accountHref} className={styles.mobileLogin}>{accountLabel}</Link>
          {userName && <button type="button" className={styles.mobileLogout} onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "Saindo..." : "Sair da conta"}</button>}
          <Link href="/carrinho" className={styles.mobileCart}><FaCartShopping aria-hidden="true" /><span>Carrinho ({isHydrated ? cartCount : 0})</span></Link>
        </nav>
      </div>
    </header>
  );
}
