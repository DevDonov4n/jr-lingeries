"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "./actions";
import styles from "./page.module.css";

const initialState = { error: "" };

export default function Cadastro() {
  const [state, formAction, loading] = useActionState(registerAction, initialState);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>JR Lingeries</span>
          <h1>Crie sua conta</h1>
          <p>Cadastre-se para acessar sua conta e aproveitar todos os recursos da loja.</p>
        </div>

        <form className={styles.form} action={formAction}>
          <div className={styles.field}>
            <label htmlFor="name">Nome completo</label>
            <input id="name" name="name" type="text" placeholder="Digite seu nome" autoComplete="name" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999" autoComplete="tel" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" placeholder="seuemail@email.com" autoComplete="email" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="address">Endereço</label>
            <input id="address" name="address" type="text" placeholder="Rua, número, bairro e cidade" autoComplete="street-address" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" placeholder="Mínimo de 6 caracteres" autoComplete="new-password" minLength={6} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={6} required />
          </div>

          {state.error && <div className={styles.error}>{state.error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>

        <div className={styles.login}>
          <span>Já possui uma conta?</span>
          <Link href="/login">Entrar</Link>
        </div>
      </section>
    </main>
  );
}
