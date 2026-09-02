"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import styles from "./page.module.css";

const ADMIN_USER = "patroa";
const ADMIN_PASSWORD = ["patroa", "123"].join("");

export default function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    if (usuario.trim().toLowerCase() === ADMIN_USER && senha === ADMIN_PASSWORD) {
      localStorage.setItem("jr-lingeries-auth", "patroa");
      router.push("/patroa");
      return;
    }

    setErro("Usuário ou senha incorretos.");
    setLoading(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>JR Lingeries</span>
          <h1>Bem-vinda de volta!</h1>
          <p>Entre na sua conta para acessar a área da JR Lingeries.</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          {erro && <div className={styles.error}>{erro}</div>}

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
