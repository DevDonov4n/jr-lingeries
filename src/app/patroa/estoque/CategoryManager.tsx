"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "../actions";
import styles from "./page.module.css";

export default function CategoryManager({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = new FormData(event.currentTarget);
      await createCategory(data);
      setName("");
      setOpen(false);
      setMessage("Categoria criada com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar a categoria.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.categoriesBox}>
      <div className={styles.categoriesHeader}>
        <div>
          <span className={styles.eyebrow}>Organização</span>
          <h2>Categorias</h2>
          <p>{categories.length} categoria(s) cadastrada(s).</p>
        </div>
        <button type="button" onClick={() => { setOpen(true); setMessage(""); }}>
          + Nova categoria
        </button>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.categoryList}>
        {categories.map((category) => (
          <span key={category.id} className={styles.categoryChip}>{category.name}</span>
        ))}
      </div>

      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="categoria-modal-title">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div><span className={styles.eyebrow}>Categorias</span><h2 id="categoria-modal-title">Nova categoria</h2></div>
              <button className={styles.close} type="button" onClick={() => !saving && setOpen(false)} disabled={saving}>×</button>
            </div>
            <form onSubmit={submit} className={styles.form}>
              <input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Cuecas" maxLength={100} required autoFocus />
              <input name="description" placeholder="Descrição (opcional)" maxLength={255} />
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setOpen(false)} disabled={saving}>Cancelar</button>
                <button className={styles.primary} type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar categoria"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
