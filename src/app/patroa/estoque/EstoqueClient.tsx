"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { createProduct, deleteProduct, toggleProductStatus, updateProduct } from "../actions";

type Product = { id: string; name: string; category: string; categoryId: string; description: string; sku: string; size: string; color: string; costPrice: number; price: number; stock: number; minimumStock: number; imageUrl: string; active: boolean };
type Category = { id: string; name: string };

type FormState = { name: string; categoryId: string; description: string; sku: string; size: string; color: string; costPrice: string; price: string; stock: string; minimumStock: string; imageUrl: string };
const emptyForm = (categoryId = ""): FormState => ({ name: "", categoryId, description: "", sku: "", size: "", color: "", costPrice: "", price: "", stock: "", minimumStock: "0", imageUrl: "" });
const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function EstoqueClient({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [skuSearch, setSkuSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(categories[0]?.id ?? ""));
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(search.toLowerCase().trim());
    const matchesSku = !skuSearch.trim() || p.sku.toLowerCase().includes(skuSearch.toLowerCase().trim());
    const matchesCategory = category === "all" || p.categoryId === category;
    const matchesStatus = status === "all" || (status === "active" ? p.active : !p.active);
    return matchesName && matchesSku && matchesCategory && matchesStatus;
  }), [products, search, skuSearch, category, status]);

  function openCreate() { setEditingId(null); setForm(emptyForm(categories[0]?.id ?? "")); setPreview(""); setMessage(""); setModalOpen(true); }
  function openEdit(p: Product) { setEditingId(p.id); setForm({ name: p.name, categoryId: p.categoryId, description: p.description, sku: p.sku, size: p.size, color: p.color, costPrice: String(p.costPrice), price: String(p.price), stock: String(p.stock), minimumStock: String(p.minimumStock), imageUrl: p.imageUrl }); setPreview(p.imageUrl); setMessage(""); setModalOpen(true); }
  function closeModal() { if (!saving) setModalOpen(false); }
  function selectImage(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) return setMessage("Selecione um arquivo de imagem."); if (file.size > 5 * 1024 * 1024) return setMessage("A imagem deve ter no máximo 5 MB."); setPreview(URL.createObjectURL(file)); setMessage(""); }
  async function uploadImage(file: File) { const data = new FormData(); data.append("file", file); const response = await fetch("/api/patroa/cloudinary/upload", { method: "POST", body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Não foi possível enviar a imagem."); return String(result.url); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const data = new FormData(event.currentTarget); const input = event.currentTarget.elements.namedItem("image_file") as HTMLInputElement | null; const file = input?.files?.[0];
      let imageUrl = form.imageUrl; if (file) { setMessage("Enviando imagem para o Cloudinary..."); imageUrl = await uploadImage(file); }
      data.set("image_url", imageUrl || ""); if (editingId) { data.set("id", editingId); await updateProduct(data); } else await createProduct(data);
      const response = await fetch("/api/patroa/products", { cache: "no-store" }); if (response.ok) setProducts(await response.json()); else router.refresh();
      setModalOpen(false); setEditingId(null); setForm(emptyForm(categories[0]?.id ?? "")); setPreview(""); setMessage(editingId ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar o produto."); }
    finally { setSaving(false); }
  }

  async function remove(p: Product) { if (!window.confirm(`Deseja realmente excluir “${p.name}”?`)) return; setSaving(true); setMessage(""); try { const data = new FormData(); data.set("id", p.id); await deleteProduct(data); setProducts((list) => list.filter((item) => item.id !== p.id)); setMessage("Produto excluído com sucesso."); } catch (e) { setMessage(e instanceof Error ? e.message : "Não foi possível excluir o produto."); } finally { setSaving(false); } }
  async function toggle(p: Product) { setSaving(true); setMessage(""); try { const data = new FormData(); data.set("id", p.id); await toggleProductStatus(data); setProducts((list) => list.map((item) => item.id === p.id ? { ...item, active: !item.active } : item)); } catch (e) { setMessage(e instanceof Error ? e.message : "Não foi possível alterar o status."); } finally { setSaving(false); } }

  return <main className={styles.page}>
    <header className={styles.header}><div><span className={styles.logo}>JR Lingeries</span><h1>Estoque</h1><p>Pesquise, filtre e gerencie seus produtos.</p></div><div className={styles.headerActions}><a href="/patroa">← Visão geral</a><button onClick={openCreate}>+ Novo produto</button></div></header>
    {message && <div className={styles.message}>{message}</div>}
    <section className={styles.filters}>
      <label>Nome<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar produto..." /></label>
      <label>SKU<input value={skuSearch} onChange={(e) => setSkuSearch(e.target.value)} placeholder="Pesquisar SKU..." /></label>
      <label>Categoria<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Todas</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>
    </section>
    <section className={styles.summary}><strong>{filtered.length}</strong><span>produto(s) encontrado(s)</span><span>·</span><span>{filtered.reduce((sum, p) => sum + p.stock, 0)} peças em estoque</span></section>
    <section className={styles.list}>{filtered.length === 0 ? <div className={styles.empty}>Nenhum produto corresponde aos filtros.</div> : filtered.map((p) => <article className={styles.product} key={p.id}>
      {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <div className={styles.noImage}>Sem foto</div>}
      <div className={styles.info}><strong>{p.name}</strong><span>{p.category} · SKU: {p.sku || "não informado"}</span><span>{p.stock} peças · {currency(p.price)}</span><small className={p.active ? styles.active : styles.inactive}>{p.active ? "Ativo" : "Inativo"}{p.stock <= p.minimumStock ? " · Estoque baixo" : ""}</small></div>
      <div className={styles.actions}><button onClick={() => openEdit(p)} disabled={saving}>Editar</button><button onClick={() => void toggle(p)} disabled={saving}>{p.active ? "Desativar" : "Ativar"}</button><button className={styles.delete} onClick={() => void remove(p)} disabled={saving}>Excluir</button></div>
    </article>)}</section>

    {modalOpen && <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="produto-modal-title" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}><div className={styles.modal}>
      <div className={styles.modalHeader}><div><span className={styles.eyebrow}>Estoque</span><h2 id="produto-modal-title">{editingId ? "Editar produto" : "Novo produto"}</h2></div><button className={styles.close} onClick={closeModal} disabled={saving}>×</button></div>
      <form onSubmit={submit} className={styles.form}>
        <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" required />
        <div className={styles.grid}><select name="category_id" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Sem categoria</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input name="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" /></div>
        <div className={styles.grid}><input name="size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="Tamanho" /><input name="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Cor" /></div>
        <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" rows={3} />
        <div className={styles.grid}><input name="cost_price" type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="Preço de custo" required /><input name="sale_price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Preço de venda" required /></div>
        <div className={styles.grid}><input name="stock_quantity" type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Quantidade" required /><input name="minimum_stock" type="number" min="0" step="1" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} placeholder="Estoque mínimo" required /></div>
        <label className={styles.fileLabel}>Foto<input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={selectImage} />{preview && <img className={styles.preview} src={preview} alt="Prévia do produto" />}</label><input type="hidden" name="image_url" value={form.imageUrl} readOnly />
        <div className={styles.modalActions}><button type="button" onClick={closeModal} disabled={saving}>Cancelar</button><button className={styles.primary} type="submit" disabled={saving}>{saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar produto"}</button></div>
      </form>
    </div></div>}
  </main>;
}
