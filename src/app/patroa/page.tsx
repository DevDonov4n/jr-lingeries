"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface Promotion {
  id: number;
  name: string;
  discount: number;
  category: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Conjunto Elegance", category: "Conjuntos", price: 89.9, stock: 10 },
  { id: 2, name: "Conjunto Romance", category: "Conjuntos", price: 99.9, stock: 8 },
  { id: 3, name: "Body Delicate", category: "Bodies", price: 79.9, stock: 5 },
  { id: 4, name: "Sutiã Comfort", category: "Sutiãs", price: 59.9, stock: 12 },
];

const initialPromotions: Promotion[] = [];

const financeiro = {
  recebido: 4850,
  receber: 2150,
  devedor: 100,
  clientesAtivos: 10,
};

const categorias = ["Calcinhas", "Sutiãs", "Cuecas", "Conjuntos", "Bodies"];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Patroa() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({ name: "", category: "Calcinhas", price: "", stock: "" });
  const [promotionForm, setPromotionForm] = useState({ name: "", discount: "", category: "Todas" });

  useEffect(() => {
    if (localStorage.getItem("jr-lingeries-auth") !== "patroa") {
      router.replace("/login");
      return;
    }

    const savedProducts = localStorage.getItem("jr-lingeries-products");
    const savedPromotions = localStorage.getItem("jr-lingeries-promotions");
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedPromotions) setPromotions(JSON.parse(savedPromotions));
  }, [router]);

  useEffect(() => {
    localStorage.setItem("jr-lingeries-products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("jr-lingeries-promotions", JSON.stringify(promotions));
  }, [promotions]);

  const totalPecas = products.reduce((total, product) => total + product.stock, 0);

  const estoquePorCategoria = useMemo(() => categorias.map((categoria) => ({
    categoria,
    quantidade: products
      .filter((product) => product.category === categoria)
      .reduce((total, product) => total + product.stock, 0),
  })), [products]);

  const maiorEstoque = Math.max(...estoquePorCategoria.map((item) => item.quantidade), 1);
  const totalFinanceiro = financeiro.recebido + financeiro.receber;
  const percentualRecebido = totalFinanceiro > 0 ? Math.round((financeiro.recebido / totalFinanceiro) * 100) : 0;

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const product: Product = {
      id: editingId ?? Date.now(),
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };

    if (!product.name || product.price < 0 || product.stock < 0) return;

    setProducts((current) => editingId === null
      ? [...current, product]
      : current.map((item) => item.id === editingId ? product : item));

    setProductForm({ name: "", category: "Calcinhas", price: "", stock: "" });
    setEditingId(null);
  }

  function editarProduto(product: Product) {
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function excluirProduto(id: number) {
    if (window.confirm("Deseja realmente excluir este produto?")) {
      setProducts((current) => current.filter((product) => product.id !== id));
    }
  }

  function criarPromocao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const discount = Number(promotionForm.discount);
    if (!promotionForm.name.trim() || discount <= 0 || discount > 100) return;

    setPromotions((current) => [...current, {
      id: Date.now(),
      name: promotionForm.name.trim(),
      discount,
      category: promotionForm.category,
    }]);
    setPromotionForm({ name: "", discount: "", category: "Todas" });
  }

  function excluirPromocao(id: number) {
    setPromotions((current) => current.filter((promotion) => promotion.id !== id));
  }

  function sair() {
    localStorage.removeItem("jr-lingeries-auth");
    router.replace("/login");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.logo}>JR Lingeries</span>
          <h1>Dashboard da Patroa</h1>
          <p>Uma visão completa das vendas, estoque, produtos e promoções.</p>
        </div>
        <button className={styles.logout} onClick={sair}>Sair</button>
      </header>

      <section className={styles.cards}>
        <article className={styles.card}>
          <span>Total recebido</span>
          <strong>{formatCurrency(financeiro.recebido)}</strong>
          <small className={styles.positive}>Recebimentos confirmados</small>
        </article>
        <article className={styles.card}>
          <span>Total a receber</span>
          <strong>{formatCurrency(financeiro.receber)}</strong>
          <small>Valores em aberto</small>
        </article>
        <article className={`${styles.card} ${styles.debtCard}`}>
          <span>Saldo devedor</span>
          <strong>{formatCurrency(financeiro.devedor)}</strong>
          <small>Referente ao mês anterior</small>
        </article>
        <article className={styles.card}>
          <span>Clientes ativos</span>
          <strong>{financeiro.clientesAtivos}</strong>
          <small>Clientes cadastrados</small>
        </article>
      </section>

      <section className={styles.analytics}>
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.eyebrow}>Financeiro</span>
              <h2>Resumo financeiro</h2>
            </div>
            <span className={styles.chartBadge}>Visão geral</span>
          </div>
          <div className={styles.financeChart}>
            <div
              className={styles.donut}
              style={{ "--progress": `${percentualRecebido}%` } as React.CSSProperties}
            >
              <div className={styles.donutCenter}>
                <strong>{percentualRecebido}%</strong>
                <span>recebido</span>
              </div>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.receivedDot}`} />
                <div><strong>{formatCurrency(financeiro.recebido)}</strong><span>Recebido</span></div>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.toReceiveDot}`} />
                <div><strong>{formatCurrency(financeiro.receber)}</strong><span>A receber</span></div>
              </div>
              <div className={styles.totalLine}><span>Movimentação prevista</span><strong>{formatCurrency(totalFinanceiro)}</strong></div>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.eyebrow}>Estoque</span>
              <h2>Peças por categoria</h2>
            </div>
            <span className={styles.chartBadge}>{totalPecas} peças</span>
          </div>
          <div className={styles.barChart}>
            {estoquePorCategoria.map((item) => (
              <div className={styles.barRow} key={item.categoria}>
                <div className={styles.barLabel}><span>{item.categoria}</span><strong>{item.quantidade}</strong></div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(item.quantidade / maiorEstoque) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div><h2>Estoque</h2><p>{totalPecas} peças cadastradas</p></div>
          </div>
          <div className={styles.productList}>
            {products.map((product) => (
              <div className={styles.productItem} key={product.id}>
                <div><strong>{product.name}</strong><span>{product.category} · {product.stock} peças · {formatCurrency(product.price)}</span></div>
                <div className={styles.actions}>
                  <button onClick={() => editarProduto(product)}>Editar</button>
                  <button className={styles.deleteButton} onClick={() => excluirProduto(product.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h2>{editingId === null ? "Adicionar produto" : "Alterar produto"}</h2>
          <form className={styles.form} onSubmit={handleProductSubmit}>
            <input placeholder="Nome do produto" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
              <option>Calcinhas</option><option>Sutiãs</option><option>Cuecas</option><option>Conjuntos</option><option>Bodies</option>
            </select>
            <input type="number" min="0" step="0.01" placeholder="Preço (R$)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
            <input type="number" min="0" placeholder="Quantidade em estoque" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
            <div className={styles.formActions}>
              <button type="submit">{editingId === null ? "Adicionar produto" : "Salvar alterações"}</button>
              {editingId !== null && <button type="button" className={styles.cancelButton} onClick={() => { setEditingId(null); setProductForm({ name: "", category: "Calcinhas", price: "", stock: "" }); }}>Cancelar</button>}
            </div>
          </form>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.panel}>
          <h2>Criar promoção</h2>
          <form className={styles.form} onSubmit={criarPromocao}>
            <input placeholder="Nome da promoção" value={promotionForm.name} onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })} required />
            <input type="number" min="1" max="100" placeholder="Desconto (%)" value={promotionForm.discount} onChange={(e) => setPromotionForm({ ...promotionForm, discount: e.target.value })} required />
            <select value={promotionForm.category} onChange={(e) => setPromotionForm({ ...promotionForm, category: e.target.value })}>
              <option>Todas</option><option>Calcinhas</option><option>Sutiãs</option><option>Cuecas</option><option>Conjuntos</option><option>Bodies</option>
            </select>
            <button type="submit">Criar promoção</button>
          </form>
        </div>

        <div className={styles.panel}>
          <h2>Promoções ativas</h2>
          {promotions.length === 0 ? <p className={styles.empty}>Nenhuma promoção criada.</p> : (
            <div className={styles.productList}>
              {promotions.map((promotion) => (
                <div className={styles.productItem} key={promotion.id}>
                  <div><strong>{promotion.name}</strong><span>{promotion.category} · {promotion.discount}% de desconto</span></div>
                  <button className={styles.deleteButton} onClick={() => excluirPromocao(promotion.id)}>Excluir</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
