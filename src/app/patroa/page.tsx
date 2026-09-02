"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const estoque = [
  { categoria: "Calcinhas", quantidade: 30 },
  { categoria: "Sutiãs", quantidade: 25 },
  { categoria: "Cuecas", quantidade: 40 },
];

const financeiro = {
  recebido: 4850,
  receber: 2150,
  devedor: 2150,
  clientesAtivos: 10,
};

export default function Patroa() {
  const router = useRouter();
  const totalPecas = estoque.reduce((total, item) => total + item.quantidade, 0);

  useEffect(() => {
    if (localStorage.getItem("jr-lingeries-auth") !== "patroa") {
      router.replace("/login");
    }
  }, [router]);

  function sair() {
    localStorage.removeItem("jr-lingeries-auth");
    router.replace("/login");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.logo}>JR Lingeries</span>
          <h1>Dashboard Financeiro</h1>
          <p>Visão geral do estoque e das finanças da loja.</p>
        </div>
        <button className={styles.logout} onClick={sair}>Sair</button>
      </header>

      <section className={styles.cards}>
        <article className={styles.card}>
          <span>Total recebido</span>
          <strong>R$ {financeiro.recebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </article>
        <article className={styles.card}>
          <span>Total a receber</span>
          <strong>R$ {financeiro.receber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </article>
        <article className={styles.card}>
          <span>Saldo devedor</span>
          <strong>R$ {financeiro.devedor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </article>
        <article className={styles.card}>
          <span>Clientes ativos</span>
          <strong>{financeiro.clientesAtivos}</strong>
        </article>
      </section>

      <section className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div>
              <h2>Estoque por categoria</h2>
              <p>{totalPecas} peças no estoque</p>
            </div>
          </div>

          <div className={styles.stockList}>
            {estoque.map((item) => (
              <div className={styles.stockItem} key={item.categoria}>
                <div>
                  <span>{item.categoria}</span>
                  <div className={styles.bar}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${(item.quantidade / totalPecas) * 100}%` }}
                    />
                  </div>
                </div>
                <strong>{item.quantidade} peças</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h2>Resumo financeiro</h2>
          <div className={styles.summary}>
            <div><span>Recebido</span><strong>R$ 4.850,00</strong></div>
            <div><span>A receber</span><strong>R$ 2.150,00</strong></div>
            <div><span>Saldo devedor</span><strong>R$ 2.150,00</strong></div>
            <div><span>Clientes ativos</span><strong>10</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}
