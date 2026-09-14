"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

type ActionResult = {
  error?: string;
  success?: string;
};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") {
    return { error: "Sessão inválida. Faça login novamente." };
  }

  const userId = BigInt(session.id);
  const name = value(formData, "name");
  const email = value(formData, "email").toLowerCase();
  const phone = value(formData, "phone");
  const zipCode = value(formData, "zipCode");
  const number = value(formData, "number");
  const address = value(formData, "address");
  const neighborhood = value(formData, "neighborhood");
  const city = value(formData, "city");
  const state = value(formData, "state").toUpperCase();

  if (!name || !email) {
    return { error: "Nome e e-mail são obrigatórios." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Informe um e-mail válido." };
  }

  if (state && state.length !== 2) {
    return { error: "Informe o estado usando a sigla com 2 letras." };
  }

  const existingUser = await prisma.users.findFirst({
    where: {
      email,
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Este e-mail já está sendo usado por outra conta." };
  }

  const client = await prisma.clients.findFirst({
    where: { user_id: userId },
    select: { id: true },
  });

  if (!client) {
    return { error: "Cadastro de cliente não encontrado." };
  }

  await prisma.$transaction([
    prisma.users.update({
      where: { id: userId },
      data: { name, email },
    }),
    prisma.clients.update({
      where: { id: client.id },
      data: {
        name,
        email,
        phone: phone || null,
        zip_code: zipCode || null,
        number: number || null,
        address: address || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
      },
    }),
  ]);

  revalidatePath("/cliente");
  return { success: "Dados atualizados com sucesso." };
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") {
    return { error: "Sessão inválida. Faça login novamente." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Preencha todos os campos de senha." };
  }

  if (newPassword.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "A confirmação da nova senha não confere." };
  }

  const userId = BigInt(session.id);
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { password_hash: true },
  });

  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return { error: "A senha atual está incorreta." };
  }

  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: hashPassword(newPassword) },
  });

  return { success: "Senha alterada com sucesso." };
}
