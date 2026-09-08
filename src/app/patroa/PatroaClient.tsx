"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { createProduct, deleteProduct, toggleProductStatus, updateProduct } from "./actions";

type Product = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  sku: string;
  size: string;
  color: string;
  costPrice: number;
  price: number;
  stock: number;
  minimumStock: number;
  imageUrl: string;
  active: boolean;
};

type Category = { id: string; name: string };

type Promotion = {
  id: number;
  name: string;
  discount: number;
  category: string;
};

const fallbackCategories = ["Calcinhas", "Sutiãs", "Cuecas", "Conjuntos", "Bodies"];

const financeiro = {
  recebido: 4850,
  receber: 2150,
  devedor: 100,
  clientesAtivos: 10,
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function emptyProduct(categoryId = "") {
  return {
    name: "",
    categoryId,
    description: "",
    sku: "",
    size: "",
    color: "",
    costPrice: "",
    price: "",
    stock: "",
    minimumStock: "0",
    imageUrl: "",
  };
}

export default function PatroaClient({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const router = useRouter();
  const availableCategories = categories.length ? categories : fallbackCategories.map((name, index) => ({ id: `fallback-${index}`, name }));
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [productForm, setProductForm] = useState(() => emptyProduct(availableCategories[0]?.id ?? ""));
  const [promotionForm, setPromotionForm] = useState({ name: "", discount: "", category: "Todas" });

  const totalPecas = products.reduce((total, product) => total + product.stock, 0);
  const categorias = availableCategories.map((category) => category.name);

  const estoquePorCategoria = useMemo(() => availableCategories.map((category) => ({
    categoria: category.name,
    quantidade: products
      .filter((product) => product.categoryId === category.id)
      .reduce((total, product) => total + product.stock, 0),
  })), [availableCategories, products]);

  const maiorEstoque = Math.max(...estoquePorCategoria.map((item) => item.quantidade), 1);
  const totalFinanceiro = financeiro.recebido + financeiro.receber;
  const percentualRecebido = totalFinanceiro > 0 ? Math.round((financeiro.recebido / totalFinanceiro) * 100) : 0;

  function closeMenu() {
    setMenuOpen(false);
  }

  function beginCreate() {
    setEditingId(null);
    setMessage("");
    setProductForm(emptyProduct(availableCategories[0]?.id ?? ""));
    document.getElementById("form-produto")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function editarProduto(product: Product) {
    setEditingId(product.id);
    setMessage("");
    setProductForm({
      name: product.name,
      categoryId: product.categoryId || availableCategories[0]?.id || "",
      description: product.description,
      sku: product.sku,
      size: product.size,
      color: product.color,
      costPrice: String(product.costPrice),
      price: String(product.price),
      stock: String(product.stock),
      minimumStock: String(product.minimumStock),
      imageUrl: product.imageUrl,
    });
    document.getElementById("form-produto")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      if (editingId) formData.set("id", editingId);

      if (editingId) {
        await updateProduct(formData);
      } else {
        await createProduct(formData);
      }

      const refreshed = await fetch("/api/patroa/products", { cache: "no-store" });
      if (refreshed.ok) {
        setProducts(await refreshed.json());
      } else {
        router.refresh();
      }

      setEditingId(null);
      setProductForm(emptyProduct(availableCategories[0]?.id ?? ""));
      setMessage(editingId ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function excluirProduto(product: Product) {
    if (!window.confirm(`Deseja realmente excluir “${product.name}”?`)) return;

    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("id", product.id);
      await deleteProduct(formData);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage("Produto excluído com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível excluir o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function alternarStatus(product: Product) {
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("id", product.id);
      await toggleProductStatus(formData);
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item));
      setMessage(product.active ? "Produto desativado." : "Produto ativado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível alterar o status.");
    } finally {
      setSaving(false);
    }
  }

  function criarPromocao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const discount = Number(promotionForm.discount);
    if (!promotionForm.name.trim() || discount <= 0 || discount > 100) return;
    setPromotions((current) => [...current, { id: Date.now(), name: promotionForm.name.trim(), discount, category: promotionForm.category }]);
    setPromotionForm({ name: "", discount: "", category: "Todas" });
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <span className={styles.logo}>JR Lingeries</span>
          <div><h1>Dashboard da Patroa</h1><p>Uma visão completa das vendas, estoque, produtos e promoções.</p></div>
        </div>

        <nav className={styles.desktopNav} aria-label="Navegação do dashboard">
          <a href="#dashboard">Início</a><a href="#financeiro">Financeiro</a><a href="#estoque">Estoque</a><a href="#promocoes">Promoções</a>
        </nav>
        <button className={styles.logoutDesktop} onClick={sair}>Sair</button>
        <button className={styles.menuButton} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>
          <span className={styles.menuIcon}>{menuOpen ? "−" : "+"}</span>
        </button>
        <nav className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`} aria-label="Menu mobile">
          <a href="#dashboard" onClick={closeMenu}>Início</a><a href="#financeiro" onClick={closeMenu}>Financeiro</a><a href="#estoque" onClick={closeMenu}>Estoque</a><a href="#promocoes" onClick={closeMenu}>Promoções</a>
          <button onClick={() => { closeMenu(); void sair(); }}>Sair</button>
        </nav>
      </header>

      <div id="dashboard" className={styles.dashboardAnchor} />

      {message && <div className={styles.statusMessage} role="status">{message}</div>}

      <section className={styles.cards}>
        <article className={styles.card}><span>Total recebido</span><strong>{formatCurrency(financeiro.recebido)}</strong><small className={styles.positive}>Recebimentos confirmados</small></article>
        <article className={styles.card}><span>Total a receber</span><strong>{formatCurrency(financeiro.receber)}</strong><small>Valores em aberto</small></article>
        <article className={`${styles.card} ${styles.debtCard}`}><span>Saldo devedor</span><strong>{formatCurrency(financeiro.devedor)}</strong><small>Referente ao mês anterior</small></article>
        <article className={styles.card}><span>Clientes ativos</span><strong>{financeiro.clientesAtivos}</strong><small>Clientes cadastrados</small></article>
      </section>

      <section id="financeiro" className={styles.analytics}>
        <div className={styles.panel}>
          <div className={styles.panelHeading}><div><span className={styles.eyebrow}>Financeiro</span><h2>Resumo financeiro</h2></div><span className={styles.chartBadge}>Visão geral</span></div>
          <div className={styles.financeChart}>
            <div className={styles.donut} style={{ "--progress": `${percentualRecebido}%` } as React.CSSProperties}><div className={styles.donutCenter}><strong>{percentualRecebido}%</strong><span>recebido</span></div></div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}><span className={`${styles.legendDot} ${styles.receivedDot}`} /><div><strong>{formatCurrency(financeiro.recebido)}</strong><span>Recebido</span></div></div>
              <div className={styles.legendItem}><span className={`${styles.legendDot} ${styles.toReceiveDot}`} /><div><strong>{formatCurrency(financeiro.receber)}</strong><span>A receber</span></div></div>
              <div className={styles.totalLine}><span>Movimentação prevista</span><strong>{formatCurrency(totalFinanceiro)}</strong></div>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeading}><div><span className={styles.eyebrow}>Estoque</span><h2>Peças por categoria</h2></div><span className={styles.chartBadge}>{totalPecas} peças</span></div>
          <div className={styles.barChart}>{estoquePorCategoria.map((item) => <div className={styles.barRow} key={item.categoria}><div className={styles.barLabel}><span>{item.categoria}</span><strong>{item.quantidade}</strong></div><div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${(item.quantidade / maiorEstoque) * 100}%` }} /></div></div>)}</div>
        </div>
      </section>

      <section id="estoque" className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}><div><h2>Produtos</h2><p>{totalPecas} peças em estoque · {products.length} produtos</p></div><button className={styles.primaryButton} onClick={beginCreate}>+ Novo produto</button></div>
          <div className={styles.productList}>
            {products.length === 0 ? <p className={styles.empty}>Nenhum produto cadastrado no banco.</p> : products.map((product) => (
              <div className={styles.productItem} key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category || "Sem categoria"} · {product.stock} peças · {formatCurrency(product.price)}</span>
                  <small className={product.active ? styles.activeLabel : styles.inactiveLabel}>{product.active ? "Ativo" : "Inativo"}{product.stock <= product.minimumStock ? " · Estoque baixo" : ""}</small>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => editarProduto(product)} disabled={saving}>Editar</button>
                  <button onClick={() => void alternarStatus(product)} disabled={saving} className={styles.statusButton}>{product.active ? "Desativar" : "Ativar"}</button>
                  <button className={styles.deleteButton} onClick={() => void excluirProduto(product)} disabled={saving}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel} id="form-produto">
          <div className={styles.panelTitle}><div><h2>{editingId === null ? "Adicionar produto" : "Alterar produto"}</h2><p>Os dados serão salvos diretamente no banco.</p></div></div>
          <form className={styles.form} onSubmit={handleProductSubmit}>
            <input name="name" placeholder="Nome do produto" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <select name="category_id" value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
              <option value="">Sem categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <div className={styles.formGrid}>
              <input name="sku" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
              <input name="size" placeholder="Tamanho" value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} />
              <input name="color" placeholder="Cor" value={productForm.color} onChange={(e) => setProductForm({ ...productForm, color: e.target.value })} />
            </div>
            <textarea name="description" placeholder="Descrição do produto" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} />
            <div className={styles.formGrid}>
              <input name="cost_price" type="number" min="0" step="0.01" placeholder="Preço de custo (R$)" value={productForm.costPrice} onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })} required />
              <input name="sale_price" type="number" min="0" step="0.01" placeholder="Preço de venda (R$)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
            </div>
            <div className={styles.formGrid}>
              <input name="stock_quantity" type="number" min="0" step="1" placeholder="Quantidade em estoque" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
              <input name="minimum_stock" type="number" min="0" step="1" placeholder="Estoque mínimo" value={productForm.minimumStock} onChange={(e) => setProductForm({ ...productForm, minimumStock: e.target.value })} required />
            </div>
            <input name="image_url" placeholder="URL da imagem (opcional)" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} />
            <div className={styles.formActions}>
              <button type="submit" disabled={saving}>{saving ? "Salvando..." : editingId === null ? "Adicionar produto" : "Salvar alterações"}</button>
              {editingId !== null && <button type="button" className={styles.cancelButton} onClick={beginCreate} disabled={saving}>Cancelar edição</button>}
            </div>
          </form>
        </div>
      </section>

      <section id="promocoes" className={styles.content}>
        <div className={styles.panel}>
          <h2>Criar promoção</h2>
          <form className={styles.form} onSubmit={criarPromocao}>
            <input placeholder="Nome da promoção" value={promotionForm.name} onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })} required />
            <input type="number" min="1" max="100" placeholder="Desconto (%)" value={promotionForm.discount} onChange={(e) => setPromotionForm({ ...promotionForm, discount: e.target.value })} required />
            <select value={promotionForm.category} onChange={(e) => setPromotionForm({ ...promotionForm, category: e.target.value })}><option>Todas</option>{categorias.map((category) => <option key={category}>{category}</option>)}</select>
            <button type="submit">Criar promoção</button>
          </form>
        </div>
        <div className={styles.panel}>
          <h2>Promoções ativas</h2>
          {promotions.length === 0 ? <p className={styles.empty}>Nenhuma promoção criada.</p> : <div className={styles.productList}>{promotions.map((promotion) => <div className={styles.productItem} key={promotion.id}><div><strong>{promotion.name}</strong><span>{promotion.category} · {promotion.discount}% de desconto</span></div><button className={styles.deleteButton} onClick={() => setPromotions((current) => current.filter((item) => item.id !== promotion.id))}>Excluir</button></div>)}</div>}
        </div>
      </section>
    </main>
  );
}
