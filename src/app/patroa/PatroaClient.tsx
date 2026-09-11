"use client";

import { useMemo } from "react";
import PatroaHeader from "@/components/PatroaHeader/PatroaHeader";
import styles from "./page.module.css";

type Product = { id: string; name: string; categoryId: string; stock: number };
type Category = { id: string; name: string };
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function PatroaClient({ products, categories, clients, received, toReceive }: { products: Product[]; categories: Category[]; clients: number; received: number; toReceive: number }) {
  const total = received + toReceive; const percent = total ? Math.round(received / total * 100) : 0; const totalStock = products.reduce((s,p)=>s+p.stock,0);
  const byCategory = useMemo(() => categories.map(c => ({ name:c.name, qty:products.filter(p=>p.categoryId===c.id).reduce((s,p)=>s+p.stock,0) })), [categories,products]); const max = Math.max(...byCategory.map(c=>c.qty),1);
  return <main className={styles.page}><PatroaHeader />
    <section className={styles.cards}><article className={styles.card}><span>Total recebido</span><strong>{money(received)}</strong><small>Vendas pagas</small></article><article className={styles.card}><span>Total a receber</span><strong>{money(toReceive)}</strong><small>Vendas pendentes</small></article><article className={styles.card}><span>Clientes ativos</span><strong>{clients}</strong><small>Cadastros ativos</small></article><article className={styles.card}><span>Estoque</span><strong>{totalStock}</strong><small>{products.length} produtos ativos</small></article></section>
    <section className={styles.analytics}><div className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>Financeiro</span><h2>Resumo financeiro</h2></div><span className={styles.chartBadge}>{percent}% recebido</span></div><div className={styles.financeChart}><div className={styles.donut} style={{"--progress":`${percent}%`} as React.CSSProperties}><div className={styles.donutCenter}><strong>{percent}%</strong><span>recebido</span></div></div><div className={styles.chartLegend}><div className={styles.legendItem}><span className={`${styles.legendDot} ${styles.receivedDot}`}/><div><strong>{money(received)}</strong><span>Recebido</span></div></div><div className={styles.legendItem}><span className={`${styles.legendDot} ${styles.toReceiveDot}`}/><div><strong>{money(toReceive)}</strong><span>A receber</span></div></div><div className={styles.totalLine}><span>Total previsto</span><strong>{money(total)}</strong></div></div></div></div><div className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>Estoque</span><h2>Peças por categoria</h2></div><a className={styles.chartBadge} href="/patroa/estoque">Gerenciar</a></div><div className={styles.barChart}>{byCategory.map(c=><div className={styles.barRow} key={c.name}><div className={styles.barLabel}><span>{c.name}</span><strong>{c.qty}</strong></div><div className={styles.barTrack}><div className={styles.barFill} style={{width:`${c.qty/max*100}%`}}/></div></div>)}</div></div></section>
    <section className={styles.quickGrid}><a className={styles.quickCard} href="/patroa/estoque"><strong>Estoque</strong><span>Pesquisar por nome, SKU e categoria. Cadastrar e editar produtos.</span><b>Acessar estoque →</b></a><a className={styles.quickCard} href="/patroa/categorias"><strong>Categorias</strong><span>Criar, editar, ativar, desativar e excluir categorias.</span><b>Gerenciar categorias →</b></a><a className={styles.quickCard} href="/patroa/ofertas"><strong>Ofertas</strong><span>Criar promoções, selecionar produtos e definir período e desconto.</span><b>Gerenciar ofertas →</b></a></section>
  </main>;
}
