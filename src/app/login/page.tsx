"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import styles from "./page.module.css";

const initialState = { error: "" };

export default function Login() {
  const [state, formAction, loading] = useActionState(loginAction, initialState);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>JR Lingeries</span>
          <h1>Bem-vinda de volta!</h1>
          <p>Entre na sua conta para acessar a área da JR Lingeries.</p>
        </div>

        <form className={styles.form} action={formAction}>
          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Digite seu e-mail"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          {state.error && <div className={styles.error}>{state.error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.register}>
          <span>Não possui acesso?</span>
          <Link href="/">Voltar para a loja</Link>
        </div>
      </section>
    </main>
  );
}
