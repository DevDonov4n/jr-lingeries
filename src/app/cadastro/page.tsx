"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

import styles from "./page.module.css";

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleCadastro(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setLoading(true);

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password: senha,

        options: {
          data: {
            nome,
            telefone,
            endereco,
          },
        },
      });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setSucesso(
        "Cadastro realizado com sucesso!"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }

    setLoading(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>
            JR Lingeries
          </span>

          <h1>Crie sua conta</h1>

          <p>
            Cadastre-se para acompanhar seus pedidos
            e aproveitar as novidades da JR Lingeries.
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleCadastro}
        >
          <div className={styles.field}>
            <label htmlFor="nome">
              Nome completo
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="telefone">
              Telefone
            </label>

            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(event) =>
                setTelefone(event.target.value)
              }
              placeholder="(11) 99999-9999"
              required
            />
          </div>

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
            <label htmlFor="endereco">
              Endereço
            </label>

            <input
              id="endereco"
              type="text"
              value={endereco}
              onChange={(event) =>
                setEndereco(event.target.value)
              }
              placeholder="Rua, número, bairro e cidade"
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
              placeholder="Crie uma senha"
              minLength={6}
              required
            />

            <small>
              A senha deve possuir pelo menos 6
              caracteres.
            </small>
          </div>

          {erro && (
            <div className={styles.error}>
              {erro}
            </div>
          )}

          {sucesso && (
            <div className={styles.success}>
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Criando conta..."
              : "Criar minha conta"}
          </button>
        </form>

        <div className={styles.login}>
          <span>
            Já possui uma conta?
          </span>

          <Link href="/login">
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}