"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./PatroaHeader.module.css";

export default function PatroaHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "/patroa", label: "Início" },
    { href: "/patroa/estoque", label: "Estoque" },
    { href: "/patroa/categorias", label: "Categorias" },
    { href: "/patroa/ofertas", label: "Ofertas" },
  ];
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); router.refresh(); }
  return <header className={styles.header}><Link href="/patroa" className={styles.brand} onClick={() => setMenuOpen(false)}><span>JR Lingeries</span><div><strong>Dashboard da Patroa</strong><small>Visão geral da operação.</small></div></Link><nav className={styles.desktopNav}>{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? styles.active : ""}>{link.label}</Link>)}<button onClick={() => void logout()}>Sair</button></nav><button className={styles.menuButton} onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>{menuOpen ? "−" : "+"}</button>{menuOpen && <nav className={styles.mobileNav}>{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={pathname === link.href ? styles.active : ""}>{link.label}</Link>)}<button onClick={() => void logout()}>Sair</button></nav>}</header>;
}
