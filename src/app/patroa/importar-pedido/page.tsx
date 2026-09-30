"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Category = { id: string | number; name: string };
type ColorVariantInput = { color: string; quantity: number };
type ImportedProduct = {
  sku: string;
  imageUrl: string;
  quantity: number;
  status?: "EXISTENTE" | "NOVO";
  name: string;
  description: string | null;
  size: string | null;
  costPrice: number;
  salePrice: number;
  actionCategory: string;
  existing?: {
    id: string;
    name: string;
    description: string | null;
    size: string | null;
    color: string | null;
    costPrice: number;
    salePrice: number;
    stockQuantity: number;
    categoryId: string | null;
    category: string | null;
    imageUrl: string | null;
    variants: { id: string; color: string; colorHex: string; stockQuantity: number }[];
  } | null;
  actionDone?: boolean;
  actionMessage?: string;
  variants: ColorVariantInput[];
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export default function ImportarPedidoPage() {
  const [cpf, setCpf] = useState("");
  const [pedido, setPedido] = useState("");
  const [products, setProducts] = useState<ImportedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
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

      setCategories(result.categories ?? []);
      setProducts(
        (result.products ?? []).map((product: Omit<ImportedProduct, "variants">) => ({
          ...product,
          name: product.name ?? "",
          description: product.description ?? "",
          size: product.size ?? "",
          costPrice: product.costPrice ?? 0,
          salePrice: product.salePrice ?? 0,
          actionCategory: product.actionCategory ?? "",
          variants: [{ color: "", quantity: product.quantity }],
        })),
      );
      setMessage("Pedido " + result.pedido + " encontrado: " + result.total + " produto(s).");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao consultar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(sku: string, field: keyof Pick<ImportedProduct, "name" | "description" | "size" | "costPrice" | "salePrice" | "actionCategory">, value: string | number) {
    setProducts((current) =>
      current.map((product) => (product.sku === sku ? { ...product, [field]: value } : product)),
    );
  }

  function updateVariant(sku: string, index: number, field: keyof ColorVariantInput, value: string | number) {
    setProducts((current) =>
      current.map((product) => {
        if (product.sku !== sku) return product;
        return {
          ...product,
          variants: product.variants.map((variant, variantIndex) =>
            variantIndex === index ? { ...variant, [field]: value } : variant,
          ),
        };
      }),
    );
  }

  function addVariant(sku: string) {
    setProducts((current) =>
      current.map((product) =>
        product.sku === sku
          ? { ...product, variants: [...product.variants, { color: "", quantity: 0 }] }
          : product,
      ),
    );
  }

  function removeVariant(sku: string, index: number) {
    setProducts((current) =>
      current.map((product) =>
        product.sku === sku && product.variants.length > 1
          ? { ...product, variants: product.variants.filter((_, variantIndex) => variantIndex !== index) }
          : product,
      ),
    );
  }

  async function actionProduct(product: ImportedProduct) {
    setActing(product.sku);
    setMessage("");

    try {
      const totalConfirmed = product.variants.reduce((sum, variant) => sum + Number(variant.quantity), 0);
      const invalidVariant = product.variants.some(
        (variant) => !variant.color.trim() || !Number.isInteger(variant.quantity) || variant.quantity <= 0,
      );

      if (invalidVariant) {
        throw new Error("Preencha uma cor e uma quantidade inteira positiva para cada variante.");
      }
      if (totalConfirmed !== product.quantity) {
        throw new Error(
          "As quantidades das cores devem somar exatamente " +
            product.quantity +
            " unidade(s) do pedido. Atualmente: " +
            totalConfirmed +
            ".",
        );
      }

      const category = categories.find((item) => item.name === product.actionCategory);
      const body =
        product.status === "EXISTENTE"
          ? { action: "estoque", sku: product.sku, variants: product.variants }
          : {
              action: "cadastrar",
              sku: product.sku,
              name: product.name,
              description: product.description,
              size: product.size,
              categoryId: category ? String(category.id) : undefined,
              costPrice: product.costPrice,
              salePrice: product.salePrice,
              quantity: product.quantity,
              imageUrl: product.imageUrl,
              variants: product.variants,
            };

      const response = await fetch("/api/import-pedido/acao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir a ação.");

      setProducts((current) =>
        current.map((item) =>
          item.sku === product.sku
            ? {
                ...item,
                actionDone: true,
                actionMessage:
                  product.status === "EXISTENTE"
                    ? "Estoque atualizado para " + result.stockQuantity + " unidade(s)."
                    : "Produto e variantes cadastrados com sucesso.",
              }
            : item,
        ),
      );
    } catch (error) {
      setProducts((current) =>
        current.map((item) =>
          item.sku === product.sku
            ? { ...item, actionMessage: error instanceof Error ? error.message : "Não foi possível concluir a ação." }
            : item,
        ),
      );
    } finally {
      setActing(null);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>JR Lingeries · Patroa</span>
        <h1>Importar pedido da Morena</h1>
        <p className={styles.description}>
          Consulte o pedido, confirme os dados de cada produto e distribua a quantidade recebida entre as cores antes de atualizar o estoque.
        </p>

        <form onSubmit={submit} className={styles.form}>
          <label>
            CPF cadastrado na Morena
            <input value={cpf} onChange={(event) => setCpf(event.target.value)} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" maxLength={14} required />
          </label>
          <label>
            Número do pedido
            <input value={pedido} onChange={(event) => setPedido(onlyDigits(event.target.value))} inputMode="numeric" placeholder="Ex.: 557830" required />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Consultando..." : "Consultar pedido"}</button>
        </form>

        {message && <div className={styles.message}>{message}</div>}

        {products.length > 0 && (
          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <span className={styles.eyebrow}>Conferência manual</span>
                <h2>Produtos encontrados</h2>
              </div>
              <strong>{products.length}</strong>
            </div>

            <div className={styles.productList}>
              {products.map((product) => {
                const existing = product.status === "EXISTENTE";
                const totalConfirmed = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
                const remaining = product.quantity - totalConfirmed;

                return (
                  <article className={styles.productCard} key={product.sku}>
                    <div className={styles.imageWrap}>
                      <img src={product.imageUrl} alt={"Produto " + product.sku} />
                    </div>

                    <div className={styles.productInfo}>
                      <div className={styles.statusRow}>
                        <span className={styles.sku}>SKU {product.sku}</span>
                        <span className={styles.status}>{existing ? "Produto existente" : "Novo cadastro"}</span>
                      </div>

                      <h3>{existing ? product.existing?.name : product.name}</h3>
                      <p className={styles.meta}>
                        {existing
                          ? (product.existing?.category ?? "Sem categoria") + " · Estoque atual: " + (product.existing?.stockQuantity ?? 0)
                          : "Produto novo · confira os dados antes do cadastro"}
                      </p>

                      {!existing && (
                        <div className={styles.fields}>
                          <label>
                            Nome
                            <input value={product.name} onChange={(event) => updateField(product.sku, "name", event.target.value)} />
                          </label>
                          <label>
                            Descrição
                            <textarea value={product.description ?? ""} onChange={(event) => updateField(product.sku, "description", event.target.value)} />
                          </label>
                          <div className={styles.twoFields}>
                            <label>
                              Tamanho
                              <input value={product.size ?? ""} onChange={(event) => updateField(product.sku, "size", event.target.value)} />
                            </label>
                            <label>
                              Categoria
                              <select value={product.actionCategory} onChange={(event) => updateField(product.sku, "actionCategory", event.target.value)}>
                                <option value="">Selecione</option>
                                {categories.map((category) => (
                                  <option key={String(category.id)} value={category.name}>{category.name}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <div className={styles.twoFields}>
                            <label>
                              Custo
                              <input type="number" min="0" step="0.01" value={product.costPrice} onChange={(event) => updateField(product.sku, "costPrice", Number(event.target.value))} />
                            </label>
                            <label>
                              Venda
                              <input type="number" min="0" step="0.01" value={product.salePrice} onChange={(event) => updateField(product.sku, "salePrice", Number(event.target.value))} />
                            </label>
                          </div>
                        </div>
                      )}

                      <div className={styles.variantHeader}>
                        <div>
                          <strong>Variantes de cor</strong>
                          <span>Pedido: {product.quantity} unidade(s)</span>
                        </div>
                        <span className={remaining === 0 ? styles.complete : styles.pending}>
                          {remaining === 0 ? "Quantidade conferida ✓" : "Faltam " + remaining + " unidade(s)"}
                        </span>
                      </div>

                      <div className={styles.variantList}>
                        {product.variants.map((variant, index) => (
                          <div className={styles.variantRow} key={index}>
                            <label>
                              Cor
                              <input value={variant.color} onChange={(event) => updateVariant(product.sku, index, "color", event.target.value)} placeholder="Ex.: Preto" />
                            </label>
                            <label>
                              Quantidade
                              <input type="number" min="1" step="1" value={variant.quantity} onChange={(event) => updateVariant(product.sku, index, "quantity", Number(event.target.value))} />
                            </label>
                            {product.variants.length > 1 && (
                              <button type="button" className={styles.removeVariant} onClick={() => removeVariant(product.sku, index)}>
                                Remover
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button type="button" className={styles.addVariant} onClick={() => addVariant(product.sku)}>
                        + Adicionar outra cor
                      </button>

                      <p className={styles.quantity}>
                        Total informado nas cores: <strong>{totalConfirmed}</strong> de <strong>{product.quantity}</strong> unidade(s)
                      </p>

                      <button type="button" className={styles.actionButton} disabled={acting === product.sku || product.actionDone || remaining !== 0} onClick={() => actionProduct(product)}>
                        {product.actionDone
                          ? (existing ? "Estoque atualizado ✓" : "Produto cadastrado ✓")
                          : acting === product.sku
                            ? (existing ? "Atualizando..." : "Cadastrando...")
                            : (existing ? "Adicionar cores ao estoque" : "Cadastrar produto e variantes")}
                      </button>

                      {product.actionMessage && <p className={styles.actionMessage}>{product.actionMessage}</p>}
                    </div>
                  </article>
                );
              })}
            </div>

            <p className={styles.note}>
              A quantidade total vem do pedido da Morena. A patroa confirma manualmente quais cores foram recebidas e quantas unidades existem de cada uma. Nenhum estoque é alterado até a confirmação.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
