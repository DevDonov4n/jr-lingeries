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

  const user = await prisma.users.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id, user.role);

  if (user.role === "PATROA") redirect("/patroa");
  redirect("/cliente");
}
