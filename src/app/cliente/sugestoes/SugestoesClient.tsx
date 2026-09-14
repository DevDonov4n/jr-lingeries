"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSuggestion } from "./actions";
import styles from "./page.module.css";

type Category = { id: string; name: string };

export default function SugestoesClient({ categories }: { categories: Category[] }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await createSuggestion(new FormData(event.currentTarget));
      event.currentTarget.reset();
      setMessage("Sugestão enviada com sucesso! Obrigada por ajudar a gente a escolher novas peças. 💗");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar sua sugestão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>Minha conta</span><h1>Sugira uma peça 💗</h1><p>Conte para a JR Lingeries qual peça ou pedido você gostaria de encontrar.</p></div>
        <Link className={styles.backLink} href="/cliente">Voltar para minha conta</Link>
      </header>
      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Qual peça você gostaria?<input name="name" placeholder="Ex.: Conjunto de renda preto" maxLength={150} required /></label>
          <div className={styles.formRow}>
            <label>Categoria<select name="categoryId" defaultValue=""><option value="">Não informar</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Cor<input name="color" placeholder="Ex.: Preto" maxLength={50} /></label>
          </div>
          <label>Tamanho<input name="size" placeholder="Ex.: M" maxLength={30} /></label>
          <label>Conte mais sobre seu pedido<textarea name="description" placeholder="Descreva detalhes, modelo, tecido, estilo ou qualquer preferência." maxLength={5000} rows={6} /></label>
          {message && <p className={message.includes("sucesso") ? styles.success : styles.error}>{message}</p>}
          <button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar sugestão"}</button>
        </form>
      </section>
    </main>
  );
}
