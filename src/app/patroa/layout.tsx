import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PatroaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "PATROA") redirect("/cliente");

  return children;
}
