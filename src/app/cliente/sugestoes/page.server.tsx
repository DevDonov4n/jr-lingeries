import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import SugestoesClient from "./page";

export default async function SugestoesPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") redirect("/login");

  const categories = await prisma.categories.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <SugestoesClient categories={categories.map((category) => ({ id: category.id.toString(), name: category.name }))} />;
}
