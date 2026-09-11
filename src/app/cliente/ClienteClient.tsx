"use client";

import { useState } from "react";
import styles from "./page.module.css";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export default function ClienteClient({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Minha conta</span>
          <h1>Olá, {user.name.split(" ")[0]}! 💗</h1>
          <p>Gerencie seus dados e acompanhe sua conta na JR Lingeries.</p>
        </div>
        <a className={styles.backLink} href="/">Voltar para a loja</a>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeading}>
            <div>
              <span className={styles.eyebrow}>Dados pessoais</span>
              <h2>Meu cadastro</h2>
            </div>
            <button type="button" onClick={() => setEditing((value) => !value)}>
              {editing ? "Cancelar" : "Editar"}
            </button>
          </div>

          {editing ? (
            <form className={styles.form}>
              <label>Nome<input name="name" defaultValue={user.name} /></label>
              <label>E-mail<input name="email" type="email" defaultValue={user.email} /></label>
              <label>Telefone<input name="phone" defaultValue={user.phone} /></label>
              <div className={styles.formRow}>
                <label>CEP<input name="zipCode" defaultValue={user.zipCode} /></label>
                <label>Número<input name="number" defaultValue={user.number} /></label>
              </div>
              <label>Endereço<input name="address" defaultValue={user.address} /></label>
              <label>Bairro<input name="neighborhood" defaultValue={user.neighborhood} /></label>
              <div className={styles.formRow}>
                <label>Cidade<input name="city" defaultValue={user.city} /></label>
                <label>Estado<input name="state" defaultValue={user.state} /></label>
              </div>
              <button className={styles.primaryButton} type="submit">Salvar alterações</button>
            </form>
          ) : (
            <div className={styles.details}>
              <div><span>Nome</span><strong>{user.name}</strong></div>
              <div><span>E-mail</span><strong>{user.email}</strong></div>
              <div><span>Telefone</span><strong>{user.phone || "Não informado"}</strong></div>
              <div><span>Endereço</span><strong>{user.address ? `${user.address}${user.number ? `, ${user.number}` : ""}` : "Não informado"}</strong></div>
              <div><span>Bairro</span><strong>{user.neighborhood || "Não informado"}</strong></div>
              <div><span>Cidade / Estado</span><strong>{user.city ? `${user.city}${user.state ? ` - ${user.state}` : ""}` : "Não informado"}</strong></div>
              <div><span>CEP</span><strong>{user.zipCode || "Não informado"}</strong></div>
            </div>
          )}
        </article>

        <aside className={styles.sideColumn}>
          <a className={styles.actionCard} href="/cliente/favoritos">
            <span className={styles.icon}>♡</span>
            <strong>Meus favoritos</strong>
            <span>Veja as peças que você salvou para comprar depois.</span>
          </a>
          <a className={styles.actionCard} href="/cliente/sugestoes">
            <span className={styles.icon}>✦</span>
            <strong>Sugerir uma peça</strong>
            <span>Conte para a JR Lingeries o que você gostaria de encontrar.</span>
          </a>
          <div className={styles.passwordCard}>
            <span className={styles.eyebrow}>Segurança</span>
            <h2>Alterar senha</h2>
            <p>A alteração de senha será disponibilizada junto à edição segura do cadastro.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
