"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

type LoginResult = {
  error: string;
};

export async function loginAction(_: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Informe seu e-mail e sua senha." };

  console.log("[LOGIN] E-mail recebido:", email);
  console.log("[LOGIN] Senha recebida:", password.length > 0 ? "SIM" : "NÃO");

  const user = await prisma.users.findUnique({ where: { email } });

  console.log("[LOGIN] Usuário encontrado:", user ? "SIM" : "NÃO");

  if (user) {
    console.log("[LOGIN] ID:", user.id.toString());
    console.log("[LOGIN] Role:", user.role);
    console.log("[LOGIN] Tamanho do hash:", user.password_hash.length);
    console.log("[LOGIN] Prefixo do hash:", user.password_hash.slice(0, 7));
    console.log("[LOGIN] Senha válida:", verifyPassword(password, user.password_hash));
  }

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id, user.role);

  if (user.role === "PATROA") redirect("/patroa");
  redirect("/cliente");
}
