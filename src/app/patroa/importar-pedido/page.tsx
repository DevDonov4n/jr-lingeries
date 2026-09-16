"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Category = { id: string | number; name: string };
type Analysis = { name: string; description: string; size: string; color: string; category: string; costPrice?: number; salePrice?: number };
type ImportedProduct = {
  sku: string; imageUrl: string; quantity: number; status?: "EXISTENTE" | "NOVO";
  existing?: { id: string; name: string; description: string | null; size: string | null; color: string | null; costPrice: number; salePrice: number; stockQuantity: number; categoryId: string | null; category: string | null; imageUrl: string | null } | null;
  analysis?: Analysis | null; actionDone?: boolean; actionMessage?: string;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export default function ImportarPedidoPage() {
  const [cpf, setCpf] = useState(""); const [pedido, setPedido] = useState("");
  const [products, setProducts] = useState<ImportedProduct[]>([]); const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false); const [analyzing, setAnalyzing] = useState<string | null>(null); const [acting, setActing] = useState<string | null>(null); const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(""); setProducts([]);
    try {
      const response = await fetch("/api/import-pedido", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cpf: onlyDigits(cpf), pedido: onlyDigits(pedido) }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Não foi possível consultar o pedido.");
      setCategories(result.categories ?? []); setProducts(result.products ?? []); setMessage(`Pedido ${result.pedido} encontrado: ${result.total} produto(s).`);
      for (const product of result.products ?? []) analyzeProduct(product.sku, product.imageUrl);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao consultar o pedido."); }
    finally { setLoading(false); }
  }

  async function analyzeProduct(sku: string, imageUrl: string) {
    setAnalyzing(sku);
    try {
      const response = await fetch("/api/import-pedido/analisar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku, imageUrl }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Não foi possível analisar o produto.");
      setProducts((current) => current.map((product) => product.sku === sku ? { ...product, status: result.status, existing: result.existing, analysis: result.analysis } : product));
    } catch (error) { setProducts((current) => current.map((product) => product.sku === sku ? { ...product, actionMessage: error instanceof Error ? error.message : "Falha na análise." } : product)); }
    finally { setAnalyzing(null); }
  }

  function updateNewField(sku: string, field: keyof Analysis, value: string | number) {
    setProducts((current) => current.map((product) => product.sku !== sku ? product : { ...product, analysis: { name: "", description: "", size: "", color: "", category: "", ...product.analysis, [field]: value } }));
  }

  async function actionProduct(product: ImportedProduct) {
    setActing(product.sku); setMessage("");
    try {
      const category = categories.find((item) => item.name === product.analysis?.category);
      const body = product.status === "EXISTENTE" ? { action: "estoque", sku: product.sku, quantity: product.quantity } : { action: "cadastrar", sku: product.sku, name: product.analysis?.name || `Produto ${product.sku}`, description: product.analysis?.description, size: product.analysis?.size, color: product.analysis?.color, categoryId: category ? String(category.id) : undefined, costPrice: product.analysis?.costPrice ?? 0, salePrice: product.analysis?.salePrice ?? 0, quantity: product.quantity, imageUrl: product.imageUrl };
      const response = await fetch("/api/import-pedido/acao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Não foi possível concluir a ação.");
      setProducts((current) => current.map((item) => item.sku === product.sku ? { ...item, actionDone: true, actionMessage: product.status === "EXISTENTE" ? `Estoque atualizado para ${result.stockQuantity} unidade(s).` : "Produto cadastrado com sucesso." } : item));
    } catch (error) { setProducts((current) => current.map((item) => item.sku === product.sku ? { ...item, actionMessage: error instanceof Error ? error.message : "Não foi possível concluir a ação." } : item)); }
    finally { setActing(null); }
  }

  return <main className={styles.page}><section className={styles.card}>
    <span className={styles.eyebrow}>JR Lingeries · Patroa</span><h1>Importar pedido da Morena</h1>
    <p className={styles.description}>Consulte o pedido, confira a análise dos produtos e confirme cada alteração antes de mexer no estoque.</p>
    <form onSubmit={submit} className={styles.form}>
      <label>CPF cadastrado na Morena<input value={cpf} onChange={(event) => setCpf(event.target.value)} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" maxLength={14} required /></label>
      <label>Número do pedido<input value={pedido} onChange={(event) => setPedido(onlyDigits(event.target.value))} inputMode="numeric" placeholder="Ex.: 557830" required /></label>
      <button type="submit" disabled={loading}>{loading ? "Consultando..." : "Consultar pedido"}</button>
    </form>
    {message && <div className={styles.message}>{message}</div>}
    {products.length > 0 && <section className={styles.results}>
      <div className={styles.resultsHeader}><div><span className={styles.eyebrow}>Prévia inteligente</span><h2>Produtos encontrados</h2></div><strong>{products.length}</strong></div>
      <div className={styles.productList}>{products.map((product) => {
        const existing = product.status === "EXISTENTE"; const analysis = product.analysis ?? { name: "", description: "", size: "", color: "", category: "", costPrice: 0, salePrice: 0 }; const newStock = (product.existing?.stockQuantity ?? 0) + product.quantity;
        return <article className={`${styles.productCard} ${existing ? styles.existing : styles.newProduct}`} key={product.sku}>
          <div className={styles.imageWrap}><img src={product.imageUrl} alt={`Produto ${product.sku}`} /></div><div className={styles.productInfo}>
            <div className={styles.statusRow}><span className={styles.sku}>SKU {product.sku}</span><span className={styles.status}>{product.status ? (existing ? "Produto existente" : "Novo cadastro") : "Verificando..."}</span></div>
            {analyzing === product.sku && <p className={styles.analyzing}>Analisando imagem...</p>}
            {existing ? <><h3>{product.existing?.name}</h3><p className={styles.meta}>{product.existing?.category ?? "Sem categoria"} · Estoque atual: {product.existing?.stockQuantity ?? 0}</p><div className={styles.stockBox}><span>Quantidade no pedido</span><strong>+{product.quantity}</strong><small>Novo estoque: {newStock}</small></div><button className={styles.actionButton} disabled={acting === product.sku || product.actionDone || !product.status} onClick={() => actionProduct(product)}>{product.actionDone ? "Estoque atualizado ✓" : acting === product.sku ? "Atualizando..." : `Adicionar ${product.quantity} ao estoque`}</button></> : <>
              <div className={styles.fields}><label>Nome<input value={analysis.name} onChange={(event) => updateNewField(product.sku, "name", event.target.value)} /></label><label>Descrição<textarea value={analysis.description} onChange={(event) => updateNewField(product.sku, "description", event.target.value)} /></label><div className={styles.twoFields}><label>Tamanho<input value={analysis.size} onChange={(event) => updateNewField(product.sku, "size", event.target.value)} /></label><label>Cor<input value={analysis.color} onChange={(event) => updateNewField(product.sku, "color", event.target.value)} /></label></div><label>Categoria<select value={analysis.category} onChange={(event) => updateNewField(product.sku, "category", event.target.value)}><option value="">Selecione</option>{categories.map((category) => <option key={String(category.id)} value={category.name}>{category.name}</option>)}</select></label><div className={styles.twoFields}><label>Custo<input type="number" min="0" step="0.01" value={analysis.costPrice ?? 0} onChange={(event) => updateNewField(product.sku, "costPrice", Number(event.target.value))} /></label><label>Venda<input type="number" min="0" step="0.01" value={analysis.salePrice ?? 0} onChange={(event) => updateNewField(product.sku, "salePrice", Number(event.target.value))} /></label></div></div>
              <p className={styles.quantity}>Estoque inicial: <strong>{product.quantity} unidade(s)</strong></p><button className={styles.actionButton} disabled={acting === product.sku || product.actionDone || !product.status} onClick={() => actionProduct(product)}>{product.actionDone ? "Produto cadastrado ✓" : acting === product.sku ? "Cadastrando..." : "Cadastrar produto no banco"}</button>
            </>}
            {product.actionMessage && <p className={styles.actionMessage}>{product.actionMessage}</p>}
          </div></article>;
      })}</div><p className={styles.note}>A IA faz apenas um pré-preenchimento. Revise os dados antes de cadastrar. Produtos existentes só têm o estoque alterado quando você confirmar.</p>
    </section>}
  </section></main>;
}
