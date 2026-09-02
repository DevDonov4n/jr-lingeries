"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import styles from "./page.module.css";

export default function Cadastro() {
  const router = useRouter();
  const [sucesso, setSucesso] = useState("");

  function handleCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSucesso("Cadastro recebido! O acesso de clientes será disponibilizado em uma próxima versão.");
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>JR Lingeries</span>
          <h1>Crie sua conta</h1>
          <p>Preencha seus dados para deixar seu cadastro preparado na loja.</p>
        </div>

        <form className={styles.form} onSubmit={handleCadastro}>
          <div className={styles.field}><label htmlFor="nome">Nome completo</label><input id="nome" type="text" placeholder="Digite seu nome" required /></div>
          <div className={styles.field}><label htmlFor="telefone">Telefone</label><input id="telefone" type="tel" placeholder="(11) 99999-9999" required /></div>
          <div className={styles.field}><label htmlFor="email">E-mail</label><input id="email" type="email" placeholder="seuemail@email.com" required /></div>
          <div className={styles.field}><label htmlFor="endereco">Endereço</label><input id="endereco" type="text" placeholder="Rua, número, bairro e cidade" required /></div>

          {sucesso && <div className={styles.success}>{sucesso}</div>}

          <button type="submit">Criar minha conta</button>
        </form>

        <div className={styles.login}>
          <span>Já possui uma conta?</span>
          <Link href="/login">Entrar</Link>
        </div>
      </section>
    </main>
  );
}
