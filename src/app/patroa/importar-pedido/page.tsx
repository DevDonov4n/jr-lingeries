"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

type ImportedProduct = {
  sku: string;
  imageUrl: string;
};

export default function ImportarPedidoPage() {
  const [cpf, setCpf] = useState("");
  const [pedido, setPedido] = useState("");
  const [products, setProducts] = useState<ImportedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setProducts([]);

    try {
      const response = await fetch("/api/import-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: onlyDigits(cpf), pedido: onlyDigits(pedido) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível consultar o pedido.");

      setProducts(result.products ?? []);
      setMessage(`Pedido ${result.pedido} encontrado: ${result.total} produto(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao consultar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>JR Lingeries · Patroa</span>
        <h1>Importar pedido da Morena</h1>
        <p className={styles.description}>
          Consulte o pedido da fornecedora e veja as referências encontradas antes de alterar o estoque.
        </p>

        <form onSubmit={submit} className={styles.form}>
          <label>
            CPF cadastrado na Morena
            <input
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </label>
          <label>
            Número do pedido
            <input
              value={pedido}
              onChange={(event) => setPedido(onlyDigits(event.target.value))}
              inputMode="numeric"
              placeholder="Ex.: 557830"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Consultando..." : "Consultar pedido"}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}

        {products.length > 0 && (
          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <span className={styles.eyebrow}>Prévia</span>
                <h2>Referências encontradas</h2>
              </div>
              <strong>{products.length}</strong>
            </div>
            <div className={styles.grid}>
              {products.map((product) => (
                <article className={styles.product} key={product.sku}>
                  <img src={product.imageUrl} alt={`Produto ${product.sku}`} />
                  <div>
                    <strong>SKU {product.sku}</strong>
                    <span>Imagem original da Morena</span>
                  </div>
                </article>
              ))}
            </div>
            <p className={styles.note}>
              Esta primeira etapa apenas consulta e identifica as referências. O estoque do JR Lingeries ainda não é alterado automaticamente.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
