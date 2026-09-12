import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateSuggestionStatus } from "./actions";
import styles from "./page.module.css";

const statusLabel = {
  PENDENTE: "Pendente",
  ANALISADA: "Analisada",
  ATENDIDA: "Atendida",
} as const;

export default async function SugestoesPatroaPage() {
  const session = await getSession();
  if (!session || session.role !== "PATROA") redirect("/login");

  const suggestions = await prisma.product_suggestions.findMany({
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { name: true } },
      categories: { select: { name: true } },
    },
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Atendimento</span>
          <h1>Pedidos e sugestões</h1>
          <p>
            Acompanhe o que as clientes gostariam de encontrar na JR Lingeries.
          </p>
        </div>
        <Link className={styles.backLink} href="/patroa">
          Voltar para o painel
        </Link>
      </header>

      {suggestions.length === 0 ? (
        <section className={styles.empty}>
          <span>✦</span>
          <h2>Nenhuma sugestão recebida</h2>
          <p>Quando uma cliente enviar um pedido, ele aparecerá aqui.</p>
        </section>
      ) : (
        <section className={styles.list}>
          {suggestions.map((suggestion) => (
            <article className={styles.card} key={suggestion.id.toString()}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.category}>
                    {suggestion.categories?.name ?? "Sem categoria"}
                  </span>
                  <h2>{suggestion.name}</h2>
                </div>
                <span
                  className={`${styles.status} ${styles[suggestion.status.toLowerCase()]}`}
                >
                  {statusLabel[suggestion.status]}
                </span>
              </div>
              <div className={styles.details}>
                <div>
                  <span>Cliente</span>
                  <strong>{suggestion.users.name}</strong>
                </div>
                <div>
                  <span>Pedido em</span>
                  <strong>
                    {suggestion.created_at
                      ? new Date(suggestion.created_at).toLocaleString("pt-BR")
                      : "Não informado"}
                  </strong>
                </div>
                <div>
                  <span>Cor</span>
                  <strong>{suggestion.color || "Não informada"}</strong>
                </div>
                <div>
                  <span>Tamanho</span>
                  <strong>{suggestion.size || "Não informado"}</strong>
                </div>
              </div>
              {suggestion.description && (
                <div className={styles.description}>
                  <span>Observações</span>
                  <p>{suggestion.description}</p>
                </div>
              )}
              <form
                className={styles.statusForm}
                action={updateSuggestionStatus}
              >
                <input
                  type="hidden"
                  name="id"
                  value={suggestion.id.toString()}
                />
                <label>
                  Status
                  <select name="status" defaultValue={suggestion.status}>
                    <option value="PENDENTE">Pendente</option>
                    <option value="ANALISADA">Analisada</option>
                    <option value="ATENDIDA">Atendida</option>
                  </select>
                </label>
                <button type="submit">Atualizar status</button>
              </form>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
