"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (error) {
        console.error("Erro de login:", error);

        setErro(error.message);

        setLoading(false);
        return;
    }

    if (!data.user) {
      setErro(
        "Não foi possível realizar o login."
      );

      setLoading(false);
      return;
    }

    // Buscar o perfil do usuário
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
      setErro(
        "Não foi possível carregar o perfil."
      );

      setLoading(false);
      return;
    }

    // Redirecionamento baseado no tipo de usuário
    if (profile.role === "patroa") {
      router.push("/patroa");
    } else {
      router.push("/cliente");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>

        <div className={styles.header}>
          <span className={styles.logo}>
            JR Lingeries
          </span>

          <h1>Bem-vinda de volta!</h1>

          <p>
            Entre na sua conta para continuar
            comprando.
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleLogin}
        >

          <div className={styles.field}>
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="seuemail@email.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && (
            <div className={styles.error}>
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>

        </form>

        <div className={styles.register}>
          <span>
            Ainda não possui uma conta?
          </span>

          <Link href="/cadastro">
            Criar minha conta
          </Link>
        </div>

      </section>
    </main>
  );
}