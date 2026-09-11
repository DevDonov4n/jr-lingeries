"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

type RegisterResult = {
  error: string;
};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function registerAction(_: RegisterResult, formData: FormData): Promise<RegisterResult> {
  const name = value(formData, "name");
  const phone = value(formData, "phone");
  const email = value(formData, "email").toLowerCase();
  const address = value(formData, "address");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !phone || !email || !address || !password || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Informe um e-mail válido." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "A confirmação da senha não confere." };
  }

  const existingUser = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Este e-mail já está cadastrado." };
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name,
        email,
        password_hash: hashPassword(password),
        role: "CLIENTE",
      },
    });

    await tx.clients.create({
      data: {
        user_id: user.id,
        name,
        phone,
        email,
        address,
      },
    });
  });

  redirect("/login?cadastro=sucesso");
}
