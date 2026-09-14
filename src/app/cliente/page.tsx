import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ClienteClient from "./ClienteClient";

export default async function ClientePage() {
  const session = await getSession();

  if (!session || session.role !== "CLIENTE") {
    redirect("/login");
  }

  const user = await prisma.users.findUnique({
    where: { id: BigInt(session.id) },
    select: {
      id: true,
      name: true,
      email: true,
      clients: {
        where: { user_id: BigInt(session.id) },
        orderBy: { id: "asc" },
        take: 1,
        select: {
          phone: true,
          address: true,
          number: true,
          neighborhood: true,
          city: true,
          state: true,
          zip_code: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const client = user.clients[0];

  return (
    <ClienteClient
      user={{
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: client?.phone ?? "",
        address: client?.address ?? "",
        number: client?.number ?? "",
        neighborhood: client?.neighborhood ?? "",
        city: client?.city ?? "",
        state: client?.state ?? "",
        zipCode: client?.zip_code ?? "",
      }}
    />
  );
}
